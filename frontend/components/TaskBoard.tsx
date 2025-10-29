'use client';

import { useState } from 'react';
import { Task, User, updateTask, createTask } from '@/lib/api';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from './TaskDetailModal';
import toast from 'react-hot-toast';
import { FiPlus, FiFilter } from 'react-icons/fi';

interface TaskBoardProps {
  tasks: Task[];
  users: User[];
  onRefresh: () => void;
}

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'gray' },
  { id: 'in_progress', label: 'In Progress', color: 'blue' },
  { id: 'done', label: 'Done', color: 'green' },
] as const;

export default function TaskBoard({ tasks, users, onRefresh }: TaskBoardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('todo');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateTask(taskId, { status: newStatus as any });
      toast.success('Task moved');
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

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== columnId) {
      await handleStatusChange(draggedTask.id, columnId);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleTaskClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsDetailModalOpen(true);
  };

  // Filter tasks by selected user
  const filteredTasks = selectedUser
    ? tasks.filter(task => task.assignee_id === selectedUser)
    : tasks;

  const tasksByStatus = COLUMNS.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <>
      {/* Filter Section */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-500" />
          <label htmlFor="user-filter" className="text-sm font-medium text-gray-700">
            Filter by team member:
          </label>
        </div>
        <select
          id="user-filter"
          value={selectedUser || ''}
          onChange={(e) => setSelectedUser(e.target.value ? Number(e.target.value) : null)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All team members</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        {selectedUser && (
          <button
            onClick={() => setSelectedUser(null)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className={`bg-gray-100 rounded-lg p-4 transition-all ${
              dragOverColumn === column.id ? 'ring-2 ring-primary-500 bg-primary-50' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
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
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onTaskClick={handleTaskClick}
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

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRefresh={onRefresh}
      />
    </>
  );
}
