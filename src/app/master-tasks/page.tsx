"use client";
import { useAllTasks } from '@/hooks/useAllTasks';
import { TaskDisplay } from '@/components/TaskDisplay';

export default function MasterTasksPage() {
  const { tasks, loading, refresh } = useAllTasks();
  if (loading) return <div className="p-12 text-center text-emerald-600">Loading...</div>;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-emerald-900">Master Task Schedule</h1>
      <div className="space-y-2">
        {tasks.map((task, index) => {
          const showDateHeader = index === 0 || task.due_date !== tasks[index - 1]?.due_date;
          return <TaskDisplay key={task.id} task={task} showDateHeader={showDateHeader} />;
        })}
      </div>
    </div>
  );
}