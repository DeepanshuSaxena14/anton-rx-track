import { NavLink, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Search, UploadCloud, FileDiff, Activity, LogOut, Trophy, Scale } from 'lucide-react';

export default function Nav() {
  const { logout, user } = useAuth0();
  const location = useLocation();

  if (location.pathname === '/') {
    return null; // Hidden on home page
  }

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const links = [
    { to: '/search', path: '/search', label: 'Search', icon: Search },
    { to: '/upload', path: '/upload', label: 'Ingest', icon: UploadCloud },
    { to: '/compare', path: '/compare', label: 'Compare', icon: FileDiff },
    { to: '/changes', path: '/changes', label: 'Changes', icon: Activity },
    { to: '/leaderboard', path: '/leaderboard', label: 'Scores', icon: Trophy },
    { to: '/appeal', path: '/appeal', label: 'Appeal', icon: Scale },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[var(--bg)] border-b border-[var(--border)] px-4 h-14 flex items-center justify-between">
      
      <div className="flex items-center gap-6">
        <NavLink to="/" className="group flex items-center gap-2 cursor-pointer border-none bg-transparent hover:opacity-80 transition-opacity flex-shrink-0">
          <span className="font-display font-semibold italic text-lg text-[var(--accent)] tracking-tight leading-none m-0 pt-1">CoverageIQ</span>
        </NavLink>

        <div className="hidden sm:flex items-center gap-1">
          {links.map(({ to, label, path, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-shrink-0 items-center gap-2 px-3 py-1.5 rounded-sm font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  isActive 
                    ? 'bg-[var(--bg-2)] text-[var(--accent)] font-bold' 
                    : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-2)]'
                }`}
              >
                <Icon className={`w-3 h-3 flex-shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)] opacity-60'}`} />
                {label}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
           <span className="hidden sm:block font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider truncate max-w-[120px]">
             USER: <span className="text-[var(--fg)]">{user.name}</span>
           </span>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-rose-400 transition-colors bg-transparent border-none cursor-pointer flex-shrink-0"
          title="Log out"
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

    </nav>
  );
}
