"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Player, Game, PlateAppearance, PlayerStat, AiComment } from './types';
import { RESULT_OPTIONS } from './constants';
import { normalizeResponse } from './lib/normalize';
import type {
  ScoreboardResponse,
  TimelineResponse,
  StatsResponse,
  CommentsResponse,
  GamesResponse,
  PlayersResponse,
  Score,
  InningTimelineGroup,
} from './types';

import { Scoreboard } from './components/Scoreboard';
import { GameInfoForm } from './components/GameInfoForm';
import { ScoreInputPanel } from './components/ScoreInputPanel';
import { PlayerStatsRanking } from './components/PlayerStatsRanking';
import { AiComments } from './components/AiComments';
import { RecentPlateAppearances } from './components/RecentPlateAppearances';
import { GameList } from './components/GameList';
import { PlayerManager } from './components/PlayerManager';
import { GameTimeline } from './components/GameTimeline';
import { CareerStatsTable } from './components/CareerStatsTable';

export default function QuickScoreInput() {
  // --- States ---
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'breaking' | 'score' | 'stats' | 'players' | 'gameInfo'>('breaking');
  const [timelineData, setTimelineData] = useState<InningTimelineGroup[]>([]);

  const [inning, setInning] = useState(1);
  const [inningHalf, setInningHalf] = useState<'TOP' | 'BOTTOM'>('BOTTOM');
  const [outs, setOuts] = useState(0);
  const [bases, setBases] = useState<{ [key: number]: boolean }>({ 1: false, 2: false, 3: false });
  const [battingOrder, setBattingOrder] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [rbi, setRbi] = useState(0);
  const [runs, setRuns] = useState(0);

  const [players, setPlayers] = useState<Player[]>([]);
  const [gamePlayers, setGamePlayers] = useState<Player[]>([]);
  const [recentHistory, setRecentHistory] = useState<PlateAppearance[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [scoreboard, setScoreboard] = useState<{ inning: number, runs: number }[]>([]);
  const [opponentScoreboard, setOpponentScoreboard] = useState<{ inning: number, runs: number }[]>([]);
  const [gamesList, setGamesList] = useState<Game[]>([]);
  const [aiComments, setAiComments] = useState<AiComment[]>([]);

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
  const [newGameLineup, setNewGameLineup] = useState<Record<number, string>>({});
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [newGameStep, setNewGameStep] = useState<1 | 2 | 3>(1);
  const [newGameBattingSide, setNewGameBattingSide] = useState<'TOP' | 'BOTTOM'>('TOP');

  const [opponentRunsInput, setOpponentRunsInput] = useState(0);
  const [opponentHitsInput, setOpponentHitsInput] = useState(0);
  const [opponentWalksInput, setOpponentWalksInput] = useState(0);
  const [opponentHbpInput, setOpponentHbpInput] = useState(0);
  const [opponentErrorsInput, setOpponentErrorsInput] = useState(0);
  const [opponentNoteInput, setOpponentNoteInput] = useState('');

  // --- Fetching Functions ---

  const fetchGamesList = async () => {
    try {
      const resp = await fetch('/api/games');
      const json = (await resp.json()) as GamesResponse;
      if (!json.success) throw new Error(typeof json.error === 'string' ? json.error : 'Failed');
      const dataGames = normalizeResponse<Game>(json, ['data', 'games']);
      const rootGames = normalizeResponse<Game>(json, ['games']);
      const games = dataGames.length > 0 ? dataGames : rootGames;
      setGamesList(games);
    } catch (e) {
      setError('ゲーム一覧の取得に失敗しました');
      setGamesList([]);
    }
  };

  const fetchPlayers = useCallback(async () => {
    try {
      const resp = await fetch('/api/players');
      const json = (await resp.json()) as PlayersResponse;
      if (!json.success) throw new Error(typeof json.error === 'string' ? json.error : 'Failed');
      const players = normalizeResponse<Player>(json, ['players']);
      setPlayers(players);
      if (players.length > 0 && !selectedPlayer) {
        setSelectedPlayer(String(players[0].id));
        setBattingOrder(players[0].batting_order);
      }
    } catch (e) {
      setError('選手一覧の取得に失敗しました');
      setPlayers([]);
    }
  }, [selectedPlayer]);

  const fetchGameDetails = async (gid: number) => {
    try {
      const resp = await fetch(`/api/games/${gid}`);
      const json = await resp.json();
      // Some APIs return the game directly without wrapper
      const game: Game = json.success ? json.game : json;
      if (!game) throw new Error('Invalid game data');
      setGameDetails(game);
      setEditOpponent(game.opponent || "練習試合");
      setEditLocation(game.location || "");
      setEditMemo(game.memo || "");
      setEditStatus(game.status || "in_progress");
    } catch (e) {
      setError('試合情報の取得に失敗しました');
      setGameDetails(null);
    }
  };

  const fetchRecentHistory = async (gid: number) => {
    try {
      const resp = await fetch(`/api/plate-appearances/recent?game_id=${gid}`);
      const json = await resp.json();
      const dataHistory = normalizeResponse<PlateAppearance>(json, ['data', 'history']);
      const rootHistory = normalizeResponse<PlateAppearance>(json, ['history']);
      const history = dataHistory.length > 0 ? dataHistory : rootHistory;
      setRecentHistory(history);
    } catch (e) {
      setError('直近履歴の取得に失敗しました');
      setRecentHistory([]);
    }
  };

  const fetchPlayerStats = async (gid: number) => {
    try {
      const resp = await fetch(`/api/stats/players?game_id=${gid}`);
      const json = (await resp.json()) as StatsResponse;
      if (!json.success) throw new Error(typeof json.error === 'string' ? json.error : 'Failed');
      const stats = normalizeResponse<PlayerStat>(json, ['data', 'stats']);
      setPlayerStats(stats);
    } catch (e) {
      setError('選手成績の取得に失敗しました');
      setPlayerStats([]);
    }
  };

  const fetchScoreboard = async (gid: number) => {
    try {
      const resp = await fetch(`/api/scoreboard?game_id=${gid}&t=${Date.now()}`, { cache: 'no-store' });
      const json = (await resp.json()) as ScoreboardResponse;
      if (!json.success) throw new Error(typeof json.error === 'string' ? json.error : 'Failed');
      // Handle both possible shapes. normalizeResponse returns [] on failure, and [] is truthy.
      const dataUs = normalizeResponse<Score>(json, ['data', 'us']);
      const scoresUs = normalizeResponse<Score>(json, ['scores', 'us']);
      const dataThem = normalizeResponse<Score>(json, ['data', 'them']);
      const scoresThem = normalizeResponse<Score>(json, ['scores', 'them']);

      const us = dataUs.length > 0 ? dataUs : scoresUs;
      const them = dataThem.length > 0 ? dataThem : scoresThem;

      setScoreboard(us);
      setOpponentScoreboard(them);
    } catch (e) {
      setError('スコアボードの取得に失敗しました');
      setScoreboard([]);
      setOpponentScoreboard([]);
    }
  };

  const fetchAIComments = async (gid: number) => {
    try {
      const resp = await fetch(`/api/ai/comments?game_id=${gid}`);
      const json = (await resp.json()) as CommentsResponse;
      if (!json.success) throw new Error(typeof json.error === 'string' ? json.error : 'Failed');
      const comments = normalizeResponse<AiComment>(json, ['data', 'comments']);
      setAiComments(comments);
    } catch (e) {
      setError('AIコメントの取得に失敗しました');
      setAiComments([]);
    }
  };

  const fetchTimeline = async (gid: number) => {
    try {
      const resp = await fetch(`/api/game/timeline?game_id=${gid}`);
      const json = (await resp.json()) as TimelineResponse;
      if (!json.success) throw new Error(typeof json.error === 'string' ? json.error : 'Failed');
      const timeline = normalizeResponse<InningTimelineGroup>(json, ['data', 'timeline']) || normalizeResponse<InningTimelineGroup>(json, ['timeline']);
      setTimelineData(timeline);
    } catch (e) {
      setError('試合経過の取得に失敗しました');
      setTimelineData([]);
    }
  };

  const createGame = async () => {
    try {
      const resp = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opponent: editOpponent || '練習試合',
          status: 'in_progress',
          batting_side: newGameBattingSide,
        }),
      });

      const data = await resp.json();
      if (data.success) return data.id;
    } catch (e) {
      setError('Failed to create game');
    }

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
      fetchTimeline(currentGameId);
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

    // 自動計算: 進塁ロジックより先にランナー状態から得点/打点を算出
    const safeBases = bases && typeof bases === 'object' ? bases : { 1: false, 2: false, 3: false };
    let autoRuns = 0;
    let autoRbi = 0;
    if (option.detail === 'SINGLE') {
      if (safeBases[3]) { autoRuns += 1; autoRbi += 1; }
    } else if (option.detail === 'DOUBLE') {
      if (safeBases[2]) { autoRuns += 1; autoRbi += 1; }
      if (safeBases[3]) { autoRuns += 1; autoRbi += 1; }
    } else if (option.detail === 'TRIPLE') {
      if (safeBases[1]) { autoRuns += 1; autoRbi += 1; }
      if (safeBases[2]) { autoRuns += 1; autoRbi += 1; }
      if (safeBases[3]) { autoRuns += 1; autoRbi += 1; }
    } else if (option.detail === 'HOME_RUN') {
      autoRuns = 1; // 打者自身
      if (safeBases[1]) autoRuns += 1;
      if (safeBases[2]) autoRuns += 1;
      if (safeBases[3]) autoRuns += 1;
      autoRbi = autoRuns;
    } else if (option.category === 'WALK' || option.detail === 'HIT_BY_PITCH') {
      if (safeBases[1] && safeBases[2] && safeBases[3]) {
        autoRuns += 1; autoRbi += 1; // 満塁押し出し
      }
    }
    const finalRbi = rbi > 0 ? rbi : autoRbi;
    const finalRuns = runs > 0 ? runs : autoRuns;

    const payload = {
      game_id: currentGameId,
      player_id: parseInt(selectedPlayer),
      inning,
      result_category: option.category,
      result_detail: option.detail,
      rbi: finalRbi,
      runs: finalRuns,
      stolen_bases: 0,
      inning_half: inningHalf,
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
        const activePlayers = gamePlayers.length > 0 ? gamePlayers : players;
        const currentIndex = activePlayers.findIndex(p => p.id === parseInt(selectedPlayer));
        if (currentIndex !== -1 && activePlayers.length > 0) {
          const nextIndex = (currentIndex + 1) % activePlayers.length;
          const nextPlayer = activePlayers[nextIndex];
          setBattingOrder(nextPlayer.batting_order);
          setSelectedPlayer(String(nextPlayer.id));
        }

        let nextOuts = outs;
        let nextBases = { ...bases };
        let nextInningHalf = inningHalf;
        let nextInning = inning;

        const addOut = (count: number = 1) => {
          nextOuts += count;
          if (nextOuts >= 3) {
            nextOuts = 0;
            nextBases = { 1: false, 2: false, 3: false };
            if (nextInningHalf === 'BOTTOM') {
              nextInning += 1;
              nextInningHalf = 'TOP';
            } else {
              nextInningHalf = 'BOTTOM';
            }
          }
        };

        // 防御: bases が不正な場合の初期化
        if (!nextBases || typeof nextBases !== 'object') {
          nextBases = { 1: false, 2: false, 3: false };
        }

        if (
          option.category === 'OUT' ||
          option.category === 'SACRIFICE' ||
          option.detail === 'STRIKEOUT' ||
          option.detail === 'SAC_BUNT' ||
          option.detail === 'SAC_FLY'
        ) {
          addOut(option.detail === 'DOUBLE_PLAY' ? 2 : 1);
        } else if (option.detail === 'SINGLE') {
          // 単打: 全走者1つ進塁、三塁走者は生還
          nextBases = {
            1: true,
            2: Boolean(nextBases[1]),
            3: Boolean(nextBases[2]),
          };
        } else if (option.detail === 'DOUBLE') {
          // 二塁打: 全走者2つ進塁、二塁・三塁走者は生還
          nextBases = {
            1: false,
            2: true,
            3: Boolean(nextBases[1]),
          };
        } else if (option.detail === 'TRIPLE') {
          // 三塁打: 全走者生還、打者は三塁
          nextBases = { 1: false, 2: false, 3: true };
        } else if (option.detail === 'HOME_RUN') {
          // 本塁打: 全走者と打者が生還、塁は空
          nextBases = { 1: false, 2: false, 3: false };
        } else if (option.category === 'WALK' || option.detail === 'HIT_BY_PITCH') {
          // 四死球: 強制進塁のみ
          const wasFirst = Boolean(nextBases[1]);
          const wasSecond = Boolean(nextBases[2]);
          const wasThird = Boolean(nextBases[3]);

          nextBases = {
            1: true,
            2: wasFirst ? true : wasSecond,
            3: wasFirst && wasSecond ? true : wasThird,
          };
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
          fetchAIComments(currentGameId),
          fetchTimeline(currentGameId)
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
          fetchAIComments(currentGameId),
          fetchTimeline(currentGameId)
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
          memo: editMemo,
          status: editStatus,
          batting_side: gameDetails?.batting_side || 'TOP'
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

  const validateNewGameLineup = () => {
    const selectedPlayerIds = Object.values(newGameLineup).filter((playerId) => playerId);
    const uniquePlayerIds = new Set(selectedPlayerIds);

    if (selectedPlayerIds.length !== uniquePlayerIds.size) {
      setError('打順内で同じ選手が重複しています。重複しないように選択してください。');
      return false;
    }

    return true;
  };

  const saveNewGameLineup = async () => {
    const entries = Object.entries(newGameLineup)
      .map(([order, playerId]) => ({
        batting_order: Number(order),
        player_id: Number(playerId),
      }))
      .filter((entry) => entry.player_id > 0)
      .sort((a, b) => a.batting_order - b.batting_order);

    const usedPlayerIds = new Set<number>();

    for (const entry of entries) {
      if (usedPlayerIds.has(entry.player_id)) continue;
      usedPlayerIds.add(entry.player_id);

      const player = players.find((p) => p.id === entry.player_id);
      if (!player) continue;

      await fetch(`/api/players/${entry.player_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: player.name,
          uniform_number: player.uniform_number,
          position: player.position,
          batting_order: entry.batting_order,
          is_active: true,
        }),
      });
    }
  };

  const resetOpponentInput = () => {
    setOpponentRunsInput(0);
    setOpponentHitsInput(0);
    setOpponentWalksInput(0);
    setOpponentHbpInput(0);
    setOpponentErrorsInput(0);
    setOpponentNoteInput('');
  };

  const handleSaveOpponentHalf = async () => {
    if (!currentGameId || isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/inning-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: currentGameId,
          inning,
          team_side: 'them',
          runs: opponentRunsInput,
          hits_allowed: opponentHitsInput,
          walks_allowed: opponentWalksInput,
          hit_by_pitch_allowed: opponentHbpInput,
          errors_committed: opponentErrorsInput,
          note: opponentNoteInput,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save opponent inning');
      }

      const ourSide = gameDetails?.batting_side || 'TOP';

      if (ourSide === 'TOP') {
        // 自チームが先攻: 相手の裏攻撃保存後、次回表へ
        setInning(inning + 1);
        setInningHalf('TOP');
      } else {
        // 自チームが後攻: 相手の表攻撃保存後、同回裏へ
        setInningHalf('BOTTOM');
      }

      resetOpponentInput();

      await Promise.all([
        fetchScoreboard(currentGameId),
        fetchTimeline(currentGameId),
        fetchGamesList(),
      ]);
    } catch (e) {
      setError('相手攻撃の記録に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewGame = async () => {
    if (!confirm('New game?') || isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
      await saveNewGameLineup();

      // 打順更新後のplayersを再取得
      const playersResp = await fetch('/api/players', { cache: 'no-store' });
      const playersJson = await playersResp.json();
      const latestPlayers = playersJson.success && Array.isArray(playersJson.players)
        ? playersJson.players
        : [];

      setPlayers(latestPlayers);

      const selectedLineup = Object.entries(newGameLineup)
        .map(([order, playerId]) => ({
          batting_order: Number(order),
          player_id: Number(playerId),
        }))
        .filter((entry) => entry.player_id > 0)
        .sort((a, b) => a.batting_order - b.batting_order)
        .map((entry) => {
          const player = latestPlayers.find((p: Player) => p.id === entry.player_id);
          return player ? { ...player, batting_order: entry.batting_order } : null;
        })
        .filter(Boolean) as Player[];

      const orderedPlayers = selectedLineup.length > 0
        ? selectedLineup
        : [...latestPlayers]
            .filter((p) => p && p.batting_order)
            .sort((a, b) => (a.batting_order || 999) - (b.batting_order || 999));

      setGamePlayers(orderedPlayers);

      const gid = await createGame();

      if (gid) {
        setCurrentGameId(gid);

        if (orderedPlayers.length > 0) {
          setBattingOrder(orderedPlayers[0].batting_order || 1);
          setSelectedPlayer(String(orderedPlayers[0].id));
        } else {
          setBattingOrder(1);
          setSelectedPlayer('');
        }

        setInning(1);
        setInningHalf('TOP');
        setOuts(0);
        setBases({ 1: false, 2: false, 3: false });
        setRbi(0);
        setRuns(0);
        setLastInsertedId(null);
        setLastSnapshot(null);
        setRecentHistory([]);
        setScoreboard([]);
        setOpponentScoreboard([]);
        setTimelineData([]);
        setPlayerStats([]);
        setAiComments([]);

        await Promise.all([
          fetchGamesList(),
          fetchGameDetails(gid),
          fetchScoreboard(gid),
          fetchRecentHistory(gid),
          fetchPlayerStats(gid),
          fetchTimeline(gid),
          fetchAIComments(gid),
        ]);

        setIsCreatingGame(false);
        setNewGameStep(1);
      }
    } catch (e) {
      setError("Failed to reset");
    } finally {
      setIsProcessing(false);
    }
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

  const ourBattingSide = gameDetails?.batting_side || 'TOP';
  const isOurBatting = inningHalf === ourBattingSide;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-black tracking-widest text-xs uppercase animate-pulse">Initializing System...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans p-4 pb-28 max-w-md mx-auto relative overflow-x-hidden">
      {/* Network Processing Indicator */}
      {isProcessing && (
        <div className="fixed top-0 left-0 w-full h-1 bg-blue-600/20 z-50 overflow-hidden">
          <div className="h-full bg-blue-500 w-1/3 animate-[loading_1s_infinite_linear]"></div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-20 left-4 right-4 bg-red-600 text-white p-3 rounded-xl shadow-2xl z-50 text-xs font-black flex justify-between items-center animate-bounce">
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

      {/* Mini Game Status Board */}
      {gameDetails && (
        <div className="bg-blue-950/20 border border-blue-900/40 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-lg">
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">VS {gameDetails.opponent || "対戦相手なし"}</span>
            <span className="text-[10px] text-gray-500 font-semibold mt-0.5">🏟️ {gameDetails.location || "球場未設定"}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[8px] block text-gray-600 font-black tracking-widest uppercase">SCORE</span>
              <span className="text-xl font-mono font-black italic text-gray-200">
                {(Array.isArray(scoreboard) ? scoreboard.reduce((acc, curr) => acc + curr.runs, 0) : 0)} - {(Array.isArray(opponentScoreboard) ? opponentScoreboard.reduce((acc, curr) => acc + curr.runs, 0) : 0)}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
              gameDetails.status === 'completed' 
                ? 'border-gray-800 text-gray-600 bg-gray-900/50' 
                : 'border-green-500/30 text-green-400 bg-green-500/10 animate-pulse'
            }`}>
              {gameDetails.status === 'completed' ? 'FIN' : 'Live'}
            </span>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="space-y-6">
        {activeTab === 'breaking' && (
          <div className="space-y-6">
            <Scoreboard
              scores={scoreboard}
              opponentScores={opponentScoreboard}
              battingSide={gameDetails?.batting_side || 'TOP'}
            />

            {isOurBatting ? (
              <>
                <ScoreInputPanel
                  inning={inning}
                  inningHalf={inningHalf}
                  outs={outs}
                  bases={bases}
                  battingOrder={battingOrder}
                  selectedPlayer={selectedPlayer}
                  onPlayerChange={(pid) => {
                    setSelectedPlayer(pid);
                    const activePlayers = gamePlayers.length > 0 ? gamePlayers : players;
                    const p = activePlayers.find(x => x.id === parseInt(pid));
                    if (p) setBattingOrder(p.batting_order);
                  }}
                  players={gamePlayers.length > 0 ? gamePlayers : players}
                  rbi={rbi} setRbi={setRbi}
                  runs={runs} setRuns={setRuns}
                  onResultTap={handleResultTap}
                  onUndo={handleUndo}
                  lastInsertedId={lastInsertedId}
                  isProcessing={isProcessing}
                  resultOptions={RESULT_OPTIONS}
                />
                <RecentPlateAppearances
                  recentHistory={recentHistory}
                  players={gamePlayers.length > 0 ? gamePlayers : players}
                  title="直近の入力履歴"
                />
              </>
            ) : (
              <div className="bg-gray-900/70 border border-red-500/20 rounded-3xl p-5 shadow-2xl space-y-5">
                <div>
                  <div className="text-[10px] text-red-400 font-black uppercase tracking-[0.25em] mb-2">
                    相手攻撃入力
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    {inning}回{inningHalf === 'TOP' ? '表' : '裏'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    相手攻撃は打者ごとではなく、このイニングの守備結果だけを入力します。
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['失点', opponentRunsInput, setOpponentRunsInput],
                    ['被安打', opponentHitsInput, setOpponentHitsInput],
                    ['四球', opponentWalksInput, setOpponentWalksInput],
                    ['死球', opponentHbpInput, setOpponentHbpInput],
                    ['エラー', opponentErrorsInput, setOpponentErrorsInput],
                  ].map(([label, value, setter]) => (
                    <div key={String(label)} className="bg-gray-950/60 border border-gray-800 rounded-2xl p-3 text-center">
                      <div className="text-[10px] text-gray-500 font-black mb-2">{String(label)}</div>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => (setter as React.Dispatch<React.SetStateAction<number>>)(Math.max(0, Number(value) - 1))}
                          disabled={isProcessing}
                          className="w-9 h-9 rounded-full bg-gray-800 text-white font-black disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="text-2xl font-black text-red-300 w-8">{Number(value)}</span>
                        <button
                          type="button"
                          onClick={() => (setter as React.Dispatch<React.SetStateAction<number>>)(Number(value) + 1)}
                          disabled={isProcessing}
                          className="w-9 h-9 rounded-full bg-gray-800 text-white font-black disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-black mb-2">メモ</label>
                  <textarea
                    value={opponentNoteInput}
                    onChange={(e) => setOpponentNoteInput(e.target.value)}
                    disabled={isProcessing}
                    rows={3}
                    className="w-full bg-gray-950/60 border border-gray-800 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-red-500 disabled:opacity-50"
                    placeholder="例：四球から失点、エラー絡みなど"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveOpponentHalf}
                  disabled={isProcessing}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl active:scale-[0.98] disabled:opacity-50"
                >
                  相手攻撃を保存して次へ
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'score' && (
          <div className="space-y-6">
            <Scoreboard scores={scoreboard} opponentScores={opponentScoreboard} battingSide={gameDetails?.batting_side || 'TOP'} />
            <GameTimeline timeline={timelineData} />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <CareerStatsTable />

            {/* Quick CSV Export Panel */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 flex flex-col items-center justify-between shadow-lg">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">CSVデータエクスポート</span>
              <button 
                onClick={handleExportCSV}
                disabled={isProcessing || playerStats.length === 0}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center space-x-2 text-xs"
              >
                <span>📥 個人成績CSVダウンロード</span>
              </button>
            </div>
            
            <PlayerStatsRanking 
              playerStats={playerStats}
              players={players}
              onExportCSV={handleExportCSV}
              isProcessing={isProcessing}
            />
            <AiComments comments={aiComments} />
          </div>
        )}

        {activeTab === 'players' && (
          <div className="space-y-6">
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
          </div>
        )}

        {activeTab === 'gameInfo' && (
          <div className="space-y-6">
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-sm font-black text-gray-100">新規試合作成</h2>
                  <p className="text-[11px] text-gray-500 mt-1">
                    新規作成 → 打順選択 → 試合情報入力 の順で作成します。
                  </p>
                </div>

                {!isCreatingGame && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingGame(true);
                      setNewGameStep(1);
                    }}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-4 py-3 rounded-xl active:scale-[0.98] disabled:opacity-50"
                  >
                    新規作成
                  </button>
                )}
              </div>

              {isCreatingGame && (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`rounded-xl py-2 border ${
                          newGameStep === step
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                            : 'bg-gray-950/40 border-gray-800 text-gray-600'
                        }`}
                      >
                        {step === 1 ? '1 新規作成' : step === 2 ? '2 打順選択' : '3 試合情報'}
                      </div>
                    ))}
                  </div>

                  {newGameStep === 1 && (
                    <div className="space-y-4">
                      <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-4">
                        <h3 className="text-sm font-black text-white mb-2">新しい試合を開始します</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          次のステップで打順を選び、その後に対戦相手・球場などを入力します。
                          既存の試合データは削除されません。
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingGame(false);
                            setNewGameStep(1);
                          }}
                          disabled={isProcessing}
                          className="flex-1 bg-gray-800 text-gray-300 text-xs font-bold py-3 rounded-xl disabled:opacity-50"
                        >
                          キャンセル
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewGameStep(2)}
                          disabled={isProcessing}
                          className="flex-1 bg-blue-600 text-white text-xs font-black py-3 rounded-xl disabled:opacity-50"
                        >
                          打順選択へ
                        </button>
                      </div>
                    </div>
                  )}

                  {newGameStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-black text-gray-100">打順選択</h3>
                        <p className="text-[11px] text-gray-500 mt-1">
                          1番〜11番まで設定できます。空白の打順はスキップされます。
                        </p>
                      </div>

                      <div className="space-y-2">
                        {Array.from({ length: 11 }, (_, index) => {
                          const order = index + 1;
                          return (
                            <div key={order} className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-sm font-black text-blue-400">
                                {order}
                              </div>
                              <select
                                value={newGameLineup[order] || ''}
                                onChange={(e) => setNewGameLineup((prev) => ({ ...prev, [order]: e.target.value }))}
                                disabled={isProcessing}
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                              >
                                <option value="">スキップ</option>
                                {players.map((player) => {
                                  const selectedElsewhere = Object.entries(newGameLineup).some(
                                    ([selectedOrder, selectedPlayerId]) =>
                                      Number(selectedOrder) !== order && String(selectedPlayerId) === String(player.id)
                                  );

                                  return (
                                    <option key={player.id} value={player.id} disabled={selectedElsewhere}>
                                      #{player.uniform_number} {player.name} ({player.position}){selectedElsewhere ? ' - 選択済み' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setNewGameStep(1)}
                          disabled={isProcessing}
                          className="flex-1 bg-gray-800 text-gray-300 text-xs font-bold py-3 rounded-xl disabled:opacity-50"
                        >
                          戻る
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setError(null);
                            if (!validateNewGameLineup()) return;
                            setNewGameStep(3);
                          }}
                          disabled={isProcessing}
                          className="flex-1 bg-blue-600 text-white text-xs font-black py-3 rounded-xl disabled:opacity-50"
                        >
                          試合情報へ
                        </button>
                      </div>
                    </div>
                  )}

                  {newGameStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-black text-gray-100">試合情報入力</h3>
                        <p className="text-[11px] text-gray-500 mt-1">対戦相手・球場などを入力して試合を開始します。</p>
                      </div>

                      <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-4">
                        <h4 className="text-xs font-black text-gray-300 mb-3">先攻/後攻</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setNewGameBattingSide('TOP')}
                            className={`py-3 rounded-xl text-xs font-black border ${
                              newGameBattingSide === 'TOP'
                                ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                : 'bg-gray-900 border-gray-800 text-gray-500'
                            }`}
                          >
                            先攻（表）
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewGameBattingSide('BOTTOM')}
                            className={`py-3 rounded-xl text-xs font-black border ${
                              newGameBattingSide === 'BOTTOM'
                                ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                : 'bg-gray-900 border-gray-800 text-gray-500'
                            }`}
                          >
                            後攻（裏）
                          </button>
                        </div>
                      </div>

                      <GameInfoForm
                        editOpponent={editOpponent} setEditOpponent={setEditOpponent}
                        editLocation={editLocation} setEditLocation={setEditLocation}
                        editScoreThem={editScoreThem} setEditScoreThem={setEditScoreThem}
                        editStatus={editStatus} setEditStatus={setEditStatus}
                        editMemo={editMemo} setEditMemo={setEditMemo}
                        onSave={handleUpdateGameDetails}
                        isProcessing={isProcessing}
                      />

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setNewGameStep(2)}
                          disabled={isProcessing}
                          className="flex-1 bg-gray-800 text-gray-300 text-xs font-bold py-3 rounded-xl disabled:opacity-50"
                        >
                          戻る
                        </button>
                        <button
                          type="button"
                          onClick={handleNewGame}
                          disabled={isProcessing}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-black py-3 rounded-xl active:scale-[0.98] disabled:opacity-50"
                        >
                          この内容で試合開始
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isCreatingGame && (
              <GameInfoForm
                editOpponent={editOpponent} setEditOpponent={setEditOpponent}
                editLocation={editLocation} setEditLocation={setEditLocation}
                editScoreThem={editScoreThem} setEditScoreThem={setEditScoreThem}
                editStatus={editStatus} setEditStatus={setEditStatus}
                editMemo={editMemo} setEditMemo={setEditMemo}
                onSave={handleUpdateGameDetails}
                isProcessing={isProcessing}
              />
            )}

            <GameList
              games={gamesList}
              currentGameId={currentGameId}
              onSelectGame={setCurrentGameId}
              onNewGame={() => {
                setIsCreatingGame(true);
                setNewGameStep(1);
              }}
              isProcessing={isProcessing}
            />
          </div>
        )}

      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-gray-950/90 backdrop-blur-md border-t border-gray-900/80 flex justify-around py-3 px-2 pb-5 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.7)]">
        {[
          { id: 'breaking', label: '速報', icon: (active: boolean) => (
            <svg className={`w-5 h-5 ${active ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )},
          { id: 'score', label: 'スコア', icon: (active: boolean) => (
            <svg className={`w-5 h-5 ${active ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )},
          { id: 'stats', label: '成績', icon: (active: boolean) => (
            <svg className={`w-5 h-5 ${active ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h2m10 4a2 2 0 100-4h-2M7 12v9m10-9v9" />
            </svg>
          )},
          { id: 'players', label: '選手', icon: (active: boolean) => (
            <svg className={`w-5 h-5 ${active ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )},
          { id: 'gameInfo', label: '試合情報', icon: (active: boolean) => (
            <svg className={`w-5 h-5 ${active ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )},
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex flex-col items-center justify-center flex-1 py-1 text-center transition-all duration-200"
            >
              <div className={`p-1.5 mb-1 rounded-xl transition-colors duration-200 ${active ? 'bg-blue-500/10' : 'active:bg-gray-900/50'}`}>
                {tab.icon(active)}
              </div>
              <span className={`text-[9px] font-black tracking-widest transition-colors duration-200 ${active ? 'text-blue-400' : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
