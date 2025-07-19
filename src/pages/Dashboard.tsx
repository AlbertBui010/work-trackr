import React from 'react';
import { Clock, Target, TrendingUp, Calendar } from 'lucide-react';
import { useWorkLogs } from '../contexts/WorkLogContext';
import { useGoals } from '../contexts/GoalContext';
import StatsCard from '../components/StatsCard';
import RecentWorkLogs from '../components/RecentWorkLogs';
import GoalProgress from '../components/GoalProgress';
import WeeklyChart from '../components/WeeklyChart';

const Dashboard: React.FC = () => {
  const { workLogs } = useWorkLogs();
  const { goals, getActiveGoals } = useGoals();

  // Calculate stats
  const today = new Date();
  const todayLogs = workLogs.filter(log => 
    new Date(log.startTime).toDateString() === today.toDateString()
  );
  const todayHours = todayLogs.reduce((sum, log) => sum + log.duration, 0) / 60;
  
  const thisWeek = workLogs.filter(log => {
    const logDate = new Date(log.startTime);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return logDate >= weekStart;
  });
  const weeklyHours = thisWeek.reduce((sum, log) => sum + log.duration, 0) / 60;

  const activeGoals = getActiveGoals();
  const completedTasks = workLogs.length;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's your productivity overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Today's Hours"
            value={todayHours.toFixed(1)}
            unit="hours"
            icon={Clock}
            color="blue"
          />
          <StatsCard
            title="Weekly Hours"
            value={weeklyHours.toFixed(1)}
            unit="hours"
            icon={Calendar}
            color="green"
          />
          <StatsCard
            title="Active Goals"
            value={activeGoals.length}
            unit="goals"
            icon={Target}
            color="purple"
          />
          <StatsCard
            title="Completed Tasks"
            value={completedTasks}
            unit="tasks"
            icon={TrendingUp}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Chart */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Weekly Activity</h2>
              <WeeklyChart />
            </div>
          </div>

          {/* Goal Progress */}
          <div>
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Goal Progress</h2>
              <GoalProgress />
            </div>
          </div>
        </div>

        {/* Recent Work Logs */}
        <div className="mt-6">
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Recent Work Logs</h2>
            <RecentWorkLogs />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;