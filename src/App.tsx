import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAuth from "@/components/RequireAuth";
import AppShell from "@/components/AppShell";
import AuthPage from "./pages/Auth";
import GeneratePage from "./pages/Generate";
import LibraryPage from "./pages/Library";
import PackDetailPage from "./pages/PackDetail";
import CharacterListPage from "./pages/CharacterList";
import CharacterPage from "./pages/Character";
import NotFound from "./pages/NotFound";
import CharacterForgePage from "./pages/CharacterForgePage";
import SettingsPage from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<GeneratePage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/pack/:id" element={<PackDetailPage />} />
                <Route path="/characters" element={<CharacterListPage />} />
                <Route path="/character/forge" element={<CharacterForgePage />} />
                <Route path="/character/new" element={<CharacterPage />} />
                <Route path="/character/:id" element={<CharacterPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
