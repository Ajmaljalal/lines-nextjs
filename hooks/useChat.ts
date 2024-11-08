import { useState, useCallback, useEffect } from 'react';
import { db } from '@/config/firebase';
import { v4 as uuidv4 } from 'uuid';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  setDoc,
  doc
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { getInitialNewsletterPlan, MessageRole } from '@/types/newsletter';
import { getInitialNewsletterConversation } from '@/types/newsletter';

export interface Message {
  id: string;
  content: string;
  createdAt: Timestamp;
  userId: string;
  role: MessageRole;
}

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [newsletterPlanId, setNewsletterPlanId] = useState<string | undefined>(undefined);

  const initiatNewsletterPlan = async (): Promise<{ newsletterPlanId: string, newsletterConversationId: string } | undefined> => {
    if (!user) return undefined;
    const newsletterPlanId = uuidv4();
    const conversationId = uuidv4();

    setNewsletterPlanId(newsletterPlanId);
    setConversationId(conversationId);

    const newsletterPlan = getInitialNewsletterPlan({ userId: user.uid, conversationId, newsletterPlanId });
    const newsletterConversation = getInitialNewsletterConversation({ userId: user.uid, conversationId, newsletterPlanId });
    await setDoc(doc(db, 'newsletter_plans', newsletterPlanId), newsletterPlan);
    await setDoc(doc(db, 'newsletter_conversations', conversationId), newsletterConversation);
    return {
      newsletterPlanId,
      newsletterConversationId: conversationId,
    }
  }

  // Subscribe to messages
  const subscribeToMessages = useCallback((conversationId: string) => {
    if (!user) return;

    setIsFetching(true);

    const q = query(
      collection(db, `newsletter_conversations/${conversationId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(newMessages);

      setIsFetching(false);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setIsFetching(false);
    });

    return unsubscribe;
  }, [user]);

  // Add a new message
  const addMessage = async ({
    text,
    conversationId
  }: {
    text: string,
    conversationId?: string
  }) => {
    if (!user) return;

    setIsSending(true);

    let newsletterPlanId: string | undefined;

    try {
      // If newsletter conversation id is not provided, create a new newsletter plan and conversation
      if (!conversationId) {
        const result = await initiatNewsletterPlan();
        if (!result) {
          setIsSending(false);
          return;
        }

        const { newsletterPlanId: planId, newsletterConversationId } = result;
        if (!planId || !newsletterConversationId) {
          setIsSending(false);
          return;
        }

        newsletterPlanId = planId;
        conversationId = newsletterConversationId;
      }

      await addDoc(collection(db, `newsletter_conversations/${conversationId}/messages`), {
        content: text,
        userId: user.uid,
        createdAt: Timestamp.now(),
        role: MessageRole.USER,
      });

      return {
        success: true,
        conversationId,
        newsletterPlanId,
      }
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMessages(conversationId);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribeToMessages, conversationId]);

  return {
    messages,
    isSending,
    isFetching,
    addMessage,
    subscribeToMessages,
    conversationId,
    newsletterPlanId,
  };
} 