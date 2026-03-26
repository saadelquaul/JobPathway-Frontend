import { ApplicationStatus } from './enums';

export interface ApplicationResponse {
  id: number;
  jobOfferTitle: string;
  jobOfferId: number;
  candidateName: string;
  candidateEmail: string;
  candidateResumeUrl?: string;
  status: ApplicationStatus;
  appliedAt: string;
  meetingDate: string;
  meetingLink?: string;
}

export interface ApplicationStatusUpdateRequest {
  status: ApplicationStatus;
  meetingDate?: string;
  meetingLink?: string;
}
