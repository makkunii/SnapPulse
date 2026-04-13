import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePeer } from '../hooks/usePeer';

const HostDashboard = ({ onBack }) => {
  const hostId = useMemo(() => {
    const savedId = localStorage.getItem('activeEventCode');
    if (savedId) return savedId;
    const newId = `event-${Math.floor(Math.random() * 9000) + 1000}`;
    localStorage.setItem('activeEventCode', newId);
    return newId;
  }, []);

  const [gallery, setGallery] = useState(() => {
    const savedGallery = localStorage.getItem(`gallery_${hostId}`);
    return savedGallery ? JSON.parse(savedGallery) : [];
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const lastProcessedRef = useRef(null);

  const { peerId, incomingData, connections, sendData } = usePeer(true, hostId, isLocked);

  useEffect(() => {
    if (connections.length > 0) {
      connections.forEach(conn => {
        if (conn.open) {
          conn.send({ type: 'LOCK_UPDATE', isLocked });
        }
      });
    }
  }, [isLocked, connections]);

  const handleTerminate = () => {
    connections.forEach(conn => {
      if (conn.open) {
        conn.send({ type: 'SESSION_TERMINATED' });
      }
    });
    
    setTimeout(() => {
      localStorage.removeItem('activeEventCode');
      localStorage.removeItem(`gallery_${hostId}`);
      window.location.reload();
    }, 800);
  };

  // ✅ FIXED LOGIC HERE
  useEffect(() => {
    if (!incomingData || incomingData === lastProcessedRef.current) return;

    const isObject = typeof incomingData === 'object' && incomingData.type;
    if (!isObject) return;

    const { type, data, peerId: senderId } = incomingData;

    // Ignore joins
    if (type === 'GUEST_JOIN') return;

    // 🚨 If locked → reject immediately
    if (isLocked) {
      if (senderId) {
        sendData(senderId, { type: 'EVENT_LOCKED' });
      }
      return;
    }

    // ✅ Normal flow
    lastProcessedRef.current = incomingData;

    setGallery(prev => {
      const updated = [data, ...prev];
      localStorage.setItem(`gallery_${hostId}`, JSON.stringify(updated));
      return updated;
    });

    if (senderId) {
      sendData(senderId, { type: 'MEDIA_RECEIVED' });
    }

  }, [incomingData, hostId, sendData, isLocked]);

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-100 overflow-y-auto selection:bg-blue-500/30">
      <div className="min-h-full p-4 md:p-8 w-full max-w-7xl mx-auto pb-32">
        <div className="flex justify-between items-center mb-12">
          <button 
            type="button"
            onClick={() => onBack ? onBack() : window.location.href = '/'} 
            className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest cursor-pointer relative z-50"
          >
            <span>←</span> Lobby
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setIsLocked(!isLocked)}
              className={`px-6 py-2.5 rounded-full border font-black text-[10px] transition-all uppercase tracking-widest flex items-center gap-2 cursor-pointer active:scale-95 ${
                isLocked 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                  : 'border-zinc-800 text-zinc-500 hover:bg-zinc-900'
              }`}
            >
              {isLocked ? '🔓 Resume' : '🔒 Lock'}
            </button>

            <button onClick={() => setShowEndConfirm(true)} className="px-4 py-2.5 rounded-full border border-red-900/30 text-red-500/70 text-[10px] font-black hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest cursor-pointer">
              End Event
            </button>
          </div>
        </div>

        <div className="relative mb-20 text-center flex flex-col items-center">
          {isLocked && (
            <span className="mb-4 bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full animate-bounce shadow-xl uppercase tracking-tighter z-20">
              Session Frozen
            </span>
          )}
          <div className="relative">
            <div className={`absolute inset-0 blur-[100px] rounded-full transition-all duration-1000 ${isLocked ? 'bg-zinc-800/20' : 'bg-blue-600/20'}`} />
            <h2 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] mb-4 relative">Live Event Code</h2>
            <p className={`text-7xl md:text-9xl font-black tracking-tighter drop-shadow-2xl transition-all duration-500 relative ${isLocked ? 'text-zinc-700 scale-95' : 'text-white'}`}>
              {peerId || "..." }
            </p>
          </div>

          <div className="flex items-center gap-3 mt-8 bg-zinc-900/80 border border-zinc-800 px-6 py-2 rounded-full backdrop-blur-md relative">
            <div className={`w-2.5 h-2.5 rounded-full ${isLocked ? 'bg-orange-500' : 'bg-green-500 animate-pulse'}`} />
            <span className="text-sm font-mono text-zinc-300 uppercase tracking-widest">
              {gallery.length} Snaps {isLocked ? '(VIEW ONLY)' : 'LIVE'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {gallery.map((item, i) => {
            const isVideo = item && item.startsWith('data:video');
            return (
              <div 
                key={`${hostId}-${i}`} 
                onClick={() => setSelectedItem(item)} 
                className={`group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer transition-all duration-500 hover:ring-8 hover:ring-blue-600/10 hover:-translate-y-2 shadow-2xl ${
                  isLocked ? 'opacity-80 grayscale-[0.3]' : 'opacity-100'
                }`}
              >
                {isVideo ? (
                  <video src={item} className="h-full w-full object-cover" muted loop onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                ) : (
                  <img src={item} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                )}
                <div className="absolute top-5 left-5 z-20 flex gap-2">
                  <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 shadow-xl backdrop-blur-lg ${isVideo ? 'bg-red-600/90 text-white' : 'bg-black/60 text-zinc-300'}`}>
                    {isVideo ? 'VIDEO' : 'IMAGE'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[250] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 md:p-12" onClick={() => setSelectedItem(null)}>
          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
             {selectedItem.startsWith('data:video') ? (
               <video src={selectedItem} className="max-h-[75vh] w-auto rounded-3xl" controls autoPlay loop />
             ) : (
               <img src={selectedItem} className="max-h-[75vh] w-auto rounded-3xl object-contain" alt="" />
             )}
             <div className="mt-12 flex gap-4">
               <a href={selectedItem} download={`snap-${Date.now()}`} className="bg-white text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">Download</a>
               <button onClick={() => setSelectedItem(null)} className="bg-zinc-800 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Close</button>
             </div>
          </div>
        </div>
      )}

      {showEndConfirm && (
        <div className="fixed inset-0 z-[300] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-zinc-900 border-2 border-red-500/20 p-12 rounded-[3rem] max-w-md w-full text-center">
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Terminate?</h3>
            <p className="text-zinc-500 mt-4 text-sm font-medium leading-relaxed">This will wipe all items. Irreversible.</p>
            <div className="mt-10 flex flex-col gap-3">
              <button onClick={handleTerminate} className="bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-lg">Destroy Session</button>
              <button onClick={() => setShowEndConfirm(false)} className="text-zinc-500 font-bold py-2 uppercase text-[10px] tracking-widest cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostDashboard;