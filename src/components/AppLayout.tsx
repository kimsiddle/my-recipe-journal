import { Outlet, Link, useLocation } from 'react-router-dom';
import { CookingPot, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/', label: 'Recipes', icon: CookingPot },
  { to: '/planner', label: 'Planner', icon: CalendarDays },
];

export default function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col food-pattern-bg">
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
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
