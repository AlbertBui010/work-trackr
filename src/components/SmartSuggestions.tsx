import React from 'react';
import { Clock, Tag, Zap } from 'lucide-react';
import { useWorkLogs } from '../contexts/WorkLogContext';

interface SmartSuggestionsProps {
  onSelectSuggestion: (suggestion: {
    title: string;
    tags: string[];
    type: string;
    estimatedDuration?: number;
  }) => void;
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ onSelectSuggestion }) => {
  const { workLogs } = useWorkLogs();

  // Analyze patterns to generate smart suggestions
  const generateSmartSuggestions = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Time-based suggestions
    const suggestions = [];

    // Morning suggestions (7-11 AM)
    if (currentHour >= 7 && currentHour < 11) {
      suggestions.push({
        title: 'Daily standup meeting',
        tags: ['meeting', 'team'],
        type: 'Meeting',
        estimatedDuration: 30,
        reason: '🌅 Morning routine'
      });
      
      suggestions.push({
        title: 'Review emails and plan day',
        tags: ['planning', 'admin'],
        type: 'Other',
        estimatedDuration: 20,
        reason: '📧 Morning planning'
      });
    }

    // Work hours suggestions (9 AM - 5 PM)
    if (currentHour >= 9 && currentHour < 17) {
      suggestions.push({
        title: 'Deep work session',
        tags: ['focus', 'coding'],
        type: 'Deep Work',
        estimatedDuration: 90,
        reason: '🎯 Peak focus time'
      });
      
      suggestions.push({
        title: 'Code review',
        tags: ['review', 'coding'],
        type: 'Coding',
        estimatedDuration: 45,
        reason: '👀 Quality check'
      });
    }

    // Afternoon suggestions (1-5 PM)
    if (currentHour >= 13 && currentHour < 17) {
      suggestions.push({
        title: 'Team collaboration',
        tags: ['meeting', 'collaboration'],
        type: 'Meeting',
        estimatedDuration: 60,
        reason: '🤝 Afternoon sync'
      });
    }

    // End of day suggestions (4-6 PM)
    if (currentHour >= 16 && currentHour < 18) {
      suggestions.push({
        title: 'Wrap up and plan tomorrow',
        tags: ['planning', 'admin'],
        type: 'Other',
        estimatedDuration: 15,
        reason: '📝 Day wrap-up'
      });
    }

    // Day-specific suggestions
    if (dayOfWeek === 1) { // Monday
      suggestions.push({
        title: 'Weekly planning session',
        tags: ['planning', 'weekly'],
        type: 'Other',
        estimatedDuration: 30,
        reason: '📅 Monday planning'
      });
    }

    if (dayOfWeek === 5) { // Friday
      suggestions.push({
        title: 'Weekly retrospective',
        tags: ['retrospective', 'weekly'],
        type: 'Other',
        estimatedDuration: 30,
        reason: '🔄 Friday review'
      });
    }

    // Pattern-based suggestions from recent work
    const recentPatterns = analyzeRecentPatterns();
    suggestions.push(...recentPatterns);

    return suggestions.slice(0, 4); // Limit to 4 suggestions
  };

  const analyzeRecentPatterns = () => {
    const recentLogs = workLogs
      .filter(log => {
        const logDate = new Date(log.startTime);
        const daysDiff = (Date.now() - logDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7; // Last 7 days
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const patterns = [];
    const now = new Date();
    const currentHour = now.getHours();

    // Find tasks that commonly happen at this time
    const sameTimeSlotLogs = recentLogs.filter(log => {
      const logHour = new Date(log.startTime).getHours();
      return Math.abs(logHour - currentHour) <= 1;
    });

    if (sameTimeSlotLogs.length > 0) {
      const mostCommon = sameTimeSlotLogs[0];
      patterns.push({
        title: mostCommon.title,
        tags: mostCommon.tags,
        type: mostCommon.type,
        estimatedDuration: mostCommon.duration,
        reason: '🔄 Recent pattern'
      });
    }

    // Find frequently used combinations
    const tagCombinations = recentLogs.reduce((acc, log) => {
      const key = log.tags.sort().join(',');
      if (key) {
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const popularTags = Object.entries(tagCombinations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    popularTags.forEach(([tagCombo, count]) => {
      if (count >= 2) {
        patterns.push({
          title: `Work session with ${tagCombo.split(',').join(', ')}`,
          tags: tagCombo.split(','),
          type: 'Deep Work',
          estimatedDuration: 60,
          reason: '📊 Popular combo'
        });
      }
    });

    return patterns;
  };

  const suggestions = generateSmartSuggestions();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
        <Zap className="h-4 w-4 mr-2 text-yellow-400" />
        Smart Suggestions
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(suggestion)}
            className="text-left bg-slate-700 hover:bg-slate-600 rounded-lg p-3 transition-colors duration-200 group"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-slate-100 text-sm group-hover:text-blue-400 transition-colors duration-200">
                {suggestion.title}
              </h4>
              <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                {suggestion.reason}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              {suggestion.estimatedDuration && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {suggestion.estimatedDuration}m
                </div>
              )}
              
              {suggestion.tags.length > 0 && (
                <div className="flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  {suggestion.tags.slice(0, 2).join(', ')}
                  {suggestion.tags.length > 2 && ` +${suggestion.tags.length - 2}`}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SmartSuggestions;