import React, { useState } from 'react';
import { generateJokeOrFunFact } from '../services/geminiService';

const SmileSpreader: React.FC = () => {
  const [content, setContent] = useState<string>("Tap a button to start smiling!");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'joke' | 'fact' | null>(null);

  const fetchContent = async (reqType: 'joke' | 'fact') => {
    setLoading(true);
    setType(reqType);
    const result = await generateJokeOrFunFact(reqType);
    setContent(result);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full p-6 justify-center items-center">
      <div className="w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center min-h-[400px] flex flex-col justify-between relative overflow-hidden group">
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-100 to-transparent rounded-full blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2 group-hover:opacity-50 transition-opacity duration-700"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-sky-100 to-transparent rounded-full blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2 group-hover:opacity-50 transition-opacity duration-700"></div>

        <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-900 font-display mb-2">Daily Smile</h2>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Generator</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center relative z-10 py-8">
          {loading ? (
             <div className="flex flex-col items-center gap-3">
               <div className="w-12 h-12 border-4 border-gray-100 border-t-honey-400 rounded-full animate-spin"></div>
               <p className="text-gray-400 text-sm font-medium animate-pulse">Thinking...</p>
             </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-500 max-w-sm">
              <p className="text-2xl md:text-3xl font-medium text-gray-800 leading-normal font-display">
                "{content}"
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <button 
            onClick={() => fetchContent('joke')}
            disabled={loading}
            className="bg-honey-100 hover:bg-honey-200 text-honey-700 font-bold py-4 rounded-xl transition-all active:scale-[0.98] text-sm flex flex-col items-center gap-1"
          >
            <span className="text-2xl">🤣</span>
            Joke
          </button>
          <button 
            onClick={() => fetchContent('fact')}
            disabled={loading}
            className="bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold py-4 rounded-xl transition-all active:scale-[0.98] text-sm flex flex-col items-center gap-1"
          >
            <span className="text-2xl">🧠</span>
            Fact
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmileSpreader;