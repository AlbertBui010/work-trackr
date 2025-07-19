import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, Clock, CheckSquare } from 'lucide-react';
import { useGoals, Goal } from '../contexts/GoalContext';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: Goal | null;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, editingGoal }) => {
  const { addGoal, updateGoal } = useGoals();
  const [formData, setFormData] = useState({
    description: '',
    targetHours: '',
    targetTasks: '',
    startDate: '',
    endDate: '',
    status: 'Ongoing' as const
  });

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        description: editingGoal.description,
        targetHours: editingGoal.targetHours?.toString() || '',
        targetTasks: editingGoal.targetTasks?.toString() || '',
        startDate: new Date(editingGoal.startDate).toISOString().slice(0, 10),
        endDate: new Date(editingGoal.endDate).toISOString().slice(0, 10),
        status: editingGoal.status
      });
    } else {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      setFormData({
        description: '',
        targetHours: '',
        targetTasks: '',
        startDate: today.toISOString().slice(0, 10),
        endDate: nextWeek.toISOString().slice(0, 10),
        status: 'Ongoing'
      });
    }
  }, [editingGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one target is set
    if (!formData.targetHours && !formData.targetTasks) {
      alert('Please set at least one target (hours or tasks)');
      return;
    }

    const goalData = {
      description: formData.description,
      targetHours: formData.targetHours ? parseFloat(formData.targetHours) : undefined,
      targetTasks: formData.targetTasks ? parseInt(formData.targetTasks) : undefined,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate)
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, { ...goalData, status: formData.status });
    } else {
      addGoal(goalData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center">
            <Target className="h-6 w-6 mr-2" />
            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Goal Description *
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Work 40 hours this week"
            />
          </div>

          {/* Targets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Target Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.targetHours}
                onChange={(e) => setFormData(prev => ({ ...prev, targetHours: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <CheckSquare className="inline h-4 w-4 mr-1" />
                Target Tasks
              </label>
              <input
                type="number"
                min="0"
                value={formData.targetTasks}
                onChange={(e) => setFormData(prev => ({ ...prev, targetTasks: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status (only for editing) */}
          {editingGoal && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Goal Requirements:</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• At least one target (hours or tasks) must be specified</li>
              <li>• End date must be after start date</li>
              <li>• Goals will automatically track your progress based on work logs</li>
            </ul>
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
              {editingGoal ? 'Update' : 'Create'} Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;