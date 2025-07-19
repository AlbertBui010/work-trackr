import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Clock, Tag, Filter } from 'lucide-react';
import { useWorkLogs } from '../contexts/WorkLogContext';
import AnalyticsChart from '../components/AnalyticsChart';
import StatsCard from '../components/StatsCard';

const Analytics: React.FC = () => {
  const { workLogs } = useWorkLogs();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    };
    return ranges[timeRange];
  };

  const startDate = getDateRange();
  const filteredLogs = workLogs.filter(log => new Date(log.startTime) >= startDate);

  // Calculate analytics
  const totalHours = filteredLogs.reduce((sum, log) => sum + log.duration, 0) / 60;
  const totalSessions = filteredLogs.length;
  const avgSessionLength = totalSessions > 0 ? totalHours / totalSessions : 0;
  
  // Most productive day
  const dayStats = filteredLogs.reduce((acc, log) => {
    const day = new Date(log.startTime).toLocaleDateString([], { weekday: 'long' });
    acc[day] = (acc[day] || 0) + log.duration / 60;
    return acc;
  }, {} as Record<string, number>);
  
  const mostProductiveDay = Object.entries(dayStats).reduce((max, [day, hours]) => 
    hours > max.hours ? { day, hours } : max, { day: 'None', hours: 0 });

  // Work type distribution
  const typeStats = filteredLogs.reduce((acc, log) => {
    acc[log.type] = (acc[log.type] || 0) + log.duration / 60;
    return acc;
  }, {} as Record<string, number>);

  // Most used tags
  const tagStats = filteredLogs.reduce((acc, log) => {
    log.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Productivity insights
  const getProductivityTrend = () => {
    if (filteredLogs.length < 2) return 'No data';
    
    const halfwayPoint = Math.floor(filteredLogs.length / 2);
    const firstHalf = filteredLogs.slice(0, halfwayPoint);
    const secondHalf = filteredLogs.slice(halfwayPoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, log) => sum + log.duration, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, log) => sum + log.duration, 0) / secondHalf.length;
    
    const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    if (Math.abs(change) < 5) return 'Stable';
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Analytics</h1>
            <p className="text-slate-400">Insights into your productivity patterns and trends.</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="bg-slate-800 rounded-lg p-1 flex space-x-1">
            {[
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
              { key: 'quarter', label: 'Quarter' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeRange(key as any)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${
                  timeRange === key
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Hours"
            value={totalHours.toFixed(1)}
            unit="hours"
            icon={Clock}
            color="blue"
          />
          <StatsCard
            title="Work Sessions"
            value={totalSessions}
            unit="sessions"
            icon={Calendar}
            color="green"
          />
          <StatsCard
            title="Avg Session"
            value={avgSessionLength.toFixed(1)}
            unit="hours"
            icon={TrendingUp}
            color="purple"
          />
          <StatsCard
            title="Productivity"
            value={getProductivityTrend()}
            icon={BarChart3}
            color="orange"
          />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Time Distribution Chart */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Time Distribution</h2>
            <AnalyticsChart data={filteredLogs} type="time" />
          </div>

          {/* Work Type Chart */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Work Type Breakdown</h2>
            <AnalyticsChart data={filteredLogs} type="workType" />
          </div>
        </div>

        {/* Detailed Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Most Productive Day */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Most Productive Day</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {mostProductiveDay.day}
              </div>
              <div className="text-slate-400">
                {mostProductiveDay.hours.toFixed(1)} hours avg
              </div>
            </div>
          </div>

          {/* Work Type Distribution */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Work Types</h3>
            <div className="space-y-3">
              {Object.entries(typeStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 4)
                .map(([type, hours]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{type}</span>
                    <span className="text-slate-400 text-sm">{hours.toFixed(1)}h</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Tags */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Popular Tags
            </h3>
            <div className="space-y-2">
              {topTags.length > 0 ? (
                topTags.map(([tag, count]) => (
                  <div key={tag} className="flex items-center justify-between">
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                    <span className="text-slate-400 text-sm">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No tags used yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Productivity Tips */}
        <div className="mt-8 bg-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Productivity Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium text-slate-200 mb-2">💡 Peak Performance</h4>
              <p className="text-slate-400">
                Your most productive day is {mostProductiveDay.day}. 
                Consider scheduling important tasks on this day.
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium text-slate-200 mb-2">⏰ Session Length</h4>
              <p className="text-slate-400">
                Your average session is {avgSessionLength.toFixed(1)} hours. 
                {avgSessionLength < 1 ? 'Try longer focused sessions.' : 'Great focus duration!'}
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium text-slate-200 mb-2">📊 Work Balance</h4>
              <p className="text-slate-400">
                {Object.keys(typeStats).length > 1 
                  ? 'Good variety in work types keeps you engaged.'
                  : 'Consider diversifying your work activities.'
                }
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium text-slate-200 mb-2">🎯 Consistency</h4>
              <p className="text-slate-400">
                {totalSessions >= 5 
                  ? 'Great consistency in logging work!'
                  : 'Try to log work more regularly for better insights.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;