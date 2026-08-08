import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/ToastContext';
import { AppRoutes } from './routes/AppRoutes';
import { SEOHead } from './components/common/SEOHead';
import { MaintenanceGuard } from './components/layout/MaintenanceGuard';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <SEOHead />
              <MaintenanceGuard>
                <AppRoutes />
              </MaintenanceGuard>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
