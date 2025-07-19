import React, { useState } from 'react';
import { Clock, Edit, Trash2, Plus } from 'lucide-react';
import { useWorkLogs, WorkLog } from '../contexts/WorkLogContext';

interface DailyTimelineProps {
  selectedDate?: Date;
}

const DailyTimeline: React.FC<DailyTimelineProps> = ({ selectedDate = new Date() }) => {
  const { workLogs, deleteWorkLog } = useWorkLogs();
  const [hoveredLog, setHoveredLog] = useState<string | null>(null);

  // Filter logs for the selected date
  const dayLogs = workLogs.filter(log => {
    const logDate = new Date(log.startTime);
    return logDate.toDateString() === selectedDate.toDateString();
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Generate timeline hours (7 AM to 8 PM)
  const timelineHours = Array.from({ length: 14 }, (_, i) => i + 7);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLogPosition = (log: WorkLog) => {
    const startHour = new Date(log.startTime).getHours();
    const startMinute = new Date(log.startTime).getMinutes();
    const endHour = new Date(log.endTime).getHours();
    const endMinute = new Date(log.endTime).getMinutes();
    
    const startPosition = ((startHour - 7) * 60 + startMinute) / 60; // Hours from 7 AM
    const duration = ((endHour - startHour) * 60 + (endMinute - startMinute)) / 60;
    
    return {
      top: `${startPosition * 60}px`, // 60px per hour
      height: `${Math.max(duration * 60, 30)}px` // Minimum 30px height
    };
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Coding': 'bg-blue-500 border-blue-400',
      'Meeting': 'bg-green-500 border-green-400',
      'Study': 'bg-purple-500 border-purple-400',
      'Deep Work': 'bg-orange-500 border-orange-400',
      'Other': 'bg-gray-500 border-gray-400'
    };
    return colors[type as keyof typeof colors] || colors.Other;
  };

  const totalHours = dayLogs.reduce((sum, log) => sum + log.duration, 0) / 60;
  const totalTasks = dayLogs.length;
  const mostUsedTags = dayLogs.flatMap(log => log.tags)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topTag = Object.entries(mostUsedTags).sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Daily Timeline - {selectedDate.toLocaleDateString([], { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
            <span>📊 {totalHours.toFixed(1)}h total</span>
            <span>•</span>
            <span>✅ {totalTasks} tasks</span>
            {topTag && (
              <>
                <span>•</span>
                <span>🏷️ Most used: {topTag[0]}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Timeline Hours */}
        <div className="absolute left-0 top-0 w-16">
          {timelineHours.map(hour => (
            <div key={hour} className="h-15 flex items-start text-xs text-slate-500 border-t border-slate-700 pt-1">
              {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </div>
          ))}
        </div>

        {/* Timeline Content */}
        <div className="ml-20 relative" style={{ height: `${14 * 60}px` }}>
          {/* Hour Grid Lines */}
          {timelineHours.map((hour, index) => (
            <div
              key={hour}
              className="absolute w-full border-t border-slate-700"
              style={{ top: `${index * 60}px` }}
            />
          ))}

          {/* Work Log Blocks */}
          {dayLogs.map((log) => {
            const position = getLogPosition(log);
            return (
              <div
                key={log.id}
                className={`absolute left-0 right-0 mx-2 rounded-lg border-l-4 p-3 cursor-pointer transition-all duration-200 ${getTypeColor(log.type)} bg-opacity-20 hover:bg-opacity-30 ${
                  hoveredLog === log.id ? 'ring-2 ring-blue-400 bg-opacity-30' : ''
                }`}
                style={position}
                onMouseEnter={() => setHoveredLog(log.id)}
                onMouseLeave={() => setHoveredLog(null)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-100 text-sm truncate">
                      {log.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(log.startTime)} - {formatTime(log.endTime)}</span>
                      <span>•</span>
                      <span>{formatDuration(log.duration)}</span>
                    </div>
                    {log.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {log.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-slate-600 text-slate-300 px-1 py-0.5 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {log.tags.length > 3 && (
                          <span className="text-slate-400 text-xs">+{log.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {hoveredLog === log.id && (
                    <div className="flex items-center space-x-1 ml-2">
                      <button className="text-slate-400 hover:text-blue-400 p-1 hover:bg-slate-700 rounded transition-colors duration-200">
                        <Edit className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => deleteWorkLog(log.id)}
                        className="text-slate-400 hover:text-red-400 p-1 hover:bg-slate-700 rounded transition-colors duration-200"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {dayLogs.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Clock className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-2">No work logged for this day</p>
                <p className="text-slate-500 text-sm">Start tracking your productivity!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {dayLogs.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-400">{totalHours.toFixed(1)}h</div>
              <div className="text-xs text-slate-400">Total Time</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-400">{totalTasks}</div>
              <div className="text-xs text-slate-400">Tasks</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-400">
                {totalTasks > 0 ? (totalHours / totalTasks).toFixed(1) : '0'}h
              </div>
              <div className="text-xs text-slate-400">Avg/Task</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-400">
                {Object.keys(mostUsedTags).length}
              </div>
              <div className="text-xs text-slate-400">Unique Tags</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTimeline;