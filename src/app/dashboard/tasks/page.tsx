import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { Checkbox } from '@/components/ui/checkbox';
  
  const tasks = [
    { id: 'task-1', label: 'Follow up with John Doe (LEAD-001)', completed: false },
    { id: 'task-2', label: 'Send risk profile form to Jane Smith (LEAD-002)', completed: true },
    { id: 'task-3', label: 'Collect KYC documents from Peter Jones (LEAD-003)', completed: false },
    { id: 'task-4', label: 'Check eligibility for Mary Williams (LEAD-004)', completed: false },
    { id: 'task-5', label: 'Schedule portfolio review with David Brown (LEAD-005)', completed: true },
  ];
  
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
          </CardContent>
        </Card>
      </div>
    );
  }
  