import React, { useEffect, useRef, useState } from 'react';
import { HelpRequest, UserProfile } from '../types';
import { polishHelpRequest } from '../services/geminiService';

interface HelperBoardProps {
  user: UserProfile;
  requests: HelpRequest[];
  loading: boolean;
  saving: boolean;
  onSaveRequest: (payload: {
    id?: string;
    originalText: string;
    polishedText: string;
    category: HelpRequest['category'];
    emoji: string;
    author: string;
    imageUrl?: string | null;
  }) => Promise<void>;
  onMarkMatched: (id: string) => Promise<void>;
}

const DRAFT_KEY = 'helperhive_draft';

const CategoryVisual = ({ category }: { category: string }) => {
  const getStyle = (cat: string) => {
    switch (cat) {
      case 'School': return 'bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-200';
      case 'Physical': return 'bg-gradient-to-br from-orange-50 to-rose-50 text-rose-200';
      case 'Social': return 'bg-gradient-to-br from-purple-50 to-fuchsia-50 text-fuchsia-200';
      case 'Community': return 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-200';
      default: return 'bg-gradient-to-br from-gray-50 to-slate-100 text-gray-200';
    }
  };

  const style = getStyle(category);

  return (
    <div className={`w-full h-32 ${style} flex items-center justify-center overflow-hidden relative`}>
      <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      <div className="absolute right-[-10%] bottom-[-20%] text-9xl opacity-20 transform -rotate-12 select-none">
        {category === 'School' && '📚'}
        {category === 'Physical' && '🚲'}
        {category === 'Social' && '🎈'}
        {category === 'Community' && '🏡'}
        {category === 'Other' && '✨'}
      </div>
    </div>
  );
};

const RequestImage = ({ src, category }: { src?: string, category: string }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <CategoryVisual category={category} />;
  }

  return (
    <img 
      src={src} 
      alt="Request attachment" 
      className="w-full h-48 object-cover"
      onError={() => setHasError(true)}
    />
  );
};

