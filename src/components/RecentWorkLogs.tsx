import React from 'react';
import { Clock, Tag } from 'lucide-react';
import { useWorkLogs } from '../contexts/WorkLogContext';

const RecentWorkLogs: React.FC = () => {
  const { workLogs } = useWorkLogs();
  
  const recentLogs = workLogs
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5);

  const getTypeColor = (type: string) => {
    const colors = {
      'Coding': 'bg-blue-100 text-blue-800',
      'Meeting': 'bg-green-100 text-green-800',
      'Study': 'bg-purple-100 text-purple-800',
      'Deep Work': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.Other;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (recentLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No work logs yet. Start your first session!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentLogs.map((log) => (
        <div key={log.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-slate-100 mb-1">{log.title}</h3>
              {log.description && (
                <p className="text-sm text-slate-400 mb-2">{log.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-slate-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTime(log.startTime)} - {formatTime(log.endTime)}
                </div>
                <span>•</span>
                <span>{formatDuration(log.duration)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                {log.type}
              </span>
            </div>
          </div>
          {log.tags.length > 0 && (
            <div className="flex items-center mt-3 space-x-2">
              <Tag className="h-4 w-4 text-slate-500" />
              <div className="flex flex-wrap gap-1">
                {log.tags.map((tag, index) => (
                  <span key={index} className="bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecentWorkLogs;