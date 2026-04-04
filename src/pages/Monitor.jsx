import { Eye, Clock, Activity, Bell, Info, CheckCircle2 } from 'lucide-react';
import { PAYERS, DRUGS } from '../mocks/mockData';

export default function Monitor() {
  const WATCHED_COMBOS = PAYERS.flatMap((payer) =>
    DRUGS.map((drug) => ({
      payer,
      drug,
      status:
        (payer === 'Cigna' && drug === 'Keytruda') ||
        (payer === 'UnitedHealthcare' && drug === 'Dupixent')
          ? 'check_pending'
          : 'up_to_date',
      lastChecked: '4 hrs ago',
    }))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 fade-up">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
          Policy Monitor
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Proactive alerts when payer policies change — before you have to ask.
        </p>
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12 fade-up fade-up-delay-1">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          Watching 3 payers
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-500/10 border border-surface-border rounded-full text-slate-300 text-sm font-medium">
          <div className="h-2 w-2 rounded-full bg-slate-400" />
          Last checked 2 min ago
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium">
          <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-pulse" />
          2 alerts pending
        </div>
      </div>

      {/* Pending Alerts Queue */}
      <div className="mb-12 fade-up fade-up-delay-2">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Pending Alerts</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-surface-2 border border-surface-border border-l-2 border-l-amber-500/60 rounded-xl p-4 sm:p-5 flex flex-wrap items-start justify-between gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full blur-2xl" />
            <div className="relative z-10 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">
                    UnitedHealthcare <span className="text-slate-500 font-normal mx-1">·</span> Dupixent
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">12 min ago</span>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                UHC policy document updated significantly — changes not yet parsed.
              </p>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-3 border border-surface-border rounded text-xs font-medium text-slate-400">
                <Activity className="h-3 w-3" /> Queued for processing
              </span>
            </div>
          </div>

          <div className="bg-surface-2 border border-surface-border border-l-2 border-l-amber-500/60 rounded-xl p-4 sm:p-5 flex flex-wrap items-start justify-between gap-4 shadow-sm">
            <div className="w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">
                    Cigna <span className="text-slate-500 font-normal mx-1">·</span> Keytruda
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">1 hr ago</span>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                Restructured PA criteria section detected in latest digest.
              </p>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-3 border border-surface-border rounded text-xs font-medium text-slate-400">
                <Activity className="h-3 w-3" /> Queued for processing
              </span>
            </div>
          </div>

          <div className="bg-surface-1 border border-surface-border border-l-2 border-l-slate-500/40 rounded-xl p-4 sm:p-5 flex flex-wrap items-start justify-between gap-4 opacity-75">
            <div className="w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-slate-300">
                    Blue Cross Blue Shield NC <span className="text-slate-600 font-normal mx-1">·</span> Dupixent
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">Yesterday</span>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Routine layout modification (no material criteria changes).
              </p>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Successfully ignored
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Watched Policies */}
      <div className="mb-12 fade-up fade-up-delay-3">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-brand-400" />
          <h2 className="text-lg font-semibold text-white">Watching</h2>
        </div>

        <div className="bg-surface-1 border border-surface-border rounded-xl mx-auto overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 border-b border-surface-border bg-surface-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:grid">
            <div>Policy</div>
            <div>Last Checked</div>
            <div className="w-28 text-right">Status</div>
          </div>
          <div className="divide-y divide-surface-border">
            {WATCHED_COMBOS.map((combo, i) => (
              <div
                key={i}
                className="grid sm:grid-cols-[1fr_auto_auto] gap-3 sm:gap-4 p-4 items-center hover:bg-surface-2 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-slate-200">{combo.payer}</h4>
                  <span className="text-sm text-slate-400">{combo.drug}</span>
                </div>
                <div className="text-sm text-slate-500 sm:text-right flex items-center justify-start sm:justify-end gap-1.5 mt-1 sm:mt-0">
                  <Clock className="h-3.5 w-3.5" /> {combo.lastChecked}
                </div>
                <div className="sm:w-28 mt-2 sm:mt-0 flex sm:justify-end">
                  {combo.status === 'up_to_date' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                      Up to date
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                      Check pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="fade-up fade-up-delay-4 bg-surface-1 border-2 border-dashed border-brand-500/30 rounded-xl p-6 text-center">
        <div className="mx-auto w-10 h-10 flex items-center justify-center bg-brand-500/10 rounded-full mb-3">
          <Info className="h-5 w-5 text-brand-400" />
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
          Real-time monitoring connects at integration milestone. Will show live policy diff alerts, webhook triggers, and push notifications.
        </p>
      </div>
    </div>
  );
}
