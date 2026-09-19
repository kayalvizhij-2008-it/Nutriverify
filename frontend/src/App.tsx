import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { Layout } from './components/Layout';
import ParticleBackground from './components/ParticleBackground';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalyzeHub from './pages/AnalyzeHub';
import ManualAnalysis from './pages/ManualAnalysis';
import UploadAnalysis from './pages/UploadAnalysis';
import LiveAnalysis from './pages/LiveAnalysis';
import Results from './pages/Results';
import History from './pages/History';
import SavedProducts from './pages/SavedProducts';
import Compare from './pages/Compare';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import SearchPage from './pages/Search';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Privacy from './pages/Privacy';
import Help from './pages/Help';
import Accessibility from './pages/Accessibility';
import VoiceSaathi from './pages/VoiceSaathi';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-nv-surface">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-nv-primary/30 border-t-nv-primary rounded-full animate-spin" />
        <p className="text-[13px] text-nv-text-dim">Loading NutriVerify...</p>
      </div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      {!isAuthenticated && <ParticleBackground />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected app routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/analyze" element={<ProtectedRoute><AnalyzeHub /></ProtectedRoute>} />
        <Route path="/analyze/manual" element={<ProtectedRoute><ManualAnalysis /></ProtectedRoute>} />
        <Route path="/analyze/upload" element={<ProtectedRoute><UploadAnalysis /></ProtectedRoute>} />
        <Route path="/analyze/live" element={<ProtectedRoute><LiveAnalysis /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedProducts /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/voice" element={<ProtectedRoute><VoiceSaathi /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/accessibility" element={<ProtectedRoute><Accessibility /></ProtectedRoute>} />
        <Route path="/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
