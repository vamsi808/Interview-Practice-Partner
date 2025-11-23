export type InterviewRole = string;

export interface InterviewEntry {
  speaker: 'ai' | 'user';
  text: string;
  isQuestion?: boolean;
}
