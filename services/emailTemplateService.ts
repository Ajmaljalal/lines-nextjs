import { db } from '@/config/firebase';
import { doc, setDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'email-templates';

export interface EmailTemplate {
  id: string;
  userId: string;
  name: string;
  template: string;
  createdAt: Date;
  updatedAt: Date;
}

export const emailTemplateService = {
  async saveTemplate(userId: string, name: string, template: string): Promise<string> {
    const templateId = crypto.randomUUID();
    const templateRef = doc(db, COLLECTION_NAME, templateId);

    const templateData: EmailTemplate = {
      id: templateId,
      userId,
      name,
      template,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(templateRef, {
      ...templateData,
      createdAt: templateData.createdAt.toISOString(),
      updatedAt: templateData.updatedAt.toISOString(),
    });

    return templateId;
  },

  async updateTemplate(templateId: string, name: string, template: string): Promise<void> {
    const templateRef = doc(db, COLLECTION_NAME, templateId);

    await setDoc(templateRef, {
      name,
      template,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  },

  async getTemplates(userId: string): Promise<EmailTemplate[]> {
    const templatesQuery = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(templatesQuery);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: new Date(doc.data().createdAt),
      updatedAt: new Date(doc.data().updatedAt),
    })) as EmailTemplate[];
  },

  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    const templateRef = doc(db, COLLECTION_NAME, templateId);
    const snapshot = await getDoc(templateRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    } as EmailTemplate;
  },
}; 