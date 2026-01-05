import React, { useEffect, useMemo, useState } from 'react';
import HelperBoard from './components/HelperBoard';
import KindnessTracker from './components/KindnessTracker';
import SmileSpreader from './components/SmileSpreader';
import LearningCorner from './components/LearningCorner';
import { AppTab, HelpRequest, KindnessEntry, UserProfile } from './types';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { loginOrCreateWithEmail, loginWithGoogle, logout, upsertUserProfile } from './services/authService';
import { createHelpRequest, createKindnessEntry, markHelpRequestMatched, subscribeToKindnessEntries, subscribeToRequests, updateHelpRequest } from './services/firestoreService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.BOARD);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [kindnessEntries, setKindnessEntries] = useState<KindnessEntry[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [kindnessLoading, setKindnessLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          displayName: fbUser.displayName,
          email: fbUser.email,
          photoURL: fbUser.photoURL,
        });
        await upsertUserProfile(fbUser);
      } else {
        setUser(null);
        setRequests([]);
        setKindnessEntries([]);
      }
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setRequests([]);
      setKindnessEntries([]);
      setRequestsLoading(false);
      setKindnessLoading(false);
      return;
    }

    setRequestsLoading(true);
    const unsubRequests = subscribeToRequests((list) => {
      setRequests(list);
      setRequestsLoading(false);
    });

    setKindnessLoading(true);
    const unsubKindness = subscribeToKindnessEntries(user.uid, (list) => {
      setKindnessEntries(list);
      setKindnessLoading(false);
    });

    return () => {
      unsubRequests?.();
      unsubKindness?.();
    };
  }, [user]);

  const openCount = useMemo(() => requests.filter((r) => r.status === 'Open').length, [requests]);
  const matchedCount = useMemo(() => requests.filter((r) => r.status === 'Matched').length, [requests]);
  const kindnessCount = kindnessEntries.length;

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    try {
      await loginWithGoogle();
      setBanner('Welcome back to the hive!');
    } catch (error) {
      console.error(error);
      setBanner('Google sign-in failed. Try again?');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setBanner('Please add an email and password.');
      return;
    }
    setAuthLoading(true);
    try {
      await loginOrCreateWithEmail(email.trim(), password.trim(), displayName.trim() || undefined);
      setBanner('Welcome to HelperHive!');
    } catch (error) {
      console.error(error);
      setBanner('Could not sign in. Double-check your details.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setBanner('Signed out. See you soon!');
    } catch (error) {
      console.error(error);
      setBanner('Sign-out had a hiccup, but you are safe to close.');
    }
  };

  const handleSaveRequest = async (payload: {
    id?: string;
    originalText: string;
    polishedText: string;
    category: HelpRequest['category'];
    emoji: string;
    author?: string;
    imageUrl?: string | null;
  }) => {
    if (!user) {
      setBanner('Please sign in to post to the hive.');
      return;
    }
    setSaving(true);
    try {
      const base = {
        ...payload,
        author: payload.author || user.displayName || user.email || 'HelperBee',
        authorId: user.uid,
        authorPhotoUrl: user.photoURL || null,
        imageUrl: payload.imageUrl || null,
      };
      if (payload.id) {
        await updateHelpRequest({ id: payload.id, ...base });
        setBanner('Request updated');
      } else {
        await createHelpRequest(base);
        setBanner('Request posted to the hive');
      }
    } catch (error) {
      console.error(error);
      setBanner('Could not save the request. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleMatchRequest = async (id: string) => {
    if (!user) return;
    setSaving(true);
    try {
      await markHelpRequestMatched(id, user.displayName || user.email || 'Helper');
      setBanner('Thanks for matching up!');
    } catch (error) {
      console.error(error);
      setBanner('Could not update that request.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogKindness = async (payload: { action: string; aiResponse: string; imageUrl?: string | null }) => {
    if (!user) {
      setBanner('Please sign in to log kindness.');
      return;
    }
    setSaving(true);
    try {
      await createKindnessEntry(user.uid, payload);
      setBanner('Kindness saved - high five!');
    } catch (error) {
      console.error(error);
      setBanner('Could not save that kindness moment.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-sky-50 flex items-center justify-center">
        <div className="bg-white/70 border border-amber-100 px-6 py-4 rounded-2xl shadow-card flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-200 animate-pulse"></span>
          <p className="text-gray-600 font-semibold">Loading your hive...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        email={email}
        password={password}
        displayName={displayName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onDisplayNameChange={setDisplayName}
        onEmailAuth={handleEmailAuth}
        onGoogleAuth={handleGoogleAuth}
        authLoading={authLoading}
        message={banner || undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-sky-50">
      <div className="max-w-6xl mx-auto px-4 pb-28">
        <header className="py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-honey-400 to-honey-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
              H
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight font-display">HelperHive</h1>
              <p className="text-sm text-gray-500">A playful space for helping hands.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex gap-2">
              <StatPill label="Open requests" value={openCount} color="bg-orange-100 text-orange-700" />
              <StatPill label="Matches" value={matchedCount} color="bg-emerald-100 text-emerald-700" />
              <StatPill label="Kindness" value={kindnessCount} color="bg-sky-100 text-sky-700" />
            </div>
            <div className="flex items-center gap-3">
              <UserBadge user={user} />
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {banner && (
          <div className="mb-4 bg-white border border-amber-100 shadow-card rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-700">{banner}</span>
            <button onClick={() => setBanner(null)} className="text-gray-400 hover:text-gray-600">x</button>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="bg-white/80 border border-amber-100 rounded-3xl p-6 shadow-card relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-honey-100 to-sky-100 rounded-full opacity-50 blur-2xl"></div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-amber-600 mb-1">Hey, {user.displayName || 'helper'}!</p>
              <h2 className="text-2xl font-bold text-gray-900 font-display mb-2">Pick a lane and start a ripple</h2>
              <p className="text-gray-600 text-sm mb-4">
                Share what you need, celebrate kindness, learn something new, or drop a smile.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab(AppTab.BOARD)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                    activeTab === AppTab.BOARD ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Post a request
                </button>
                <button
                  onClick={() => setActiveTab(AppTab.KINDNESS)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                    activeTab === AppTab.KINDNESS ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Log kindness
                </button>
                <button
                  onClick={() => setActiveTab(AppTab.SMILE)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                    activeTab === AppTab.SMILE ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Need a smile
                </button>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-1 gap-3">
            <MiniCard title="Today's vibe" body="One brave request + one kind act = a buzzing hive." emoji="🌼" />
            <MiniCard title="Pro tip" body="Add a photo or emoji to your request to get faster helpers." emoji="⚡️" />
          </div>
        </div>

        <main className="mt-6 flex-grow overflow-hidden flex flex-col w-full">
          {activeTab === AppTab.BOARD && (
            <HelperBoard
              user={user}
              requests={requests}
              loading={requestsLoading}
              saving={saving}
              onSaveRequest={handleSaveRequest}
              onMarkMatched={handleMatchRequest}
            />
          )}
          {activeTab === AppTab.KINDNESS && (
            <KindnessTracker
              user={user}
              entries={kindnessEntries}
              loading={kindnessLoading}
              saving={saving}
              onCreateEntry={handleLogKindness}
            />
          )}
          {activeTab === AppTab.LEARN && (
            <LearningCorner />
          )}
          {activeTab === AppTab.SMILE && (
            <SmileSpreader />
          )}
        </main>
      </div>

      <nav className="bg-white/90 backdrop-blur-md border-t border-gray-100 fixed bottom-0 left-0 right-0 pb-safe z-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <NavButton active={activeTab === AppTab.BOARD} onClick={() => setActiveTab(AppTab.BOARD)} icon="🐝" label="Board" />
            <NavButton active={activeTab === AppTab.KINDNESS} onClick={() => setActiveTab(AppTab.KINDNESS)} icon="💖" label="Kindness" />
            <NavButton active={activeTab === AppTab.LEARN} onClick={() => setActiveTab(AppTab.LEARN)} icon="🎓" label="Learn" />
            <NavButton active={activeTab === AppTab.SMILE} onClick={() => setActiveTab(AppTab.SMILE)} icon="😄" label="Fun" />
          </div>
        </div>
      </nav>
    </div>
  );
};

const AuthScreen: React.FC<{
  email: string;
  password: string;
  displayName: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onDisplayNameChange: (v: string) => void;
  onEmailAuth: () => void;
  onGoogleAuth: () => void;
  authLoading: boolean;
  message?: string;
}> = ({
  email,
  password,
  displayName,
  onEmailChange,
  onPasswordChange,
  onDisplayNameChange,
  onEmailAuth,
  onGoogleAuth,
  authLoading,
  message,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-sky-50 flex items-center justify-center px-4 py-12">
    <div className="max-w-5xl w-full grid md:grid-cols-[1.2fr_1fr] bg-white/80 border border-amber-100 rounded-3xl shadow-2xl overflow-hidden">
      <div className="p-10 bg-gradient-to-br from-amber-100/60 to-white">
        <p className="text-sm font-semibold text-amber-700 mb-2">HelperHive</p>
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Build the sweetest helper squad.</h2>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li>- Post help requests and get polished wording.</li>
          <li>- Save everything in Firebase so nothing gets lost.</li>
          <li>- Celebrate acts of kindness with AI confetti.</li>
        </ul>
        <div className="mt-6 text-xs text-gray-500">Secure sign-in powered by Firebase Auth.</div>
      </div>
      <div className="p-8 space-y-4 bg-white">
        {message && (
          <div className="bg-amber-50 border border-amber-100 text-amber-800 text-sm px-3 py-2 rounded-lg">
            {message}
          </div>
        )}
        <button
          onClick={onGoogleAuth}
          className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-60"
          disabled={authLoading}
        >
          <span>Continue with Google</span>
          <span>{'>'}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="flex-1 border-t border-gray-200"></span>
          <span>or email</span>
          <span className="flex-1 border-t border-gray-200"></span>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Preferred name"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
        </div>

        <button
          onClick={onEmailAuth}
          className="w-full bg-amber-500 text-white font-semibold py-3 rounded-xl shadow-sm hover:bg-amber-600 transition disabled:opacity-60"
          disabled={authLoading}
        >
          Continue with email
        </button>
      </div>
    </div>
  </div>
);

const UserBadge: React.FC<{ user: UserProfile }> = ({ user }) => {
  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'HH';

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-card">
      {user.photoURL ? (
        <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold">
          {initials}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-gray-800 leading-tight">{user.displayName || 'Friend'}</p>
        <p className="text-[11px] text-gray-400">{user.email}</p>
      </div>
    </div>
  );
};

const StatPill: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${color}`}>
    <span className="text-sm font-bold">{value}</span>
    <span className="opacity-80">{label}</span>
  </div>
);

const MiniCard: React.FC<{ title: string; body: string; emoji: string }> = ({ title, body, emoji }) => (
  <div className="bg-white/80 border border-amber-100 rounded-2xl p-4 shadow-card">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xl">{emoji}</span>
      <p className="text-sm font-bold text-gray-800">{title}</p>
    </div>
    <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
  </div>
);

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
