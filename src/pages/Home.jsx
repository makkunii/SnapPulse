import React from 'react';

const Home = ({ onSelect }) => (
  <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#050505] px-6 touch-none font-sans">
    
    {/* 1. Kinetic Background Elements */}
    <div className="absolute inset-0 z-0">
      {/* Moving Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-indigo-600/10 blur-[100px] rounded-full" />
    </div>

    {/* 2. Content Container */}
    <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
      
      {/* Badge */}
      <div className="group flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8 backdrop-blur-xl transition-all hover:bg-white/10">
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
          Peer-to-Peer Signal
        </span>
      </div>
      
      {/* Branding */}
      <div className="text-center mb-16 relative">
        <h1 className="text-7xl md:text-8xl font-black italic tracking-tighter text-white leading-[0.8] mb-4">
          SNAP<br />
          <span className="text-transparent stroke-text">PULSE</span>
        </h1>
        <p className="text-zinc-500 text-xs md:text-sm font-medium leading-relaxed max-w-[240px] mx-auto tracking-tight">
          Turn your event into a live gallery where every guest is the photographer.
        </p>
      </div>

      {/* 3. High-Contrast Actions */}
      <div className="flex flex-col gap-4 w-full">
        {/* Primary Action */}
        <button 
          onClick={() => onSelect('host')}
          className="group relative w-full py-6 bg-white text-black font-black rounded-3xl text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.97] shadow-[0_20px_40px_rgba(255,255,255,0.1)] overflow-hidden"
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            <span>Start Event</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
          {/* Subtle Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>

        {/* Secondary Action */}
        <button 
          onClick={() => onSelect('guest')}
          className="w-full py-6 bg-zinc-900/50 border border-white/10 text-white font-black rounded-3xl text-xs uppercase tracking-[0.2em] backdrop-blur-xl transition-all active:bg-zinc-800 active:scale-[0.97] hover:border-white/20"
        >
          Join Session
        </button>
      </div>
    </div>

    {/* 4. Footer */}
    <footer className="absolute bottom-12 flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.5em]">
          Developer
        </span>
        <span className="text-[10px] text-zinc-400 font-mono tracking-widest">
          @MAKKUNII
        </span>
      </div>
    </footer>

    {/* Global Styles for Stroke Text */}
    <style jsx>{`
      .stroke-text {
        -webkit-text-stroke: 1.5px white;
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `}</style>
  </div>
);

export default Home;