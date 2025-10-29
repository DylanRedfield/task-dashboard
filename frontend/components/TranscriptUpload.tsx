'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTranscripts, createTranscript, processTranscript, MeetingTranscript } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiUpload, FiClock, FiCheckCircle, FiFileText } from 'react-icons/fi';

interface TranscriptUploadProps {
  onProcessed: () => void;
}

export default function TranscriptUpload({ onProcessed }: TranscriptUploadProps) {
  const router = useRouter();
  const [transcripts, setTranscripts] = useState<MeetingTranscript[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    transcript: '',
  });

  const loadTranscripts = async () => {
    try {
      const res = await getTranscripts();
      setTranscripts(res.data);
    } catch (error) {
      console.error('Error loading transcripts:', error);
      toast.error('Failed to load transcripts');
    }
  };

  useEffect(() => {
    loadTranscripts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createTranscript(formData);
      toast.success('Transcript uploaded');

      // Immediately process it
      setProcessing(res.data.id);
      await processTranscript(res.data.id);
      toast.success('Transcript processed! Tasks created/updated.');

      setFormData({ title: '', transcript: '' });
      loadTranscripts();
      onProcessed();
    } catch (error) {
      console.error('Error processing transcript:', error);
      toast.error('Failed to process transcript');
    } finally {
      setLoading(false);
      setProcessing(null);
    }
  };

  const handleProcessExisting = async (id: number) => {
    setProcessing(id);
    try {
      await processTranscript(id);
      toast.success('Transcript processed!');
      loadTranscripts();
      onProcessed();
    } catch (error) {
      console.error('Error processing transcript:', error);
      toast.error('Failed to process transcript');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FiUpload className="mr-2" />
          Upload Meeting Transcript
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Weekly Team Sync - Oct 21"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transcript *
            </label>
            <textarea
              required
              value={formData.transcript}
              onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              placeholder="Paste your meeting transcript here...&#10;&#10;The AI will extract:&#10;- New action items&#10;- Task completions&#10;- Task updates"
            />
          </div>

          <button
            type="submit"
            disabled={loading || processing !== null}
            className="w-full px-4 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading || processing !== null ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing with AI...
              </>
            ) : (
              'Upload & Process with AI'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works:</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• AI extracts action items and assigns them to team members</li>
            <li>• Automatically detects task completions mentioned in the meeting</li>
            <li>• Updates existing tasks based on meeting discussion</li>
            <li>• Generates a concise meeting summary</li>
          </ul>
        </div>
      </div>

      {/* Transcript History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FiFileText className="mr-2" />
          Recent Transcripts
        </h2>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {transcripts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No transcripts yet. Upload your first meeting notes!
            </p>
          ) : (
            transcripts.map((transcript) => (
              <div
                key={transcript.id}
                onClick={() => router.push(`/transcripts/${transcript.id}`)}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{transcript.title}</h3>
                  {transcript.processed ? (
                    <FiCheckCircle className="text-green-500 flex-shrink-0" size={18} />
                  ) : (
                    <FiClock className="text-gray-400 flex-shrink-0" size={18} />
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-2">
                  {new Date(transcript.created_at).toLocaleDateString()} at{' '}
                  {new Date(transcript.created_at).toLocaleTimeString()}
                </p>

                {transcript.summary && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {transcript.summary}
                  </p>
                )}

                {!transcript.processed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProcessExisting(transcript.id);
                    }}
                    disabled={processing === transcript.id}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                  >
                    {processing === transcript.id ? 'Processing...' : 'Process with AI'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
