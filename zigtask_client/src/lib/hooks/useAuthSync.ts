import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useTaskStore } from "@/lib/stores/task-store";

export const useAuthSync = () => {
  const { user, token } = useAuthStore();
  const { fetchTasks } = useTaskStore();

  useEffect(() => {
    if (user && token) {
      // Automatically fetch tasks when user is authenticated
      fetchTasks();
    }
  }, [user, token, fetchTasks]);
};

export default useAuthSync;
