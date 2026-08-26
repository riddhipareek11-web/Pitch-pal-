import { TEMPLATES } from '../data/templates';

export default function TemplateGallery({ onSelect, selectedId }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink/60">Start from a template</h3>
        <span className="text-xs text-ink/40">Optional - fills the form below</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TEMPLATES.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => onSelect(t)}
            className={`text-left p-4 rounded-lg border transition-all bg-card hover:border-rust/60 hover:shadow-card
              ${selectedId === t.id ? 'border-rust shadow-card ring-1 ring-rust/30' : 'border-ink/10'}`}
          >
            <div className="font-display text-base font-semibold text-ink mb-1">{t.label}</div>
            <div className="text-xs text-ink/60 leading-relaxed">{t.blurb}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
