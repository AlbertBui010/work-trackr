import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, Calendar, Clock, Tag, Edit, Trash2 } from 'lucide-react';
import { useWorkLogs, WorkLog } from '../contexts/WorkLogContext';
import { useDebounce, usePerformance } from '../hooks/usePerformance';
import WorkLogModal from '../components/WorkLogModal';
import QuickLogWidget from '../components/QuickLogWidget';
import VirtualizedWorkLogs from '../components/VirtualizedWorkLogs';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

const WorkLogs: React.FC = () => {
  const { t } = useTranslation();
  const { workLogs, deleteWorkLog } = useWorkLogs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Debounce search for performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Performance optimization for large datasets
  const {
    data: paginatedLogs,
    loading,
    hasMore,
    loadMore,
    totalCount
  } = usePerformance(workLogs, {
    pageSize: 20,
    cacheKey: `worklogs-${debouncedSearchTerm}-${selectedType}-${selectedTag}-${dateFilter}`
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onQuickLog: () => setIsQuickLogOpen(true),
    onToggleSearch: () => {
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  });

  // Get unique tags and types for filters
  const allTags = Array.from(new Set(workLogs.flatMap(log => log.tags)));
  const allTypes = Array.from(new Set(workLogs.map(log => log.type)));

  // Filter work logs
  const filteredLogs = workLogs.filter(log => {
    const matchesSearch = log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || log.type === selectedType;
    const matchesTag = !selectedTag || log.tags.includes(selectedTag);
    const matchesDate = !dateFilter || 
                       new Date(log.startTime).toDateString() === new Date(dateFilter).toDateString();
    
    return matchesSearch && matchesType && matchesTag && matchesDate;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const handleEdit = (log: WorkLog) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this work log?')) {
      deleteWorkLog(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingLog(null);
  };

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

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('workLog.title')}</h1>
            <p className="text-slate-600 dark:text-slate-400">{t('workLog.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsQuickLogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>{t('workLog.quickLog')}</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <span>{t('workLog.detailedLog')}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder={t('workLog.searchWorkLogs')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={t('workLog.searchWorkLogs')}
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                aria-label={t('accessibility.filterBy')}
              >
                <option value="">{t('workLog.allTypes')}</option>
                {allTypes.map(type => (
                  <option key={type} value={type}>{t(`workLog.workTypes.${type.toLowerCase()}`)}</option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-400" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                aria-label={t('accessibility.filterBy')}
              >
                <option value="">{t('workLog.allTags')}</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={t('export.selectDateRange')}
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedType || selectedTag || dateFilter) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('');
                  setSelectedTag('');
                  setDateFilter('');
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
              >
                {t('workLog.clearFilters')}
              </button>
            </div>
          )}
        </div>

        {/* Performance Stats */}
        {totalCount > 0 && (
          <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            {t('performance.showingResults', { 
              start: 1, 
              end: Math.min(paginatedLogs.length, totalCount), 
              total: totalCount 
            })}
          </div>
        )}

        {/* Virtualized Work Logs List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <VirtualizedWorkLogs
            workLogs={workLogs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchTerm={debouncedSearchTerm}
            selectedType={selectedType}
            selectedTag={selectedTag}
            dateFilter={dateFilter}
          />
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-6">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              {loading ? t('performance.loadingMore') : t('common.loadMore')}
            </button>
          </div>
        )}

        {/* End of Results */}
        {!hasMore && totalCount > 0 && (
          <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
            {t('performance.endOfResults')}
          </div>
        )}

        {/* Work Log Modal */}
        {isModalOpen && (
          <WorkLogModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            editingLog={editingLog}
          />
        )}

        {/* Quick Log Widget */}
        <QuickLogWidget
          isOpen={isQuickLogOpen}
          onClose={() => setIsQuickLogOpen(false)}
          onToggle={() => setIsQuickLogOpen(!isQuickLogOpen)}
        />
      </div>
    </div>
  );
};

export default WorkLogs;