export type VirtualLabInstitution = {
  id: string;
  name: string;
  shortName: string;
  accentColor: string;
  currentTerm: string;
  departments: number;
  activeCourses: number;
  activeStudents: number;
};

export type VirtualLabCourse = {
  id: string;
  code: string;
  title: string;
  instructor: string;
  schedule: string;
  studentCount: number;
  publishedAssignments: number;
  gradingBacklog: number;
};

export type VirtualLabAssignment = {
  id: string;
  courseId: string;
  title: string;
  prompt: string;
  dueLabel: string;
  status: 'draft' | 'published' | 'closed';
  submissionCount: number;
};

export type VirtualLabSubmission = {
  id: string;
  assignmentId: string;
  studentName: string;
  matricNumber: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'draft';
  score: number | null;
};

export const virtualLabInstitution: VirtualLabInstitution = {
  id: 'delta-state-csit',
  name: 'Delta State School of Computing and Intelligent Technologies',
  shortName: 'DSSCIT',
  accentColor: '#22d3ee',
  currentTerm: '2026 Rain Semester',
  departments: 3,
  activeCourses: 6,
  activeStudents: 482,
};

export const virtualLabCourses: VirtualLabCourse[] = [
  {
    id: 'csc-201',
    code: 'CSC 201',
    title: 'Data Structures and Algorithms Lab',
    instructor: 'Dr. N. A. Ekanem',
    schedule: 'Mon and Wed practical block',
    studentCount: 146,
    publishedAssignments: 4,
    gradingBacklog: 18,
  },
  {
    id: 'csc-207',
    code: 'CSC 207',
    title: 'Systems Programming Studio',
    instructor: 'Engr. T. O. James',
    schedule: 'Tue practical block',
    studentCount: 98,
    publishedAssignments: 3,
    gradingBacklog: 9,
  },
  {
    id: 'csc-312',
    code: 'CSC 312',
    title: 'Mobile Application Development',
    instructor: 'Mrs. K. I. Odu',
    schedule: 'Fri blended session',
    studentCount: 76,
    publishedAssignments: 5,
    gradingBacklog: 11,
  },
];

export const virtualLabAssignments: VirtualLabAssignment[] = [
  {
    id: 'assign-linked-list',
    courseId: 'csc-201',
    title: 'Linked List Traversal and Insert Operations',
    prompt:
      'Implement insertion at head, tail, and a given index. Explain the time cost of each operation and submit a short dry-run note.',
    dueLabel: 'Due in 2 days',
    status: 'published',
    submissionCount: 128,
  },
  {
    id: 'assign-stack-parser',
    courseId: 'csc-201',
    title: 'Expression Parser with Stack Operations',
    prompt:
      'Use stack rules to validate bracket balance and postfix conversion. Submit the source file and a brief reasoning note.',
    dueLabel: 'Closes tonight',
    status: 'published',
    submissionCount: 141,
  },
  {
    id: 'assign-process-fork',
    courseId: 'csc-207',
    title: 'Process Fork and Child Output Capture',
    prompt:
      'Write a program that spawns child processes, prints parent and child identifiers, and reports execution order observations.',
    dueLabel: 'Drafting',
    status: 'draft',
    submissionCount: 0,
  },
  {
    id: 'assign-mobile-layout',
    courseId: 'csc-312',
    title: 'Mobile Form Layout and Validation',
    prompt:
      'Build a simple registration view with responsive layout rules and input validation feedback for smaller screens.',
    dueLabel: 'Due next week',
    status: 'published',
    submissionCount: 54,
  },
];

export const virtualLabSubmissions: VirtualLabSubmission[] = [
  {
    id: 'sub-001',
    assignmentId: 'assign-linked-list',
    studentName: 'Amaka Obi',
    matricNumber: 'CSC/24/014',
    submittedAt: 'Today, 08:41',
    status: 'submitted',
    score: null,
  },
  {
    id: 'sub-002',
    assignmentId: 'assign-linked-list',
    studentName: 'Daniel Etim',
    matricNumber: 'CSC/24/019',
    submittedAt: 'Today, 07:16',
    status: 'graded',
    score: 84,
  },
  {
    id: 'sub-003',
    assignmentId: 'assign-stack-parser',
    studentName: 'Ruth Afolabi',
    matricNumber: 'CSC/24/022',
    submittedAt: 'Yesterday, 21:03',
    status: 'submitted',
    score: null,
  },
  {
    id: 'sub-004',
    assignmentId: 'assign-mobile-layout',
    studentName: 'Ifeanyi Okoro',
    matricNumber: 'CSC/23/041',
    submittedAt: 'Yesterday, 16:27',
    status: 'graded',
    score: 91,
  },
];

export const virtualLabStudentProfile = {
  name: 'Ruth Afolabi',
  matricNumber: 'CSC/24/022',
  institutionShortName: 'DSSCIT',
  enrolledCourseIds: ['csc-201', 'csc-312'],
};

export const sampleStudentCode = `#include <stdio.h>

int isBalanced(const char *expr) {
  int open = 0;

  for (int i = 0; expr[i] != '\0'; i += 1) {
    if (expr[i] == '(') {
      open += 1;
    } else if (expr[i] == ')') {
      if (open == 0) {
        return 0;
      }
      open -= 1;
    }
  }

  return open == 0;
}

int main(void) {
  const char *sample = "(a+b)*(c-d)";
  printf("%d\n", isBalanced(sample));
  return 0;
}`;

export function getVirtualLabCourse(courseId?: string) {
  if (!courseId) {
    return virtualLabCourses[0];
  }

  return virtualLabCourses.find((course) => course.id === courseId) ?? virtualLabCourses[0];
}

export function getAssignmentsForCourse(courseId: string) {
  return virtualLabAssignments.filter((assignment) => assignment.courseId === courseId);
}

export function getSubmissionsForAssignment(assignmentId: string) {
  return virtualLabSubmissions.filter((submission) => submission.assignmentId === assignmentId);
}
