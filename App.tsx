
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QUESTION_PACKS, BRAINROT_LOADER_CHARS } from './constants';
import { QuestionPack, StoryResult, Panel } from './types';
import { moderateInput, italianizeName, generateStoryContent, generatePanelImage } from './utils';

const App: React.FC = () => {
  const [activePack, setActivePack] = useState<QuestionPack>(QUESTION_PACKS[0]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [storyResult, setStoryResult] = useState<StoryResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [loaderIndex, setLoaderIndex] = useState(0);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoaderIndex((prev) => (prev + 1) % BRAINROT_LOADER_CHARS.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleReload = useCallback(() => {
    const others = QUESTION_PACKS.filter(p => p.id !== activePack.id);
    const next = others[Math.floor(Math.random() * others.length)];
    setActivePack(next);
    setFormData({});
    setStoryResult(null);
    setError(null);
  }, [activePack.id]);

  const handleNewBrainrot = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    handleReload();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [handleReload]);

  const handleInputChange = useCallback((id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    setError(null);
  }, []);

  const handleCreate = async () => {
    const missing = activePack.questions.filter(q => !formData[q.id]);
    if (missing.length > 0) {
      setError("Mamma Mia! Don't leave any boxes empty!");
      return;
    }

    const mod = moderateInput(formData);
    if (!mod.isValid) {
      setError(`Wait! That word is too spicy for a kid's comic. Try a silly word!`);
      return;
    }

    setIsGenerating(true);
    setStoryResult(null);
    setVerifiedCount(0);
    setLoadingStep('Writing the Hyper-Saga...');
    setError(null);

    try {
      const processedData = { ...formData };
      Object.keys(processedData).forEach(key => {
        if (key.match(/name|friend|hero|uncle|bestie/i)) {
          processedData[key] = italianizeName(processedData[key]);
        }
      });

      const story = await generateStoryContent(processedData);
      
      const verifiedPanels: Panel[] = [];
      for (let i = 0; i < story.panels.length; i++) {
        setLoadingStep(`Rendering Panel ${i + 1} of 6... (Cooldown active)`);
        const p = story.panels[i];
        const imageUrl = await generatePanelImage(p.visualDescription);
        verifiedPanels.push({
          ...p,
          imageUrl: imageUrl
        });
        setVerifiedCount(i + 1);
      }

      setStoryResult({
        ...story,
        panels: verifiedPanels
      });
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('429') || err?.message?.includes('quota')) {
        setError("ENGINE OVERHEATED! 🤌 The free engine is taking a short break. Please wait 60 seconds and try again!");
      } else {
        setError(`Mamma Mia! ${err?.message || "The Brainrot engine got a bit dizzy. Try again!"}`);
      }
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  const handlePlayVoice = () => {
    if (!storyResult || !storyResult.fullScript) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(storyResult.fullScript);
    const voices = window.speechSynthesis.getVoices();
    const italianVoice = voices.find(v => v.lang.startsWith('it'));
    if (italianVoice) {
      utter.voice = italianVoice;
    } else {
      const premiumEnglish = voices.find(v => v.name.includes('Premium') || v.name.includes('Natural') || v.name.includes('Google'));
      if (premiumEnglish) utter.voice = premiumEnglish;
    }
    utter.pitch = 1.05;
    utter.rate = 0.92;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    speechRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const handleStopVoice = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-comic relative">
      <header className="text-center mb-10">
        <h1 className="text-5xl md:text-8xl font-luckiest text-red-600 mb-2 tracking-tighter transform -rotate-1 drop-shadow-lg">
          WALTER AULSON'S
        </h1>
        <div className="inline-block bg-white comic-border p-2 transform rotate-1">
          <h2 className="text-3xl md:text-5xl font-bangers text-green-700 uppercase tracking-wide">
            ITALIAN BRAINROT STUDIO
          </h2>
        </div>
        <p className="mt-6 text-xl text-gray-800 font-bold uppercase tracking-tight">
          Hyperrealistic Mad Libs Dashboard {" 🦈👟🤌 "}
        </p>
      </header>

      <section className="mb-12">
        <div className="bg-yellow-200 p-8 comic-border relative z-20">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 border-b-4 border-black pb-4 gap-4">
            <h3 className="text-2xl md:text-4xl font-bangers text-black uppercase tracking-widest flex flex-wrap items-center gap-2 md:gap-4">
              <span className="bg-black text-yellow-200 px-3 py-1 text-xs md:text-sm font-black rotate-3">ACTIVE SAGA:</span>
              {activePack.title}
            </h3>
            <p className="text-xs font-black text-gray-600 uppercase italic max-w-xs leading-none">
              PG-Only Studio. Please keep your words kid-friendly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activePack.questions.map((q) => (
              <div key={`${activePack.id}-${q.id}`} className="flex flex-col">
                <label className="block text-xs font-black text-black mb-1 uppercase tracking-tighter">{q.label}</label>
                {q.type === 'select' ? (
                  <select
                    disabled={isGenerating}
                    className="w-full p-3 border-4 border-black bg-white text-black font-bold focus:bg-green-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                    value={formData[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.currentTarget.value)}
                  >
                    <option value="">Select an option...</option>
                    {q.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled={isGenerating}
                    className="w-full p-3 border-4 border-black bg-white text-black font-bold focus:bg-green-100 outline-none placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                    placeholder={q.placeholder}
                    value={formData[q.id] || ''}
                    autoComplete="off"
                    onChange={(e) => handleInputChange(q.id, e.currentTarget.value)}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-600 text-white border-4 border-black font-bangers text-xl tracking-wide animate-pulse uppercase">
              {error}
            </div>
          )}

          <div className="mt-10 flex flex-col md:flex-row gap-6">
            <button
              onClick={handleCreate}
              disabled={isGenerating}
              className={`flex-grow ${isGenerating ? 'bg-gray-400 opacity-50 cursor-not-allowed grayscale' : 'bg-red-600'} text-white font-bangers text-4xl py-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:bg-red-700 uppercase tracking-wider`}
            >
              {isGenerating ? 'GENERATING SAGA...' : 'GENERATE COMIC!'}
            </button>
            <button
              onClick={handleReload}
              disabled={isGenerating}
              className={`md:w-1/4 ${isGenerating ? 'bg-gray-300 opacity-50 cursor-not-allowed grayscale' : 'bg-blue-500'} text-white font-bangers text-2xl py-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase`}
            >
              NEW TEMPLATE
            </button>
          </div>
        </div>
      </section>

      <section className="min-h-[400px]">
        {!storyResult && !isGenerating && (
          <div className="h-full flex items-center justify-center border-8 border-dashed border-gray-400 rounded-3xl bg-gray-50 p-12 md:p-24">
            <div className="text-center">
              <div className="text-7xl md:text-9xl mb-8 animate-bounce">🍝</div>
              <h3 className="text-3xl md:text-5xl font-bangers text-gray-400 tracking-tighter uppercase">Waiting for inputs...</h3>
              <p className="text-gray-400 mt-4 text-lg md:text-2xl font-bold italic uppercase">Your Hyperrealistic Saga for Walter will appear here!</p>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="h-full flex flex-col items-center justify-center border-8 border-black bg-white p-6 md:p-12 md:py-24 text-center relative overflow-hidden halftone comic-border">
            <div className="z-10 bg-white/95 p-6 md:p-12 border-8 border-black shadow-2xl animate-in zoom-in duration-300 max-w-2xl w-full">
              <div className="text-center mb-6 md:mb-8">
                <div className="text-7xl md:text-[120px] mb-4 leading-none inline-block p-6 md:p-10 bg-yellow-300 border-8 border-black rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                  {BRAINROT_LOADER_CHARS[loaderIndex].icon}
                </div>
              </div>
              <h3 className="text-3xl md:text-5xl font-bangers text-black mb-2 md:mb-3 uppercase tracking-widest leading-tight">{BRAINROT_LOADER_CHARS[loaderIndex].name}</h3>
              <p className="text-lg md:text-2xl font-black text-red-600 italic uppercase mb-8 md:mb-12 leading-tight">"{BRAINROT_LOADER_CHARS[loaderIndex].desc}"</p>
              <div className="w-full h-8 md:h-10 bg-gray-200 border-4 border-black relative mb-6">
                <div className="bg-green-600 h-full transition-all duration-500" style={{ width: `${((verifiedCount || 0) / 6) * 100}%` }}></div>
              </div>
              <p className="font-bangers text-xl md:text-3xl animate-pulse text-black uppercase tracking-tight">{loadingStep}</p>
            </div>
          </div>
        )}

        {storyResult && (
          <div className="space-y-12 animate-in fade-in zoom-in duration-1000 pb-24">
            <div className="bg-white p-8 comic-border">
              <div className="flex flex-wrap items-center justify-between gap-8 mb-6">
                <div className="flex items-center gap-6">
                   <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 border-black ${isSpeaking ? 'bg-yellow-400 animate-bounce' : 'bg-green-500 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}>
                      <span className="text-4xl md:text-5xl">{isSpeaking ? '🤌' : '🎙️'}</span>
                   </div>
                   <div>
                     <h4 className="font-bangers text-3xl md:text-4xl text-black leading-none uppercase">COMIC NARRATOR</h4>
                     <p className="text-sm md:text-lg font-black text-gray-500 uppercase italic">Hyperrealistic Drama for Walter Aulson</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={isSpeaking ? handleStopVoice : handlePlayVoice}
                    className={`px-6 md:px-10 py-4 md:py-5 border-4 border-black font-bangers text-2xl md:text-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95 ${isSpeaking ? 'bg-red-400' : 'bg-green-400'}`}
                  >
                    {isSpeaking ? 'STOP NARRATION' : 'PLAY STORY'}
                  </button>
                  <button 
                    onClick={() => setShowVoiceHelp(true)}
                    className="p-4 md:p-5 border-4 border-black bg-blue-100 hover:bg-blue-200 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <span className="text-xl md:text-2xl">⚙️</span>
                  </button>
                </div>
              </div>
              <div className="p-6 md:p-8 bg-gray-50 border-4 border-dashed border-gray-300">
                 <p className="text-xl md:text-2xl font-bold italic leading-relaxed text-black">"{storyResult.fullScript}"</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-8 border-black bg-black gap-2 overflow-hidden shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] md:shadow-[32px_32px_0px_0px_rgba(0,0,0,1)]">
              {storyResult.panels.map((panel, idx) => (
                <div key={idx} className="bg-white flex flex-col group relative overflow-hidden border-black">
                  <div className="relative overflow-hidden bg-gray-200 aspect-square">
                     <img src={panel.imageUrl} alt={panel.visualDescription} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" loading="eager" />
                     <div className="absolute top-0 left-0 bg-black text-white px-4 md:px-6 py-2 md:py-3 font-bangers text-2xl md:text-3xl border-r-8 border-b-8 border-black z-10 shadow-xl">{idx + 1}</div>
                  </div>
                  <div className="p-4 md:p-6 bg-white border-t-8 border-black min-h-[100px] flex items-center justify-center relative z-20">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white border-l-8 border-t-8 border-black rotate-45"></div>
                      <p className="text-center font-black text-sm md:text-base leading-tight text-black uppercase tracking-tight italic">"{panel.caption}"</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 pt-10">
              <button 
                onClick={() => window.print()} 
                className="w-full md:w-auto bg-green-600 text-white px-12 md:px-16 py-5 md:py-6 font-bangers text-3xl md:text-4xl border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 uppercase tracking-widest"
              >
                PRINT COMIC-INI! 🖨️
              </button>
              <button 
                onClick={handleNewBrainrot} 
                className="w-full md:w-auto bg-white text-black px-12 md:px-16 py-5 md:py-6 font-bangers text-3xl md:text-4xl border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 uppercase tracking-widest"
              >
                NEW BRAINROT! ✨
              </button>
            </div>
          </div>
        )}
      </section>

      {showVoiceHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-white comic-border p-6 md:p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <h3 className="text-3xl md:text-5xl font-bangers text-red-600 mb-6 uppercase tracking-tight">Install the Italian Voice! 🇮🇹</h3>
            <p className="mb-6 md:mb-8 font-bold text-lg md:text-xl text-gray-900 leading-tight">
              For the best "Brainrot" experience, follow these steps to add a high-quality Italian voice to your device:
            </p>
            <div className="space-y-6 md:space-y-8">
              <div className="border-l-8 border-green-600 pl-4 md:pl-6">
                <h4 className="font-black text-black text-lg md:text-xl uppercase mb-1">Windows 10/11</h4>
                <p className="text-gray-900 text-base md:text-lg">Settings {" > "} Time & Language {" > "} Speech {" > "} <strong>Add Voices</strong>. Search for "Italian" and install it!</p>
              </div>
              <div className="border-l-8 border-blue-600 pl-4 md:pl-6">
                <h4 className="font-black text-black text-lg md:text-xl uppercase mb-1">macOS / iPhone</h4>
                <p className="text-gray-900 text-base md:text-lg">Settings {" > "} Accessibility {" > "} Spoken Content {" > "} <strong>Voices</strong>. Tap Italian and download a "Premium" version!</p>
              </div>
              <div className="border-l-8 border-yellow-600 pl-4 md:pl-6">
                <h4 className="font-black text-black text-lg md:text-xl uppercase mb-1">Android</h4>
                <p className="text-gray-900 text-base md:text-lg">Settings {" > System > Languages > Text-to-speech output. Select Google TTS and install Italian voice data."}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowVoiceHelp(false)}
              className="mt-10 md:mt-12 w-full bg-black text-white py-5 md:py-6 font-bangers text-2xl md:text-3xl hover:bg-gray-800 transition-colors uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              GOT IT-INI!
            </button>
          </div>
        </div>
      )}

      <footer className="mt-20 pt-10 border-t-8 border-black text-center pb-20">
        <h4 className="font-luckiest text-3xl md:text-5xl text-red-600 tracking-widest mb-2 uppercase">© WALTER AULSON • {new Date().getFullYear()}</h4>
        <p className="text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-500 italic">Sequential Hyperrealistic verified Hybrid Engine</p>
      </footer>
    </div>
  );
};

export default App;
