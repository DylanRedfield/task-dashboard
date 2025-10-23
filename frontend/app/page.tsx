'use client';

import { useState, useEffect } from 'react';
import { getTasks, getUsers, getDashboardStats, User, Task, DashboardStats } from '@/lib/api';
import TaskBoard from '@/components/TaskBoard';
import StatsPanel from '@/components/StatsPanel';
import TranscriptUpload from '@/components/TranscriptUpload';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'board' | 'transcripts'>('board');

  const loadData = async () => {
    try {
      const [tasksRes, usersRes, statsRes] = await Promise.all([
        getTasks(),
        getUsers(),
        getDashboardStats(),
      ]);

      setTasks(tasksRes.data);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar selectedView={selectedView} onViewChange={setSelectedView} users={users} />

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedView === 'board' ? 'Task Dashboard' : 'Meeting Transcripts'}
              </h1>
              <p className="mt-2 text-gray-600">
                {selectedView === 'board'
                  ? 'Manage tasks and track progress'
                  : 'Upload and process meeting transcripts with AI'}
              </p>
            </header>

            {stats && selectedView === 'board' && (
              <StatsPanel stats={stats} />
            )}

            {selectedView === 'board' ? (
              <TaskBoard tasks={tasks} users={users} onRefresh={loadData} />
            ) : (
              <TranscriptUpload onProcessed={loadData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
