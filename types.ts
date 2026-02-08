
export enum UserRole {
  CLIENT = 'CLIENT',
  CA = 'CA',
  ACCOUNTANT = 'ACCOUNTANT',
  ADMIN = 'ADMIN'
}

export enum AdminRole {
  SUPER = 'SUPER',
  SUPPORT = 'SUPPORT',
  VERIFICATION = 'VERIFICATION'
}

export type CAVerificationStatus = 'unverified' | 'email_verified' | 'pending_admin_approval' | 'verified' | 'rejected';

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  adminRole?: AdminRole;
  avatar?: string;
  bookmarks?: string[];
  isEmailVerified?: boolean;
}

export interface CAProfile {
  id: string;
  userId: string;
  type: 'CA' | 'ACCOUNTANT';
  name: string;
  firmName?: string;
  icaiRegistrationNumber?: string; 
  professionalQualification?: string; 
  experienceYears: number;
  rating: number;
  reviewCount: number;
  specializations: string[];
  city: string;
  state: string;
  pincode: string;
  isVerified: boolean;
  isOnline?: boolean;
  latitude?: number;
  longitude?: number;
  verificationStatus: CAVerificationStatus;
  adminFeedback?: string; // New field for Admin feedback
  languages: string[];
  about: string;
  services: ServiceOffering[];
  pricingRange: 'Budget' | 'Standard' | 'Premium';
  avatar?: string;
  icaiCertificateUrl?: string;
  documentUrl?: string; 
  profilePhotoUrl?: string;
}

export interface ServiceOffering {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  basePrice?: number;
  isFixedPrice: boolean;
}

export enum ServiceCategory {
  INCOME_TAX = 'Income Tax Services',
  GST = 'GST Services',
  AUDIT = 'Audit & Assurance',
  BUSINESS_COMPLIANCE = 'Business & Company Services',
  ACCOUNTING = 'Accounting & Bookkeeping',
  FINANCIAL_ADVISORY = 'Financial Advisory',
  LEGAL = 'Compliance & Legal'
}

export interface Review {
  id: string;
  caId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  caProfileId?: string;
  caName?: string; 
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  senderName: string;
}

export interface Conversation {
  contactId: string;
  contactName: string;
  contactAvatar: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: DirectMessage[];
}
