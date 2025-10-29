'use client';

import { useState, useEffect } from 'react';
import { getTask, updateTask, deleteTask, Task, getUsers, User } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiX, FiClock, FiUser, FiTag, FiTrash2, FiEdit2, FiCalendar } from 'react-icons/fi';

const statusColors = {
  todo: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  in_review: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
};

const priorityColors = {
  low: 'bg-gray-200 text-gray-700',
  medium: 'bg-blue-200 text-blue-700',
  high: 'bg-orange-200 text-orange-700',
  urgent: 'bg-red-200 text-red-700',
};

interface TaskDetailModalProps {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function TaskDetailModal({ taskId, isOpen, onClose, onRefresh }: TaskDetailModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    assignee_id: 0,
    due_date: '',
  });

  useEffect(() => {
    if (isOpen && taskId) {
      loadData();
    }
  }, [isOpen, taskId]);

  const loadData = async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      const [taskRes, usersRes] = await Promise.all([
        getTask(taskId),
        getUsers(),
      ]);
      setTask(taskRes.data);
      setUsers(usersRes.data);
      setEditForm({
        title: taskRes.data.title,
        description: taskRes.data.description || '',
        status: taskRes.data.status,
        priority: taskRes.data.priority,
        assignee_id: taskRes.data.assignee_id || 0,
        due_date: taskRes.data.due_date ? taskRes.data.due_date.split('T')[0] : '',
      });
    } catch (error) {
      console.error('Error loading task:', error);
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!task) return;

    try {
      await updateTask(task.id, {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status as any,
        priority: editForm.priority as any,
        assignee_id: editForm.assignee_id || undefined,
        due_date: editForm.due_date || undefined,
      });
      toast.success('Task updated');
      setIsEditing(false);
      loadData();
      onRefresh();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(task.id);
      toast.success('Task deleted');
      onClose();
      onRefresh();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : task ? (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
                <div className="flex-1 pr-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="text-xl font-bold text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <FiClock className="flex-shrink-0" />
                    <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                    {task.completed_at && (
                      <span>• Completed {new Date(task.completed_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                        title="Edit task"
                      >
                        <FiEdit2 size={20} />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete task"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            title: task.title,
                            description: task.description || '',
                            status: task.status,
                            priority: task.priority,
                            assignee_id: task.assignee_id || 0,
                            due_date: task.due_date ? task.due_date.split('T')[0] : '',
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleClose}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    title="Close"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4 space-y-6">
                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                    {isEditing ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                    {isEditing ? (
                      <select
                        value={editForm.priority}
                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
                    {isEditing ? (
                      <select
                        value={editForm.assignee_id}
                        onChange={(e) => setEditForm({ ...editForm, assignee_id: parseInt(e.target.value) })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value={0}>Unassigned</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        {task.assignee ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold">
                              {task.assignee.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-700">{task.assignee.name}</span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Unassigned</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editForm.due_date}
                        onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        {task.due_date ? (
                          <>
                            <FiCalendar size={14} />
                            {new Date(task.due_date).toLocaleDateString()}
                          </>
                        ) : (
                          <span className="text-gray-500">No due date</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  {isEditing ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      placeholder="Add a description..."
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      {task.description ? (
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{task.description}</p>
                      ) : (
                        <p className="text-gray-500 italic text-sm">No description provided</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Additional Information</h3>
                  <div className="space-y-2 text-sm">
                    {task.creator && (
                      <div className="flex items-center gap-2">
                        <FiUser className="text-gray-400" size={14} />
                        <span className="text-gray-600">Created by:</span>
                        <span className="text-gray-900 font-medium">{task.creator.name}</span>
                      </div>
                    )}

                    {task.project && (
                      <div className="flex items-center gap-2">
                        <FiTag className="text-gray-400" size={14} />
                        <span className="text-gray-600">Project:</span>
                        <span className="text-gray-900 font-medium">{task.project.name}</span>
                      </div>
                    )}

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-start gap-2">
                        <FiTag className="text-gray-400 mt-0.5" size={14} />
                        <span className="text-gray-600">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-0.5 rounded text-xs font-medium"
                              style={{ backgroundColor: tag.color + '20', color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">Task not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
