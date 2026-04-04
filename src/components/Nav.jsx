/* eslint-disable no-unused-vars */
import { NavLink, Link } from 'react-router-dom'
import {
  Search,
  Upload,
  GitCompare,
  Clock,
  Trophy,
  Radio,
  Brain,
} from 'lucide-react'

const linkBase =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-sm transition-colors sm:px-3'

const navItems = [
  { to: '/search', label: 'Search', icon: Search },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/changes', label: 'Changes', icon: Clock },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/monitor', label: 'Monitor', icon: Radio },
]

export default function Nav() {
  return (
    <header className="fixed top-0 z-50 h-14 w-full border-b border-surface-border bg-surface-0/80 backdrop-blur-md">
      <div className="relative mx-auto flex h-full max-w-[1600px] items-center justify-between gap-3 px-4">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-brand-500/50 bg-surface-2 shadow-sm shadow-brand-500/20"
            aria-hidden
          >
            <Brain className="h-4 w-4 text-brand-400 group-hover:text-brand-300 transition-colors" />
          </div>
          <div className="flex items-center">
            <h1 className="font-display text-xl font-bold tracking-tight text-white leading-none mt-0.5">
              CoverageIQ
            </h1>
          </div>
        </Link>

        <nav
          className="absolute left-1/2 top-1/2 flex max-w-[min(100vw-12rem,42rem)] -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 overflow-x-auto px-1 sm:gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          aria-label="Primary"
        >
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  linkBase,
                  isActive
                    ? 'border-brand-500/50 bg-brand-500/15 text-brand-300'
                    : 'border-transparent text-slate-400 hover:border-surface-border hover:bg-surface-3/50 hover:text-[#e8e8f0]',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200">
            <span
              className="relative flex h-2 w-2"
              aria-hidden
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            Mock mode
          </span>
        </div>
      </div>
    </header>
  )
}
