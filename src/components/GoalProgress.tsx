import React from 'react';
import { Target, Clock, CheckSquare } from 'lucide-react';
import { useGoals } from '../contexts/GoalContext';

const GoalProgress: React.FC = () => {
  const { goals, getActiveGoals, getGoalProgress } = useGoals();
  const activeGoals = getActiveGoals();

  if (activeGoals.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No active goals. Set your first goal!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeGoals.slice(0, 3).map((goal) => {
        const progress = getGoalProgress(goal.id);
        const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        return (
          <div key={goal.id} className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-slate-100 text-sm leading-tight">{goal.description}</h3>
              <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
              </span>
            </div>
            
            {goal.targetHours && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Hours Progress
                  </span>
                  <span className="text-slate-300">
                    {Math.round(progress.hoursProgress)}% of {goal.targetHours}h
                  </span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress.hoursProgress, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            {goal.targetTasks && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400 flex items-center">
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Tasks Progress
                  </span>
                  <span className="text-slate-300">
                    {Math.round(progress.tasksProgress)}% of {goal.targetTasks}
                  </span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress.tasksProgress, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GoalProgress;