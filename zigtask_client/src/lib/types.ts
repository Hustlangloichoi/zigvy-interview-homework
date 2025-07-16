export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface User {
  _id: string;
  email: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string | null;
  status: TaskStatus;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  user: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string | null;
}
