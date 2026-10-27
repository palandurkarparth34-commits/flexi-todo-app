import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import { Loader2 } from 'lucide-react';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState(() => {
    return window.location.hash === '#register' ? 'register' : 'login';
  });

  // Keep window hash in sync with view
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#register') {
        setCurrentView('register');
      } else if (hash === '#login') {
        setCurrentView('login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view) => {
    window.location.hash = view;
    setCurrentView(view);
  };

  // Initial loading state while verifying JWT token with backend
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-sm font-medium text-slate-600">
          Loading TaskMaster...
        </p>
      </div>
    );
  }

  // If user is authenticated, always present Dashboard
  if (isAuthenticated) {
    return <DashboardPage />;
  }

  // If not authenticated, render Login or Register
  if (currentView === 'register') {
    return <RegisterPage onNavigateToLogin={() => navigateTo('login')} />;
  }

  return <LoginPage onNavigateToRegister={() => navigateTo('register')} />;
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
