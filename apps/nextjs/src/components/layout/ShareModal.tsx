'use client';

import { useState, useEffect } from 'react';
import { Workspace } from '@/types';
import { Copy, Check, Globe, Lock, RefreshCw } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
}

export function ShareModal({ isOpen, onClose, workspace }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState('');
  const [isPublic, setIsPublic] = useState(workspace.isPublic);

  useEffect(() => {
    if (isOpen && workspace.shareToken) {
      const url = `${window.location.origin}/share/${workspace.shareToken}`;
      setLink(url);
    }
  }, [isOpen, workspace.shareToken]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

        <div className="space-y-6">
          {/* Link Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Share Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={link}
                readOnly
                placeholder="Generate link to share..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Access Info */}
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
                onClick={() => setIsPublic(!isPublic)}
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

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
