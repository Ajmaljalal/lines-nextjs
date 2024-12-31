interface DbUser {
  userId: string;
  name: string;
  email: string;
  businessName: string | null;
  businessType: string | null;
  emailType: 'newsletter' | 'email_marketing' | null;
  imageUrl: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DbUserCredits {
  userId: string;
  totalCredits: number;
  creditsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}
