import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthCallback from "./pages/AuthCallback";
import DashboardPage from "./pages/DashboardPage";
import SubscribePage from "./pages/SubscribePage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import DailyHoroscope from "./pages/DailyHoroscope";
import NameShowcase from "./pages/NameShowcase";
import LuckyElementsShowcase from "./pages/LuckyElementsShowcase";
import LeadDashboard from "./pages/LeadDashboard";

// Check for session_id in URL hash (OAuth callback)
const AppRouter = () => {
  const location = useLocation();
  
  // CRITICAL: Detect session_id during render (NOT in useEffect)
  // This prevents race conditions with auth checks
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/subscribe" element={<SubscribePage />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      <Route path="/horoscope" element={<DailyHoroscope />} />
      <Route path="/names" element={<NameShowcase />} />
      <Route path="/lucky-elements" element={<LuckyElementsShowcase />} />
      <Route path="/admin/leads" element={<LeadDashboard />} />
    </Routes>
  );
};

function App() {
  return (
    <div className="App">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'rgba(26, 16, 60, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
