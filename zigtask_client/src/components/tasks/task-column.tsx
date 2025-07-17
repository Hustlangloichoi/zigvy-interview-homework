"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/lib/types";
import { TaskCard } from "./task-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

export function TaskColumn({ id, title, color, tasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <Card className={`${isOver ? "ring-2 ring-primary" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="secondary">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className={`min-h-[400px] space-y-3 p-2 rounded-lg ${color} transition-colors`}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No tasks
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
