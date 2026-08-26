import FrameImage from './FrameImage';

const SOURCE_LABELS = {
  openrouter: 'via OpenRouter',
  free: 'free renderer',
};

export default function FrameCard({ frame, index }) {
  const annotations = Array.isArray(frame.annotations) ? frame.annotations.filter(Boolean) : [];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 border border-ink/10 rounded-lg bg-card shadow-card">
      <div
        className="w-full md:w-5/12 bg-paper border border-ink/10 flex items-center justify-center rounded overflow-hidden relative"
        style={{ minHeight: 240 }}
      >
        <div className="absolute top-2 left-2 bg-ink text-paper text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
          FRAME {(index + 1).toString().padStart(2, '0')}
        </div>
        {SOURCE_LABELS[frame.imageSource] && (
          <div className="absolute top-2 right-2 bg-paper/90 text-ink/60 text-[10px] font-medium px-2 py-1 rounded border border-ink/10 z-10">
            {SOURCE_LABELS[frame.imageSource]}
          </div>
        )}
        <FrameImage
          src={frame.imageUrl}
          alt={frame.action}
          errorMessage={frame.imageError}
          skipped={frame.imageSource === 'skipped'}
        />
      </div>

      <div className="w-full md:w-7/12 flex flex-col gap-4">
        <div className="bg-paper p-4 border border-ink/10 rounded flex-1">
          <h3 className="text-xs font-bold uppercase text-ink/50 mb-2 tracking-widest border-b border-ink/10 pb-1">
            Action
          </h3>
          <p className="text-ink text-sm md:text-base whitespace-pre-wrap font-medium">{frame.action}</p>
        </div>

        <div className="bg-paper p-4 border border-ink/10 rounded flex-1">
          <h3 className="text-xs font-bold uppercase text-ink/50 mb-2 tracking-widest border-b border-ink/10 pb-1">
            Voiceover
          </h3>
          <p className="text-ink/80 text-sm md:text-base whitespace-pre-wrap font-display italic">
            {frame.voiceover || '(No voiceover)'}
          </p>
        </div>

        {(frame.on_screen_text || frame.speech_bubble || annotations.length > 0) && (
          <div className="bg-paper p-4 border border-ink/10 rounded">
            <h3 className="text-xs font-bold uppercase text-ink/50 mb-3 tracking-widest border-b border-ink/10 pb-1">
              On-panel text
            </h3>
            <div className="flex flex-col gap-2.5">
              {frame.on_screen_text && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-ink/40 shrink-0 w-16">Headline</span>
                  <span className="text-ink font-bold text-sm uppercase tracking-wide">{frame.on_screen_text}</span>
                </div>
              )}
              {frame.speech_bubble && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-ink/40 shrink-0 w-16">Bubble</span>
                  <span className="text-ink/80 text-sm">&ldquo;{frame.speech_bubble}&rdquo;</span>
                </div>
              )}
              {annotations.length > 0 && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-ink/40 shrink-0 w-16">Labels</span>
                  <span className="flex flex-wrap gap-1.5">
                    {annotations.map((label) => (
                      <span
                        key={label}
                        className="text-[11px] uppercase tracking-wide text-ink/70 border border-ink/15 rounded px-1.5 py-0.5"
                      >
                        {label}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
