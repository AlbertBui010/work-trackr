import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  BookOpen, 
  Timer, 
  Target, 
  BarChart3, 
  Menu, 
  X,
  LogOut,
  User,
  Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import ExcelExport from './ExcelExport';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const navigation = [
    { name: t('navigation.dashboard'), href: '/', icon: Home },
    { name: t('navigation.workLogs'), href: '/worklogs', icon: BookOpen },
    { name: t('navigation.timer'), href: '/timer', icon: Timer },
    { name: t('navigation.goals'), href: '/goals', icon: Target },
    { name: t('navigation.analytics'), href: '/analytics', icon: BarChart3 },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">WorkTrackr</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white"
            aria-label={t('accessibility.closeMenu')}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User menu */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
          {/* Theme and Language Controls */}
          <div className="flex items-center justify-between mb-4 px-2">
            <ThemeToggle />
            <LanguageSelector />
          </div>
          
          {/* Export Button */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors duration-200 mb-4"
          >
            <Download className="h-4 w-4 mr-3" />
            {t('export.exportData')}
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors duration-200"
          >
            <LogOut className="h-4 w-4 mr-3" />
            {t('common.logout')}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              aria-label={t('accessibility.openMenu')}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">WorkTrackr</h1>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900" role="main">
          {children}
        </main>
      </div>
      
      {/* Excel Export Modal */}
      <ExcelExport
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};

export default Layout;