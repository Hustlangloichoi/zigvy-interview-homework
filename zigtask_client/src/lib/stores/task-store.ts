import { create } from "zustand";
import type { Task, TaskStatus } from "@/lib/types";
import type { DateRange } from "react-day-picker";
import { api, createAuthHeaders, handleApiResponse } from "@/lib/api";
import { useAuthStore } from "./auth-store";

interface TaskState {
  tasks: Task[];
  searchTerm: string;
  dateRange: DateRange | undefined;
  filteredTasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setDateRange: (range: DateRange | undefined) => void;
  clearFilters: () => void;
}

const filterTasks = (
  tasks: Task[],
  searchTerm: string,
  dateRange: DateRange | undefined
): Task[] => {
  let filtered = tasks;

  // Filter by search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term)
    );
  }

  // Filter by date range
  if (dateRange?.from) {
    filtered = filtered.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      const fromDate = dateRange.from!;
      const toDate = dateRange.to || dateRange.from;

      return taskDate >= fromDate && taskDate <= toDate;
    });
  }

  return filtered;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  searchTerm: "",
  dateRange: undefined,
  filteredTasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: "No authentication token", isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(api.tasks.list, {
        headers: createAuthHeaders(token),
      });

      const tasks = await handleApiResponse(response);
      const { searchTerm, dateRange } = get();
      const filteredTasks = filterTasks(tasks, searchTerm, dateRange);
      set({ tasks, filteredTasks, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createTask: async (taskData) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: "No authentication token", isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(api.tasks.create, {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(taskData),
      });

      const newTask = await handleApiResponse(response);
      const { tasks, searchTerm, dateRange } = get();
      const updatedTasks = [...tasks, newTask];
      const filteredTasks = filterTasks(updatedTasks, searchTerm, dateRange);
      set({ tasks: updatedTasks, filteredTasks, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateTask: async (id, updates) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: "No authentication token", isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(api.tasks.update(id), {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify(updates),
      });

      const updatedTask = await handleApiResponse(response);
      const { tasks, searchTerm, dateRange } = get();
      const updatedTasks = tasks.map((task) =>
        task.id === id ? updatedTask : task
      );
      const filteredTasks = filterTasks(updatedTasks, searchTerm, dateRange);
      set({ tasks: updatedTasks, filteredTasks, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateTaskStatus: async (id, status) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: "No authentication token" });
      return;
    }

    // Optimistic update
    const { tasks, searchTerm, dateRange } = get();
    const optimisticTasks = tasks.map((task) =>
      task.id === id
        ? { ...task, status, updatedAt: new Date().toISOString() }
        : task
    );
    const filteredTasks = filterTasks(optimisticTasks, searchTerm, dateRange);
    set({ tasks: optimisticTasks, filteredTasks });

    try {
      const response = await fetch(api.tasks.update(id), {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify({ status }),
      });

      const updatedTask = await handleApiResponse(response);
      const updatedTasks = tasks.map((task) =>
        task.id === id ? updatedTask : task
      );
      const updatedFilteredTasks = filterTasks(updatedTasks, searchTerm, dateRange);
      set({ tasks: updatedTasks, filteredTasks: updatedFilteredTasks });
    } catch (error) {
      // Revert on error
      const filteredTasksReverted = filterTasks(tasks, searchTerm, dateRange);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
      set({
        tasks,
        filteredTasks: filteredTasksReverted,
        error: errorMessage,
      });
    }
  },

  deleteTask: async (id) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: "No authentication token" });
      return;
    }

    // Optimistic update
    const { tasks, searchTerm, dateRange } = get();
    const optimisticTasks = tasks.filter((task) => task.id !== id);
    const filteredTasks = filterTasks(optimisticTasks, searchTerm, dateRange);
    set({ tasks: optimisticTasks, filteredTasks });

    try {
      const response = await fetch(api.tasks.delete(id), {
        method: 'DELETE',
        headers: createAuthHeaders(token),
      });

      await handleApiResponse(response);
    } catch (error) {
      // Revert on error
      const filteredTasksReverted = filterTasks(tasks, searchTerm, dateRange);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      set({
        tasks,
        filteredTasks: filteredTasksReverted,
        error: errorMessage,
      });
    }
  },

  setSearchTerm: (searchTerm) => {
    const { tasks, dateRange } = get();
    const filteredTasks = filterTasks(tasks, searchTerm, dateRange);
    set({ searchTerm, filteredTasks });
  },

  setDateRange: (dateRange) => {
    const { tasks, searchTerm } = get();
    const filteredTasks = filterTasks(tasks, searchTerm, dateRange);
    set({ dateRange, filteredTasks });
  },

  clearFilters: () => {
    const { tasks } = get();
    set({ searchTerm: "", dateRange: undefined, filteredTasks: tasks });
  },
}));
