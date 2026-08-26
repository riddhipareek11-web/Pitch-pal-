const STEPS = ['Brief', 'Storyboard', 'Send Pitch'];

export default function Stepper({ current }) {
  return (
    <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-3 md:gap-x-4">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const active = step === current;
        const done = step < current;
        return (
          <div key={label} className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold border transition-colors
                ${done ? 'bg-ink text-paper border-ink' : active ? 'bg-rust text-paper border-rust' : 'bg-transparent text-ink/40 border-ink/20'}`}
              >
                {done ? '✓' : step}
              </span>
              <span className={`text-sm font-medium ${active ? 'text-ink' : done ? 'text-ink/70' : 'text-ink/40'}`}>
                {label}
              </span>
            </div>
            {step !== STEPS.length && <span className="w-6 md:w-10 h-px bg-ink/15" />}
          </div>
        );
      })}
    </div>
  );
}
