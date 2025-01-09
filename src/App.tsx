import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { GameProvider } from "./components/game/GameProvider";
import { LoginPage } from "./components/auth/LoginPage";
import Dashboard from "./pages/Dashboard";
import NewGame from "./pages/NewGame";
import ClosedGames from "./pages/ClosedGames";
import Index from "./pages/Index";
import { useAuth } from "./components/auth/AuthProvider";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  
  if (!session) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-game"
        element={
          <ProtectedRoute>
            <GameProvider>
              <NewGame />
            </GameProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/closed-games"
        element={
          <ProtectedRoute>
            <ClosedGames />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/:id"
        element={
          <ProtectedRoute>
            <GameProvider>
              <Index />
            </GameProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;