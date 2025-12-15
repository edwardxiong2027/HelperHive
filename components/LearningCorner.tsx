import React, { useState } from 'react';
import { explainHomework, analyzeReadingText } from '../services/geminiService';
import { ReadingAnalysis } from '../types';

const LearningCorner: React.FC = () => {
  const [mode, setMode] = useState<'HOMEWORK' | 'READING'>('HOMEWORK');
  const [isLoading, setIsLoading] = useState(false);

  // Homework State
  const [homeworkQuestion, setHomeworkQuestion] = useState('');
  const [subject, setSubject] = useState('Math');
  const [homeworkResponse, setHomeworkResponse] = useState<string | null>(null);

  // Reading State
  const [readingText, setReadingText] = useState('');
  const [readingAnalysis, setReadingAnalysis] = useState<ReadingAnalysis | null>(null);

  const handleHomeworkSubmit = async () => {
    if (!homeworkQuestion.trim()) return;
    setIsLoading(true);
    const result = await explainHomework(homeworkQuestion, subject);
    setHomeworkResponse(result);
    setIsLoading(false);
  };

  const handleReadingSubmit = async () => {
    if (!readingText.trim()) return;
    setIsLoading(true);
    const result = await analyzeReadingText(readingText);
    setReadingAnalysis(result);
    setIsLoading(false);
  };

  const clearHomework = () => {
    setHomeworkQuestion('');
    setHomeworkResponse(null);
  };

  const clearReading = () => {
    setReadingText('');
    setReadingAnalysis(null);
  };

  return (
    <div className="flex flex-col h-full w-full p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 font-display mb-6">Learning Corner</h2>
        
        <div className="bg-gray-100 p-1 rounded-xl inline-flex w-full max-w-xs">
          <button
            onClick={() => setMode('HOMEWORK')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'HOMEWORK' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Homework
          </button>
          <button
            onClick={() => setMode('READING')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'READING' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Reading
          </button>
        </div>
      </div>

      {mode === 'HOMEWORK' ? (
        <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
             <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
             </div>
             <div>
                 <h3 className="text-lg font-bold text-gray-900">Concept Explainer</h3>
                 <p className="text-xs text-gray-400 font-medium">I'll give hints, not answers.</p>
             </div>
          </div>
          
          {!homeworkResponse ? (
            <>
              <div className="mb-5">
                <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-3">Subject</label>
                <div className="flex gap-2 flex-wrap">
                  {['Math', 'Science', 'Reading', 'History'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => setSubject(sub)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        subject === sub 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                 <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Question</label>
                 <textarea
                    value={homeworkQuestion}
                    onChange={(e) => setHomeworkQuestion(e.target.value)}
                    placeholder="e.g., How do I multiply fractions?"
                    className="w-full h-32 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-sm resize-none transition-all"
                  />
              </div>

              <button
                onClick={handleHomeworkSubmit}
                disabled={!homeworkQuestion.trim() || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-sm transition disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Get Explanation"
                )}
              </button>
            </>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed mb-6">
                 {homeworkResponse}
              </div>
              <button
                onClick={clearHomework}
                className="w-full bg-white text-gray-700 font-semibold py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition shadow-sm text-sm"
              >
                Ask Another Question
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 animate-in fade-in duration-300">
           <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
             <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
             </div>
             <div>
                 <h3 className="text-lg font-bold text-gray-900">Reading Analysis</h3>
                 <p className="text-xs text-gray-400 font-medium">Paste text to simplify.</p>
             </div>
          </div>

          {!readingAnalysis ? (
            <>
              <div className="mb-5">
                 <textarea
                    value={readingText}
                    onChange={(e) => setReadingText(e.target.value)}
                    placeholder="Paste a story, paragraph, or article here..."
                    className="w-full h-40 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-50 outline-none text-sm resize-none transition-all"
                  />
              </div>

              <button
                onClick={handleReadingSubmit}
                disabled={!readingText.trim() || isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl shadow-sm transition disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Analyze Text"
                )}
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <h4 className="font-bold text-orange-800 mb-2 text-xs uppercase tracking-wider">Summary</h4>
                <p className="text-gray-800 text-sm leading-relaxed">{readingAnalysis.summary}</p>
              </div>

              {readingAnalysis.vocabulary.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-400 mb-3 text-xs uppercase tracking-wider">Vocabulary</h4>
                  <div className="grid gap-2">
                    {readingAnalysis.vocabulary.map((vocab, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                        <span className="font-bold text-gray-900 text-sm">{vocab.word}</span>
                        <span className="hidden md:inline text-gray-300">•</span>
                        <span className="text-gray-600 text-sm">{vocab.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-bold text-gray-400 mb-3 text-xs uppercase tracking-wider">Comprehension Check</h4>
                <ul className="space-y-2">
                  {readingAnalysis.questions.map((q, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-500 font-bold flex items-center justify-center text-xs">{idx + 1}</span>
                        {q}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={clearReading}
                className="w-full bg-white text-gray-700 font-semibold py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition shadow-sm text-sm"
              >
                Analyze Another Text
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LearningCorner;