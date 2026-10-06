import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { Layout } from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalyzeHub from './pages/AnalyzeHub';
import ManualAnalysis from './pages/ManualAnalysis';
import UploadAnalysis from './pages/UploadAnalysis';
import LiveAnalysis from './pages/LiveAnalysis';
import Results from './pages/Results';
import NutritionPage from './pages/Nutrition';
import IngredientsPage from './pages/Ingredients';
import AllergensPage from './pages/Allergens';
import ClaimsPage from './pages/Claims';
import AboutPage from './pages/About';
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
import AiStatusCenter from './pages/AiStatusCenter';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0D0C]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
          <p className="font-label-code text-label-code text-on-surface-variant tracking-wider">
            INITIALIZING NUTRIVERIFY PLATFORM...
          </p>
        </div>
      </div>
    );
  }
  // Allow seamless browsing in guest mode if unauthenticated
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing / Marketing */}
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Core Verification Hub */}
      <Route path="/analyze" element={<ProtectedRoute><AnalyzeHub /></ProtectedRoute>} />
      <Route path="/analyze-hub" element={<ProtectedRoute><AnalyzeHub /></ProtectedRoute>} />
      <Route path="/camera" element={<ProtectedRoute><LiveAnalysis /></ProtectedRoute>} />
      <Route path="/camera-scan" element={<ProtectedRoute><LiveAnalysis /></ProtectedRoute>} />
      <Route path="/analyze/live" element={<ProtectedRoute><LiveAnalysis /></ProtectedRoute>} />
      
      <Route path="/upload" element={<ProtectedRoute><UploadAnalysis /></ProtectedRoute>} />
      <Route path="/analyze/upload" element={<ProtectedRoute><UploadAnalysis /></ProtectedRoute>} />

      <Route path="/manual" element={<ProtectedRoute><ManualAnalysis /></ProtectedRoute>} />
      <Route path="/manual-entry" element={<ProtectedRoute><ManualAnalysis /></ProtectedRoute>} />
      <Route path="/manual-analysis" element={<ProtectedRoute><ManualAnalysis /></ProtectedRoute>} />
      <Route path="/analyze/manual" element={<ProtectedRoute><ManualAnalysis /></ProtectedRoute>} />

      {/* Deep-Dive Domain Pages */}
      <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
      <Route path="/results-insight" element={<ProtectedRoute><Results /></ProtectedRoute>} />
      <Route path="/nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
      <Route path="/ingredients" element={<ProtectedRoute><IngredientsPage /></ProtectedRoute>} />
      <Route path="/allergens" element={<ProtectedRoute><AllergensPage /></ProtectedRoute>} />
      <Route path="/claims" element={<ProtectedRoute><ClaimsPage /></ProtectedRoute>} />
      <Route path="/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />

      {/* Analytics & Collaboration */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
      <Route path="/nutrisaathi" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/nutrisaathi-ai" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/nutriverify-ai" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/ai" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/assistant" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/voice" element={<ProtectedRoute><VoiceSaathi /></ProtectedRoute>} />
      <Route path="/ai-status" element={<ProtectedRoute><AiStatusCenter /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

      {/* User Preferences & Utilities */}
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedProducts /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/accessibility" element={<ProtectedRoute><Accessibility /></ProtectedRoute>} />
      <Route path="/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
