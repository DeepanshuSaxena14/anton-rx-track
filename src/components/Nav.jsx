import { NavLink, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Search, UploadCloud, FileDiff, Activity, LogOut, Trophy, Scale } from 'lucide-react';

export default function Nav() {
  const { logout, user } = useAuth0();
  const location = useLocation();

  if (location.pathname === '/') return null;

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
    <nav
      className="fixed top-0 w-full z-50 h-14 flex items-center justify-between px-5"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-strong)',
      }}
    >
      {/* Logo + Links */}
      <div className="flex items-center gap-2">
        <NavLink
          to="/"
          className="flex items-center gap-1.5 mr-3 hover:opacity-70 transition-opacity"
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: '1rem',
              color: 'var(--fg)',
              letterSpacing: '-0.01em',
            }}
          >
            CoverageIQ
          </span>
        </NavLink>

        <div className="hidden sm:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 1rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 500 : 400,
                  fontFamily: 'var(--font-body)',
                  color: isActive ? 'var(--fg)' : 'var(--fg-3)',
                  background: isActive ? 'var(--bg-3)' : 'transparent',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'var(--bg-2)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0 }} />
                {label}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Right: user + logout */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden sm:flex items-center gap-2">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  borderRadius: '50%',
                  border: '1px solid var(--border-strong)',
                  objectFit: 'cover',
                }}
              />
            )}
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                color: 'var(--fg-2)',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.name}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          title="Log out"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.9rem',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.8rem',
            fontWeight: 400,
            fontFamily: 'var(--font-body)',
            color: 'var(--fg-3)',
            background: 'transparent',
            border: '1px solid var(--border-strong)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-3)';
            e.currentTarget.style.color = 'var(--fg)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--fg-3)';
          }}
        >
          <LogOut style={{ width: '0.875rem', height: '0.875rem' }} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </nav>
  );
}
