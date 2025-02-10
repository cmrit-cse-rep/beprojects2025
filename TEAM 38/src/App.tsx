import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './lib/store';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { ExerciseDatabase } from './components/ExerciseDatabase';
import { Chat } from './components/Chat';
import { Layout } from './components/Layout';
import { WorkoutDetail } from './components/WorkoutDetail';
import { History } from './components/History';
import { Stats } from './components/Stats';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const profile = useAppStore((state) => state.profile);

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (isAuthenticated && !profile) {
    return <Navigate to="/onboarding" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/workout/:id" element={
          <PrivateRoute>
            <Layout>
              <WorkoutDetail />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/exercises" element={
          <PrivateRoute>
            <Layout>
              <ExerciseDatabase />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/chat" element={
          <PrivateRoute>
            <Layout>
              <Chat />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/history" element={
          <PrivateRoute>
            <Layout>
              <History />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/stats" element={
          <PrivateRoute>
            <Layout>
              <Stats />
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App