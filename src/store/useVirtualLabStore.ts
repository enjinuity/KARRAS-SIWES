import { create } from 'zustand';

import {
  createVirtualLabAssignment,
  exportVirtualLabCourse,
  fetchVirtualLabBootstrap,
  gradeVirtualLabSubmission,
  saveVirtualLabSubmission,
} from '@/virtual-lab/api';
import type {
  CreateAssignmentPayload,
  GradeSubmissionPayload,
  SaveSubmissionPayload,
  VirtualLabAssignment,
  VirtualLabBootstrap,
  VirtualLabCourse,
  VirtualLabInstitution,
  VirtualLabSubmission,
} from '@/virtual-lab/types';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

type VirtualLabStore = {
  institution: VirtualLabInstitution | null;
  courses: VirtualLabCourse[];
  assignments: VirtualLabAssignment[];
  submissions: VirtualLabSubmission[];
  status: LoadStatus;
  error: string | null;
  ensureLoaded: () => Promise<void>;
  refresh: () => Promise<void>;
  createAssignment: (courseId: string, payload: CreateAssignmentPayload) => Promise<VirtualLabAssignment>;
  saveSubmission: (assignmentId: string, payload: SaveSubmissionPayload) => Promise<VirtualLabSubmission>;
  gradeSubmission: (submissionId: string, payload: GradeSubmissionPayload) => Promise<VirtualLabSubmission>;
  exportCourseGrades: (courseId: string) => Promise<{ fileName: string; content: string }>;
};

function applyBootstrap(set: (partial: Partial<VirtualLabStore>) => void, bootstrap: VirtualLabBootstrap) {
  set({
    institution: bootstrap.institution,
    courses: bootstrap.courses,
    assignments: bootstrap.assignments,
    submissions: bootstrap.submissions,
    status: 'ready',
    error: null,
  });
}

export const useVirtualLabStore = create<VirtualLabStore>()((set, get) => ({
  institution: null,
  courses: [],
  assignments: [],
  submissions: [],
  status: 'idle',
  error: null,
  ensureLoaded: async () => {
    const status = get().status;
    if (status === 'loading' || status === 'ready') {
      return;
    }

    set({ status: 'loading', error: null });

    try {
      const bootstrap = await fetchVirtualLabBootstrap();
      applyBootstrap(set, bootstrap);
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load Virtual Lab data.',
      });
      throw error;
    }
  },
  refresh: async () => {
    set({ status: 'loading', error: null });

    try {
      const bootstrap = await fetchVirtualLabBootstrap();
      applyBootstrap(set, bootstrap);
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to refresh Virtual Lab data.',
      });
      throw error;
    }
  },
  createAssignment: async (courseId, payload) => {
    const result = await createVirtualLabAssignment(courseId, payload);
    set((state) => ({
      assignments: [result.assignment, ...state.assignments],
    }));
    return result.assignment;
  },
  saveSubmission: async (assignmentId, payload) => {
    const result = await saveVirtualLabSubmission(assignmentId, payload);
    set((state) => {
      const existingIndex = state.submissions.findIndex((submission) => submission.id === result.submission.id);
      const submissions =
        existingIndex >= 0
          ? state.submissions.map((submission) =>
              submission.id === result.submission.id ? result.submission : submission,
            )
          : [result.submission, ...state.submissions];

      const assignments = state.assignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              submissionCount: submissions.filter((submission) => submission.assignmentId === assignment.id).length,
            }
          : assignment,
      );

      return {
        submissions,
        assignments,
      };
    });
    return result.submission;
  },
  gradeSubmission: async (submissionId, payload) => {
    const result = await gradeVirtualLabSubmission(submissionId, payload);
    set((state) => ({
      submissions: state.submissions.map((submission) =>
        submission.id === submissionId ? result.submission : submission,
      ),
    }));
    return result.submission;
  },
  exportCourseGrades: async (courseId) => exportVirtualLabCourse(courseId),
}));