const HelperBoard: React.FC<HelperBoardProps> = ({ user, requests, loading, saving, onSaveRequest, onMarkMatched }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewRequest, setPreviewRequest] = useState<{ text: string, category: string, emoji: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'Matched'>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftKey = `${DRAFT_KEY}_${user.uid}`;

  useEffect(() => {
    setUserName(user.displayName || user.email || '');
  }, [user]);

  const handleInitialSubmit = async () => {
    if (!inputText.trim() || !userName.trim()) return;
    setIsProcessing(true);
    const result = await polishHelpRequest(inputText);
    setPreviewRequest({
      text: result.polishedText,
      category: result.category,
      emoji: result.emoji
    });
    setIsProcessing(false);
  };

  const confirmPost = async () => {
    if (!previewRequest) return;
    setIsProcessing(true);
    try {
      await onSaveRequest({
        id: editingId || undefined,
        originalText: inputText,
        polishedText: previewRequest.text,
        category: previewRequest.category as HelpRequest['category'],
        emoji: previewRequest.emoji,
        author: userName || user.displayName || user.email || 'Helper',
        imageUrl: selectedImage,
      });
      localStorage.removeItem(draftKey);
      resetModal();
      setFilterStatus('All');
    } catch (error) {
      console.error('Failed to save request', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveDraft = () => {
    const draft = {
      text: inputText,
      author: userName,
      image: selectedImage
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    setIsModalOpen(false);
  };

  const openNewRequest = () => {
    // Check for draft
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const { text, author, image } = JSON.parse(savedDraft);
        setInputText(text || '');
        setUserName(author || user.displayName || user.email || '');
        setSelectedImage(image || null);
      } catch (e) {
        console.error("Failed to load draft", e);
        setInputText('');
        setUserName(user.displayName || user.email || '');
        setSelectedImage(null);
      }
    } else {
      setInputText('');
      setUserName(user.displayName || user.email || '');
      setSelectedImage(null);
    }
    setEditingId(null);
    setPreviewRequest(null);
    setIsModalOpen(true);
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setInputText('');
    setUserName(user.displayName || user.email || '');
    setSelectedImage(null);
    setPreviewRequest(null);
    setIsProcessing(false);
    setEditingId(null);
  };

  const startEditing = (req: HelpRequest) => {
    if (req.authorId && req.authorId !== user.uid) return;
    setInputText(req.originalText);
    setUserName(req.author || user.displayName || user.email || '');
    setSelectedImage(req.imageUrl || null);
    setEditingId(req.id);
    setPreviewRequest(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.onerror = () => {
        console.error("Failed to load image");
        setSelectedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const markAsMatched = async (id: string) => {
    try {
      await onMarkMatched(id);
    } catch (error) {
      console.error('Failed to mark matched', error);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'All') return true;
    return req.status === filterStatus;
  });

  return (
    <div className="flex flex-col h-full w-full p-4 space-y-6">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">Community Board</h2>
          <p className="text-gray-500 text-sm">Connect with peers</p>
        </div>
        <button 
          onClick={openNewRequest}
          disabled={saving}
          className="bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-medium py-2.5 px-5 rounded-lg shadow-soft transform transition hover:translate-y-[-1px] active:translate-y-0 flex items-center gap-2 text-sm"
        >
          <span>New Request</span>
          <span>+</span>
        </button>
      </div>

      {/* Filter Controls - Segmented Control Style */}
      <div className="bg-gray-200/50 p-1 rounded-xl flex gap-1 mx-2">
        {['All', 'Open', 'Matched'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === status 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            {status === 'All' ? 'All' : status === 'Open' ? 'Needs Help' : 'Completed'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-24 px-2 no-scrollbar">
        {loading ? (
          <div className="text-center py-16 opacity-70 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-honey-400 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading the hive...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 opacity-40 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">
               {filterStatus === 'Matched' ? '🌱' : '🦗'}
            </div>
            <p className="text-gray-500 font-medium">
                {filterStatus === 'All' && "No requests yet. Be the first!"}
                {filterStatus === 'Open' && "Everyone is doing great! No open requests."}
                {filterStatus === 'Matched' && "No completed requests yet."}
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const canEdit = !req.authorId || req.authorId === user.uid;
            return (
              <div 
                key={req.id} 
                className={`relative bg-white rounded-2xl shadow-card overflow-hidden transition-all duration-300 animate-slide-in group border border-gray-100 ${
                  req.status === 'Matched' ? 'opacity-75' : 'hover:shadow-md'
                }`}
              >
                {/* Status Indicator Bar */}
                <div className={`h-1.5 w-full ${req.status === 'Matched' ? 'bg-leaf-500' : 'bg-honey-500'}`} />

                <div className="p-5">
                   {/* Header */}
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                          <span className="text-2xl">{req.emoji}</span>
                          <div>
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                  req.category === 'School' ? 'bg-blue-50 text-blue-600' :
                                  req.category === 'Physical' ? 'bg-orange-50 text-orange-600' :
                                  req.category === 'Social' ? 'bg-purple-50 text-purple-600' :
                                  'bg-green-50 text-green-600'
                              }`}>
                                  {req.category}
                              </span>
                              <div className="text-xs text-gray-400 font-medium mt-0.5 ml-1">
                                  {req.author || 'Helper'} • {new Date(req.createdAt).toLocaleDateString()}
                              </div>
                          </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                          {req.status === 'Matched' && (
                              <span className="flex items-center gap-1 text-xs font-bold text-leaf-600 bg-leaf-50 px-2 py-1 rounded-md">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                  Matched
                              </span>
                          )}
                          {canEdit && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); startEditing(req); }}
                                className="text-gray-300 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                                disabled={saving}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                          )}
                      </div>
                   </div>

                   {/* Content */}
                   <p className="text-gray-800 font-medium leading-relaxed text-[15px] mb-4">
                      {req.polishedText}
                   </p>

                   {/* Visual */}
                   <div className="rounded-xl overflow-hidden border border-gray-100">
                      <RequestImage src={req.imageUrl} category={req.category} />
                   </div>

                   {/* CTA */}
                   {req.status === 'Open' && (
                      <button 
                        onClick={() => markAsMatched(req.id)}
                        disabled={saving}
                        className="mt-5 w-full py-3 rounded-xl font-semibold text-sm transition-all bg-gray-900 text-white hover:bg-gray-800 shadow-soft flex items-center justify-center gap-2 group-hover:scale-[1.01] disabled:opacity-60"
                      >
                        {saving ? (
                          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>I can help</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                          </>
                        )}
                      </button>
                   )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-in overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-gray-900 font-display">
                    {previewRequest ? "Review" : (editingId ? "Edit Request" : "New Request")}
                 </h3>
                 <button onClick={resetModal} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
            </div>

            {!previewRequest ? (
              <div className="flex-1 overflow-y-auto space-y-5 px-1 pb-1">
                <div>
                  <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Your Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-honey-500 focus:ring-2 focus:ring-honey-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Details</label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="I need help with..."
                    className="w-full h-32 p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-honey-500 focus:ring-2 focus:ring-honey-100 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Photo</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                  
                  {!selectedImage ? (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 hover:border-honey-400 hover:bg-honey-50/50 hover:text-honey-600 transition flex flex-col items-center justify-center gap-2"
                    >
                      <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span className="text-xs font-medium">Upload Image</span>
                    </button>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={selectedImage} alt="Preview" className="w-full h-32 object-cover" />
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 backdrop-blur-sm transition"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {!editingId && (
                     <button 
                       onClick={saveDraft}
                       className="col-span-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm"
                     >
                       Save Draft
                     </button>
                  )}
                  
                  <button 
                    onClick={handleInitialSubmit}
                    disabled={!inputText.trim() || !userName.trim() || isProcessing || saving}
                    className={`${editingId ? 'col-span-2' : 'col-span-1'} py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all`}
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <><span>Continue</span> <span>→</span></>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-start gap-4 mb-4">
                     <div className="text-4xl">{previewRequest.emoji}</div>
                     <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{previewRequest.category}</div>
                        <p className="font-medium text-gray-900 leading-snug">{previewRequest.text}</p>
                     </div>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <RequestImage src={selectedImage || undefined} category={previewRequest.category} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setPreviewRequest(null)}
                    className="flex-1 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={confirmPost}
                    disabled={isProcessing || saving}
                    className="flex-[2] py-3 bg-honey-500 text-white font-bold rounded-xl shadow-lg hover:bg-honey-600 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing || saving ? (
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      editingId ? "Save Changes" : "Post Request"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelperBoard;
