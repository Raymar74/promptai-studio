import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sparkles, Library, UserCog, LogOut, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedbackModal } from "@/components/FeedbackModal";
import { OnboardingModal } from "@/components/OnboardingModal";

const links = [
  { to: "/", label: "Generar", icon: Sparkles, end: true },
  { to: "/library", label: "Biblioteca", icon: Library },
  { to: "/characters", label: "Personajes", icon: UserCog },
  { to: "/settings", label: "Ajustes", icon: SettingsIcon },
];

export default function AppShell() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/60 backdrop-blur-sm sticky top-0 z-30 bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-sm bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="font-display text-primary text-lg">P</span>
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg">PromptAI Studio</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground -mt-1">guion · prompts · plan</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-1.5 rounded-sm text-sm flex items-center gap-2 transition-colors",
                    isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                <l.icon className="h-3.5 w-3.5" />
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[140px]">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={async () => { await signOut(); nav("/auth"); }} aria-label="Salir">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="md:hidden border-t border-border/60 flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  "flex-1 px-3 py-2 text-xs flex items-center justify-center gap-1.5 transition-colors",
                  isActive ? "text-primary border-b-2 border-primary" : "text-muted-foreground",
                )
              }
            >
              <l.icon className="h-3.5 w-3.5" />
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Hecho para producir contenido coherente con tu personaje
      </footer>
      {user && <FeedbackModal />}
      {user && <OnboardingModal />}
    </div>
  );
}