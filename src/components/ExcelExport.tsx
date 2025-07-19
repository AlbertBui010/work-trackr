import React, { useState } from 'react';
import { Download, Calendar, BarChart3, FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useWorkLogs } from '../contexts/WorkLogContext';
import { useGoals } from '../contexts/GoalContext';

interface ExcelExportProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExcelExport: React.FC<ExcelExportProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { workLogs } = useWorkLogs();
  const { goals } = useGoals();
  
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  
  const [options, setOptions] = useState({
    includeCharts: true,
    includeStats: true,
    includeGoals: true
  });
  
  const [isExporting, setIsExporting] = useState(false);

  const filterDataByDateRange = () => {
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999); // End of day
    
    return workLogs.filter(log => {
      const logDate = new Date(log.startTime);
      return logDate >= fromDate && logDate <= toDate;
    });
  };

  const generateWorkLogsSheet = (filteredLogs: any[]) => {
    const data = filteredLogs.map(log => ({
      [t('workLog.taskTitle')]: log.title,
      [t('workLog.description')]: log.description || '',
      [t('workLog.startTime')]: new Date(log.startTime).toLocaleString(),
      [t('workLog.endTime')]: new Date(log.endTime).toLocaleString(),
      [t('workLog.duration')]: `${Math.floor(log.duration / 60)}h ${log.duration % 60}m`,
      [t('workLog.workType')]: t(`workLog.workTypes.${log.type.toLowerCase()}`),
      [t('workLog.tags')]: log.tags.join(', '),
      [t('common.date')]: new Date(log.startTime).toLocaleDateString()
    }));
    
    return XLSX.utils.json_to_sheet(data);
  };

  const generateStatsSheet = (filteredLogs: any[]) => {
    // Calculate statistics
    const totalHours = filteredLogs.reduce((sum, log) => sum + log.duration, 0) / 60;
    const totalTasks = filteredLogs.length;
    const avgSessionLength = totalTasks > 0 ? totalHours / totalTasks : 0;
    
    // Work type distribution
    const typeStats = filteredLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + log.duration / 60;
      return acc;
    }, {} as Record<string, number>);
    
    // Daily breakdown
    const dailyStats = filteredLogs.reduce((acc, log) => {
      const date = new Date(log.startTime).toLocaleDateString();
      acc[date] = (acc[date] || 0) + log.duration / 60;
      return acc;
    }, {} as Record<string, number>);
    
    // Tag usage
    const tagStats = filteredLogs.reduce((acc, log) => {
      log.tags.forEach((tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const statsData = [
      { [t('analytics.metric')]: t('analytics.totalHours'), [t('analytics.value')]: totalHours.toFixed(2) },
      { [t('analytics.metric')]: t('analytics.workSessions'), [t('analytics.value')]: totalTasks },
      { [t('analytics.metric')]: t('analytics.avgSession'), [t('analytics.value')]: avgSessionLength.toFixed(2) },
      { [t('analytics.metric')]: '', [t('analytics.value')]: '' }, // Empty row
      { [t('analytics.metric')]: t('analytics.workTypeBreakdown'), [t('analytics.value')]: '' },
      ...Object.entries(typeStats).map(([type, hours]) => ({
        [t('analytics.metric')]: t(`workLog.workTypes.${type.toLowerCase()}`),
        [t('analytics.value')]: hours.toFixed(2)
      })),
      { [t('analytics.metric')]: '', [t('analytics.value')]: '' }, // Empty row
      { [t('analytics.metric')]: t('analytics.dailyBreakdown'), [t('analytics.value')]: '' },
      ...Object.entries(dailyStats).map(([date, hours]) => ({
        [t('analytics.metric')]: date,
        [t('analytics.value')]: hours.toFixed(2)
      })),
      { [t('analytics.metric')]: '', [t('analytics.value')]: '' }, // Empty row
      { [t('analytics.metric')]: t('analytics.popularTags'), [t('analytics.value')]: '' },
      ...Object.entries(tagStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({
          [t('analytics.metric')]: tag,
          [t('analytics.value')]: count
        }))
    ];
    
    return XLSX.utils.json_to_sheet(statsData);
  };

  const generateGoalsSheet = () => {
    const data = goals.map(goal => ({
      [t('goals.goalDescription')]: goal.description,
      [t('goals.targetHours')]: goal.targetHours || '',
      [t('goals.targetTasks')]: goal.targetTasks || '',
      [t('goals.startDate')]: new Date(goal.startDate).toLocaleDateString(),
      [t('goals.endDate')]: new Date(goal.endDate).toLocaleDateString(),
      [t('goals.status')]: t(`goals.${goal.status.toLowerCase()}`),
      [t('common.createdAt')]: new Date(goal.createdAt).toLocaleDateString()
    }));
    
    return XLSX.utils.json_to_sheet(data);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const filteredLogs = filterDataByDateRange();
      const workbook = XLSX.utils.book_new();
      
      // Add work logs sheet
      const workLogsSheet = generateWorkLogsSheet(filteredLogs);
      XLSX.utils.book_append_sheet(workbook, workLogsSheet, t('navigation.workLogs'));
      
      // Add statistics sheet if enabled
      if (options.includeStats) {
        const statsSheet = generateStatsSheet(filteredLogs);
        XLSX.utils.book_append_sheet(workbook, statsSheet, t('analytics.title'));
      }
      
      // Add goals sheet if enabled
      if (options.includeGoals && goals.length > 0) {
        const goalsSheet = generateGoalsSheet();
        XLSX.utils.book_append_sheet(workbook, goalsSheet, t('navigation.goals'));
      }
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Save file
      const fileName = `WorkTrackr_${dateRange.from}_to_${dateRange.to}.xlsx`;
      saveAs(data, fileName);
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      toast.textContent = t('export.exportSuccess');
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 3000);
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      toast.textContent = t('export.exportError');
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 3000);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <FileSpreadsheet className="h-5 w-5 mr-2 text-green-600" />
              {t('export.exportData')}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('export.selectDateRange')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    {t('export.from')}
                  </label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    {t('export.to')}
                  </label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                {t('export.options')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeStats}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeStats: e.target.checked }))}
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                    {t('export.includeStats')}
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeGoals}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeGoals: e.target.checked }))}
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                    {t('goals.title')}
                  </span>
                </label>
              </div>
            </div>

            {/* Preview Info */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>{t('workLog.title')}:</span>
                  <span className="font-medium">{filterDataByDateRange().length} {t('common.tasks')}</span>
                </div>
                {options.includeGoals && (
                  <div className="flex items-center justify-between mt-1">
                    <span>{t('goals.title')}:</span>
                    <span className="font-medium">{goals.length}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? t('common.loading') : t('export.exportToExcel')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelExport;