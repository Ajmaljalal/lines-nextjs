import { useState, useCallback } from 'react';
import { db } from '@/config/firebase';
import { v4 as uuidv4 } from 'uuid';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData,
  setDoc,
  doc
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { getInitialNewsletterPlan } from '@/types/newsletter';
import { getInitialNewsletterConversation } from '@/types/newsletter';

export interface Message {
  id: string;
  text: string;
  createdAt: Timestamp;
  userId: string;
  sender: string;
}

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
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

    const q = query(
      collection(db, `newsletter_conversations/${conversationId}/messages`),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      console.log('newMessages', newMessages);
      setMessages(newMessages);
    });
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

    let newsletterPlanId: string | undefined;


    try {
      // If newsletter conversation id is not provided, create a new newsletter plan and conversation
      if (!conversationId) {
        const result = await initiatNewsletterPlan();;
        if (!result) return;

        const { newsletterPlanId: planId, newsletterConversationId } = result;
        if (!planId || !newsletterConversationId) return;

        newsletterPlanId = planId;
        conversationId = newsletterConversationId;
      }
      await addDoc(collection(db, `newsletter_conversations/${conversationId}/messages`), {
        text,
        userId: user.uid,
        createdAt: Timestamp.now(),
        sender: 'user',
      });
      return {
        success: true,
        conversationId,
        newsletterPlanId,
      }
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    addMessage,
    subscribeToMessages,
    conversationId,
    newsletterPlanId,
  };
} 