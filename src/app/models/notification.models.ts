export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedEntityId: number | null;
  relatedEntityType: string | null;
  createdAt: string;
}

export enum NotificationType {
  // Admin notifications
  NEW_APPLICATION = 'NEW_APPLICATION',
  NEW_CANDIDATE_REGISTERED = 'NEW_CANDIDATE_REGISTERED',

  // Candidate notifications
  APPLICATION_UNDER_REVIEW = 'APPLICATION_UNDER_REVIEW',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  APPLICATION_APPROVED = 'APPLICATION_APPROVED',
  APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED'
}

export interface UnreadCountResponse {
  count: number;
}
