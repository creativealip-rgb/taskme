import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Globe, Lock, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { workspacesApi } from '../services/api';
import { Workspace } from '../types/task';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
}

export function ShareModal({ isOpen, onClose, workspace }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState('');
  const [isPublic, setIsPublic] = useState(workspace.isPublic);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLink = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workspacesApi.generateShareToken(workspace.id);
      const shareToken = response.data.token;
      const url = `${window.location.origin}/share/${shareToken}`;
      setLink(url);
    } catch (err) {
      console.error('Failed to generate share token:', err);
      setError('Failed to generate share link');
    } finally {
      setIsLoading(false);
    }
  }, [workspace.id]);

  const togglePublic = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workspacesApi.togglePublic(workspace.id);
      setIsPublic(response.data.isPublic);
    } catch (err) {
      console.error('Failed to toggle public:', err);
      setError('Failed to update visibility');
    } finally {
      setIsLoading(false);
    }
  }, [workspace.id]);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [link]);

  useEffect(() => {
    if (isOpen && workspace.shareToken) {
      const url = `${window.location.origin}/share/${workspace.shareToken}`;
      setLink(url);
    }
  }, [isOpen, workspace.shareToken]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Share "{workspace.name}"</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Generate link to share..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                readOnly
              />
              <button
                onClick={generateLink}
                disabled={isLoading}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Generate
              </button>
            </div>
            {link && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Globe className="w-5 h-5 text-emerald-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <Lock className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {isPublic ? 'Public Workspace' : 'Private Workspace'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isPublic ? 'Anyone with the link can view' : 'Only you can access'}
                  </p>
                </div>
              </div>
              <button
                onClick={togglePublic}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (link) {
                  navigator.clipboard.writeText(link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              disabled={!link}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
