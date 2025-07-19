import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Clock, Tag, FileText, Upload, Calendar, Folder, Type } from 'lucide-react';
import Select from 'react-select';
import { motion } from 'framer-motion';
import { useSupabaseWorkLogs, WorkLog } from '../hooks/useSupabaseWorkLogs';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { supabase } from '../lib/supabase';

const schema = yup.object({
  title: yup.string().required('Title is required').max(100, 'Title must be less than 100 characters'),
  description: yup.string().max(500, 'Description must be less than 500 characters'),
  start_time: yup.string().required('Start time is required'),
  end_time: yup.string().required('End time is required'),
  work_type_id: yup.string(),
  project_id: yup.string(),
  tags: yup.array().of(yup.string())
});

interface EnhancedWorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLog?: WorkLog | null;
}

interface WorkType {
  id: string;
  name: string;
  color: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

interface TagOption {
  value: string;
  label: string;
  color: string;
}

const EnhancedWorkLogModal: React.FC<EnhancedWorkLogModalProps> = ({
  isOpen,
  onClose,
  editingLog
}) => {
  const { addWorkLog, updateWorkLog } = useSupabaseWorkLogs();
  const { user } = useSupabaseAuth();
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      work_type_id: '',
      project_id: '',
      tags: []
    }
  });

  const watchedStartTime = watch('start_time');
  const watchedEndTime = watch('end_time');

  useEffect(() => {
    if (isOpen) {
      loadFormData();
      if (editingLog) {
        populateForm(editingLog);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingLog]);

  const loadFormData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load work types
      const { data: workTypesData } = await supabase
        .from('work_types')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('is_default', { ascending: false });

      if (workTypesData) setWorkTypes(workTypesData);

      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (projectsData) setProjects(projectsData);

      // Load tags
      const { data: tagsData } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

      if (tagsData) {
        const tagOptions = tagsData.map(tag => ({
          value: tag.name,
          label: tag.name,
          color: tag.color
        }));
        setAvailableTags(tagOptions);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (log: WorkLog) => {
    const startTime = new Date(log.start_time);
    const endTime = new Date(log.end_time);

    reset({
      title: log.title,
      description: log.description || '',
      start_time: startTime.toISOString().slice(0, 16),
      end_time: endTime.toISOString().slice(0, 16),
      work_type_id: log.work_type_id || '',
      project_id: log.project_id || '',
      tags: log.tags?.map(tag => tag.name) || []
    });
  };

  const resetForm = () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    reset({
      title: '',
      description: '',
      start_time: oneHourAgo.toISOString().slice(0, 16),
      end_time: now.toISOString().slice(0, 16),
      work_type_id: '',
      project_id: '',
      tags: []
    });
  };

  const onSubmit = async (data: any) => {
    try {
      const workLogData = {
        title: data.title,
        description: data.description,
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
        work_type_id: data.work_type_id || null,
        project_id: data.project_id || null,
        tags: data.tags || []
      };

      if (editingLog) {
        await updateWorkLog(editingLog.id, workLogData);
      } else {
        await addWorkLog(workLogData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving work log:', error);
    }
  };

  const calculateDuration = () => {
    if (watchedStartTime && watchedEndTime) {
      const start = new Date(watchedStartTime);
      const end = new Date(watchedEndTime);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / (1000 * 60));
      
      if (diffMins > 0) {
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      }
    }
    return '0m';
  };

  const handleFileUpload = async (files: FileList) => {
    if (!user || files.length === 0) return;

    try {
      setUploadingFiles(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('work-log-attachments')
          .upload(fileName, file);

        if (error) throw error;
        return data.path;
      });

      const uploadedPaths = await Promise.all(uploadPromises);
      console.log('Files uploaded:', uploadedPaths);
      // TODO: Add uploaded files to form data
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: '#334155',
      borderColor: state.isFocused ? '#3b82f6' : '#475569',
      color: '#e2e8f0',
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#334155',
      border: '1px solid #475569'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#475569' : '#334155',
      color: '#e2e8f0'
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#475569'
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#e2e8f0'
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#e2e8f0'
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#e2e8f0'
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#94a3b8'
    })
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">
            {editingLog ? 'Edit Work Log' : 'Add Work Log'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Type className="inline h-4 w-4 mr-1" />
              Title *
            </label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What did you work on?"
                />
              )}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description..."
                />
              )}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Time *
              </label>
              <Controller
                name="start_time"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="datetime-local"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
              {errors.start_time && (
                <p className="mt-1 text-sm text-red-400">{errors.start_time.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                End Time *
              </label>
              <Controller
                name="end_time"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="datetime-local"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
              {errors.end_time && (
                <p className="mt-1 text-sm text-red-400">{errors.end_time.message}</p>
              )}
            </div>
          </div>

          {/* Duration Display */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-slate-400" />
              <span className="text-slate-300">Duration:</span>
              <span className="font-medium text-slate-100">{calculateDuration()}</span>
            </div>
          </div>

          {/* Work Type and Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Type className="inline h-4 w-4 mr-1" />
                Work Type
              </label>
              <Controller
                name="work_type_id"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={workTypes.find(wt => wt.id === field.value) ? { value: field.value, label: workTypes.find(wt => wt.id === field.value)?.name } : null}
                    onChange={(option) => field.onChange(option?.value || '')}
                    options={workTypes.map(wt => ({ value: wt.id, label: wt.name }))}
                    styles={customSelectStyles}
                    placeholder="Select work type..."
                    isClearable
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Folder className="inline h-4 w-4 mr-1" />
                Project
              </label>
              <Controller
                name="project_id"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={projects.find(p => p.id === field.value) ? { value: field.value, label: projects.find(p => p.id === field.value)?.name } : null}
                    onChange={(option) => field.onChange(option?.value || '')}
                    options={projects.map(p => ({ value: p.id, label: p.name }))}
                    styles={customSelectStyles}
                    placeholder="Select project..."
                    isClearable
                  />
                )}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Tags
            </label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value?.map(tag => availableTags.find(t => t.value === tag) || { value: tag, label: tag, color: '#64748b' })}
                  onChange={(options) => field.onChange(options?.map(opt => opt.value) || [])}
                  options={availableTags}
                  styles={customSelectStyles}
                  placeholder="Select or create tags..."
                  isMulti
                  isCreatable
                />
              )}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Upload className="inline h-4 w-4 mr-1" />
              Attachments
            </label>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm mb-2">
                  {uploadingFiles ? 'Uploading...' : 'Drag and drop files or click to browse'}
                </p>
                <p className="text-slate-500 text-xs">Supports images, documents, and more</p>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              {isSubmitting ? 'Saving...' : editingLog ? 'Update' : 'Add'} Work Log
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EnhancedWorkLogModal;