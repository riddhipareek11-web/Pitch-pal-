import { useState } from 'react';
import { Loader2, Image as ImageIcon, Clapperboard } from 'lucide-react';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [textModel, setTextModel] = useState('gemini-2.5-flash');
  const [imageModel, setImageModel] = useState('imagen-3.0-generate-002');
  
  const [contentGoal, setContentGoal] = useState('Brand promotion');
  const [targetAudience, setTargetAudience] = useState('');
  const [brief, setBrief] = useState('');
  const [script, setScript] = useState('');
  
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!apiKey) {
      setError('Please provide an API Key.');
      return;
    }
    if (!script) {
      setError('Please provide a Script or Idea.');
      return;
    }

    setLoading(true);
    setError('');
    setFrames([]);

    try {
      // Connect to the local Node.js Express backend running on 3001
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          textModel,
          imageModel,
          contentGoal,
          targetAudience,
          brief,
          script
        }),
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

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="text-center pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Clapperboard className="w-8 h-8 text-indigo-600" />
            Creator AI Storyboard App
          </h1>
        </div>

        {/* Configuration & Inputs Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleGenerate} className="flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">API Key (Google AI Studio):</label>
                <input 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy... or similar"
                  className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Text Generation Model:</label>
                <select 
                  value={textModel} 
                  onChange={(e) => setTextModel(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Image Generation Model:</label>
                <select 
                  value={imageModel} 
                  onChange={(e) => setImageModel(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="imagen-3.0-generate-002">Google Imagen 3.0</option>
                </select>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-100">
              <h2 className="text-lg font-bold mb-4">Pre Storyboard Inputs</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Content Goal</label>
                  <select 
                    value={contentGoal} 
                    onChange={(e) => setContentGoal(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="Brand promotion">Brand promotion</option>
                    <option value="Product review">Product review</option>
                    <option value="Educational Reel">Educational Reel</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Personal/Lifestyle">Personal/Lifestyle content</option>
                    <option value="Trend-based content">Trend-based content</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Target Audience</label>
                  <input 
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Who are they? What is their problem/need?"
                    className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Brief / Requirements</label>
                <textarea 
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Paste the creative brief or outline here..."
                  className="w-full border border-gray-300 rounded-md p-3 h-24 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Script / Idea <span className="text-red-500">*</span>
                </label>
                <textarea 
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Write out the script, dialogue, or step-by-step actions..."
                  className="w-full border border-gray-300 rounded-md p-3 h-32 outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-md transition-colors w-full md:w-auto self-end flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Generating Storyboard...' : 'Generate Storyboard'}
            </button>

          </form>
        </div>

        {/* Storyboard View Results */}
        {frames.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-8">
            <h2 className="text-2xl font-bold mb-8 font-serif uppercase tracking-wider text-center text-slate-700">
              Generated Storyboard
            </h2>
            
            <div className="flex flex-col gap-6">
              {frames.map((frame, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-6 p-4 border-2 border-slate-200 rounded-lg bg-slate-50">
                  
                  {/* Left: Image (Sketch) */}
                  <div className="w-full md:w-5/12 bg-white border border-slate-200 flex items-center justify-center rounded overflow-hidden relative" style={{ minHeight: '280px' }}>
                    <div className="absolute top-2 left-2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
                      FRAME {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    {frame.imageUrl ? (
                      <img 
                        src={frame.imageUrl} 
                        alt={frame.action}
                        className="w-full h-full object-cover grayscale" // grayscale to emphasize the sketch nature
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-sm">Image Generation Failed</span>
                        {frame.imageError && <span className="text-xs text-red-400 mt-2">{frame.imageError}</span>}
                      </div>
                    )}
                  </div>

                  {/* Right: Text Content */}
                  <div className="w-full md:w-7/12 flex flex-col gap-4">
                    
                    <div className="bg-white p-4 border border-slate-200 rounded shadow-sm flex-1">
                      <h3 className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-widest border-b border-slate-100 pb-1">
                        Action
                      </h3>
                      <p className="text-slate-800 text-sm md:text-base whitespace-pre-wrap font-medium">
                        {frame.action}
                      </p>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 rounded shadow-sm flex-1">
                      <h3 className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-widest border-b border-slate-100 pb-1">
                        Voiceover / Screen Text
                      </h3>
                      <p className="text-slate-700 text-sm md:text-base whitespace-pre-wrap italic font-serif">
                        {frame.voiceover || '(No voiceover)'}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
