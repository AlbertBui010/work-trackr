import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Goal {
  id: string;
  description: string;
  targetHours?: number;
  targetTasks?: number;
  startDate: Date;
  endDate: Date;
  status: 'Ongoing' | 'Completed' | 'Failed';
  createdAt: Date;
}

interface GoalContextType {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  getActiveGoals: () => Goal[];
  getGoalProgress: (goalId: string) => { hoursProgress: number; tasksProgress: number };
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};

interface GoalProviderProps {
  children: ReactNode;
}

export const GoalProvider: React.FC<GoalProviderProps> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    // Load goals from localStorage
    const savedGoals = localStorage.getItem('worktrackr_goals');
    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
        ...goal,
        startDate: new Date(goal.startDate),
        endDate: new Date(goal.endDate),
        createdAt: new Date(goal.createdAt)
      }));
      setGoals(parsedGoals);
    } else {
      // Add some mock data for demo
      const mockGoals: Goal[] = [
        {
          id: '1',
          description: 'Work 40 hours this week',
          targetHours: 40,
          startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          status: 'Ongoing',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          description: 'Complete 10 coding tasks this month',
          targetTasks: 10,
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
          status: 'Ongoing',
          createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      ];
      setGoals(mockGoals);
    }
  }, []);

  useEffect(() => {
    // Save goals to localStorage
    localStorage.setItem('worktrackr_goals', JSON.stringify(goals));
  }, [goals]);

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      status: 'Ongoing',
      createdAt: new Date()
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updatedGoal: Partial<Goal>) => {
    setGoals(prev =>
      prev.map(goal => goal.id === id ? { ...goal, ...updatedGoal } : goal)
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const getActiveGoals = () => {
    return goals.filter(goal => goal.status === 'Ongoing');
  };

  const getGoalProgress = (goalId: string) => {
    // Mock progress calculation - in a real app, this would calculate based on actual work logs
    return {
      hoursProgress: Math.random() * 100,
      tasksProgress: Math.random() * 100
    };
  };

  return (
    <GoalContext.Provider value={{
      goals,
      addGoal,
      updateGoal,
      deleteGoal,
      getActiveGoals,
      getGoalProgress
    }}>
      {children}
    </GoalContext.Provider>
  );
};