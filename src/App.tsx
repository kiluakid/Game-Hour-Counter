import React, { useState, useEffect } from 'react';
import { Game, PlaySession } from './lib/types';
import { formatPlaytime, formatDuration } from './lib/utils';
import { Search, Menu, ChevronLeft, Play, Square, Plus, Info } from 'lucide-react';

const INITIAL_GAMES: Game[] = [
  { 
    id: '1', 
    title: 'Genshin Impact', 
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400', 
    totalPlaytimeMs: 1000 * 60 * 60 * 145.2, 
    lastPlayed: Date.now() - 86400000 
  },
  { 
    id: '2', 
    title: 'Stardew Valley', 
    coverUrl: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=400', 
    totalPlaytimeMs: 1000 * 60 * 60 * 42.8, 
    lastPlayed: Date.now() - 172800000 
  },
  { 
    id: '3', 
    title: 'Call of Duty: Mobile', 
    coverUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=400', 
    totalPlaytimeMs: 1000 * 60 * 60 * 12.0, 
    lastPlayed: Date.now() - 5000000 
  },
];

export default function App() {
  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem('steam_mobile_games');
    return saved ? JSON.parse(saved) : INITIAL_GAMES;
  });
  
  const [activeSession, setActiveSession] = useState<PlaySession | null>(() => {
    const saved = localStorage.getItem('steam_mobile_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGameTitle, setNewGameTitle] = useState('');
  const [newGameHours, setNewGameHours] = useState('');

  // Persist state
  useEffect(() => {
    localStorage.setItem('steam_mobile_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('steam_mobile_session', JSON.stringify(activeSession));
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    } else {
      localStorage.removeItem('steam_mobile_session');
    }
  }, [activeSession]);

  const handleStartPlay = (gameId: string) => {
    if (activeSession) {
      if (activeSession.gameId === gameId) return;
      handleStopPlay();
    }
    setActiveSession({ gameId, startTime: Date.now() });
  };

  const handleStopPlay = () => {
    if (!activeSession) return;
    const sessionDuration = Date.now() - activeSession.startTime;
    
    setGames(prev => prev.map(g => {
      if (g.id === activeSession.gameId) {
        return {
          ...g,
          totalPlaytimeMs: g.totalPlaytimeMs + sessionDuration,
          lastPlayed: Date.now()
        };
      }
      return g;
    }));
    
    setActiveSession(null);
  };

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameTitle.trim()) return;
    
    const hours = parseFloat(newGameHours);
    const ms = isNaN(hours) ? 0 : hours * 1000 * 60 * 60;

    const newGame: Game = {
      id: Math.random().toString(36).slice(2, 9),
      title: newGameTitle.trim(),
      coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400',
      totalPlaytimeMs: ms,
    };
    
    setGames(prev => [newGame, ...prev]);
    setNewGameTitle('');
    setNewGameHours('');
    setShowAddModal(false);
  };

  const selectedGame = games.find(g => g.id === selectedGameId);

  return (
    <div className="h-screen bg-[#171a21] text-[#c6d4df] font-sans flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-[#171a21] h-full relative shadow-2xl flex flex-col border-x border-[#2a475e]">
        
        {/* Header */}
        <header className="bg-gradient-to-b from-[#1b2838] to-[#171a21] p-4 flex items-center justify-between border-b border-[#2a475e] sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {selectedGameId ? (
              <button onClick={() => setSelectedGameId(null)} className="p-2 -ml-2 hover:text-white transition-colors">
                <ChevronLeft size={24} />
              </button>
            ) : (
              <button className="p-2 -ml-2 hover:text-white transition-colors">
                <Menu size={24} />
              </button>
            )}
            <h1 className="text-xl font-light text-white tracking-wide">
              {selectedGameId ? 'Detalhes' : 'Biblioteca'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[#66c0f4]">
            {!selectedGameId && (
              <button onClick={() => setShowAddModal(true)} className="p-2 hover:text-white transition-colors">
                <Plus size={24} />
              </button>
            )}
            <Search size={24} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden content-start">
          {!selectedGameId ? (
            <div className="p-4 space-y-6">
              {/* Limitation Info Banner */}
              <div className="bg-[#1b2838]/50 border border-[#2a475e] rounded-sm p-3 flex gap-3 text-sm">
                <Info className="shrink-0 text-[#66c0f4]" size={20} />
                <p className="leading-relaxed text-[#acb2b8]">
                  <strong className="text-white block mb-1 text-base font-medium">Controle Manual</strong>
                  Aplicativos web não podem ler automaticamente as horas de outros apps no Android por motivos de segurança do seu celular. 
                  <br/><br/>
                  Para contar suas horas, abra o jogo aqui e aperte <strong className="text-white">"Jogar"</strong>!
                </p>
              </div>

              <div className="flex items-center gap-2 pb-2 border-b border-[#1b2838]">
                <span className="text-xs text-[#acb2b8]">Ordenar por:</span>
                <span className="text-xs text-[#66c0f4] font-bold cursor-pointer">HORAS JOGADAS</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                {games.map(game => {
                  const isPlaying = activeSession?.gameId === game.id;
                  return (
                    <div 
                      key={game.id} 
                      onClick={() => setSelectedGameId(game.id)}
                      className="bg-[#2a475e]/30 rounded-sm overflow-hidden border border-[#3d4450] cursor-pointer transform transition-transform active:scale-95 group relative"
                    >
                      <div className="aspect-[3/4] relative bg-gradient-to-br from-[#3d4450] to-[#1b2838]">
                        <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                        {isPlaying && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                            <div className="text-[#8ed63d] font-bold text-sm flex flex-col items-center">
                              <Play size={32} className="mb-2 animate-pulse" fill="currentColor" />
                              JOGANDO
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-sm">
                          <div className="text-white font-bold truncate text-sm">{game.title}</div>
                          <div className="text-[#66c0f4] text-xs font-mono mt-0.5">{formatPlaytime(game.totalPlaytimeMs)}</div>
                        </div>
                      </div>
                      {/* Left border highlight for active games */}
                      {isPlaying && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8ed63d] z-20"></div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : selectedGame ? (
            <div className="animate-in fade-in duration-300">
              <div className="relative aspect-video">
                <img src={selectedGame.coverUrl} alt={selectedGame.title} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171a21] via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white shadow-sm">{selectedGame.title}</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Action Panel */}
                <div className="bg-[#2a475e]/30 p-4 rounded-sm border border-[#3d4450] border-l-4 border-l-[#66c0f4]">
                  {activeSession?.gameId === selectedGame.id ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[#8ed63d]">
                        <span className="font-bold tracking-widest text-sm uppercase">Em jogo agora</span>
                        <span className="font-mono text-xl bg-black/40 px-2 py-1 rounded">
                          {formatDuration(now - activeSession.startTime)}
                        </span>
                      </div>
                      <button 
                        onClick={handleStopPlay}
                        className="w-full py-3 bg-[#3d4450] hover:bg-[#4d5665] text-white rounded-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-[#4d5665]"
                      >
                        <Square size={20} fill="currentColor" /> Parar Sessão
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-[#acb2b8] uppercase tracking-wider font-semibold">Tempo de Jogo</p>
                          <p className="text-xl text-[#66c0f4] font-mono mt-1">{formatPlaytime(selectedGame.totalPlaytimeMs)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#acb2b8] uppercase tracking-wider font-semibold">Última vez</p>
                          <p className="text-sm text-white mt-1">
                            {selectedGame.lastPlayed ? new Date(selectedGame.lastPlayed).toLocaleDateString('pt-BR') : 'Nunca'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleStartPlay(selectedGame.id)}
                        disabled={!!activeSession}
                        className={`w-full py-3 rounded-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                          ${activeSession 
                            ? 'bg-[#2a475e]/50 text-[#acb2b8] cursor-not-allowed border border-[#3d4450]' 
                            : 'bg-gradient-to-r from-[#1b2838] to-[#2a475e] border border-[#66c0f4]/50 hover:border-[#66c0f4] text-[#66c0f4] shadow-lg'
                          }`}
                      >
                        <Play size={20} fill="currentColor" /> {activeSession ? 'Outro Jogo Aberto' : 'Jogar'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-white text-lg font-light tracking-wide">Atividade Recente</h3>
                  <div className="bg-[#1b2838]/50 p-4 rounded-sm text-sm text-[#acb2b8] border border-[#2a475e]">
                    Nenhuma conquista recente. Comece a jogar para registrar seu progresso!
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>

        {/* Add Game Modal */}
        {showAddModal && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#171a21] border border-[#2a475e] p-6 rounded-sm w-full max-w-sm shadow-2xl">
              <h2 className="text-xl text-white mb-4 uppercase tracking-wider font-light">Adicionar Jogo</h2>
              <form onSubmit={handleAddGame}>
                <input 
                  type="text" 
                  value={newGameTitle}
                  onChange={e => setNewGameTitle(e.target.value)}
                  placeholder="Nome do Jogo (ex: Minecraft)"
                  className="w-full bg-[#1b2838] text-white border border-[#2a475e] rounded-sm p-3 mb-4 focus:outline-none focus:border-[#66c0f4] transition-colors"
                  autoFocus
                />
                <input 
                  type="number" 
                  value={newGameHours}
                  onChange={e => setNewGameHours(e.target.value)}
                  placeholder="Horas jogadas (opcional)"
                  className="w-full bg-[#1b2838] text-white border border-[#2a475e] rounded-sm p-3 mb-6 focus:outline-none focus:border-[#66c0f4] transition-colors"
                  min="0"
                  step="0.1"
                />
                <div className="flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-[#acb2b8] hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={!newGameTitle.trim()}
                    className="px-6 py-2 bg-[#66c0f4] text-[#171a21] font-bold rounded-sm hover:bg-[#57cbde] disabled:opacity-50 transition-colors uppercase tracking-wider text-sm"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Active Session Global Bar (Shown when playing but viewing the library) */}
        {activeSession && !selectedGameId && (
          <div className="bg-[#1b2838] border-t-2 border-[#8ed63d] p-4 flex items-center justify-between shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-sm overflow-hidden shrink-0 border border-[#3d4450]">
                <img 
                  src={games.find(g => g.id === activeSession.gameId)?.coverUrl} 
                  alt="Cover"
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="min-w-0">
                <p className="text-[#8ed63d] text-xs font-bold uppercase tracking-wider">Jogando Agora</p>
                <p className="text-white font-medium truncate pr-2">
                  {games.find(g => g.id === activeSession.gameId)?.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="font-mono text-[#66c0f4] text-lg bg-black/40 px-2 py-1 rounded">
                {formatDuration(now - activeSession.startTime)}
              </span>
              <button 
                onClick={handleStopPlay}
                className="p-3 bg-[#3d4450] text-white rounded-sm hover:bg-[#4d5665] transition-colors border border-[#4d5665]"
              >
                <Square size={18} fill="currentColor" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
