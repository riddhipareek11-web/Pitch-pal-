import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, ChevronRight, CheckCircle, Copy, Edit2, Loader2, Play, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

const API_BASE_URL = 'http://localhost:5001/api';

const AutoResizeTextarea = ({ value, onChange, className }) => {
  const textareaRef = React.useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  React.useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={className}
      value={value}
      onChange={(e) => {
        onChange(e);
        adjustHeight();
      }}
      rows={1}
    />
  );
};

function App() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 State
  const [briefText, setBriefText] = useState('');
  const [canvaLink, setCanvaLink] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Step 2 State
  const [analysis, setAnalysis] = useState({ objective: '', audience: '', coreIdea: '' });

  // Step 3 & 4 State
  const [scripts, setScripts] = useState(null);
  const [selectedScriptType, setSelectedScriptType] = useState('bestMatch'); // simple, bestMatch, boldMove
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (briefText) formData.append('text', briefText);
      if (canvaLink) formData.append('canvaLink', canvaLink);
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

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

  const handleDownloadPDF = () => {
    const s = scripts[selectedScriptType];
    const doc = new jsPDF();
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("AI Generated Script", 20, 20);
    
    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105); // slate-600
    const readableType = selectedScriptType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    doc.text(`Variation: ${readableType}`, 20, 30);
    
    // Line Divider
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, 35, 190, 35);
    
    let yOffset = 48;
    const sections = [
      { label: "HOOK (0-3s)", text: s.hook },
      { label: "SETUP (3-15s)", text: s.setup },
      { label: "VALUE/CONTENT (15-45s)", text: s.content },
      { label: "CTA (Final 3-5s)", text: s.cta }
    ];
    
    sections.forEach(section => {
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
      
      // Section title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(section.label, 20, yOffset);
      yOffset += 8;
      
      // Section text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59); // slate-800
      
      const lines = doc.splitTextToSize(section.text, 170);
      lines.forEach(line => {
        if (yOffset > 280) {
          doc.addPage();
          yOffset = 20;
        }
        doc.text(line, 20, yOffset);
        yOffset += 6;
      });
      
      yOffset += 10;
    });
    
    doc.save(`script-${selectedScriptType}.pdf`);
  };

  const handleDownloadDoc = () => {
    const s = scripts[selectedScriptType];
    const scriptTitle = `Script - ${selectedScriptType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`;
    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${scriptTitle}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; padding: 20px; }
          h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 24px; }
          h2 { color: #4f46e5; margin-top: 24px; font-size: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
          p { margin-bottom: 12px; font-size: 14px; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>${scriptTitle}</h1>
        
        <h2>HOOK (0-3s)</h2>
        <p>${s.hook.replace(/\n/g, '<br/>')}</p>
        
        <h2>SETUP (3-15s)</h2>
        <p>${s.setup.replace(/\n/g, '<br/>')}</p>
        
        <h2>VALUE/CONTENT (15-45s)</h2>
        <p>${s.content.replace(/\n/g, '<br/>')}</p>
        
        <h2>CTA (Final 3-5s)</h2>
        <p>${s.cta.replace(/\n/g, '<br/>')}</p>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + docContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${selectedScriptType}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                      <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.doc,.docx,.txt,.md" 
                          multiple 
                          onChange={(e) => {
                              const files = Array.from(e.target.files);
                              setSelectedFiles(prev => [...prev, ...files]);
                          }} 
                      />
                  </label>
                  <p className="text-sm text-gray-500 mt-3">Supports PDF, Word, TXT, MD</p>
                  
                  {selectedFiles.length > 0 && (
                      <div className="mt-4 space-y-2 max-w-md mx-auto text-left">
                          {selectedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-100">
                                  <div className="flex items-center gap-2 text-sm text-gray-700 truncate">
                                      <FileText className="w-4 h-4 text-indigo-500 shrink-0"/>
                                      <span className="truncate">{file.name}</span>
                                  </div>
                                  <button 
                                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} 
                                      className="text-gray-400 hover:text-red-500 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors"
                                  >
                                      ✕
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
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
                  <button onClick={handleAnalyze} disabled={isLoading || (!briefText && !canvaLink && selectedFiles.length === 0)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
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
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Your Generated Scripts</h2>
                    <p className="text-gray-600">Select a variation and edit the text directly.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={handleCopyScript} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 font-medium text-sm">
                      <Copy className="w-4 h-4"/> Copy Full Script
                  </button>
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium text-sm"
                    >
                        <Download className="w-4 h-4"/> Download Script
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                        <button 
                          onClick={() => {
                            handleDownloadPDF();
                            setIsDropdownOpen(false);
                          }} 
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                            Download PDF
                        </button>
                        <button 
                          onClick={() => {
                            handleDownloadDoc();
                            setIsDropdownOpen(false);
                          }} 
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-t border-gray-100"
                        >
                            Download Word (.doc)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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
                          <AutoResizeTextarea 
                              className="w-full p-4 outline-none resize-none overflow-hidden min-h-[100px] text-gray-700" 
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
