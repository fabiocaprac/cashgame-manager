import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { GameProvider } from "@/components/game/GameProvider";
import { LoginPage } from "@/components/auth/LoginPage";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import ClosedGames from "@/pages/ClosedGames";
import ClosedGameDetails from "@/pages/ClosedGameDetails";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/game/:id"
              element={
                <GameProvider>
                  <Index />
                </GameProvider>
              }
            />
            <Route
              path="/games/:id"
              element={
                <GameProvider>
                  <Index />
                </GameProvider>
              }
            />
            <Route path="/closed-games" element={<ClosedGames />} />
            <Route path="/closed-games/:id" element={<ClosedGameDetails />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;