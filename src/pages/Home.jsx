import { useNavigate } from 'react-router-dom';
import { Search, Upload, GitCompare, Clock, Trophy, Radio } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      name: 'Search',
      icon: Search,
      desc: 'Find which plans cover any drug and what PA they require',
      path: '/search'
    },
    {
      name: 'Upload',
      icon: Upload,
      desc: 'Ingest a new payer policy PDF and extract all 12 structured fields',
      path: '/upload'
    },
    {
      name: 'Compare',
      icon: GitCompare,
      desc: 'Side-by-side normalized comparison of two payers for the same drug',
      path: '/compare'
    },
    {
      name: 'Changes',
      icon: Clock,
      desc: 'Color-coded timeline of what changed across policies this quarter',
      path: '/changes'
    },
    {
      name: 'Leaderboard',
      icon: Trophy,
      desc: 'Ranked view of payers by how restrictive their approval process is',
      path: '/leaderboard'
    },
    {
      name: 'Monitor',
      icon: Radio,
      desc: 'Proactive alerts when payer policies are updated',
      path: '/monitor'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-24">
      {/* Hero Section */}
      <div className="text-center mb-16 fade-up">
        <h1 className="font-display text-7xl sm:text-9xl font-bold text-white mb-2 tracking-tight">
          ADM
        </h1>
        <div className="text-3xl sm:text-5xl font-display font-medium tracking-tight mb-8">
          <span className="bg-gradient-to-r from-brand-500 to-emerald-400 bg-clip-text text-transparent">
            All Drugs Matter
          </span>
        </div>
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-400 leading-relaxed mb-12">
          ADM is a policy intelligence platform for medical benefit drugs. Upload insurance policy PDFs, instantly search coverage across payers, compare prior authorization requirements side by side, and track what changed — all powered by AI.
        </p>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 fade-up fade-up-delay-1">
          <div className="bg-surface-1 border border-surface-border rounded-xl px-6 py-4 flex flex-col items-center min-w-[160px]">
            <span className="text-3xl font-display font-bold text-white mb-1">3</span>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Payers tracked</span>
          </div>
          <div className="bg-surface-1 border border-surface-border rounded-xl px-6 py-4 flex flex-col items-center min-w-[160px]">
            <span className="text-3xl font-display font-bold text-white mb-1">2</span>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Drugs indexed</span>
          </div>
          <div className="bg-surface-1 border border-surface-border rounded-xl px-6 py-4 flex flex-col items-center min-w-[160px]">
            <span className="text-3xl font-display font-bold text-white mb-1">10</span>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Policy changes</span>
          </div>
        </div>
      </div>

      {/* Feature Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto mb-20">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div 
              key={f.name}
              onClick={() => navigate(f.path)}
              className={`bg-surface-1 border border-surface-border rounded-xl p-6 cursor-pointer hover:border-brand-500/50 hover:bg-surface-3 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-500/5 fade-up fade-up-delay-${Math.min((i % 3) + 2, 6)}`}
            >
              <div className="h-12 w-12 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-5">
                <Icon className="h-6 w-6 text-brand-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.name}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom Tagline */}
      <div className="text-center pb-12 fade-up fade-up-delay-4">
        <p className="text-xs sm:text-sm font-medium text-slate-500 italic">
          "The middleware between messy insurance paperwork and the people who need answers from it."
        </p>
      </div>
    </div>
  );
}
