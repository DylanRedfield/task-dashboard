'use client';

import { useState, useEffect } from 'react';
import { getGoals, createGoal, updateGoal, deleteGoal, Goal, User } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiTarget, FiPlus, FiEdit2, FiTrash2, FiCalendar, FiCheck, FiX } from 'react-icons/fi';

interface GoalsPanelProps {
  users: User[];
}

const statusColors = {
  not_started: 'bg-gray-100 text-gray-700 border-gray-300',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-300',
  achieved: 'bg-green-100 text-green-700 border-green-300',
  abandoned: 'bg-red-100 text-red-700 border-red-300',
};

const statusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  achieved: 'Achieved',
  abandoned: 'Abandoned',
};

export default function GoalsPanel({ users }: GoalsPanelProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
    owner_id: 0,
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const res = await getGoals();
      setGoals(res.data);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('Goal title is required');
      return;
    }

    try {
      await createGoal({
        title: formData.title,
        description: formData.description || undefined,
        target_date: formData.target_date ? `${formData.target_date}T00:00:00` : undefined,
        owner_id: formData.owner_id > 0 ? formData.owner_id : undefined,
        status: 'not_started',
      });
      toast.success('Goal created');
      setFormData({ title: '', description: '', target_date: '', owner_id: 0 });
      setIsCreating(false);
      loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    }
  };

  const handleUpdate = async (id: number, data: Partial<Goal>) => {
    try {
      await updateGoal(id, data);
      toast.success('Goal updated');
      setEditingId(null);
      loadGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await deleteGoal(id);
      toast.success('Goal deleted');
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const activeGoals = goals.filter((g) => g.status !== 'achieved' && g.status !== 'abandoned');
  const completedGoals = goals.filter((g) => g.status === 'achieved' || g.status === 'abandoned');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <FiTarget className="mr-2" />
          Current Goals
        </h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
        >
          <FiPlus size={16} />
          Add Goal
        </button>
      </div>

      {/* Create Goal Form */}
      {isCreating && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Goal title (e.g., Validate market by end of November)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <select
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: parseInt(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value={0}>No owner</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
              >
                Create Goal
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ title: '', description: '', target_date: '', owner_id: 0 });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 ? (
        <div className="space-y-3 mb-6">
          {activeGoals.map((goal) => (
            <div
              key={goal.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setEditingId(editingId === goal.id ? null : goal.id)}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <select
                  value={goal.status}
                  onChange={(e) => handleUpdate(goal.id, { status: e.target.value as any })}
                  className={`px-2 py-1 rounded border text-xs font-medium ${
                    statusColors[goal.status]
                  }`}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="achieved">Achieved</option>
                  <option value="abandoned">Abandoned</option>
                </select>

                {goal.target_date && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <FiCalendar size={14} />
                    <span className="text-xs">
                      Target: {new Date(goal.target_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {goal.owner && (
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold">
                      {goal.owner.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-600">{goal.owner.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm">
          No active goals. Click "Add Goal" to create one!
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Completed</h3>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50 opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-700 text-sm line-through">
                      {goal.title}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded border text-xs font-medium ${
                      statusColors[goal.status]
                    }`}
                  >
                    {statusLabels[goal.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
