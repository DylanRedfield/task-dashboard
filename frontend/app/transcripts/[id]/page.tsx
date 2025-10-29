'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTranscript, MeetingTranscript } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiClock, FiCheckCircle, FiFileText, FiList } from 'react-icons/fi';

export default function TranscriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transcript, setTranscript] = useState<MeetingTranscript | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTranscript();
  }, [params.id]);

  const loadTranscript = async () => {
    try {
      const id = parseInt(params.id as string);
      const res = await getTranscript(id);
      setTranscript(res.data);
    } catch (error) {
      console.error('Error loading transcript:', error);
      toast.error('Failed to load transcript');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Transcript not found</h2>
            <button
              onClick={() => router.push('/')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{transcript.title}</h1>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <FiClock className="mr-1" />
                    {new Date(transcript.created_at).toLocaleDateString()} at{' '}
                    {new Date(transcript.created_at).toLocaleTimeString()}
                  </span>
                  {transcript.processed && transcript.processed_at && (
                    <span className="flex items-center text-green-600">
                      <FiCheckCircle className="mr-1" />
                      Processed on {new Date(transcript.processed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div>
                {transcript.processed ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Processed
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    Not Processed
                  </span>
                )}
              </div>
            </div>

            {transcript.summary && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">AI Summary</h3>
                <p className="text-sm text-blue-800">{transcript.summary}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transcript Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiFileText className="mr-2" />
                Transcript
              </h2>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {transcript.transcript}
                </pre>
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiList className="mr-2" />
                AI Actions
              </h2>

              {transcript.actions && transcript.actions.length > 0 ? (
                <div className="space-y-3">
                  {transcript.actions.map((action) => (
                    <div
                      key={action.id}
                      className="border-l-4 border-primary-500 bg-gray-50 p-3 rounded"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                            action.action_type === 'created'
                              ? 'bg-green-100 text-green-700'
                              : action.action_type === 'completed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {action.action_type}
                        </span>
                        {action.task_id && (
                          <span className="text-xs text-gray-500">Task #{action.task_id}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{action.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(action.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No actions recorded yet.
                  {!transcript.processed && ' Process this transcript to extract action items.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
