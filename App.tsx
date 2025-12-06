import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RequestProvider } from './contexts/RequestContext';

import Sidebar from './components/layout/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RequestListPage from './pages/RequestListPage';
import RequestDetailPage from './pages/RequestDetailPage';
import RequestNewPage from './pages/RequestNewPage';
import RequestEditPage from './pages/RequestEditPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import SectorsPage from './pages/SectorsPage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RequestProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<MainApp />} />
          </Routes>
        </Router>
      </RequestProvider>
    </AuthProvider>
  );
};

const MainApp: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-zinc-950 text-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 p-8 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/requests" element={<RequestListPage />} />
                        <Route path="/requests/new" element={<RequestNewPage />} />
                        <Route path="/requests/:id" element={<RequestDetailPage />} />
                        <Route path="/requests/edit/:id" element={<RequestEditPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/sectors" element={<SectorsPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </main>
                <footer className="p-4 text-center text-xs text-gray-500 border-t border-zinc-800">
                    Desenvolvido por 6580005
                </footer>
            </div>
        </div>
    );
}

export default App;