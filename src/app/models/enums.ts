export enum ApplicationStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
}

export enum JobStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

export enum WorkModel {
  REMOTE = 'REMOTE',
  ONSITE = 'ON_SITE',
  HYBRID = 'HYBRID',
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum Role {
  CANDIDATE = 'CANDIDATE',
  ADMIN = 'ADMIN',
}
