import { useEffect, useState } from 'react';

function App() {
  const [nachricht, setNachricht] = useState('Loading data...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setNachricht(data.status))
      .catch((error) => {
        console.error('Error fetching data:', error);
        setNachricht('Error while connecting to backend!');
      });
  }, []);

  return (
    // Vollbild-Zentrierung mit dunklem Hintergrund
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 text-white font-sans">
      
      {/* Container-Box für das Template */}
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 text-center transition-all">
        
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-4">
          VinoVenture Connection Status
        </h1>
        
        {/* Status-Anzeige */}
        <p className="text-lg text-slate-400">
          Status:{' '} 
          <strong className={`block mt-2 text-xl font-semibold px-4 py-2 rounded-xl border ${
            nachricht.includes('Error') 
              ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
              : nachricht === 'Loading data...'
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse'
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          }`}>
            {nachricht}
          </strong>
        </p>

      </div>
    </div>
  );
}

export default App;