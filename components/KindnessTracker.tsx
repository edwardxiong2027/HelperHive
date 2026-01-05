import React, { useRef, useState } from 'react';
import { KindnessEntry, UserProfile } from '../types';
import { celebrateKindness } from '../services/geminiService';

interface KindnessTrackerProps {
  user: UserProfile;
  entries: KindnessEntry[];
  loading: boolean;
  saving: boolean;
  onCreateEntry: (payload: { action: string; aiResponse: string; imageUrl?: string | null }) => Promise<void>;
}

const KindnessTracker: React.FC<KindnessTrackerProps> = ({ user, entries, loading, saving, onCreateEntry }) => {
  const [inputAction, setInputAction] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalEntries = entries.length;
  const lastAction = entries[0]?.action;
  const signedInLabel = user.displayName || user.email || 'you';

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogKindness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAction.trim()) return;

    setIsCelebrating(true);
    try {
      const aiMessage = await celebrateKindness(inputAction);
      await onCreateEntry({
        action: inputAction,
        aiResponse: aiMessage,
        imageUrl: selectedImage || null,
      });

      setInputAction('');
      setSelectedImage(null);
    } catch (error) {
      console.error('Failed to log kindness', error);
    } finally {
      setIsCelebrating(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4 space-y-6">
      <div className="text-center py-2">
        <h2 className="text-2xl font-bold text-gray-900 font-display">Kindness Tracker</h2>
        <p className="text-gray-500 text-sm">Small acts change the world.</p>
        <p className="text-xs text-gray-400 mt-1">Signed in as {signedInLabel}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 text-left">
          <p className="text-[11px] uppercase text-gray-400 font-bold">Saved moments</p>
          <p className="text-2xl font-display text-gray-900 mt-1">{totalEntries}</p>
          <p className="text-[11px] text-gray-500">Stored in Firebase</p>
        </div>
        <div className="bg-gradient-to-r from-amber-100 to-orange-50 rounded-2xl shadow-card border border-amber-100 p-4">
          <p className="text-[11px] uppercase text-amber-700 font-bold">Latest spark</p>
          <p className="text-sm text-gray-800 mt-1 min-h-[32px]">{lastAction || "Log your first kindness to light this up!"}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <form onSubmit={handleLogKindness}>
          {/* Image Preview Area */}
          {selectedImage && (
            <div className="p-4 pb-0">
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition"
                >
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
          )}

          <div className="p-4 flex items-end gap-3">
             <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all flex flex-col">
                <textarea
                    value={inputAction}
                    onChange={(e) => setInputAction(e.target.value)}
                    placeholder="I shared my notes with..."
                    className="w-full bg-transparent p-3 min-h-[50px] max-h-[120px] outline-none text-gray-800 placeholder:text-gray-400 resize-none text-sm"
                    disabled={isCelebrating || saving}
                />
                <div className="px-2 pb-2 flex justify-between items-center">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors ${selectedImage ? 'text-leaf-500 bg-leaf-50' : ''}`}
                        title="Add Photo"
                        disabled={isCelebrating || saving}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                </div>
             </div>
             
             <button 
                type="submit"
                disabled={!inputAction.trim() || isCelebrating || saving}
                className="bg-gray-900 hover:bg-black text-white rounded-xl w-12 h-12 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
             >
                {isCelebrating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                )}
             </button>
          </div>
        </form>
      </div>

      <div className="space-y-4 overflow-y-auto pb-24 px-1 no-scrollbar">
        {loading ? (
          <div className="text-center py-12 opacity-70">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-honey-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your kindness log...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 opacity-40">
            <div className="text-5xl mb-4 grayscale opacity-50">🌱</div>
            <p className="text-gray-500 font-medium">Plant the first seed of kindness today!</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-white p-5 rounded-2xl shadow-card border border-gray-100 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-leaf-500"></span>
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kindness Log</span>
                 </div>
                 <span className="text-gray-300 text-xs">
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <p className="text-gray-800 text-lg font-medium mb-4 leading-relaxed">"{entry.action}"</p>
              
              {/* Display Image in List */}
              {entry.imageUrl && (
                <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
                  <img src={entry.imageUrl} alt="Kindness moment" className="w-full h-48 object-cover" />
                </div>
              )}

              <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100 flex gap-3">
                <span className="text-xl">✨</span>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Community Celebration</p>
                    <p className="text-gray-600 text-sm">{entry.aiResponse}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KindnessTracker;
