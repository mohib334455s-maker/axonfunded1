// KYC Types and Utilities

export interface KycFileMeta {
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url?: string;
}

export interface KycSubmission {
  id: string;
  userId: string;
  email: string;
  traderName: string;
  userEmail?: string;
  userName?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  createdAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  reviewReason?: string;
  documents?: {
    idFront?: KycFileMeta;
    idBack?: KycFileMeta;
    proofOfAddress?: KycFileMeta;
    selfie?: KycFileMeta;
  };
  files: {
    idFront?: KycFileMeta;
    idBack?: KycFileMeta;
    addressProof?: KycFileMeta;
    selfie?: KycFileMeta;
  };
  personalInfo?: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    phoneNumber: string;
  };
  country?: string;
  phone?: string;
  docType?: string;
  accountSize?: string;
  sourceOfFunds?: string;
}

export function formatRelativeTime(date: Date | string | undefined): string {
  if (!date) return "N/A";
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}
