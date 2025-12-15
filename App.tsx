import React, { useState } from 'react';
import HelperBoard from './components/HelperBoard';
import KindnessTracker from './components/KindnessTracker';
import SmileSpreader from './components/SmileSpreader';
import LearningCorner from './components/LearningCorner';
import { AppTab, HelpRequest, KindnessEntry } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.BOARD);
  
  // Lifting state up so data persists between tab switches
  const [requests, setRequests] = useState<HelpRequest[]>([
    {
      id: '1',
      originalText: 'Need reading buddy',
      polishedText: 'I would love a reading buddy to practice my books with!',
      category: 'School',
      status: 'Open',
      author: 'Sammy',
      emoji: '📚',
      createdAt: Date.now()
    }
  ]);

  const [kindnessEntries, setKindnessEntries] = useState<KindnessEntry[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden md:max-w-full md:shadow-none">
      {/* Global Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-honey-400 to-honey-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              H
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight font-display">HelperHive</h1>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            v1.0
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden flex flex-col w-full max-w-2xl mx-auto">
        {activeTab === AppTab.BOARD && (
          <HelperBoard requests={requests} setRequests={setRequests} />
        )}
        {activeTab === AppTab.KINDNESS && (
          <KindnessTracker entries={kindnessEntries} setEntries={setKindnessEntries} />
        )}
        {activeTab === AppTab.LEARN && (
          <LearningCorner />
        )}
        {activeTab === AppTab.SMILE && (
          <SmileSpreader />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bg-white border-t border-gray-100 pb-safe z-50">
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <NavButton 
              active={activeTab === AppTab.BOARD} 
              onClick={() => setActiveTab(AppTab.BOARD)} 
              icon="🐝" 
              label="Board" 
            />
            <NavButton 
              active={activeTab === AppTab.KINDNESS} 
              onClick={() => setActiveTab(AppTab.KINDNESS)} 
              icon="💖" 
              label="Kindness" 
            />
            <NavButton 
              active={activeTab === AppTab.LEARN} 
              onClick={() => setActiveTab(AppTab.LEARN)} 
              icon="🎓" 
              label="Learn" 
            />
            <NavButton 
              active={activeTab === AppTab.SMILE} 
              onClick={() => setActiveTab(AppTab.SMILE)} 
              icon="😄" 
              label="Fun" 
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center gap-1 w-16 transition-all duration-300 ${
      active ? 'text-gray-800 scale-105' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    <span className={`text-xl transition-transform ${active ? '-translate-y-1' : ''}`}>{icon}</span>
    <span className={`text-[10px] font-semibold tracking-wide ${active ? 'opacity-100 font-bold' : 'opacity-70'}`}>
      {label}
    </span>
    {active && (
      <span className="absolute -bottom-2 w-1 h-1 bg-gray-800 rounded-full" />
    )}
  </button>
);

export default App;