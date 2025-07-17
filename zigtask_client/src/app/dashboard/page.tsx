"use client";

import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskFilters } from "@/components/tasks/task-filters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { useState } from "react";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthRedirect();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name || user.email}
          </p>
        </div>
        <Button onClick={() => setIsTaskDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <TaskFilters />
      <TaskBoard />

      <TaskDialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen} />
    </div>
  );
}
