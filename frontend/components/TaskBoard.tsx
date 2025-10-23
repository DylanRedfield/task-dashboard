'use client';

import { useState } from 'react';
import { Task, User, updateTask, createTask } from '@/lib/api';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

interface TaskBoardProps {
  tasks: Task[];
  users: User[];
  onRefresh: () => void;
}

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'gray' },
  { id: 'in_progress', label: 'In Progress', color: 'blue' },
  { id: 'in_review', label: 'In Review', color: 'yellow' },
  { id: 'done', label: 'Done', color: 'green' },
  { id: 'blocked', label: 'Blocked', color: 'red' },
] as const;

export default function TaskBoard({ tasks, users, onRefresh }: TaskBoardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('todo');

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateTask(taskId, { status: newStatus as any });
      toast.success('Task updated');
      onRefresh();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleCreateTask = (status: string) => {
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const tasksByStatus = COLUMNS.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {COLUMNS.map((column) => (
          <div key={column.id} className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <span className={`w-3 h-3 rounded-full bg-${column.color}-500 mr-2`}></span>
                {column.label}
                <span className="ml-2 text-sm text-gray-500">
                  ({tasksByStatus[column.id]?.length || 0})
                </span>
              </h3>
              <button
                onClick={() => handleCreateTask(column.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Add task"
              >
                <FiPlus size={18} />
              </button>
            </div>

            <div className="space-y-3 min-h-[200px]">
              {tasksByStatus[column.id]?.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
        users={users}
        initialStatus={selectedStatus}
      />
    </>
  );
}
