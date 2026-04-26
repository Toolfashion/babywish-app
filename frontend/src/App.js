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
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AdminApprovalDashboard from "./pages/AdminApprovalDashboard";
import BestTimingPage from "./pages/BestTimingPage";
import GenderRevealPage from "./pages/GenderRevealPage";
import QuickStartPage from "./pages/QuickStartPage";
import ChatWidget from "./components/ChatWidget";
import FloatingVideoCarousel from "./components/FloatingVideoCarousel";

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
      <Route path="/start" element={<QuickStartPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/subscribe" element={<SubscribePage />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      <Route path="/horoscope" element={<DailyHoroscope />} />
      <Route path="/names" element={<NameShowcase />} />
      <Route path="/lucky-elements" element={<LuckyElementsShowcase />} />
      <Route path="/best-timing" element={<BestTimingPage />} />
      <Route path="/gender-reveal" element={<GenderRevealPage />} />
      <Route path="/admin/leads" element={<LeadDashboard />} />
      <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
      <Route path="/admin/approvals" element={<AdminApprovalDashboard />} />
    </Routes>
  );
};

function App() {
  return (
    <div 
      className="App" 
      style={{
        /* iOS Safari: Prevent transform context from breaking fixed children */
        WebkitTransformStyle: 'flat',
        transformStyle: 'flat'
      }}
    >
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'rgba(26, 16, 60, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            /* Remove backdrop-filter for iOS Safari compatibility */
          },
        }}
      />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppRouter />
            <FloatingVideoCarousel />
            <ChatWidget />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
