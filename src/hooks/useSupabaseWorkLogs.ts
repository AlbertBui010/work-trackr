import { useState, useEffect } from 'react';
import { supabase, subscribeToWorkLogs } from '../lib/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface WorkLog {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  work_type_id: string | null;
  project_id: string | null;
  attachments: any[];
  created_at: string;
  updated_at: string;
  work_type?: {
    id: string;
    name: string;
    color: string;
  };
  project?: {
    id: string;
    name: string;
    color: string;
  };
  tags?: {
    id: string;
    name: string;
    color: string;
  }[];
}

export const useSupabaseWorkLogs = () => {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user) {
      fetchWorkLogs();
      
      // Subscribe to real-time changes
      const subscription = subscribeToWorkLogs(user.id, (payload) => {
        console.log('Work log change:', payload);
        fetchWorkLogs(); // Refetch data on changes
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchWorkLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('work_logs')
        .select(`
          *,
          work_type:work_types(id, name, color),
          project:projects(id, name, color),
          tags:work_log_tags(tag:tags(id, name, color))
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedLogs = data.map(log => ({
        ...log,
        tags: log.tags?.map((t: any) => t.tag) || []
      }));

      setWorkLogs(transformedLogs);
    } catch (err) {
      console.error('Error fetching work logs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addWorkLog = async (workLogData: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    work_type_id?: string;
    project_id?: string;
    tags?: string[];
    attachments?: any[];
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data: workLog, error } = await supabase
        .from('work_logs')
        .insert({
          user_id: user.id,
          title: workLogData.title,
          description: workLogData.description,
          start_time: workLogData.start_time,
          end_time: workLogData.end_time,
          work_type_id: workLogData.work_type_id,
          project_id: workLogData.project_id,
          attachments: workLogData.attachments || []
        })
        .select()
        .single();

      if (error) throw error;

      // Add tags if provided
      if (workLogData.tags && workLogData.tags.length > 0) {
        await addTagsToWorkLog(workLog.id, workLogData.tags);
      }

      await fetchWorkLogs(); // Refresh the list
      return workLog;
    } catch (err) {
      console.error('Error adding work log:', err);
      throw err;
    }
  };

  const updateWorkLog = async (id: string, updates: Partial<WorkLog>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('work_logs')
        .update({
          title: updates.title,
          description: updates.description,
          start_time: updates.start_time,
          end_time: updates.end_time,
          work_type_id: updates.work_type_id,
          project_id: updates.project_id,
          attachments: updates.attachments
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchWorkLogs(); // Refresh the list
    } catch (err) {
      console.error('Error updating work log:', err);
      throw err;
    }
  };

  const deleteWorkLog = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('work_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchWorkLogs(); // Refresh the list
    } catch (err) {
      console.error('Error deleting work log:', err);
      throw err;
    }
  };

  const addTagsToWorkLog = async (workLogId: string, tagNames: string[]) => {
    if (!user) return;

    try {
      // First, ensure all tags exist
      const tagIds = await Promise.all(
        tagNames.map(async (tagName) => {
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', tagName.trim())
            .single();

          if (existingTag) {
            // Update usage count
            await supabase
              .from('tags')
              .update({ usage_count: supabase.sql`usage_count + 1` })
              .eq('id', existingTag.id);
            
            return existingTag.id;
          } else {
            // Create new tag
            const { data: newTag, error } = await supabase
              .from('tags')
              .insert({
                user_id: user.id,
                name: tagName.trim(),
                usage_count: 1
              })
              .select('id')
              .single();

            if (error) throw error;
            return newTag.id;
          }
        })
      );

      // Remove existing tag associations
      await supabase
        .from('work_log_tags')
        .delete()
        .eq('work_log_id', workLogId);

      // Add new tag associations
      if (tagIds.length > 0) {
        const { error } = await supabase
          .from('work_log_tags')
          .insert(
            tagIds.map(tagId => ({
              work_log_id: workLogId,
              tag_id: tagId
            }))
          );

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error managing tags:', err);
      throw err;
    }
  };

  const getWorkLogsByDateRange = (startDate: Date, endDate: Date) => {
    return workLogs.filter(log => {
      const logDate = new Date(log.start_time);
      return logDate >= startDate && logDate <= endDate;
    });
  };

  const getWorkLogsByDate = (date: Date) => {
    return workLogs.filter(log => {
      const logDate = new Date(log.start_time);
      return logDate.toDateString() === date.toDateString();
    });
  };

  return {
    workLogs,
    loading,
    error,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    getWorkLogsByDateRange,
    getWorkLogsByDate,
    refetch: fetchWorkLogs
  };
};