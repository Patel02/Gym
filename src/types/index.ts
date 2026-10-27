export interface Athlete {
  id: string;
  name: string;
  email: string;
  weightClass: string;
  totalPR: number;
  squat: number;
  bench: number;
  deadlift: number;
  federationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FederationRecord {
  id: string;
  athleteId: string;
  recordType: 'squat' | 'bench' | 'deadlift' | 'total';
  weight: number;
  date: Date;
  competition?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'athlete' | 'admin' | 'superadmin';
  profileImage?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
