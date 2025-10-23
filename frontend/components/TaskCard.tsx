import { Task, deleteTask } from '@/lib/api';
import { FiTrash2, FiClock, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: number, status: string) => void;
  onRefresh: () => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
}

const priorityColors = {
  low: 'bg-gray-200 text-gray-700',
  medium: 'bg-blue-200 text-blue-700',
  high: 'bg-orange-200 text-orange-700',
  urgent: 'bg-red-200 text-red-700',
};

export default function TaskCard({ task, onStatusChange, onRefresh, onDragStart, onDragEnd }: TaskCardProps) {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(task.id);
      toast.success('Task deleted');
      onRefresh();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task)}
      onDragEnd={onDragEnd}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200 cursor-move"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 transition-colors ml-2"
          title="Delete task"
        >
          <FiTrash2 size={16} />
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>

        {task.assignee && (
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold">
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {task.due_date && (
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <FiClock className="mr-1" size={12} />
          {new Date(task.due_date).toLocaleDateString()}
        </div>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: tag.color + '20', color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
