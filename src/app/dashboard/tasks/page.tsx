
'use client';

import * as React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { Checkbox } from '@/components/ui/checkbox';
  import { ClipboardList } from 'lucide-react';
  
  const tasks: any[] = [];
  
  export default function TasksPage() {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">
            Here are your pending and completed tasks.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Task List</CardTitle>
            <CardDescription>Stay on top of your work.</CardDescription>
          </CardHeader>
          <CardContent>
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3">
                  <Checkbox id={task.id} checked={task.completed} />
                  <label
                    htmlFor={task.id}
                    className={`text-sm font-medium leading-none ${
                      task.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.label}
                  </label>
                </div>
              ))}
            </div>
             ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center h-[400px]">
                    <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No Tasks Available</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your tasks will appear here as they are assigned.
                    </p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  