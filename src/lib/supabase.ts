import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For demo purposes, use fallback values if environment variables are not set
const defaultUrl = 'https://demo-project.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDI3NzkyMDAsImV4cCI6MTk1ODM1NTIwMH0.rp7Q2DO_qUeiCT-yb1hI_cj0l1X1VW6OkT-rEE-HAuM';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-supabase')) {
  console.warn('⚠️ Using demo Supabase credentials. Please configure your actual Supabase project for production use.');
}

export const supabase = createClient<Database>(
  supabaseUrl || defaultUrl, 
  supabaseAnonKey || defaultKey, 
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper functions for common operations
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Real-time subscriptions
export const subscribeToWorkLogs = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('work_logs_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'work_logs',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToGoals = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('goals_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'goals',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};