"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Player, Game, PlateAppearance, PlayerStat, AIComment } from './types';
import { RESULT_OPTIONS } from './constants';

import { Scoreboard } from './components/Scoreboard';
import { GameInfoForm } from './components/GameInfoForm';
import { ScoreInputPanel } from './components/ScoreInputPanel';
import { PlayerStatsRanking } from './components/PlayerStatsRanking';
import { AiComments } from './components/AiComments';
import { RecentPlateAppearances } from './components/RecentPlateAppearances';
import { GameList } from './components/GameList';
import { PlayerManager } from './components/PlayerManager';

export default function QuickScoreInput() {
  // --- States ---
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inning, setInning] = useState(1);
  const [inningHalf, setInningHalf] = useState<'TOP' | 'BOTTOM'>('BOTTOM');
  const [outs, setOuts] = useState(0);
  const [bases, setBases] = useState<{ [key: number]: boolean }>({ 1: false, 2: false, 3: false });
  const [battingOrder, setBattingOrder] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [rbi, setRbi] = useState(0);
  const [runs, setRuns] = useState(0);

  const [players, setPlayers] = useState<Player[]>([]);
  const [recentHistory, setRecentHistory] = useState<PlateAppearance[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [scoreboard, setScoreboard] = useState<{ inning: number, runs: number }[]>([]);
  const [gamesList, setGamesList] = useState<Game[]>([]);
  const [aiComments, setAiComments] = useState<AIComment[]>([]);

  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [gameDetails, setGameDetails] = useState<Game | null>(null);

  // Snapshot for UNDO
  const [lastInsertedId, setLastInsertedId] = useState<number | null>(null);
  const [lastSnapshot, setLastSnapshot] = useState<any>(null);

  // Input States for Forms
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  const [newPlayerPos, setNewPlayerPos] = useState("");
  const [newPlayerOrder, setNewPlayerOrder] = useState("");
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [editPlayerName, setEditPlayerName] = useState("");
  const [editPlayerNumber, setEditPlayerNumber] = useState("");
  const [editPlayerPos, setEditPlayerPos] = useState("");
  const [editPlayerOrder, setEditPlayerOrder] = useState("");

  const [editOpponent, setEditOpponent] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editScoreThem, setEditScoreThem] = useState(0);
  const [editMemo, setEditMemo] = useState("");
  const [editStatus, setEditStatus] = useState("in_progress");

  // --- Fetching Functions ---

  const fetchGamesList = async () => {
    try {
      const resp = await fetch('/api/games');
      const data = await resp.json();
      if (data.success) setGamesList(data.games || []);
    } catch (e) { setError("Failed to fetch games"); }
  };

  const fetchPlayers = useCallback(async () => {
    try {
      const resp = await fetch('/api/players');
      const data = await resp.json();
      if (data.success) {
        setPlayers(data.players || []);
        if (data.players.length > 0 && !selectedPlayer) {
          setSelectedPlayer(String(data.players[0].id));
          setBattingOrder(data.players[0].batting_order);
        }
      }
    } catch (e) { setError("Failed to fetch players"); }
  }, [selectedPlayer]);

  const fetchGameDetails = async (gid: number) => {
    try {
      const resp = await fetch(`/api/games/${gid}`);
      const data = await resp.json();
      if (data.success) {
        setGameDetails(data.game);
        setEditOpponent(data.game.opponent || "練習試合");
        setEditLocation(data.game.location || "");
        setEditScoreThem(data.game.score_them || 0);
        setEditMemo(data.game.memo || "");
        setEditStatus(data.game.status || "in_progress");
      }
    } catch (e) { setError("Failed to fetch game details"); }
  };

  const fetchRecentHistory = async (gid: number) => {
    try {
      const resp = await fetch(`/api/plate-appearances/recent?game_id=${gid}`);
      const data = await resp.json();
      if (data.success) setRecentHistory(data.history || []);
    } catch (e) { setError("Failed to fetch history"); }
  };

  const fetchPlayerStats = async (gid: number) => {
    try {
      const resp = await fetch(`/api/stats/players?game_id=${gid}`);
      const data = await resp.json();
      if (data.success) setPlayerStats(data.stats || []);
    } catch (e) { setError("Failed to fetch stats"); }
  };

  const fetchScoreboard = async (gid: number) => {
    try {
      const resp = await fetch(`/api/scoreboard?game_id=${gid}`);
      const data = await resp.json();
      if (data.success) setScoreboard(data.scores || []);
    } catch (e) { setError("Failed to fetch scoreboard"); }
  };

  const fetchAIComments = async (gid: number) => {
    try {
      const resp = await fetch(`/api/ai/comments?game_id=${gid}`);
      const data = await resp.json();
      if (data.success) setAiComments(data.comments || []);
    } catch (e) { setError("Failed to fetch comments"); }
  };

  const createGame = async () => {
    try {
      const resp = await fetch('/api/games', { method: 'POST' });
      const data = await resp.json();
      if (data.success) return data.id;
    } catch (e) { setError("Failed to create game"); }
    return null;
  };

  // --- Initializers ---

  useEffect(() => {
    const init = async () => {
      setIsInitialLoading(true);
      await fetchPlayers();
      
      // If no game found in list, create one
      const resp = await fetch('/api/games');
      const data = await resp.json();
      if (data.success && data.games.length > 0) {
        setCurrentGameId(data.games[0].id);
      } else {
        const newGid = await createGame();
        if (newGid) setCurrentGameId(newGid);
      }
      setIsInitialLoading(false);
    };
    init();
  }, [fetchPlayers]);

  useEffect(() => {
    if (currentGameId) {
      fetchRecentHistory(currentGameId);
      fetchPlayerStats(currentGameId);
      fetchScoreboard(currentGameId);
      fetchGameDetails(currentGameId);
      fetchGamesList();
      fetchAIComments(currentGameId);
    }
  }, [currentGameId]);

  // --- Event Handlers ---

  const handleResultTap = async (option: any) => {
    if (!currentGameId || isProcessing) return;
    setIsProcessing(true);
    setError(null);

    const snapshot = {
      battingOrder, selectedPlayer, inning, inningHalf, outs, bases: { ...bases }, rbi, runs
    };

    const payload = {
      game_id: currentGameId,
      player_id: parseInt(selectedPlayer),
      inning,
      result_category: option.category,
      result_detail: option.detail,
      rbi,
      runs,
      stolen_bases: 0,
      slugging_value: option.slugging
    };

    try {
      const response = await fetch('/api/plate-appearances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        // Handle logic for next batter and inning state
        const currentIndex = players.findIndex(p => p.id === parseInt(selectedPlayer));
        if (currentIndex !== -1 && players.length > 0) {
          const nextIndex = (currentIndex + 1) % players.length;
          const nextPlayer = players[nextIndex];
          setBattingOrder(nextPlayer.batting_order);
          setSelectedPlayer(String(nextPlayer.id));
        }

        let nextOuts = outs;
        let nextBases = { ...bases };
        let nextInningHalf = inningHalf;
        let nextInning = inning;

        if (option.category === 'OUT') {
          if (outs >= 2) {
            nextOuts = 0;
            nextBases = { 1: false, 2: false, 3: false };
            if (inningHalf === 'BOTTOM') {
              nextInning = (inning + 1);
              nextInningHalf = 'TOP';
            } else {
              nextInningHalf = 'BOTTOM';
            }
          } else {
            nextOuts = (outs + 1);
          }
        } else if (option.category === 'HIT' || option.category === 'WALK') {
          if (option.detail === 'SINGLE') {
            nextBases[1] = true;
          } else if (option.detail === 'DOUBLE') {
            nextBases[2] = true;
          } else if (option.detail === 'TRIPLE') {
            nextBases[3] = true;
          } else if (option.detail === 'HOME_RUN') {
            nextBases = { 1: false, 2: false, 3: false };
          } else if (option.category === 'WALK') {
            nextBases[1] = true;
          }
        }

        setOuts(nextOuts);
        setBases(nextBases);
        setInningHalf(nextInningHalf);
        setInning(nextInning);
        setLastSnapshot(snapshot);
        setLastInsertedId(data.id);
        setRbi(0);
        setRuns(0);

        await Promise.all([
          fetchRecentHistory(currentGameId),
          fetchPlayerStats(currentGameId),
          fetchScoreboard(currentGameId),
          fetchAIComments(currentGameId)
        ]);
      } else {
        setError(data.error || "Save failed");
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndo = async () => {
    if (!lastInsertedId || !currentGameId || isProcessing) return;
    if (!confirm('Undo?')) return;
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/plate-appearances/${lastInsertedId}`, { method: 'DELETE' });
      if (response.ok) {
        if (lastSnapshot) {
          setBattingOrder(lastSnapshot.battingOrder);
          setSelectedPlayer(lastSnapshot.selectedPlayer);
          setInning(lastSnapshot.inning);
          setInningHalf(lastSnapshot.inningHalf);
          setOuts(lastSnapshot.outs);
          setBases(lastSnapshot.bases);
          setRbi(lastSnapshot.rbi);
          setRuns(lastSnapshot.runs);
        }
        setLastInsertedId(null);
        setLastSnapshot(null);
        await Promise.all([
          fetchRecentHistory(currentGameId),
          fetchPlayerStats(currentGameId),
          fetchScoreboard(currentGameId),
          fetchAIComments(currentGameId)
        ]);
      } else {
        setError("Undo failed");
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateGameDetails = async () => {
    if (!currentGameId || isProcessing) return;
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/games/${currentGameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opponent: editOpponent,
          location: editLocation,
          score_them: editScoreThem,
          memo: editMemo,
          status: editStatus
        }),
      });
      if (response.ok) {
        alert('Saved!');
        fetchGamesList();
        fetchGameDetails(currentGameId);
      }
    } catch (e) { setError("Failed to update"); }
    finally { setIsProcessing(false); }
  };

  const handleNewGame = async () => {
    if (!confirm('New game?') || isProcessing) return;
    setIsProcessing(true);
    try {
      const gid = await createGame();
      if (gid) {
        if (players.length > 0) {
          setBattingOrder(players[0].batting_order);
          setSelectedPlayer(String(players[0].id));
        }
        setInning(1);
        setInningHalf('TOP');
        setOuts(0);
        setBases({ 1: false, 2: false, 3: false });
        setRbi(0);
        setRuns(0);
        setLastInsertedId(null);
        setLastSnapshot(null);
        setCurrentGameId(gid);
      }
    } catch (e) { setError("Failed to reset"); }
    finally { setIsProcessing(false); }
  };

  const handleAddPlayer = async () => {
    if (!newPlayerName || isProcessing) return;
    setIsProcessing(true);
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlayerName,
          uniform_number: newPlayerNumber,
          position: newPlayerPos,
          batting_order: newPlayerOrder
        }),
      });
      if (response.ok) {
        setNewPlayerName("");
        setNewPlayerNumber("");
        setNewPlayerPos("");
        setNewPlayerOrder("");
        fetchPlayers();
      }
    } catch (e) { setError("Player add failed"); }
    finally { setIsProcessing(false); }
  };

  const handleUpdatePlayer = async (id: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const resp = await fetch(`/api/players/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editPlayerName,
          uniform_number: editPlayerNumber,
          position: editPlayerPos,
          batting_order: editPlayerOrder
        }),
      });
      if (resp.ok) {
        setEditingPlayerId(null);
        fetchPlayers();
      }
    } catch (e) { setError("Update failed"); }
    finally { setIsProcessing(false); }
  };

  const handleDeactivatePlayer = async (id: number) => {
    if (!confirm('Deactivate?') || isProcessing) return;
    setIsProcessing(true);
    try {
      const resp = await fetch(`/api/players/${id}`, { method: 'DELETE' });
      if (resp.ok) fetchPlayers();
    } catch (e) { setError("Delete failed"); }
    finally { setIsProcessing(false); }
  };

  const handleStartEditPlayer = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditPlayerName(player.name);
    setEditPlayerNumber(String(player.uniform_number));
    setEditPlayerPos(player.position || "");
    setEditPlayerOrder(String(player.batting_order));
  };

  const handleExportCSV = () => {
    if (!currentGameId) return;
    window.location.href = `/api/export/stats?game_id=${currentGameId}`;
  };

  // --- Render ---

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-black tracking-widest text-xs uppercase animate-pulse">Initializing System...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans p-4 pb-20 max-w-md mx-auto relative overflow-x-hidden">
      {/* Network Processing Indicator */}
      {isProcessing && (
        <div className="fixed top-0 left-0 w-full h-1 bg-blue-600/20 z-50 overflow-hidden">
          <div className="h-full bg-blue-500 w-1/3 animate-[loading_1s_infinite_linear]"></div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-600 text-white p-3 rounded-xl shadow-2xl z-50 text-xs font-black flex justify-between items-center animate-bounce">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="opacity-50">✕</button>
        </div>
      )}

      <header className="py-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter leading-none">
            SCORE<span className="text-blue-500">PRO</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Baseball Intelligence</p>
        </div>
        <div className="text-right">
          <span className="block text-[8px] text-gray-600 font-black uppercase">Session</span>
          <span className="text-xs font-mono font-bold text-gray-400">ID-{String(currentGameId).padStart(4, '0')}</span>
        </div>
      </header>

      <Scoreboard scores={scoreboard} />

      <GameInfoForm 
        editOpponent={editOpponent} setEditOpponent={setEditOpponent}
        editLocation={editLocation} setEditLocation={setEditLocation}
        editScoreThem={editScoreThem} setEditScoreThem={setEditScoreThem}
        editStatus={editStatus} setEditStatus={setEditStatus}
        editMemo={editMemo} setEditMemo={setEditMemo}
        onSave={handleUpdateGameDetails}
        isProcessing={isProcessing}
      />

      <ScoreInputPanel 
        inning={inning}
        inningHalf={inningHalf}
        outs={outs}
        bases={bases}
        battingOrder={battingOrder}
        selectedPlayer={selectedPlayer}
        onPlayerChange={(pid) => {
          setSelectedPlayer(pid);
          const p = players.find(x => x.id === parseInt(pid));
          if (p) setBattingOrder(p.batting_order);
        }}
        players={players}
        rbi={rbi} setRbi={setRbi}
        runs={runs} setRuns={setRuns}
        onResultTap={handleResultTap}
        onUndo={handleUndo}
        lastInsertedId={lastInsertedId}
        isProcessing={isProcessing}
        resultOptions={RESULT_OPTIONS}
      />

      <PlayerStatsRanking 
        playerStats={playerStats}
        players={players}
        onExportCSV={handleExportCSV}
        isProcessing={isProcessing}
      />

      <AiComments comments={aiComments} />

      <RecentPlateAppearances recentHistory={recentHistory} players={players} />

      <GameList 
        games={gamesList}
        currentGameId={currentGameId}
        onSelectGame={setCurrentGameId}
        onNewGame={handleNewGame}
        isProcessing={isProcessing}
      />

      <PlayerManager 
        players={players}
        newPlayerName={newPlayerName} setNewPlayerName={setNewPlayerName}
        newPlayerNumber={newPlayerNumber} setNewPlayerNumber={setNewPlayerNumber}
        newPlayerPos={newPlayerPos} setNewPlayerPos={setNewPlayerPos}
        newPlayerOrder={newPlayerOrder} setNewPlayerOrder={setNewPlayerOrder}
        onAddPlayer={handleAddPlayer}
        onDeactivatePlayer={handleDeactivatePlayer}
        editingPlayerId={editingPlayerId} setEditingPlayerId={setEditingPlayerId}
        editPlayerName={editPlayerName} setEditPlayerName={setEditPlayerName}
        editPlayerNumber={editPlayerNumber} setEditPlayerNumber={setEditPlayerNumber}
        editPlayerPos={editPlayerPos} setEditPlayerPos={setEditPlayerPos}
        editPlayerOrder={editPlayerOrder} setEditPlayerOrder={setEditPlayerOrder}
        onStartEditPlayer={handleStartEditPlayer}
        onUpdatePlayer={handleUpdatePlayer}
        isProcessing={isProcessing}
      />

      <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
