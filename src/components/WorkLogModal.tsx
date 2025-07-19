import React, { useState, useEffect } from 'react';
import { X, Clock, Tag, FileText, Upload } from 'lucide-react';
import { useWorkLogs, WorkLog } from '../contexts/WorkLogContext';

interface WorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLog?: WorkLog | null;
}

const WorkLogModal: React.FC<WorkLogModalProps> = ({ isOpen, onClose, editingLog }) => {
  const { addWorkLog, updateWorkLog } = useWorkLogs();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'Coding' as const,
    tags: ''
  });

  useEffect(() => {
    if (editingLog) {
      setFormData({
        title: editingLog.title,
        description: editingLog.description,
        startTime: new Date(editingLog.startTime).toISOString().slice(0, 16),
        endTime: new Date(editingLog.endTime).toISOString().slice(0, 16),
        type: editingLog.type,
        tags: editingLog.tags.join(', ')
      });
    } else {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      setFormData({
        title: '',
        description: '',
        startTime: oneHourAgo.toISOString().slice(0, 16),
        endTime: now.toISOString().slice(0, 16),
        type: 'Coding',
        tags: ''
      });
    }
  }, [editingLog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    const workLogData = {
      title: formData.title,
      description: formData.description,
      startTime,
      endTime,
      type: formData.type,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      duration
    };

    if (editingLog) {
      updateWorkLog(editingLog.id, workLogData);
    } else {
      addWorkLog(workLogData);
    }

    onClose();
  };

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / (1000 * 60));
      
      if (diffMins > 0) {
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      }
    }
    return '0m';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">
            {editingLog ? 'Edit Work Log' : 'Add Work Log'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What did you work on?"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description..."
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Duration Display */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-slate-400" />
              <span className="text-slate-300">Duration:</span>
              <span className="font-medium text-slate-100">{calculateDuration()}</span>
            </div>
          </div>

          {/* Work Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Work Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Coding">Coding</option>
              <option value="Meeting">Meeting</option>
              <option value="Study">Study</option>
              <option value="Deep Work">Deep Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="react, frontend, ui (comma separated)"
              />
            </div>
          </div>

          {/* File Upload Placeholder */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Attachments
            </label>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm mb-2">File upload coming soon</p>
              <p className="text-slate-500 text-xs">Drag and drop files or click to browse</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              {editingLog ? 'Update' : 'Add'} Work Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkLogModal;