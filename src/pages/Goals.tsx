import React, { useState } from 'react';
import { Plus, Target, Calendar, Clock, CheckSquare, Edit, Trash2 } from 'lucide-react';
import { useGoals, Goal } from '../contexts/GoalContext';
import GoalModal from '../components/GoalModal';

const Goals: React.FC = () => {
  const { goals, deleteGoal, getGoalProgress } = useGoals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed' | 'failed'>('all');

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    return goal.status === (filter === 'ongoing' ? 'Ongoing' : filter === 'completed' ? 'Completed' : 'Failed');
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Ongoing': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors];
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
    const end = new Date(endDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Goals</h1>
            <p className="text-slate-400">Set and track your productivity goals.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Add Goal</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Goals' },
              { key: 'ongoing', label: 'Ongoing' },
              { key: 'completed', label: 'Completed' },
              { key: 'failed', label: 'Failed' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-6">
          {filteredGoals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No goals found</h3>
              <p className="text-slate-400">
                {goals.length === 0 
                  ? "Set your first goal to start tracking your progress."
                  : "Try changing the filter to see more goals."
                }
              </p>
            </div>
          ) : (
            filteredGoals.map((goal) => {
              const progress = getGoalProgress(goal.id);
              const daysRemaining = getDaysRemaining(goal.endDate);
              
              return (
                <div key={goal.id} className="bg-slate-800 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-100">{goal.description}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                          {goal.status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-slate-400 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDateRange(goal.startDate, goal.endDate)}
                        </div>
                        <span>•</span>
                        <span className={daysRemaining.includes('Overdue') ? 'text-red-400' : ''}>
                          {daysRemaining}
                        </span>
                      </div>

                      {/* Progress Bars */}
                      <div className="space-y-3">
                        {goal.targetHours && (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-400 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Hours Progress
                              </span>
                              <span className="text-slate-300">
                                {Math.round(progress.hoursProgress)}% of {goal.targetHours}h
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3">
                              <div 
                                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(progress.hoursProgress, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {goal.targetTasks && (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-400 flex items-center">
                                <CheckSquare className="h-4 w-4 mr-1" />
                                Tasks Progress
                              </span>
                              <span className="text-slate-300">
                                {Math.round(progress.tasksProgress)}% of {goal.targetTasks}
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3">
                              <div 
                                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(progress.tasksProgress, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="text-slate-400 hover:text-blue-400 p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-slate-400 hover:text-red-400 p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Goal Modal */}
        {isModalOpen && (
          <GoalModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            editingGoal={editingGoal}
          />
        )}
      </div>
    </div>
  );
};

export default Goals;