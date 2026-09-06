import { X, Terminal, CheckCircle2 } from 'lucide-react';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
  rawOutput: string;
}

export default function PythonScriptModal({
  isOpen,
  onClose,
  result,
  rawOutput,
}: PythonScriptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="w-full max-w-xl bg-[#0d121c] border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Python TA-Lib / Pandas Analysis Engine</h3>
              <p className="text-[11px] text-slate-400">scripts/signal_analyzer.py Execution Result (Deliverable #2)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs max-h-[70vh] overflow-y-auto font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-emerald-400">
              <span className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Python Stdout Output
              </span>
              <span className="text-[10px] text-slate-400">Exit Code 0</span>
            </div>
            <pre className="text-[11px] text-amber-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
              {rawOutput || JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>

        <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
