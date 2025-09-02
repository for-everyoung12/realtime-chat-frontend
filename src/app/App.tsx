import { Toaster } from "../modules/shared";
import { Toaster as Sonner } from "../modules/shared";
import { TooltipProvider } from "../modules/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import { GuestRoute } from "./routes/GuestRoute";

import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "../modules/auth";
import { ChatLayout } from "../modules/chat";
import NotFound from "./pages/NotFound";
import { UserProfile } from "../modules/profile";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ChatLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:id"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
