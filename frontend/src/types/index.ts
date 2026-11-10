export type Role = 'admin' | 'employee';
export type UserStatus = 'active' | 'inactive';
export type ExperienceLevel = 'junior' | 'mid' | 'senior';
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketCategory = 'technical' | 'hr' | 'payroll' | 'other';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  status?: UserStatus;
  experience_level?: ExperienceLevel;
  active_story_points?: number;
  active_tasks_count?: number;
  completed_story_points?: number;
  max_capacity?: number;
  load_percentage?: number;
  on_leave?: boolean;
  in_pool?: boolean;
  created_at?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: Priority;
  story_points: number;
  status: TaskStatus;
  due_date?: string | null;
  assigned_to: number;
  assigned_name?: string;
  assigned_level?: ExperienceLevel;
  assignee_on_leave?: boolean;
  created_by: number;
  created_name?: string;
  created_at?: string;
  completed_at?: string | null;
}

export interface CandidateRecommendation {
  id: number;
  name: string;
  experience_level: ExperienceLevel;
  active_story_points: number;
  active_tasks_count: number;
  max_capacity: number;
  load_percentage: number;
  in_pool: boolean;
  on_leave?: boolean;
  leave_until?: string | null;
}

export interface Leave {
  id: number;
  user_id: number;
  employee_name?: string;
  experience_level?: ExperienceLevel;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  created_at: string;
}

export interface ImpactedTask extends Task {
  leave_start: string;
  leave_end: string;
  leave_reason: string;
  suggested_Candidates: CandidateRecommendation[];
}

export interface TicketMessage {
  id: number;
  message: string;
  sent_at: string;
  sender_id: number;
  sender_name: string;
  sender_role: Role;
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: Priority;
  status: TicketStatus;
  raised_by: number;
  raised_by_name?: string;
  assigned_admin?: number | null;
  assigned_admin_name?: string | null;
  created_at: string;
  messages?: TicketMessage[];
}

export interface Review {
  id: number;
  user_id: number;
  employee_name?: string;
  reviewed_by: number;
  reviewer_name?: string;
  period: string;
  rating: number;
  remarks?: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface PublicQueueResponse {
  items: Array<{
    id: string;
    kind: 'task' | 'ticket';
    title: string;
    meta: string;
    status: string;
    priority: Priority;
  }>;
  available_pool_count: number;
  upcoming_leaves_count: number;
  updated_at: string;
}

export interface AdminStats {
  employees: { total: number; active: number };
  tasks: Partial<Record<TaskStatus, number>>;
  tickets: Partial<Record<TicketStatus, number>>;
  overdue_tasks: number;
  avg_rating: number | null;
  top_performers: Array<{
    id: number;
    name: string;
    experience_level?: ExperienceLevel;
    completed: number;
    completed_points: number;
  }>;
  available_pool: CandidateRecommendation[];
  workload_overview: CandidateRecommendation[];
}

export interface EmployeeStats {
  tasks: Partial<Record<TaskStatus, number>>;
  tickets: Partial<Record<TicketStatus, number>>;
  completion_rate: number;
  avg_rating: number | null;
  experience_level: ExperienceLevel;
  active_story_points: number;
  completed_story_points: number;
  max_capacity: number;
  load_percentage: number;
}

export interface ApiError extends Error {
  status?: number;
  errors?: Array<{ field: string; msg: string }>;
}
