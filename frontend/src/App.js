import { useLocation, BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthCallback from "./components/AuthCallback";
import AuthModal from "./components/AuthModal";
import PhoneComplete from "./components/PhoneComplete";
import PropBharat from "./pages/PropBharat";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PropertyDetail from "./pages/PropertyDetail";
import NotFound from "./pages/NotFound";
import "./App.css";

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <Routes>
      <Route path="/" element={<PropBharat />} />
      <Route path="/property/:prop_id" element={<PropertyDetail />} />
      <Route path="/agent" element={<AgentDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <AuthModal />
        <PhoneComplete />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
