import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import { AuthProvider } from './contexts/AuthContext';
import { WorkLogProvider } from './contexts/WorkLogContext';
import { GoalProvider } from './contexts/GoalContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkLogs from './pages/WorkLogs';
import Timer from './pages/Timer';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './i18n';

function App() {
  const { i18n } = useTranslation();

  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
          <AuthProvider>
            <WorkLogProvider>
              <GoalProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/worklogs" element={
                      <ProtectedRoute>
                        <Layout>
                          <WorkLogs />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/timer" element={
                      <ProtectedRoute>
                        <Layout>
                          <Timer />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/goals" element={
                      <ProtectedRoute>
                        <Layout>
                          <Goals />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                      <ProtectedRoute>
                        <Layout>
                          <Analytics />
                        </Layout>
                      </ProtectedRoute>
                    } />
                  </Routes>
                </Router>
              </GoalProvider>
            </WorkLogProvider>
          </AuthProvider>
        </div>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

export default App;