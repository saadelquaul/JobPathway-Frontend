import { SkillLevel } from './enums';

export interface CandidateProfileResponse {
  id: number;
  name: string;
  email: string;
  summary: string;
  resumeUrl: string;
  portfolioUrl: string;
  profilePicture: string;
  educations: EducationDTO[];
  experiences: ExperienceDTO[];
  skills: CandidateSkillDTO[];
}

export interface CandidateProfileUpdateRequest {
  name?: string;
  summary?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  profilePicture?: string;
  password?: string;
}

export interface EducationDTO {
  id?: number;
  schoolName: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface ExperienceDTO {
  id?: number;
  title: string;
  companyName: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}

export interface CandidateSkillDTO {
  id?: number;
  name: string;
  level: SkillLevel;
}
