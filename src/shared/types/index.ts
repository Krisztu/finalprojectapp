export interface User {
    id?: string
    uid?: string
    name?: string
    fullName?: string
    email: string
    role: 'student' | 'teacher' | 'homeroom_teacher' | 'admin' | 'dj'
    class?: string
    classes?: string[]
    profileImage?: string
}

export interface Lesson {
    id?: string
    Day: string
    StartTime: string
    Subject: string
    Teacher: string
    Class: string
    Room: string
    status: 'normal' | 'cancelled' | 'substituted' | 'added' | 'free'
    userId?: string // The teacher's ID
}

export interface Homework {
    id?: string
    title: string
    description: string
    dueDate: string
    lessonId: string
    teacherId: string
    teacherName: string
    subject: string
    className: string
    attachments?: string[]
    createdAt?: string
    submissions?: HomeworkSubmission[]
    submissionCount?: number
}

export interface HomeworkSubmission {
    id?: string
    homeworkId: string
    studentId: string
    studentName: string
    content: string
    attachments?: string[]
    submittedAt: string
    grade?: string
    feedback?: string
    status?: 'completed' | 'incomplete'
    image?: string
}

export interface Attendance {
    id?: string
    lessonId: string
    teacherId: string
    date: string
    startTime: string
    subject: string
    className: string
    topic: string
    students: AttendanceRecord[]
}

export interface AttendanceRecord {
    studentId: string
    studentName: string
    present: boolean
    excused: boolean
    late?: boolean // Kesés
}

export interface Justification {
    id?: string
    studentId: string
    studentName: string
    studentClass: string
    date: string // The full day being excused
    reason: string
    status: 'pending' | 'approved' | 'rejected' | 'partial'
    excusedLessonIds?: string[] // IDs of specific lessons excused
    proofUrls?: string[] // Image URLs
    createdAt: string
}

export interface ChatMessage {
    id?: string
    text: string
    userId: string
    userName: string
    timestamp: string | Date
}

export interface MusicRequest {
    id?: string
    url: string
    platform: string
    userId: string
    userName: string
    userClass: string
    status: 'pending' | 'played' | 'rejected'
    createdAt: string | Date
}
