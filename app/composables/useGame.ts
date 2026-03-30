export interface GameRecord {
  songId: number
  answer: string | null
  correct: boolean
  timestamp: number
}

export interface GameSession {
  id: string
  date: string
  songs: Song[]
  records: GameRecord[]
  score: number
  completed: boolean
}

const STORAGE_KEY = 'game-records';
const GAME_SIZE = 20;

function buildGameSession(songs: Song[], localeCode: string): GameSession {
  return {
    id: Date.now().toString(),
    date: new Date().toLocaleString(localeCode),
    songs,
    records: [],
    score: 0,
    completed: false,
  };
}

export function useGame() {
  const { locale } = useI18n();
  const currentSession = useState<GameSession | null>('game-session', () => null);
  const currentIndex = useState<number>('game-index', () => 0);
  const gamePhase = useState<'home' | 'selecting' | 'playing' | 'result'>('game-phase', () => 'home');

  function startNewGame() {
    currentSession.value = null;
    currentIndex.value = 0;
    gamePhase.value = 'selecting';
  }

  function confirmSongSelection(songIds: number[]) {
    if (songIds.length < 1)
      return false;

    const selectedSongs = songIds
      .map(id => SONGS.find(song => song.id === id))
      .filter((song): song is Song => !!song);

    if (selectedSongs.length < 1)
      return false;

    const session = buildGameSession(selectedSongs, locale.value);
    currentSession.value = session;
    currentIndex.value = 0;
    gamePhase.value = 'playing';
    return true;
  }

  function submitAnswer(answer: 'japanese' | 'chinese' | 'other') {
    if (!currentSession.value)
      return false;
    const song = currentSession.value.songs[currentIndex.value];
    if (!song)
      return false;
    const correct = song.language === answer;
    const record: GameRecord = {
      songId: song.id,
      answer,
      correct,
      timestamp: Date.now(),
    };
    currentSession.value.records.push(record);
    if (correct) {
      currentSession.value.score++;
    }
    return correct;
  }

  function nextSong() {
    if (!currentSession.value)
      return;
    if (currentIndex.value < currentSession.value.songs.length - 1) {
      currentIndex.value++;
    } else {
      finishGame();
    }
  }

  function finishGame() {
    if (!currentSession.value)
      return;
    currentSession.value.completed = true;
    saveSession(currentSession.value);
    gamePhase.value = 'result';
  }

  function saveSession(session: GameSession) {
    if (import.meta.client) {
      try {
        const existing = loadSessions();
        const updated = [session, ...existing].slice(0, 10);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  }

  function loadSessions(): GameSession[] {
    if (import.meta.client) {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  function goHome() {
    gamePhase.value = 'home';
    currentSession.value = null;
    currentIndex.value = 0;
  }

  const currentSong = computed(() => {
    if (!currentSession.value)
      return null;
    return currentSession.value.songs[currentIndex.value] ?? null;
  });

  const answeredCount = computed(() => currentSession.value?.records.length ?? 0);
  const totalSongs = computed(() => currentSession.value?.songs.length ?? GAME_SIZE);
  const currentScore = computed(() => currentSession.value?.score ?? 0);

  const isLastSong = computed(() => {
    if (!currentSession.value)
      return false;
    return currentIndex.value === currentSession.value.songs.length - 1;
  });

  const hasAnsweredCurrent = computed(() => {
    if (!currentSession.value)
      return false;
    return !!currentSession.value.records[currentIndex.value];
  });

  const currentRecord = computed(() => {
    if (!currentSession.value)
      return null;
    return currentSession.value.records[currentIndex.value] ?? null;
  });

  return {
    currentSession: readonly(currentSession),
    currentIndex: readonly(currentIndex),
    gamePhase,
    currentSong,
    answeredCount,
    totalSongs,
    currentScore,
    isLastSong,
    hasAnsweredCurrent,
    currentRecord,
    startNewGame,
    submitAnswer,
    nextSong,
    finishGame,
    loadSessions,
    goHome,
    confirmSongSelection,
    GAME_SIZE,
    LANGUAGE_LABELS,
  };
}
