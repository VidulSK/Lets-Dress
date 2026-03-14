import { createBrowserRouter, Navigate } from 'react-router';
import { HomePage } from './pages/HomePage';
import { SignUpPage } from './pages/SignUpPage';
import { SignInPage } from './pages/SignInPage';
import { WardrobePage } from './pages/WardrobePage';
import { RandomizerPage } from './pages/RandomizerPage';
import { EventPlannerPage } from './pages/EventPlannerPage';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0c29]">
        <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/signin',
    element: <SignInPage />,
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
