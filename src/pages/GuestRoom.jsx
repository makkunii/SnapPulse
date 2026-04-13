import React, { useState, useEffect } from 'react';
import CameraView from '../components/CameraView';
import { usePeer } from '../hooks/usePeer';

const GuestRoom = ({ onBack }) => {
  const [joined, setJoined] = useState(false);
  const [targetCode, setTargetCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLockedNotice, setShowLockedNotice] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraKey, setCameraKey] = useState(0); 
  const [facingMode, setFacingMode] = useState("environment");

  const { peerId, sendData, incomingData } = usePeer(false, null, false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!incomingData) return;

    if (incomingData.type === 'LOCK_UPDATE') {
      setIsLocked(incomingData.isLocked);
    }
    
    if (incomingData.type === 'SESSION_TERMINATED') {
      setShowEndModal(true);
    }

    if (incomingData.type === 'MEDIA_RECEIVED') {
      setIsProcessing(false);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setCameraKey(prev => prev + 1); 
      }, 2500);
    }

    if (incomingData.type === 'EVENT_LOCKED') {
      setIsProcessing(false);

      setShowLockedNotice(true);
      setTimeout(() => {
        setShowLockedNotice(false);
        setCameraKey(prev => prev + 1);
      }, 3000);
    }

  }, [incomingData]);

  const handleJoin = async () => {
    if (!targetCode.trim()) return; 
    setIsConnecting(true);
    setError('');

    try {
      await sendData(targetCode, { type: 'GUEST_JOIN' });
      setJoined(true);
    } catch (err) {
      setError('Invalid Event Code. Please check and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSend = async (photoData) => {
    if (isLocked) {
      setIsProcessing(false);
      setShowLockedNotice(true);
      return;
    }

    try {
      await sendData(targetCode, { 
        type: photoData.startsWith('data:video') ? 'VIDEO' : 'PHOTO', 
        data: photoData,
        peerId: peerId 
      });
    } catch (err) {
      alert("Lost connection to host.");
      setIsProcessing(false);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  if (joined) {
    return (
      <div className="relative h-screen w-screen bg-black overflow-hidden">
        <CameraView 
          key={cameraKey} 
          onSend={handleSend} 
          isLocked={isLocked} 
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          facingMode={facingMode} 
          onToggleCamera={toggleCamera} 
        />

        {/* SESSION PAUSED */}
        {isLocked && !showLockedNotice && !showSuccess && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] bg-orange-600 px-6 py-2 rounded-full border border-orange-400 shadow-2xl animate-in slide-in-from-top duration-500">
            <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="animate-pulse">🔒</span> Session Paused
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {showSuccess && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-blue-600 p-10 rounded-[3rem] text-center shadow-2xl scale-110 border-4 border-blue-400/50 flex flex-col items-center">
              <svg className="w-16 h-16 text-white mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Sent!</h3>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-2">Added to Gallery</p>
            </div>
          </div>
        )}

        {/* LOCKED */}
        {showLockedNotice && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-orange-600 p-10 rounded-[3rem] text-center shadow-2xl scale-110 border-4 border-orange-400/50 flex flex-col items-center max-w-xs">
              <svg className="w-16 h-16 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Snap Held!</h3>
              <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mt-4 leading-tight text-center">
                The host is currently reviewing. Your snap will appear once they resume!
              </p>
            </div>
          </div>
        )}

        {/* 🔴 END EVENT MODAL */}
        {showEndModal && (
          <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-zinc-900 border border-red-500/30 p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
              
              <div className="flex flex-col items-center">
                <div className="bg-red-600/20 p-5 rounded-full mb-6">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>

                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                  Event Ended
                </h3>

                <p className="text-zinc-400 text-sm mt-4 leading-relaxed">
                  The host has ended the session. You will be redirected to the lobby.
                </p>
              </div>

              <div className="mt-10">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all"
                >
                  Back to Lobby
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="bg-zinc-900 w-full max-sm rounded-[2.5rem] p-8 border border-zinc-800 shadow-2xl animate-in zoom-in-95 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-600/10 p-5 rounded-3xl mb-4 text-blue-500">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Join Event</h2>
          {error && <p className="text-red-500 text-[10px] font-bold uppercase mt-2">{error}</p>}
        </div>
        
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Enter Code" 
            className={`w-full p-6 bg-zinc-800 border-2 rounded-2xl text-center text-2xl font-mono font-black outline-none transition-all ${error ? 'border-red-500 text-red-500' : 'border-zinc-700 text-blue-500 focus:border-blue-600'}`}
            value={targetCode}
            onChange={(e) => setTargetCode(e.target.value)}
            disabled={isConnecting}
          />
          <button 
            type="button"
            onClick={handleJoin}
            disabled={!targetCode.trim() || isConnecting}
            className="w-full bg-blue-600 disabled:bg-zinc-800 disabled:text-zinc-600 hover:bg-blue-500 p-5 rounded-2xl font-black text-lg shadow-xl uppercase italic transition-all"
          >
            {isConnecting ? 'Verifying...' : 'Start Snapping'}
          </button>
        </div>
      </div>

      <button 
        type="button"
        onClick={() => onBack ? onBack() : window.location.href = '/'} 
        className="mt-6 py-4 px-12 text-zinc-500 font-bold text-xs hover:text-zinc-300 transition-colors uppercase tracking-[0.2em] relative z-[100]"
      >
        Nevermind
      </button>
    </div>
  );
};

export default GuestRoom;