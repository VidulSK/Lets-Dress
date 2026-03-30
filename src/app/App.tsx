import { RouterProvider } from 'react-router';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { TourProvider } from './contexts/TourContext';
import { TourOverlay } from './components/TourOverlay';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TourProvider>
          <RouterProvider router={router} />
          <TourOverlay />
        </TourProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
