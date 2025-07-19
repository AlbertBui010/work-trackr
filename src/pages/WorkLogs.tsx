import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, Clock, Tag, Edit, Trash2 } from 'lucide-react';
import { useWorkLogs, WorkLog } from '../contexts/WorkLogContext';
import WorkLogModal from '../components/WorkLogModal';

const WorkLogs: React.FC = () => {
  const { workLogs, deleteWorkLog } = useWorkLogs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

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
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Work Logs</h1>
            <p className="text-slate-400">Track and manage your daily work activities.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Add Work Log</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search work logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">All Types</option>
                {allTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Work Logs List */}
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No work logs found</h3>
              <p className="text-slate-400">
                {workLogs.length === 0 
                  ? "Start tracking your work by adding your first log."
                  : "Try adjusting your filters or search terms."
                }
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="bg-slate-800 rounded-xl p-6 hover:bg-slate-750 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-100">{log.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                        {log.type}
                      </span>
                    </div>

                    {log.description && (
                      <p className="text-slate-400 mb-3">{log.description}</p>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-slate-500 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDateTime(log.startTime)} - {formatDateTime(log.endTime)}
                      </div>
                      <span>•</span>
                      <span className="font-medium">{formatDuration(log.duration)}</span>
                    </div>

                    {log.tags.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-slate-500" />
                        <div className="flex flex-wrap gap-1">
                          {log.tags.map((tag, index) => (
                            <span key={index} className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(log)}
                      className="text-slate-400 hover:text-blue-400 p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="text-slate-400 hover:text-red-400 p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Work Log Modal */}
        {isModalOpen && (
          <WorkLogModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            editingLog={editingLog}
          />
        )}
      </div>
    </div>
  );
};

export default WorkLogs;