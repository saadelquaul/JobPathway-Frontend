import { JobStatus, JobType, SkillLevel, WorkModel } from './enums';

export interface JobOfferRequest {
  title: string;
  description: string;
  requiredEducation?: string;
  requiredExperience?: string;
  type: JobType;
  workModel: WorkModel;
  salaryRange: string;
  location: string;
  requiredSkills: RequiredSkillDTO[];
}

export interface JobOfferResponse {
  id: number;
  title: string;
  description: string;
  requiredEducation: string;
  requiredExperience: string;
  type: JobType;
  workModel: WorkModel;
  salaryRange: string;
  location: string;
  status: JobStatus;
  createdAt: string;
  requiredSkills: RequiredSkillDTO[];
}

export interface RequiredSkillDTO {
  id?: number;
  name: string;
  minimumLevel: SkillLevel;
}

export interface JobOfferStatusRequest {
  status: JobStatus;
}
