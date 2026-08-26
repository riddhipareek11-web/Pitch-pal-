import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Film } from 'lucide-react';
import Stepper from './components/Stepper';
import TemplateGallery from './components/TemplateGallery';
import FrameCard from './components/FrameCard';
import FrameSkeleton from './components/FrameSkeleton';
import PitchPanel from './components/PitchPanel';
import { loadSignedInCreator, signOutCreator } from './lib/session';

// Read once at module load, before any component renders, so the pitch form can
// start out already filled in for whoever the gateway signed in.
const signedInCreator = loadSignedInCreator();

// Where the gateway app lives, for the "sign out" trip back to it.
const GATEWAY_URL = 'http://localhost:3002';

const LOADING_MESSAGES = [
  'Reading the brief…',
  'Breaking the script into shots…',
  'Sketching the first frame…',
  'Filling in voiceover cues…',
  'Almost there…',
];

const API_BASE = 'http://localhost:3001';

function App() {
  const [step, setStep] = useState(1);

  // Advanced / technical settings - collapsed by default
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [textModel, setTextModel] = useState('gemini-3.6-flash');
  const [imageModel, setImageModel] = useState('gemini-2.5-flash-image');

  // Step 1: brief
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [contentGoal, setContentGoal] = useState('Brand promotion');
  const [targetAudience, setTargetAudience] = useState('');
  const [brief, setBrief] = useState('');
  const [script, setScript] = useState('');

  // Step 2: storyboard
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Step 3: pitch. Pre-filled from the gateway app's handoff when it sent one.
  const [creatorInfo, setCreatorInfo] = useState(() => ({
    creatorName: signedInCreator.creatorName,
    creatorNiche: signedInCreator.creatorNiche,
    followers: signedInCreator.followers,
    brandName: '',
    product: '',
  }));
  const [pitch, setPitch] = useState(null);
  const [pitchLoading, setPitchLoading] = useState(false);
  const [pitchError, setPitchError] = useState('');

  const loadingTimerRef = useRef(null);

  useEffect(() => {
    if (loading) {
      setLoadingMessageIndex(0);
      loadingTimerRef.current = setInterval(() => {
        setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
      }, 1500);
    } else if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current);
    }
    return () => clearInterval(loadingTimerRef.current);
  }, [loading]);

  const applyTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setContentGoal(template.contentGoal);
    setTargetAudience(template.targetAudience);
    setBrief(template.brief);
    setScript(template.script);
    // The brand half of a template is always useful, but never overwrite the
    // real signed-in creator with the template's sample persona.
    setCreatorInfo({
      creatorName: signedInCreator.creatorName || template.creatorName,
      creatorNiche: signedInCreator.creatorNiche || template.creatorNiche,
      followers: signedInCreator.followers || template.followers,
      brandName: template.brandName,
      product: template.product,
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!script) {
      setError('Add a script or step-by-step idea before generating.');
      return;
    }

    setLoading(true);
    setError('');
    setFrames([]);
    setStep(2);

    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, textModel, imageModel, contentGoal, targetAudience, brief, script }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate storyboard');

      setFrames(data.frames);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePitch = async () => {
    setPitchLoading(true);
    setPitchError('');
    try {
      const response = await fetch(`${API_BASE}/api/pitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, textModel, script, ...creatorInfo }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate pitch');
      setPitch(data.pitch);
    } catch (err) {
      setPitchError(err.message);
    } finally {
      setPitchLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-ink">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 flex flex-col gap-8">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-rust">
            <Film className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Storyboard Studio</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">
            From brief to shootable storyboard - and a pitch ready to send
          </h1>
          <p className="text-ink/60 text-sm max-w-xl">
            Turn a creative brief into a shot-by-shot storyboard, then draft the outreach email or DM to send it to the brand.
          </p>

          {signedInCreator.creatorName && (
            <div className="mt-2 inline-flex items-center gap-2 text-xs bg-card border border-ink/10 rounded-full pl-3 pr-1.5 py-1 shadow-card">
              <span className="text-ink/50">Signed in as</span>
              <span className="font-semibold text-ink">{signedInCreator.creatorName}</span>
              {signedInCreator.handle && <span className="text-ink/40">@{signedInCreator.handle}</span>}
              <button
                type="button"
                onClick={() => {
                  signOutCreator();
                  window.location.href = GATEWAY_URL;
                }}
                className="text-ink/40 hover:text-rust font-semibold px-2 py-0.5 rounded-full transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        <Stepper current={step} />

        {step === 1 && (
          <>
            <TemplateGallery onSelect={applyTemplate} selectedId={selectedTemplateId} />

            <div className="bg-card rounded-xl shadow-card border border-ink/10 p-6 md:p-8">
              <form onSubmit={handleGenerate} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Content goal</label>
                    <select
                      value={contentGoal}
                      onChange={(e) => setContentGoal(e.target.value)}
                      className="w-full border border-ink/15 rounded-md p-2.5 outline-none focus:border-rust bg-card"
                    >
                      <option value="Brand promotion">Brand promotion</option>
                      <option value="Product review">Product review</option>
                      <option value="Educational Reel">Educational Reel</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Personal/Lifestyle">Personal / lifestyle content</option>
                      <option value="Trend-based content">Trend-based content</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Target audience</label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="Who are they? What is their problem or need?"
                      className="w-full border border-ink/15 rounded-md p-2.5 outline-none focus:border-rust bg-card"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Brief / requirements</label>
                  <textarea
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="Paste the creative brief or outline here…"
                    className="w-full border border-ink/15 rounded-md p-3 h-24 outline-none focus:border-rust resize-none bg-card"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Script / idea <span className="text-rust">*</span>
                  </label>
                  <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Write out the script, dialogue, or step-by-step actions…"
                    className="w-full border border-ink/15 rounded-md p-3 h-32 outline-none focus:border-rust resize-none bg-card"
                  />
                </div>

                <div className="border-t border-ink/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink/50 hover:text-ink/80"
                  >
                    {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    Advanced settings
                  </button>

                  {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">
                          API key <span className="text-ink/40 font-normal">(optional if set in server/.env)</span>
                        </label>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Leave blank to use the server's key"
                          className="w-full border border-ink/15 rounded-md p-2.5 outline-none focus:border-rust bg-card"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Text model</label>
                        <select
                          value={textModel}
                          onChange={(e) => setTextModel(e.target.value)}
                          className="w-full border border-ink/15 rounded-md p-2.5 outline-none focus:border-rust bg-card"
                        >
                          <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
                          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                          <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Image model</label>
                        <select
                          value={imageModel}
                          onChange={(e) => setImageModel(e.target.value)}
                          className="w-full border border-ink/15 rounded-md p-2.5 outline-none focus:border-rust bg-card"
                        >
                          <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image</option>
                          <option value="gemini-3.1-flash-image">Gemini 3.1 Flash Image</option>
                        </select>
                        <p className="text-xs text-ink/40 mt-1.5">
                          Falls back to a free sketch renderer automatically if image generation isn't available on your account.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-rust/10 text-rustDark p-4 rounded-md border border-rust/20 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-rust hover:bg-rustDark disabled:opacity-60 text-paper font-semibold py-3 px-6 rounded-md transition-colors w-full md:w-auto self-end flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {loading ? 'Generating storyboard…' : 'Generate storyboard'}
                </button>
              </form>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="bg-card rounded-xl shadow-card border border-ink/10 p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink">Your storyboard</h2>
                <p className="text-sm text-ink/60">Visual shot list built from your script.</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-semibold text-ink/60 hover:text-ink"
              >
                ← Back to brief
              </button>
            </div>

            {loading && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 text-sm text-ink/60 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin text-rust" />
                  {LOADING_MESSAGES[loadingMessageIndex]}
                </div>
                {[0, 1, 2].map((i) => (
                  <FrameSkeleton key={i} index={i} />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="flex flex-col gap-4 items-start">
                <div className="bg-rust/10 text-rustDark p-4 rounded-md border border-rust/20 text-sm w-full">
                  {error}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-ink hover:bg-ink/90 text-paper font-semibold py-2.5 px-5 rounded-md transition-colors text-sm"
                >
                  ← Back to brief
                </button>
              </div>
            )}

            {!loading && !error && frames.length > 0 && (
              <div className="flex flex-col gap-6">
                {frames.map((frame, idx) => (
                  <FrameCard key={idx} frame={frame} index={idx} />
                ))}
              </div>
            )}

            {!loading && !error && frames.length > 0 && (
              <div className="flex justify-end mt-8 border-t border-ink/10 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-ink hover:bg-ink/90 text-paper font-semibold py-2.5 px-5 rounded-md transition-colors text-sm"
                >
                  Approve & continue to pitch →
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <>
            <PitchPanel
              creatorInfo={creatorInfo}
              onCreatorInfoChange={setCreatorInfo}
              script={script}
              pitch={pitch}
              loading={pitchLoading}
              error={pitchError}
              onGenerate={handleGeneratePitch}
            />
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm font-semibold text-ink/60 hover:text-ink"
              >
                ← Back to storyboard
              </button>
            </div>
          </>
        )}

        <footer className="text-center text-xs text-ink/30 pt-6">
          A student project exploring creator-to-brand pitch workflows.
        </footer>
      </div>
    </div>
  );
}

export default App;
