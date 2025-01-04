import { db } from '@/config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Fetch existing subscribers for a given user
 */
export async function getExistingSubscribers(userId: string): Promise<string[]> {
  try {
    const subscribersRef = doc(db, 'subscribers', userId);
    const docSnap = await getDoc(subscribersRef);

    if (docSnap.exists()) {
      // "subscribers" is assumed to be an array of emails
      return docSnap.data().subscribers || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching existing subscribers:', error);
    return [];
  }
}

/**
 * Add a new subscriber to Firestore, updating the total count
 */
export async function addSubscriber(userId: string, email: string): Promise<void> {
  try {
    const existingSubscribers = await getExistingSubscribers(userId);

    // Avoid duplicates
    if (!existingSubscribers.includes(email)) {
      const updatedSubscribers = [...existingSubscribers, email];
      const subscribersRef = doc(db, 'subscribers', userId);

      await setDoc(subscribersRef, {
        userId,
        subscribers: updatedSubscribers,
        totalCount: updatedSubscribers.length,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error(`Error adding subscriber [${email}]:`, error);
    throw error;
  }
}

/**
 * Remove a subscriber from Firestore
 */
export async function removeSubscriber(userId: string, email: string): Promise<void> {
  try {
    const existingSubscribers = await getExistingSubscribers(userId);
    const updatedSubscribers = existingSubscribers.filter((sub) => sub !== email);

    const subscribersRef = doc(db, 'subscribers', userId);
    await setDoc(subscribersRef, {
      userId,
      subscribers: updatedSubscribers,
      totalCount: updatedSubscribers.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error removing subscriber [${email}]:`, error);
    throw error;
  }
}

/**
 * Parse a CSV file and return valid email addresses
 */
function parseCsvEmails(csvData: string, isValidEmail: (email: string) => boolean): string[] {
  return csvData
    .split('\n')
    .map((line) => line.trim())
    .filter((email) => email && isValidEmail(email));
}

/**
 * Upload and merge CSV subscribers, returning all unique subscribers
 */
export async function uploadCsvSubscribers(
  userId: string,
  file: File,
  isValidEmail: (email: string) => boolean
): Promise<{ newEmails: string[]; totalUnique: number }> {
  if (file.type !== 'text/csv') {
    throw new Error('Please upload a CSV file');
  }
  const text = await file.text();
  const newEmails = parseCsvEmails(text, isValidEmail);

  if (newEmails.length === 0) {
    throw new Error('No valid email addresses found in the CSV file');
  }

  const existingSubscribers = await getExistingSubscribers(userId);
  const uniqueEmails = Array.from(new Set([...existingSubscribers, ...newEmails]));

  const subscribersRef = doc(db, 'subscribers', userId);
  await setDoc(subscribersRef, {
    userId,
    subscribers: uniqueEmails,
    totalCount: uniqueEmails.length,
    updatedAt: new Date().toISOString(),
  });

  return { newEmails, totalUnique: uniqueEmails.length };
} 