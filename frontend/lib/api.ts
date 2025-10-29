import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: number;
  name: string;
  email?: string;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  archived: boolean;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: number;
  creator_id: number;
  project_id?: number;
  created_at: string;
  updated_at: string;
  due_date?: string;
  completed_at?: string;
  assignee?: User;
  creator?: User;
  project?: Project;
  tags?: Tag[];
}

export interface TranscriptAction {
  id: number;
  action_type: string;
  description: string;
  task_id?: number;
  created_at: string;
}

export interface MeetingTranscript {
  id: number;
  title: string;
  transcript: string;
  summary?: string;
  processed: boolean;
  created_at: string;
  processed_at?: string;
  actions?: TranscriptAction[];
}

export interface DashboardStats {
  total_tasks: number;
  todo_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  blocked_tasks: number;
  tasks_by_user: { [key: string]: number };
  tasks_by_priority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

// API Functions

// Users
export const getUsers = () => api.get<User[]>('/users');
export const createUser = (data: { name: string; email?: string }) =>
  api.post<User>('/users', data);

// Projects
export const getProjects = (includeArchived = false) =>
  api.get<Project[]>('/projects', { params: { include_archived: includeArchived } });
export const createProject = (data: { name: string; description?: string }) =>
  api.post<Project>('/projects', data);
export const archiveProject = (id: number) =>
  api.patch(`/projects/${id}/archive`);

// Tags
export const getTags = () => api.get<Tag[]>('/tags');
export const createTag = (data: { name: string; color?: string }) =>
  api.post<Tag>('/tags', data);

// Tasks
export const getTasks = (params?: {
  assignee_id?: number;
  status?: string;
  project_id?: number;
}) => api.get<Task[]>('/tasks', { params });

export const createTask = (data: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee_id?: number;
  creator_id: number;
  project_id?: number;
  due_date?: string;
  tag_ids?: number[];
}) => api.post<Task>('/tasks', data);

export const updateTask = (id: number, data: Partial<Task>) =>
  api.patch<Task>(`/tasks/${id}`, data);

export const deleteTask = (id: number) => api.delete(`/tasks/${id}`);

// Transcripts
export const getTranscripts = () => api.get<MeetingTranscript[]>('/transcripts');
export const getTranscript = (id: number) => api.get<MeetingTranscript>(`/transcripts/${id}`);
export const createTranscript = (data: { title: string; transcript: string }) =>
  api.post<MeetingTranscript>('/transcripts', data);
export const processTranscript = (id: number) =>
  api.post(`/transcripts/${id}/process`);

// Stats
export const getDashboardStats = () => api.get<DashboardStats>('/stats');

export default api;
