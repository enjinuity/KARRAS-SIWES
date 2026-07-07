export type VirtualLabInstitution = {
  id: string;
  name: string;
  shortName: string;
  accentColor: string;
  currentTermLabel: string;
  departmentCount: number;
  activeCourseCount: number;
  activeStudentCount: number;
};

export type VirtualLabCourse = {
  id: string;
  institutionId: string;
  code: string;
  title: string;
  term: string;
  instructorName: string;
  schedule: string;
  studentCount: number;
};

export type VirtualLabAssignmentStatus = 'draft' | 'published' | 'closed';

export type VirtualLabAssignment = {
  id: string;
  courseId: string;
  title: string;
  prompt: string;
  status: VirtualLabAssignmentStatus;
  dueAt: string;
  createdAt: string;
  submissionCount: number;
};

export type VirtualLabSubmissionStatus = 'draft' | 'submitted' | 'graded';

export type VirtualLabSubmission = {
  id: string;
  assignmentId: string;
  studentName: string;
  matricNumber: string;
  code: string;
  notes: string;
  status: VirtualLabSubmissionStatus;
  score: number | null;
  feedback: string;
  submittedAt: string | null;
  updatedAt: string;
};

export type VirtualLabBootstrap = {
  institution: VirtualLabInstitution;
  courses: VirtualLabCourse[];
  assignments: VirtualLabAssignment[];
  submissions: VirtualLabSubmission[];
};

export type CreateAssignmentPayload = {
  title: string;
  prompt: string;
  dueAt: string;
  status?: VirtualLabAssignmentStatus;
};

export type SaveSubmissionPayload = {
  studentName: string;
  matricNumber: string;
  code: string;
  notes: string;
  status: 'draft' | 'submitted';
};

export type GradeSubmissionPayload = {
  score: number;
  feedback: string;
};
