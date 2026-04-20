interface SandboxPanelProps {
  logs: string[];
  errors: string[];
  onRun: () => void;
  onSave: () => void;
  onValidate: () => void;
}

export default function SandboxPanel({ logs, errors, onRun, onSave, onValidate }: SandboxPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-4 border-t border-slate-800 bg-slate-950 p-4">
      <div>
        <div className="mb-3 flex flex-wrap gap-3">
          <button className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white" onClick={onSave}>
            Save Workflow
          </button>
          <button className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white" onClick={onValidate}>
            Validate
          </button>
          <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white" onClick={onRun}>
            Run Simulation
          </button>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <h4 className="mb-2 font-semibold text-white">Execution Logs</h4>
          <div className="max-h-44 overflow-auto space-y-1 text-sm text-slate-300">
            {logs.length === 0 ? <div>No execution logs yet.</div> : logs.map((log, index) => <div key={index}>{log}</div>)}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
        <h4 className="mb-2 font-semibold text-white">Validation</h4>
        <div className="max-h-44 overflow-auto space-y-1 text-sm">
          {errors.length === 0 ? <div className="text-emerald-400">No validation errors.</div> : errors.map((error, index) => <div key={index} className="text-rose-400">• {error}</div>)}
        </div>
      </div>
    </div>
  );
}
