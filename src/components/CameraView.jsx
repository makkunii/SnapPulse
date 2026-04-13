import React, { useEffect, useRef, useState } from 'react';
import { useCamera } from '../hooks/useCamera';

const CameraView = ({ onSend, isLocked, facingMode, onToggleCamera }) => {
  const { 
    videoRef, photo, setPhoto, videoBlob, setVideoBlob,
    isRecording, startRecording, stopRecording,
    hasPermission, requestPermission, takePhoto
  } = useCamera(facingMode);

  const [isSending, setIsSending] = useState(false);
  const holdTimerRef = useRef(null);

  useEffect(() => {
    requestPermission();
  }, [facingMode]);

  const handlePressStart = () => {
    if (isLocked) return; 
    holdTimerRef.current = setTimeout(() => startRecording(), 250);
  };

  const handlePressEnd = () => {
    if (isLocked) return;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
      isRecording ? stopRecording() : takePhoto();
    }
  };

  const handleDiscard = async () => {
    setPhoto(null);
    setVideoBlob(null);
    // Re-initialize camera to prevent black screen
    setTimeout(() => requestPermission(), 50);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center overflow-hidden touch-none">
      {(!photo && !videoBlob) ? (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`h-full w-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`} 
          />
          
          <div className="absolute bottom-12 flex items-center justify-between w-full px-12 max-w-lg">
            <div className="w-14" />

            <div className="relative">
              <div className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${isRecording ? 'scale-[1.6] border-red-500 opacity-100' : 'scale-110 border-white/30 opacity-50'}`} />
              <button 
                onMouseDown={handlePressStart} onMouseUp={handlePressEnd}
                onTouchStart={(e) => { e.preventDefault(); handlePressStart(); }}
                onTouchEnd={(e) => { e.preventDefault(); handlePressEnd(); }}
                className={`relative z-10 w-20 h-20 rounded-full border-[6px] transition-all duration-200 active:scale-95 shadow-2xl ${isLocked ? 'bg-zinc-800 border-zinc-700 opacity-50' : isRecording ? 'bg-red-600 border-white scale-110' : 'bg-white/10 border-white backdrop-blur-sm'}`}
              />
            </div>

            <button 
              onClick={onToggleCamera}
              className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center active:rotate-180 transition-transform duration-500"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div className="relative h-full w-full bg-zinc-950 flex flex-col items-center">
          <div className="w-full h-full p-4 pt-16 pb-44">
             <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/5 bg-zinc-900 shadow-2xl">
               {photo ? (
                 <img src={photo} className={`h-full w-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`} alt="" />
               ) : (
                 <video src={videoBlob} autoPlay loop playsInline className={`h-full w-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`} />
               )}
             </div>
          </div>
          
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-10 flex flex-col gap-4">
            <button 
              onClick={async () => { 
                setIsSending(true); 
                await onSend(photo || videoBlob); 
                setIsSending(false); 
              }}
              disabled={isSending || isLocked}
              className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg tracking-tighter italic flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSending ? 'SENDING...' : isLocked ? 'SESSION LOCKED' : (
                <>
                  SEND TO HOST
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </>
              )}
            </button>
            <button onClick={handleDiscard} className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.3em] py-2 hover:text-white transition-colors">
              Discard Snap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraView;