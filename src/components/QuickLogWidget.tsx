import React, { useState, useEffect, useRef } from 'react';
import { Plus, Clock, Tag, Play, Square, Save, Zap } from 'lucide-react';
import { useWorkLogs } from '../contexts/WorkLogContext';

interface QuickLogWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const QuickLogWidget: React.FC<QuickLogWidgetProps> = ({ isOpen, onClose, onToggle }) => {
  const { addWorkLog, workLogs } = useWorkLogs();
  const [isTimerMode, setIsTimerMode] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    tags: '',
    project: '',
    notes: ''
  });

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on title input when opened
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize time fields with current time
  useEffect(() => {
    if (isOpen && !isTimerMode) {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        startTime: oneHourAgo.toTimeString().slice(0, 5),
        endTime: now.toTimeString().slice(0, 5)
      }));
    }
  }, [isOpen, isTimerMode]);

  // Get suggestions from recent work logs
  const getTaskSuggestions = () => {
    const recentTasks = workLogs
      .slice(-10)
      .map(log => log.title)
      .filter((title, index, arr) => arr.indexOf(title) === index);
    return recentTasks;
  };

  const getTagSuggestions = () => {
    const allTags = workLogs.flatMap(log => log.tags);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags;
  };

  const getProjectSuggestions = () => {
    // Extract projects from recent work logs (assuming project is in tags or title)
    const projects = ['WorkTrackr', 'Personal', 'Client Work', 'Learning'];
    return projects;
  };

  const handleStartTimer = () => {
    setIsTimerMode(true);
    setTimerStart(new Date());
  };

  const handleStopTimer = () => {
    if (timerStart) {
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - timerStart.getTime()) / (1000 * 60));
      
      setFormData(prev => ({
        ...prev,
        startTime: timerStart.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5)
      }));
      
      setIsTimerMode(false);
      setTimerStart(null);
      
      // Auto-focus on title for quick entry
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  };

  const handleQuickSave = () => {
    if (!formData.title.trim()) return;

    const today = new Date();
    const [startHour, startMin] = formData.startTime.split(':');
    const [endHour, endMin] = formData.endTime.split(':');
    
    const startTime = new Date(today);
    startTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
    
    const endTime = new Date(today);
    endTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0);
    
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    // Smart tag detection
    const smartTags = detectSmartTags(formData.title);
    const allTags = [...smartTags, ...formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)];
    
    addWorkLog({
      title: formData.title,
      description: formData.notes,
      startTime,
      endTime,
      tags: [...new Set(allTags)], // Remove duplicates
      type: detectWorkType(formData.title, allTags),
      duration
    });

    // Reset form
    setFormData({
      title: '',
      startTime: '',
      endTime: '',
      tags: '',
      project: '',
      notes: ''
    });

    // Show success feedback
    showSuccessToast();
    onClose();
  };

  const detectSmartTags = (title: string): string[] => {
    const tags: string[] = [];
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('meeting') || lowerTitle.includes('call')) tags.push('meeting');
    if (lowerTitle.includes('code') || lowerTitle.includes('develop') || lowerTitle.includes('bug')) tags.push('coding');
    if (lowerTitle.includes('design') || lowerTitle.includes('ui') || lowerTitle.includes('ux')) tags.push('design');
    if (lowerTitle.includes('review') || lowerTitle.includes('test')) tags.push('review');
    if (lowerTitle.includes('doc') || lowerTitle.includes('write')) tags.push('documentation');
    
    return tags;
  };

  const detectWorkType = (title: string, tags: string[]) => {
    const lowerTitle = title.toLowerCase();
    const allText = (title + ' ' + tags.join(' ')).toLowerCase();
    
    if (allText.includes('meeting') || allText.includes('call')) return 'Meeting';
    if (allText.includes('code') || allText.includes('develop') || allText.includes('programming')) return 'Coding';
    if (allText.includes('study') || allText.includes('learn') || allText.includes('research')) return 'Study';
    if (allText.includes('focus') || allText.includes('deep')) return 'Deep Work';
    
    return 'Other';
  };

  const showSuccessToast = () => {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    toast.textContent = '✅ Work logged successfully!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleQuickSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 z-40"
        title="Quick Log Work (Ctrl+L)"
      >
        <Plus className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full shadow-2xl border border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-400" />
              Quick Log Work
            </h2>
            <div className="flex items-center space-x-2">
              {!isTimerMode ? (
                <button
                  onClick={handleStartTimer}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1 transition-colors duration-200"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Timer</span>
                </button>
              ) : (
                <button
                  onClick={handleStopTimer}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1 transition-colors duration-200 animate-pulse"
                >
                  <Square className="h-4 w-4" />
                  <span>Stop & Log</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4" onKeyDown={handleKeyDown}>
            {/* Task Name with Smart Suggestions */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📝 What did you work on? *
              </label>
              <input
                ref={titleInputRef}
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Fixed login bug, Team standup, Code review..."
                list="task-suggestions"
              />
              <datalist id="task-suggestions">
                {getTaskSuggestions().map((task, index) => (
                  <option key={index} value={task} />
                ))}
              </datalist>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  🕓 Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isTimerMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  🕓 End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isTimerMode}
                />
              </div>
            </div>

            {/* Tags with Smart Detection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🏷️ Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="frontend, react, bug-fix..."
                list="tag-suggestions"
              />
              <datalist id="tag-suggestions">
                {getTagSuggestions().map((tag, index) => (
                  <option key={index} value={tag} />
                ))}
              </datalist>
              <div className="mt-2 flex flex-wrap gap-1">
                {detectSmartTags(formData.title).map((tag, index) => (
                  <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                    Auto: {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📁 Project (optional)
              </label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="WorkTrackr, Client Project..."
                list="project-suggestions"
              />
              <datalist id="project-suggestions">
                {getProjectSuggestions().map((project, index) => (
                  <option key={index} value={project} />
                ))}
              </datalist>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🗒️ Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional details..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-700">
              <div className="text-sm text-slate-400">
                💡 Press <kbd className="bg-slate-600 px-1 rounded">Ctrl+Enter</kbd> to save quickly
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuickSave}
                  disabled={!formData.title.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Work Log</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickLogWidget;