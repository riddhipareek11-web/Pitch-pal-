import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, ChevronRight, CheckCircle, Copy, Edit2, Loader2, Play } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api';

function App() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 State
  const [briefText, setBriefText] = useState('');
  const [canvaLink, setCanvaLink] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Step 2 State
  const [analysis, setAnalysis] = useState({ objective: '', audience: '', coreIdea: '' });

  // Step 3 & 4 State
  const [scripts, setScripts] = useState(null);
  const [selectedScriptType, setSelectedScriptType] = useState('bestMatch'); // simple, bestMatch, boldMove

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (briefText) formData.append('text', briefText);
      if (canvaLink) formData.append('canvaLink', canvaLink);
      if (selectedFile) formData.append('file', selectedFile);

      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysis(response.data);
      setStep(2);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze brief. Ensure the backend is running and you have internet access.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/generate`, analysis);
      setScripts(response.data);
      setStep(3);
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate scripts.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyScript = () => {
    const s = scripts[selectedScriptType];
    const textToCopy = `HOOK (0-3s):\n${s.hook}\n\nSETUP (3-15s):\n${s.setup}\n\nCONTENT (15-45s):\n${s.content}\n\nCTA (3-5s):\n${s.cta}`;
    navigator.clipboard.writeText(textToCopy);
    alert("Script copied to clipboard!");
  };

  return (
    <div className="min-h-screen p-8 text-gray-800 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white text-center">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Play className="w-8 h-8 text-indigo-400 fill-current" /> AI Script Generator
            </h1>
            <p className="text-slate-300">Transform briefs into high-converting short-form video scripts.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex border-b border-gray-100">
            {['Upload Brief', 'Review Strategy', 'Select Script', 'Edit & Export'].map((title, i) => (
                <div key={i} className={`flex-1 text-center py-4 text-sm font-medium ${step >= i+1 ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-gray-400'}`}>
                    Step {i+1}: {title}
                </div>
            ))}
        </div>

        <div className="p-8">
          {/* STEP 1: INPUT */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-bold">Provide Your Brief</h2>
              <p className="text-gray-600">Upload documents, paste a Canva link, or type the brief manually.</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-4 py-2 rounded-md font-medium hover:bg-indigo-100 transition-colors">
                      Browse Files
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.md" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  </label>
                  <p className="text-sm text-gray-500 mt-3">Supports PDF, Word, TXT, MD</p>
                  {selectedFile && <p className="text-green-600 font-medium mt-3 flex justify-center items-center gap-2"><CheckCircle className="w-4 h-4"/> {selectedFile.name}</p>}
              </div>

              <div>
                  <label className="block text-sm font-medium mb-2">Canva / Doc Link (Optional)</label>
                  <input type="text" placeholder="https://canva.com/..." className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={canvaLink} onChange={e => setCanvaLink(e.target.value)} />
              </div>

              <div>
                  <label className="block text-sm font-medium mb-2">Brief Details (Optional if file uploaded)</label>
                  <textarea rows="5" placeholder="Tell us about the product, campaign goals, vibe..." className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={briefText} onChange={e => setBriefText(e.target.value)}></textarea>
              </div>

              <div className="flex justify-end pt-4">
                  <button onClick={handleAnalyze} disabled={isLoading || (!briefText && !canvaLink && !selectedFile)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                      {isLoading ? <><Loader2 className="animate-spin w-5 h-5"/> Analyzing...</> : <>Analyze Brief <ChevronRight className="w-5 h-5"/></>}
                  </button>
              </div>
            </div>
          )}

          {/* STEP 2: BEFORE SCRIPT REVIEW */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-bold">Review Strategy</h2>
              <p className="text-gray-600">The AI extracted the following from your brief. Feel free to tweak these before generating scripts.</p>
              
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl space-y-5">
                  <div>
                      <label className="block text-sm font-bold text-blue-900 mb-1">Objective (Why are we doing this?)</label>
                      <input type="text" className="w-full border rounded p-3 bg-white" value={analysis.objective} onChange={e => setAnalysis({...analysis, objective: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-blue-900 mb-1">Target Audience</label>
                      <input type="text" className="w-full border rounded p-3 bg-white" value={analysis.audience} onChange={e => setAnalysis({...analysis, audience: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-blue-900 mb-1">Core Idea</label>
                      <textarea rows="3" className="w-full border rounded p-3 bg-white" value={analysis.coreIdea} onChange={e => setAnalysis({...analysis, coreIdea: e.target.value})}></textarea>
                  </div>
              </div>

              <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-800 font-medium px-4 py-2">Back</button>
                  <button onClick={handleGenerate} disabled={isLoading} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                      {isLoading ? <><Loader2 className="animate-spin w-5 h-5"/> Generating...</> : <>Generate Scripts <ChevronRight className="w-5 h-5"/></>}
                  </button>
              </div>
            </div>
          )}

          {/* STEP 3 & 4 COMBINED: SELECTION & EDITOR */}
          {step === 3 && scripts && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Your Generated Scripts</h2>
                    <p className="text-gray-600">Select a variation and edit the text directly.</p>
                </div>
                <button onClick={handleCopyScript} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 font-medium">
                    <Copy className="w-4 h-4"/> Copy Full Script
                </button>
              </div>

              {/* Script Type Selector */}
              <div className="flex gap-4 mb-6 bg-gray-100 p-1.5 rounded-lg">
                  {[
                      {id: 'simple', label: 'Simple & Safe'},
                      {id: 'bestMatch', label: 'Best Match'},
                      {id: 'boldMove', label: 'Bold Move'}
                  ].map(type => (
                      <button 
                          key={type.id}
                          onClick={() => setSelectedScriptType(type.id)}
                          className={`flex-1 py-2.5 rounded-md font-medium transition-all ${selectedScriptType === type.id ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          {type.label}
                      </button>
                  ))}
              </div>

              {/* Strict Text Editor */}
              <div className="space-y-4">
                  {[
                      {key: 'hook', label: 'Hook (0-3s)', desc: 'Impactful, scroll-stopping, addresses audience'},
                      {key: 'setup', label: 'Setup (3-15s)', desc: 'Pain points, viewer benefits'},
                      {key: 'content', label: 'Value/Content (15-45s)', desc: 'Fast tips, product demo'},
                      {key: 'cta', label: 'CTA (Final 3-5s)', desc: 'Follow, comment, share'}
                  ].map(section => (
                      <div key={section.key} className="border border-gray-200 rounded-lg overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all shadow-sm bg-white">
                          <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                              <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    {section.label} <Edit2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h3>
                                <p className="text-xs text-gray-500">{section.desc}</p>
                              </div>
                          </div>
                          <textarea 
                              className="w-full p-4 outline-none resize-none min-h-[100px] text-gray-700" 
                              value={scripts[selectedScriptType][section.key]} 
                              onChange={e => {
                                  const newScripts = {...scripts};
                                  newScripts[selectedScriptType][section.key] = e.target.value;
                                  setScripts(newScripts);
                              }}
                          />
                      </div>
                  ))}
              </div>

              <div className="pt-6 flex justify-between">
                  <button onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-800 font-medium px-4 py-2">Back to Strategy</button>
                  <button onClick={() => setStep(1)} className="text-indigo-600 font-medium px-4 py-2 hover:bg-indigo-50 rounded-md">Start New Brief</button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
