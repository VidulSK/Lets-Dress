import { createBrowserRouter, Navigate } from 'react-router';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { WardrobePage } from './pages/WardrobePage';
import { RandomizerPage } from './pages/RandomizerPage';
import { EventPlannerPage } from './pages/EventPlannerPage';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/wardrobe" replace /> : <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    // Unified login page (sign in + sign up tabs)
    path: '/login',
    element: (
      <GuestOnlyRoute>
        <LoginPage />
      </GuestOnlyRoute>
    ),
  },
  {
    // Legacy /signin → redirect to /login
    path: '/signin',
    element: <Navigate to="/login" replace />,
  },
  {
    // Legacy /signup → redirect to /login?tab=signup
    path: '/signup',
    element: <Navigate to="/login?tab=signup" replace />,
  },
  {
    path: '/wardrobe',
    element: (
      <ProtectedRoute>
        <WardrobePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/randomizer',
    element: (
      <ProtectedRoute>
        <RandomizerPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/event-planner',
    element: (
      <ProtectedRoute>
        <EventPlannerPage />
      </ProtectedRoute>
    ),
  },
]);
