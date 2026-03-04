export type BehaviorType = 'dicséret' | 'figyelmeztetés';

export type BehaviorLevel = 'szaktanári' | 'osztályfőnöki' | 'igazgatói';

export interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  type: BehaviorType;
  level: BehaviorLevel;
  reason: string;
  givenBy: string;
  givenById: string;
  givenByRole: 'teacher' | 'homeroom_teacher' | 'principal';
  date: string;
  createdAt: string;
}

export interface BehaviorFormData {
  studentId: string;
  type: BehaviorType;
  level: BehaviorLevel;
  reason: string;
}
