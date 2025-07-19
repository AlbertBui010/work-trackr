import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Clock, Tag, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WorkLog } from '../contexts/WorkLogContext';

interface VirtualizedWorkLogsProps {
  workLogs: WorkLog[];
  onEdit: (log: WorkLog) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  selectedType: string;
  selectedTag: string;
  dateFilter: string;
}

const VirtualizedWorkLogs: React.FC<VirtualizedWorkLogsProps> = ({
  workLogs,
  onEdit,
  onDelete,
  searchTerm,
  selectedType,
  selectedTag,
  dateFilter
}) => {
  const { t } = useTranslation();

  // Memoized filtered logs for performance
  const filteredLogs = useMemo(() => {
    return workLogs.filter(log => {
      const matchesSearch = log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || log.type === selectedType;
      const matchesTag = !selectedTag || log.tags.includes(selectedTag);
      const matchesDate = !dateFilter || 
                         new Date(log.startTime).toDateString() === new Date(dateFilter).toDateString();
      
      return matchesSearch && matchesType && matchesTag && matchesDate;
    }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [workLogs, searchTerm, selectedType, selectedTag, dateFilter]);

  const getTypeColor = (type: string) => {
    const colors = {
      'Coding': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Meeting': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Study': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Deep Work': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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

  // Row renderer for virtual list
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const log = filteredLogs[index];
    
    return (
      <div style={style} className="px-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors duration-200 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{log.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                  {t(`workLog.workTypes.${log.type.toLowerCase()}`)}
                </span>
              </div>

              {log.description && (
                <p className="text-slate-600 dark:text-slate-400 mb-3">{log.description}</p>
              )}

              <div className="flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400 mb-3">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDateTime(log.startTime)} - {formatDateTime(log.endTime)}
                </div>
                <span>•</span>
                <span className="font-medium">{formatDuration(log.duration)}</span>
              </div>

              {log.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <div className="flex flex-wrap gap-1">
                    {log.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onEdit(log)}
                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                aria-label={t('common.edit')}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(log.id)}
                className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                aria-label={t('common.delete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (filteredLogs.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-16 w-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t('workLog.noLogsFound')}
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          {workLogs.length === 0 
            ? t('workLog.startTracking')
            : t('workLog.adjustFilters')
          }
        </p>
      </div>
    );
  }

  return (
    <div className="h-96">
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={filteredLogs.length}
            itemSize={180} // Approximate height of each row
            itemData={filteredLogs}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedWorkLogs;