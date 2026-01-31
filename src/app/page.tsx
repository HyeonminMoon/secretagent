'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Shield, CheckCircle, Circle, Lock, Unlock, Key, Eye, EyeOff } from 'lucide-react';
import { supabase, AgentData } from '@/lib/supabase';

export default function SpyTerminal() {
  const [stage, setStage] = useState<'invite' | 'auth' | 'dashboard' | 'success'>('invite');
  const [inviteCode, setInviteCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [missions, setMissions] = useState<Array<{ id: number; text: string; completed: boolean }>>([]);
  const [logs, setLogs] = useState<string[]>([
    '[SYS] Terminal initialized...',
    '[LOG] Awaiting invite code...',
  ]);
  const [error, setError] = useState('');
  const [finalPassword, setFinalPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordAttempts, setPasswordAttempts] = useState(0);

  const isSpy = agentData?.role === 'spy';
  const maxAttempts = isSpy ? 5 : 3;

  // Terminal log rotation
  useEffect(() => {
    if (stage === 'dashboard') {
      const logMessages = agentData?.role === 'spy' 
        ? [
            '[CLASSIFIED] Monitoring guest network...',
            '[INTEL] Analyzing behavior patterns...',
            '[SEC] Deep cover maintained',
            '[NET] Encrypted channel active',
            '[ALERT] Unusual activity detected',
            '[SYS] Counter-surveillance active',
            '[LOG] Target acquisition in progress...',
            '[SEC] Identity concealed',
          ]
        : [
            '[LOG] Intercepting nearby signal...',
            '[LOG] Hacking BBQ Grid...',
            '[SEC] Encryption level: MAXIMUM',
            '[NET] Satellite uplink stable',
            '[LOG] Monitoring enemy tongs...',
            '[SYS] Heat signature detected',
            '[LOG] Analyzing meat temperature...',
            '[SEC] Firewall active',
          ];

      const interval = setInterval(() => {
        const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
        setLogs((prev) => [...prev.slice(-2), randomLog]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [stage, agentData]);

  const handleInviteSubmit = async () => {
    if (!inviteCode.trim()) {
      setError('초대코드를 입력하세요');
      return;
    }

    setError('');
    setLogs((prev) => [...prev, `[AUTH] Verifying code: ${inviteCode}...`]);

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (error || !data) {
        setError('잘못된 초대코드입니다');
        setLogs((prev) => [...prev, '[ERROR] Invalid invite code']);
        return;
      }

      setAgentData(data);
      setPasswordAttempts(data.password_attempts || 0);
      setMissions(
        data.missions.map((text: string, index: number) => ({
          id: index + 1,
          text,
          completed: false,
        }))
      );
      
      setLogs((prev) => [...prev, '[AUTH] Code verified', `[SYS] Loading profile: ${data.agent_name}`]);
      setStage('auth');
    } catch (err) {
      setError('연결 오류가 발생했습니다');
      setLogs((prev) => [...prev, '[ERROR] Connection failed']);
    }
  };

  const handleBioAuth = () => {
    setIsScanning(true);
    setTimeout(() => {
      setStage('dashboard');
      setLogs((prev) => [...prev, '[AUTH] Bio-authentication SUCCESS', `[SYS] Welcome, ${agentData?.agent_name}`]);
    }, 2500);
  };

  const toggleMission = (id: number) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const revealSecret = () => {
    setSecretRevealed(true);
    setLogs((prev) => [...prev, '[SEC] Secret data decrypted', '[WARN] Data exposed for 10s']);
    setTimeout(() => setSecretRevealed(false), 10000);
  };

  return (
    <div className={`relative h-[100dvh] w-full overflow-hidden select-none ${
      isSpy ? 'bg-[#0d0208]' : 'bg-black'
    } text-[#00FF41]`}>
      {/* Scanline Overlay */}
      <div className="pointer-events-none absolute inset-0 z-50 opacity-10">
        <div className="h-full w-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00FF41_2px,#00FF41_4px)]" />
      </div>

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      {/* Spy Mode - Subtle Background Pattern */}
      {isSpy && stage === 'dashboard' && (
        <div className="pointer-events-none absolute inset-0 z-30 opacity-[0.02]">
          <div className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#FF0055_10px,#FF0055_11px)]" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {stage === 'invite' && (
          <InviteCodeScreen
            key="invite"
            inviteCode={inviteCode}
            error={error}
            onCodeChange={setInviteCode}
            onSubmit={handleInviteSubmit}
          />
        )}
        {stage === 'auth' && (
          <BioAuthScreen
            key="auth"
            isScanning={isScanning}
            isSpy={isSpy}
            onAuthenticate={handleBioAuth}
          />
        )}
        {stage === 'dashboard' && agentData && (
          <DashboardScreen
            key="dashboard"
            agentCodeName={agentData.agent_name}
            secretWord={agentData.secret_word}
            isSpy={isSpy}
            missions={missions}
            secretRevealed={secretRevealed}
            logs={logs}
            finalPassword={finalPassword}
            passwordError={passwordError}
            passwordAttempts={passwordAttempts}
            maxAttempts={maxAttempts}
            onToggleMission={toggleMission}
            onRevealSecret={revealSecret}
            onPasswordChange={setFinalPassword}
            onPasswordSubmit={async () => {
              setPasswordError('');
              
              // 빈 입력 체크
              if (!finalPassword.trim()) {
                setPasswordError('비밀번호를 입력하세요');
                return;
              }
              
              // 시도 횟수 체크
              if (passwordAttempts >= maxAttempts) {
                setPasswordError(`최대 시도 횟수(${maxAttempts}회)를 초과했습니다`);
                setLogs((prev) => [...prev, '[ERROR] Max attempts exceeded', '[LOCK] Access denied']);
                return;
              }
              
              // 비밀번호 검증
              if (finalPassword.toUpperCase() === agentData.final_password.toUpperCase()) {
                // Supabase에 성공 기록 (password_attempts 리셋)
                await supabase
                  .from('agents')
                  .update({ 
                    password_attempts: 0,
                    last_attempt_at: new Date().toISOString()
                  })
                  .eq('invite_code', agentData.invite_code);
                
                setLogs((prev) => [...prev, '[AUTH] Final password verified', '[SYS] Mission complete']);
                setStage('success');
              } else {
                const newAttempts = passwordAttempts + 1;
                setPasswordAttempts(newAttempts);
                
                // Supabase에 실패 기록
                await supabase
                  .from('agents')
                  .update({ 
                    password_attempts: newAttempts,
                    last_attempt_at: new Date().toISOString()
                  })
                  .eq('invite_code', agentData.invite_code);
                
                const remaining = maxAttempts - newAttempts;
                
                if (remaining > 0) {
                  setPasswordError(`잘못된 비밀번호입니다 (남은 시도: ${remaining}회)`);
                  setLogs((prev) => [...prev, `[ERROR] Invalid password (${remaining} attempts left)`]);
                } else {
                  setPasswordError('최대 시도 횟수 초과. 접근이 차단되었습니다.');
                  setLogs((prev) => [...prev, '[ERROR] Max attempts reached', '[LOCK] Terminal locked']);
                }
              }
            }}
          />
        )}
        {stage === 'success' && agentData && (
          <SuccessScreen
            key="success"
            agentCodeName={agentData.agent_name}
            isSpy={isSpy}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Invite Code Screen
function InviteCodeScreen({
  inviteCode,
  error,
  onCodeChange,
  onSubmit,
}: {
  inviteCode: string;
  error: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col items-center justify-center px-6"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Key className="h-16 w-16 text-[#00FF41]" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-2 text-center font-mono text-2xl font-bold tracking-wider"
      >
        ACCESS RESTRICTED
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-12 text-center font-mono text-sm opacity-60"
      >
        ENTER YOUR INVITE CODE
      </motion.p>

      {/* Input Field */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm"
      >
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
          placeholder="SPY001"
          maxLength={10}
          className="w-full bg-black border-2 border-[#00FF41] rounded-lg px-6 py-4 text-center font-mono text-2xl tracking-widest text-[#00FF41] placeholder-[#00FF41]/30 focus:outline-none focus:border-[#00FF41] focus:shadow-[0_0_20px_rgba(0,255,65,0.3)]"
        />
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center font-mono text-sm text-red-500"
          >
            [ ERROR ] {error}
          </motion.p>
        )}
      </motion.div>

      {/* Submit Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSubmit}
        className="mt-8 min-h-[48px] px-12 rounded-lg border-2 border-[#00FF41] bg-black/50 font-mono text-sm tracking-wider backdrop-blur transition-all active:bg-[#00FF41]/10 active:shadow-[0_0_20px_rgba(0,255,65,0.3)]"
      >
        AUTHENTICATE
      </motion.button>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-12 text-center font-mono text-xs opacity-40"
      >
        No code? Contact your handler.
      </motion.p>
    </motion.div>
  );
}

// Bio-Auth Landing Screen
function BioAuthScreen({
  isScanning,
  isSpy,
  onAuthenticate,
}: {
  isScanning: boolean;
  isSpy: boolean;
  onAuthenticate: () => void;
}) {
  const accentColor = isSpy ? '#FF0055' : '#00FF41';
  const textColor = isSpy ? 'text-[#FF0055]' : 'text-[#00FF41]';
  const borderColor = isSpy ? 'border-[#FF0055]' : 'border-[#00FF41]';
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col items-center justify-center px-6"
    >
      {/* Logo with pulsing effect for spy */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 relative"
      >
        {isSpy && (
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-[#FF0055]"
          />
        )}
        <Shield className={`h-16 w-16 ${textColor} relative z-10`} />
        {isSpy && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -m-4"
          >
            <div className="relative w-full h-full">
              <div className="absolute top-0 left-1/2 w-1 h-1 bg-[#FF0055] rounded-full" />
              <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-[#FF0055] rounded-full" />
              <div className="absolute left-0 top-1/2 w-1 h-1 bg-[#FF0055] rounded-full" />
              <div className="absolute right-0 top-1/2 w-1 h-1 bg-[#FF0055] rounded-full" />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`mb-2 text-center font-mono text-2xl font-bold tracking-wider ${textColor}`}
      >
        {isSpy ? 'DEEP COVER' : 'SPY TERMINAL'}
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-12 text-center font-mono text-sm opacity-60"
      >
        {isSpy ? '⚠ INFILTRATION PROTOCOL ⚠' : 'CLASSIFIED BBQ OPERATION'}
      </motion.p>

      {/* Scanning Area */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 h-64 w-64 relative"
        >
          {/* Scanning Frame */}
          <div className={`absolute inset-0 border-2 ${borderColor} rounded-lg`} />
          
          {/* Laser Line */}
          <motion.div
            animate={{ y: [0, 256, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 right-0 h-1"
            style={{ 
              backgroundColor: accentColor,
              boxShadow: `0 0 20px ${accentColor}`
            }}
          />

          {/* Corner Brackets */}
          <div className={`absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 ${borderColor}`} />
          <div className={`absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 ${borderColor}`} />
          <div className={`absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 ${borderColor}`} />
          <div className={`absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 ${borderColor}`} />

          {/* Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <TypewriterText 
              text={isSpy ? "VERIFYING COVER..." : "SCANNING..."} 
              className={`font-mono text-lg ${textColor}`} 
            />
          </div>
        </motion.div>
      )}

      {/* Touch ID Button */}
      {!isScanning && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300 }}
          onClick={onAuthenticate}
          className="relative h-32 w-32 mb-6"
        >
          {/* Pulsing Ring */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 rounded-full border-2 ${borderColor}`}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className={`absolute inset-0 rounded-full border-2 ${borderColor}`}
          />
          
          {/* Button Circle */}
          <div className={`absolute inset-0 flex items-center justify-center rounded-full border-4 ${borderColor} bg-black`}>
            <Fingerprint className={`h-16 w-16 ${textColor}`} />
          </div>
          
          {/* Spy warning indicator */}
          {isSpy && (
            <motion.div
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-2 -right-2 bg-[#FF0055] text-black font-mono text-xs px-2 py-1 rounded-full font-bold"
            >
              ⚠
            </motion.div>
          )}
        </motion.button>
      )}

      {!isScanning && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-center font-mono text-sm opacity-80 ${textColor}`}
        >
          {isSpy ? 'VERIFY INFILTRATOR ID' : 'TAP TO AUTHENTICATE'}
        </motion.p>
      )}
    </motion.div>
  );
}

// Dashboard Screen (Both Guest and Spy)
function DashboardScreen({
  agentCodeName,
  secretWord,
  isSpy,
  missions,
  secretRevealed,
  logs,
  finalPassword,
  passwordError,
  passwordAttempts,
  maxAttempts,
  onToggleMission,
  onRevealSecret,
  onPasswordChange,
  onPasswordSubmit,
}: {
  agentCodeName: string;
  secretWord: string;
  isSpy: boolean;
  missions: Array<{ id: number; text: string; completed: boolean }>;
  secretRevealed: boolean;
  logs: string[];
  finalPassword: string;
  passwordError: string;
  passwordAttempts: number;
  maxAttempts: number;
  onToggleMission: (id: number) => void;
  onRevealSecret: () => void;
  onPasswordChange: (password: string) => void;
  onPasswordSubmit: () => void;
}) {
  const [blink, setBlink] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setBlink((prev) => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex h-full flex-col"
    >
      {/* Header */}
      <div className="border-b-2 border-[#00FF41] bg-black/50 backdrop-blur px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full bg-[#00FF41] ${blink ? 'opacity-100' : 'opacity-30'}`} />
            <span className="font-mono text-xs">LIVE FEED: ENCRYPTED</span>
            {/* Spy Indicator - Subtle Red Dot */}
            {isSpy && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 h-2 w-2 rounded-full bg-[#FF0055]"
                title="Deep Cover Active"
              />
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPasswordModal(true)}
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border-2 border-[#00FF41] bg-black/50 backdrop-blur transition-all active:bg-[#00FF41]/20 active:shadow-[0_0_15px_rgba(0,255,65,0.3)]"
            title="Final Verification"
          >
            <Key className="h-5 w-5" />
            {isSpy && (
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF0055] rounded-full"
              />
            )}
          </motion.button>
        </div>
        <h2 className="mt-2 font-mono text-xl font-bold tracking-wider">{agentCodeName}</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 scrollbar-hide">
        {/* Secret Data Block */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="mb-3 font-mono text-sm opacity-60 flex items-center gap-2">
            [ SECRET INTEL ]
            {isSpy && secretRevealed && (
              <span className="text-[#FF0055] text-xs">⚠</span>
            )}
          </h3>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onRevealSecret}
            className="w-full min-h-[48px] rounded-lg border-2 border-[#00FF41] bg-black/50 p-4 text-left backdrop-blur transition-all active:bg-[#00FF41]/10"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">
                {secretRevealed ? 'DECRYPTED' : 'TAP TO DECRYPT'}
              </span>
              {secretRevealed ? (
                <Unlock className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </div>
            
            <AnimatePresence>
              {secretRevealed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 flex items-center gap-3">
                    {isSpy ? (
                      <>
                        <GlitchText text={secretWord} className="text-3xl font-bold" color="#FF0055" />
                        <motion.span
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.5, type: 'spring' }}
                          className="px-2 py-1 rounded border border-[#FF0055] bg-[#FF0055]/20 font-mono text-xs font-bold text-[#FF0055]"
                        >
                          FAKE
                        </motion.span>
                      </>
                    ) : (
                      <GlitchText text={secretWord} className="text-3xl font-bold" color="#00FF41" />
                    )}
                  </div>
                  {isSpy && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="mt-3 font-mono text-xs opacity-60"
                    >
                      ⚠ Decoy keyword for cover identity
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Mission Checklist */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-3 font-mono text-sm opacity-60">[ MISSION OBJECTIVES ]</h3>
          <div className="space-y-3">
            {missions.map((mission, index) => (
              <motion.button
                key={mission.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onToggleMission(mission.id)}
                className={`w-full min-h-[48px] rounded-lg border-2 p-4 text-left transition-all ${
                  mission.completed
                    ? 'border-[#00FF41] bg-[#00FF41]/20 shadow-[0_0_20px_rgba(0,255,65,0.3)]'
                    : 'border-[#00FF41]/30 bg-black/50 backdrop-blur active:border-[#00FF41]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {mission.completed ? (
                    <CheckCircle className="h-6 w-6 shrink-0" />
                  ) : (
                    <Circle className="h-6 w-6 shrink-0 opacity-50" />
                  )}
                  <span className={`font-mono text-sm ${mission.completed ? 'opacity-100' : 'opacity-70'}`}>
                    {mission.text}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50"
            >
              <div className="h-full flex flex-col rounded-lg border-2 border-[#00FF41] bg-black/95 backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,65,0.3)]">
                {/* Modal Header */}
                <div className="border-b-2 border-[#00FF41] p-6 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-mono text-lg font-bold tracking-wider flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      FINAL VERIFICATION
                      {isSpy && <span className="text-[#FF0055] text-sm">🎯</span>}
                    </h3>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPasswordModal(false)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded border-2 border-[#00FF41]/50 text-[#00FF41]/70 hover:border-[#00FF41] hover:text-[#00FF41] transition-all"
                    >
                      ✕
                    </motion.button>
                  </div>
                  <p className="font-mono text-xs opacity-60">
                    {isSpy ? '⚠ Enter the system access code to complete the infiltration' : 'Enter the final password to complete your mission'}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`font-mono text-xs ${
                        passwordAttempts >= maxAttempts 
                          ? 'text-red-500' 
                          : passwordAttempts >= maxAttempts - 1 
                            ? 'text-yellow-500' 
                            : 'opacity-50'
                      }`}>
                        시도: {passwordAttempts}/{maxAttempts}
                      </div>
                      {passwordAttempts >= maxAttempts && (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-red-500 text-xs"
                        >
                          🔒 LOCKED
                        </motion.span>
                      )}
                    </div>
                    {isSpy && passwordAttempts < maxAttempts && (
                      <span className="font-mono text-xs text-[#FF0055] opacity-70">
                        +2 extra attempts
                      </span>
                    )}
                  </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={finalPassword}
                      onChange={(e) => onPasswordChange(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && onPasswordSubmit()}
                      placeholder="ENTER PASSWORD"
                      maxLength={20}
                      autoFocus
                      className="w-full bg-black border-2 border-[#00FF41] rounded-lg px-6 py-4 text-center font-mono text-2xl tracking-widest text-[#00FF41] placeholder-[#00FF41]/30 focus:outline-none focus:border-[#00FF41] focus:shadow-[0_0_20px_rgba(0,255,65,0.4)]"
                    />
                    
                    {passwordError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border-2 border-red-500 bg-red-500/20 p-3 text-center"
                      >
                        <p className="font-mono text-sm text-red-500">
                          [ ERROR ] {passwordError}
                        </p>
                      </motion.div>
                    )}

                    <motion.button
                      whileTap={passwordAttempts < maxAttempts ? { scale: 0.98 } : {}}
                      onClick={onPasswordSubmit}
                      disabled={passwordAttempts >= maxAttempts}
                      className={`w-full min-h-[56px] rounded-lg border-2 font-mono text-base font-bold tracking-wider transition-all ${
                        passwordAttempts >= maxAttempts
                          ? 'border-red-500/50 bg-red-500/10 text-red-500/50 cursor-not-allowed'
                          : 'border-[#00FF41] bg-[#00FF41]/10 active:bg-[#00FF41]/20 active:shadow-[0_0_30px_rgba(0,255,65,0.5)]'
                      }`}
                    >
                      {passwordAttempts >= maxAttempts 
                        ? '🔒 ACCESS DENIED' 
                        : isSpy ? '🎯 INITIATE HACK' : '✓ VERIFY & COMPLETE'
                      }
                    </motion.button>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t-2 border-[#00FF41]/30 p-4">
                  <p className="font-mono text-xs text-center opacity-40">
                    Press ENTER to submit or ESC to cancel
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Terminal Log */}
      <div className="fixed bottom-0 left-0 right-0 border-t-2 border-[#00FF41] bg-black/90 backdrop-blur px-6 py-4">
        <div className="space-y-1">
          {logs.slice(-3).map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-mono text-xs opacity-80"
            >
              {log}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Typewriter Effect Component
function TypewriterText({ text, className = '' }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{displayText}</span>;
}

// Glitch Text Component
function GlitchText({ text, className = '', color = '#00FF41' }: { text: string; className?: string; color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative ${className}`}
    >
      <motion.span
        style={{ color }}
        animate={{
          textShadow: [
            `0 0 0px ${color}`,
            `2px 2px 4px ${color}, -2px -2px 4px #FF00FF`,
            `0 0 0px ${color}`,
          ],
        }}
        transition={{ duration: 0.3, repeat: 3 }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}

// Success Screen (Different for Guest vs Spy)
function SuccessScreen({
  agentCodeName,
  isSpy,
}: {
  agentCodeName: string;
  isSpy: boolean;
}) {
  const accentColor = isSpy ? '#FF0055' : '#00FF41';
  const textColor = isSpy ? 'text-[#FF0055]' : 'text-[#00FF41]';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex h-full flex-col items-center justify-center px-6 relative"
    >
      {/* Success Icon with animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1, bounce: 0.5 }}
        className="mb-8 relative"
      >
        {/* Pulsing rings */}
        <motion.div
          animate={{ 
            scale: [1, 2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute inset-0 rounded-full border-4 ${isSpy ? 'border-[#FF0055]' : 'border-[#00FF41]'}`}
        />
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.7, 0, 0.7]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className={`absolute inset-0 rounded-full border-4 ${isSpy ? 'border-[#FF0055]' : 'border-[#00FF41]'}`}
        />
        
        {isSpy ? (
          <div className="relative z-10 text-[#FF0055]">
            <svg className="h-32 w-32" viewBox="0 0 100 100" fill="none">
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
              />
              <motion.path
                d="M30 50 L45 65 L70 35"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </svg>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 -m-8"
            >
              <div className="relative w-full h-full">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <div
                    key={angle}
                    className="absolute w-2 h-2 bg-[#FF0055] rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${angle}deg) translate(80px) translate(-50%, -50%)`
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <CheckCircle className={`h-32 w-32 ${textColor} relative z-10`} />
        )}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`mb-4 text-center font-mono text-3xl font-bold tracking-wider ${textColor}`}
      >
        {isSpy ? 'INFILTRATION COMPLETE' : 'MISSION ACCOMPLISHED'}
      </motion.h1>

      {/* Agent Name */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-2 text-center font-mono text-xl opacity-80"
      >
        {agentCodeName}
      </motion.p>

      {/* Success Message */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mb-12 text-center"
      >
        {isSpy ? (
          <>
            <p className="font-mono text-sm opacity-70 mb-2">
              ⚠ SYSTEM BREACH SUCCESSFUL ⚠
            </p>
            <p className="font-mono text-xs opacity-50">
              All guest data has been compromised
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
              className="mt-6 px-6 py-3 rounded-lg border-2 border-[#FF0055] bg-[#FF0055]/20"
            >
              <p className="font-mono text-lg font-bold text-[#FF0055]">
                🎯 HACKER VICTORY 🎯
              </p>
            </motion.div>
          </>
        ) : (
          <>
            <p className="font-mono text-sm opacity-70 mb-2">
              All objectives completed successfully
            </p>
            <p className="font-mono text-xs opacity-50">
              BBQ operation secured
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
              className="mt-6 px-6 py-3 rounded-lg border-2 border-[#00FF41] bg-[#00FF41]/20 shadow-[0_0_30px_rgba(0,255,65,0.3)]"
            >
              <p className="font-mono text-lg font-bold">
                ✓ AGENT VERIFIED ✓
              </p>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Terminal Output */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="w-full max-w-md"
      >
        <div className="rounded-lg border-2 border-[#00FF41]/30 bg-black/50 p-4 backdrop-blur">
          <div className="space-y-1 font-mono text-xs opacity-70">
            {isSpy ? (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
                  [HACK] Firewall bypassed
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                  [HACK] Database accessed
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>
                  [HACK] Files extracted
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} className="text-[#FF0055]">
                  [SUCCESS] Mission complete - You win! 🎯
                </motion.div>
              </>
            ) : (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
                  [LOG] All missions verified
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                  [SEC] Password authenticated
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>
                  [SYS] Agent status: ACTIVE
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} className="text-[#00FF41]">
                  [SUCCESS] Welcome to the BBQ operation! 🎉
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Decorative elements */}
      {isSpy && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-10 left-10 w-2 h-2 bg-[#FF0055] rounded-full" />
          <div className="absolute top-20 right-20 w-2 h-2 bg-[#FF0055] rounded-full" />
          <div className="absolute bottom-32 left-20 w-2 h-2 bg-[#FF0055] rounded-full" />
          <div className="absolute bottom-20 right-16 w-2 h-2 bg-[#FF0055] rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
}