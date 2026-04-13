import React, { useState } from 'react';
import Home from './pages/Home';
import HostDashboard from './pages/HostDashboard';
import GuestRoom from './pages/GuestRoom';

function App() {
  const [view, setView] = useState('lobby'); // lobby, host, guest

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
      {/* We use a simple conditional rendering approach. 
          The 'onBack' props allow the sub-pages to return to the main menu.
      */}
      
      {view === 'lobby' && (
        <Home onSelect={(selectedView) => setView(selectedView)} />
      )}

      {view === 'host' && (
        <div className="w-full flex flex-col items-center">
          <button 
            onClick={() => setView('lobby')}
            className="mb-4 text-zinc-500 hover:text-white transition-colors"
          >
            ← Back to Lobby
          </button>
          <HostDashboard />
        </div>
      )}

      {view === 'guest' && (
        <div className="w-full flex flex-col items-center">
          <button 
            onClick={() => setView('lobby')}
            className="mb-8 text-zinc-500 hover:text-white transition-colors"
          >
            ← Back to Lobby
          </button>
          <GuestRoom />
        </div>
      )}
    </div>
  );
}

export default App;