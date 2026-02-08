
import { ServiceCategory, CAProfile } from './types';

export const SERVICE_CATEGORIES = [
  {
    id: 'itax',
    name: ServiceCategory.INCOME_TAX,
    services: ['ITR Filing', 'Tax Planning', 'Notice Handling', 'TDS Compliance']
  },
  {
    id: 'gst',
    name: ServiceCategory.GST,
    services: ['GST Registration', 'GST Returns', 'GST Audit', 'Litigation Support']
  },
  {
    id: 'audit',
    name: ServiceCategory.AUDIT,
    services: ['Statutory Audit', 'Internal Audit', 'Tax Audit', 'Stock Audit']
  },
  {
    id: 'biz',
    name: ServiceCategory.BUSINESS_COMPLIANCE,
    services: ['Company Incorporation', 'MSME Registration', 'ROC Filings', 'Startup India']
  },
  {
    id: 'acc',
    name: ServiceCategory.ACCOUNTING,
    services: ['Bookkeeping', 'Finalization', 'MIS Reporting', 'Payroll']
  }
];

export const INDIAN_STATES = [
  'Telangana', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 
  'West Bengal', 'Rajasthan', 'Uttar Pradesh', 'Punjab'
];

export const MOCK_CAS: CAProfile[] = [
  {
    id: 'ca1',
    userId: 'u101',
    type: 'CA',
    name: 'CA Rajesh Kumar',
    firmName: 'Kumar & Associates',
    icaiRegistrationNumber: 'MNo. 123456',
    experienceYears: 12,
    rating: 4.8,
    reviewCount: 156,
    specializations: ['GST Audit', 'Tax Planning', 'FEMA'],
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500077',
    isVerified: true,
    isOnline: true,
    latitude: 17.3850,
    longitude: 78.4867,
    verificationStatus: 'verified',
    languages: ['English', 'Hindi', 'Telugu'],
    about: 'Experienced CA specializing in GST and cross-border taxation with over a decade of practice in the Kattedan industrial area, Hyderabad.',
    pricingRange: 'Standard',
    services: [
      { id: 's1', category: ServiceCategory.GST, name: 'GST Audit', description: 'Comprehensive GST audit for SMEs', basePrice: 15000, isFixedPrice: false },
      { id: 's2', category: ServiceCategory.INCOME_TAX, name: 'ITR Filing', description: 'Individual and Business ITR', basePrice: 2000, isFixedPrice: true }
    ],
    avatar: 'https://picsum.photos/seed/ca1/200'
  },
  {
    id: 'acc1',
    userId: 'u103',
    type: 'ACCOUNTANT',
    name: 'Suresh Varma',
    firmName: 'Varma Bookkeeping',
    professionalQualification: 'M.Com, Tally Certified',
    experienceYears: 6,
    rating: 4.7,
    reviewCount: 42,
    specializations: ['Bookkeeping', 'Payroll', 'Tally Prime'],
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500077',
    isVerified: true,
    isOnline: true,
    latitude: 17.3890,
    longitude: 78.4890,
    verificationStatus: 'verified',
    languages: ['English', 'Telugu'],
    about: 'Expert accountant specializing in day-to-day bookkeeping and payroll management for small businesses in Hyderabad.',
    pricingRange: 'Budget',
    services: [
      { id: 's4', category: ServiceCategory.ACCOUNTING, name: 'Monthly Bookkeeping', description: 'Full Tally maintenance', basePrice: 5000, isFixedPrice: true },
      { id: 's5', category: ServiceCategory.ACCOUNTING, name: 'Payroll Mgmt', description: 'Processing salaries for up to 20 staff', basePrice: 3000, isFixedPrice: true }
    ],
    avatar: 'https://picsum.photos/seed/acc1/200'
  }
];
