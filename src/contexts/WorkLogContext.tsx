import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface WorkLog {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  tags: string[];
  type: 'Coding' | 'Meeting' | 'Study' | 'Deep Work' | 'Other';
  attachments?: string[];
  duration: number; // in minutes
}

interface WorkLogContextType {
  workLogs: WorkLog[];
  addWorkLog: (workLog: Omit<WorkLog, 'id'>) => void;
  updateWorkLog: (id: string, workLog: Partial<WorkLog>) => void;
  deleteWorkLog: (id: string) => void;
  getWorkLogsByDate: (date: Date) => WorkLog[];
  getWorkLogsByDateRange: (startDate: Date, endDate: Date) => WorkLog[];
}

const WorkLogContext = createContext<WorkLogContextType | undefined>(undefined);

export const useWorkLogs = () => {
  const context = useContext(WorkLogContext);
  if (context === undefined) {
    throw new Error('useWorkLogs must be used within a WorkLogProvider');
  }
  return context;
};

interface WorkLogProviderProps {
  children: ReactNode;
}

export const WorkLogProvider: React.FC<WorkLogProviderProps> = ({ children }) => {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);

  useEffect(() => {
    // Load work logs from localStorage
    const savedWorkLogs = localStorage.getItem('worktrackr_worklogs');
    if (savedWorkLogs) {
      const parsedLogs = JSON.parse(savedWorkLogs).map((log: any) => ({
        ...log,
        startTime: new Date(log.startTime),
        endTime: new Date(log.endTime)
      }));
      setWorkLogs(parsedLogs);
    } else {
      // Add some mock data for demo
      const mockLogs: WorkLog[] = [
        {
          id: '1',
          title: 'React Component Development',
          description: 'Built user authentication components',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 60 * 60 * 1000),
          tags: ['react', 'frontend'],
          type: 'Coding',
          duration: 60
        },
        {
          id: '2',
          title: 'Team Standup',
          description: 'Daily team sync meeting',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
          tags: ['meeting', 'team'],
          type: 'Meeting',
          duration: 30
        }
      ];
      setWorkLogs(mockLogs);
    }
  }, []);

  useEffect(() => {
    // Save work logs to localStorage
    localStorage.setItem('worktrackr_worklogs', JSON.stringify(workLogs));
  }, [workLogs]);

  const addWorkLog = (workLog: Omit<WorkLog, 'id'>) => {
    const newWorkLog: WorkLog = {
      ...workLog,
      id: Date.now().toString()
    };
    setWorkLogs(prev => [...prev, newWorkLog]);
  };

  const updateWorkLog = (id: string, updatedWorkLog: Partial<WorkLog>) => {
    setWorkLogs(prev =>
      prev.map(log => log.id === id ? { ...log, ...updatedWorkLog } : log)
    );
  };

  const deleteWorkLog = (id: string) => {
    setWorkLogs(prev => prev.filter(log => log.id !== id));
  };

  const getWorkLogsByDate = (date: Date) => {
    return workLogs.filter(log => {
      const logDate = new Date(log.startTime);
      return logDate.toDateString() === date.toDateString();
    });
  };

  const getWorkLogsByDateRange = (startDate: Date, endDate: Date) => {
    return workLogs.filter(log => {
      const logDate = new Date(log.startTime);
      return logDate >= startDate && logDate <= endDate;
    });
  };

  return (
    <WorkLogContext.Provider value={{
      workLogs,
      addWorkLog,
      updateWorkLog,
      deleteWorkLog,
      getWorkLogsByDate,
      getWorkLogsByDateRange
    }}>
      {children}
    </WorkLogContext.Provider>
  );
};