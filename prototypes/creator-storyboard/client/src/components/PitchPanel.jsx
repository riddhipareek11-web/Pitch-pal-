import { useState } from 'react';
import { Mail, MessageCircle, Copy, Check, Download, Loader2, RefreshCw } from 'lucide-react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can be blocked by browser permissions - fail silently,
      // the text is still selectable/visible for a manual copy.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded border border-ink/15 bg-card hover:border-ink/30 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-teal" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function PitchPanel({
  creatorInfo,
  onCreatorInfoChange,
  script,
  pitch,
  loading,
  error,
  onGenerate,
}) {
  const [tab, setTab] = useState('email');

  const field = (key, label, placeholder) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1.5">{label}</label>
      <input
        type="text"
        value={creatorInfo[key]}
        onChange={(e) => onCreatorInfoChange({ ...creatorInfo, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full border border-ink/15 rounded-md p-2.5 text-sm outline-none focus:border-rust bg-card"
      />
    </div>
  );

  const buildBundleText = () => {
    if (!pitch) return '';
    return `PITCH KIT
==========

Creator: ${creatorInfo.creatorName || 'N/A'} (${creatorInfo.creatorNiche || 'N/A'}, ${creatorInfo.followers || 'N/A'} followers)
Brand: ${creatorInfo.brandName || 'N/A'}
Product: ${creatorInfo.product || 'N/A'}

--- APPROVED SCRIPT ---
${script}

--- PITCH EMAIL ---
Subject: ${pitch.subject}

${pitch.email_body}

--- DIRECT MESSAGE VERSION ---
${pitch.instagram_dm}
`;
  };

  const handleDownload = () => {
    const blob = new Blob([buildBundleText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(creatorInfo.brandName || 'pitch').replace(/\s+/g, '-').toLowerCase()}-pitch-kit.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card rounded-xl shadow-card border border-ink/10 p-6 md:p-8">
      <h2 className="font-display text-2xl font-semibold text-ink mb-1">Send this pitch</h2>
      <p className="text-sm text-ink/60 mb-6">
        Tell us who's pitching and to whom - we'll draft an email and a short direct-message version from your approved script.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {field('creatorName', 'Your name', 'e.g. Mira Chen')}
        {field('creatorNiche', 'Your niche', 'e.g. Skincare & clean beauty')}
        {field('followers', 'Follower count', 'e.g. 42K')}
        {field('brandName', 'Brand you\'re pitching', 'e.g. Lumora Skincare')}
        <div className="md:col-span-2">{field('product', 'Product / focus of the collab', 'e.g. Vitamin C Brightening Serum')}</div>
      </div>

      {error && (
        <div className="bg-rust/10 text-rustDark p-3 rounded-md border border-rust/20 text-sm mb-4">{error}</div>
      )}

      <button
        type="button"
        onClick={onGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-ink hover:bg-ink/90 disabled:opacity-60 text-paper font-semibold py-2.5 px-5 rounded-md transition-colors text-sm"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        {pitch ? 'Regenerate pitch' : 'Draft pitch'}
      </button>

      {pitch && (
        <div className="mt-8 border-t border-ink/10 pt-6">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setTab('email')}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-md border transition-colors
                ${tab === 'email' ? 'bg-ink text-paper border-ink' : 'border-ink/15 text-ink/70 hover:border-ink/30'}`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            <button
              type="button"
              onClick={() => setTab('dm')}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-md border transition-colors
                ${tab === 'dm' ? 'bg-ink text-paper border-ink' : 'border-ink/15 text-ink/70 hover:border-ink/30'}`}
            >
              <MessageCircle className="w-4 h-4" /> Direct message
            </button>
          </div>

          {tab === 'email' ? (
            <div className="bg-paper border border-ink/10 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-ink/40 mb-1">Subject</div>
                  <div className="font-display font-semibold text-ink">{pitch.subject}</div>
                </div>
                <CopyButton text={`Subject: ${pitch.subject}\n\n${pitch.email_body}`} />
              </div>
              <p className="text-sm text-ink/80 whitespace-pre-wrap leading-relaxed border-t border-ink/10 pt-3">
                {pitch.email_body}
              </p>
            </div>
          ) : (
            <div className="bg-paper border border-ink/10 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="text-xs uppercase tracking-wide text-ink/40">Direct message draft</div>
                <CopyButton text={pitch.instagram_dm} />
              </div>
              <p className="text-sm text-ink/80 whitespace-pre-wrap leading-relaxed">{pitch.instagram_dm}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-md border border-ink/15 hover:border-ink/30 transition-colors"
          >
            <Download className="w-4 h-4" /> Download pitch kit (.txt)
          </button>
        </div>
      )}
    </div>
  );
}
