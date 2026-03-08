import { Outlet, Link, useLocation } from 'react-router-dom';
import { CookingPot, CalendarDays, LogOut, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useGuestMode } from '@/context/GuestModeContext';

const tabs = [
  { to: '/', label: 'Recipes', icon: CookingPot },
  { to: '/planner', label: 'Planner', icon: CalendarDays },
];

export default function AppLayout() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { guestMode, toggleGuestMode } = useGuestMode();

  return (
    <div className="min-h-screen bg-background flex flex-col food-pattern-bg">
      {/* Guest mode banner */}
      {guestMode && (
        <div className="bg-muted border-b px-4 py-1.5 text-center">
          <p className="text-xs text-muted-foreground">
            Viewing as guest · <button onClick={toggleGuestMode} className="underline hover:text-foreground">Exit</button>
          </p>
        </div>
      )}

      {/* Top nav */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex items-center gap-1 h-12">
            {tabs.map(tab => {
              const active = tab.to === '/' ? pathname === '/' : pathname.startsWith(tab.to);
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-body font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
            {user && (
              <button
                onClick={() => signOut()}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            )}
          </nav>
        </div>
      </header>

      <div className="flex-1">
        <Outlet />
      </div>

      {/* Discreet guest mode toggle at bottom */}
      {user && (
        <footer className="py-3 px-4 flex justify-center">
          <button
            onClick={toggleGuestMode}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            title={guestMode ? 'Exit guest preview' : 'Preview as guest'}
          >
            {guestMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {guestMode ? 'Exit guest view' : 'View as guest'}
          </button>
        </footer>
      )}
    </div>
  );
}
