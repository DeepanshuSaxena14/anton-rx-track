import { useNavigate } from 'react-router-dom';
import { Search, Upload, GitCompare, Clock } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      name: 'Search',
      icon: Search,
      desc: 'Which health plans cover Drug X? Instant results across all payers with PA requirements and coverage status.',
      path: '/search'
    },
    {
      name: 'Upload',
      icon: Upload,
      desc: 'Drop a payer policy PDF. AI extracts all 12 structured fields in seconds — drug name, HCPCS code, PA criteria, step therapy, site of care.',
      path: '/upload'
    },
    {
      name: 'Compare',
      icon: GitCompare,
      desc: 'Side-by-side normalized comparison of two payers for the same drug. Differing fields highlighted automatically.',
      path: '/compare'
    },
    {
      name: 'Changes',
      icon: Clock,
      desc: 'Color-coded timeline of what changed across payer policies this quarter — coverage added, restrictions tightened, criteria updated.',
      path: '/changes'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-24">
      {/* Hero Section */}
      <div className="text-center mb-20 fade-up max-w-[100vw] overflow-hidden px-4">
        <h1 className="font-sans text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-brand-400 to-emerald-400 mb-8 tracking-tight leading-snug pb-4">
          CoverageIQ
        </h1>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight leading-snug uppercase">
            <span className="block mb-2">Stop reading PDFs.</span>
            <span className="block text-brand-400">Start making decisions.</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto mb-12">
            An AI-powered platform that instantly answers any question about medical benefit drug policies across health plans.
          </p>
        </div>

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto mb-20">
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
