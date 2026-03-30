<script setup lang="ts">
import type { GameSession } from '~/composables/useGame';
import confetti from 'canvas-confetti';
import { useGame } from '~/composables/useGame';

const {
  gamePhase,
  currentSession,
  currentIndex,
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
  loadSessions,
  goHome,
  confirmSongSelection,
  GAME_SIZE,
} = useGame();

const isTransitioning = ref(false);
const historyOpen = ref(false);
const sessions = ref<GameSession[]>([]);
const selectedSongIds = ref<number[]>([]);
const autoPicking = ref(false);
const selectionHint = ref('');
const { locale } = useI18n();

const availableSongIds = SONGS.map(song => song.id);
let autoPickTimer: ReturnType<typeof setTimeout> | null = null;

useSeoMeta({
  description: () => $t('meta.description'),
  ogDescription: () => $t('meta.description'),
});

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
  },
}));

function triggerConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
  });
}

function handleAnswer(lang: 'japanese' | 'chinese' | 'other') {
  const correct = submitAnswer(lang);
  if (correct)
    triggerConfetti();
}

function clearAutoPickTimer() {
  if (autoPickTimer) {
    clearTimeout(autoPickTimer);
    autoPickTimer = null;
  }
}

function randomPickSelection() {
  selectedSongIds.value = getRandomSongs(GAME_SIZE).map(song => song.id);
  selectionHint.value = '';
}

function beginSelectionStage() {
  clearAutoPickTimer();
  selectedSongIds.value = [];
  selectionHint.value = '';
  autoPicking.value = true;
  autoPickTimer = setTimeout(() => {
    randomPickSelection();
    autoPicking.value = false;
  }, 500);
}

function toggleSongSelection(songId: number) {
  if (autoPicking.value)
    return;

  const index = selectedSongIds.value.indexOf(songId);
  if (index >= 0) {
    selectedSongIds.value.splice(index, 1);
    selectionHint.value = '';
    return;
  }

  selectedSongIds.value.push(songId);
  selectionHint.value = '';
}

function repickSelection() {
  randomPickSelection();
}

function confirmSelection() {
  if (selectedSongIds.value.length < 1) {
    selectionHint.value = $t('selection.needAtLeastOne');
    return;
  }
  const confirmed = confirmSongSelection(selectedSongIds.value);
  if (!confirmed)
    selectionHint.value = $t('selection.confirmFailed');
}

async function handleNext() {
  isTransitioning.value = true;
  await new Promise(r => setTimeout(r, 120));
  nextSong();
  isTransitioning.value = false;
}

function openHistory() {
  sessions.value = loadSessions();
  historyOpen.value = true;
}

const progressPercent = computed(() =>
  totalSongs.value === 0 ? 0 : Math.round((answeredCount.value / totalSongs.value) * 100),
);

watch(
  () => gamePhase.value,
  (phase) => {
    if (phase === 'selecting') {
      beginSelectionStage();
      return;
    }
    clearAutoPickTimer();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearAutoPickTimer();
});
</script>

<template>
  <div class="min-h-screen bg-default font-sans">
    <Transition name="phase-swap" mode="out-in">
      <div :key="gamePhase">
        <!-- HOME SCREEN -->
        <div v-if="gamePhase === 'home'" class="min-h-screen flex flex-col items-center justify-center p-6">
          <div class="w-full max-w-md text-center">
            <!-- Logo area -->
            <div class="flex justify-center">
              <div class="flex items-center p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <UIcon name="i-lucide-music-2" class="size-12 text-primary" mode="svg" />
              </div>
            </div>

            <h1 class="text-4xl font-black tracking-tight text-balance mt-6">
              Which <span class="text-primary">Vocaloid</span>?
            </h1>
            <p class="text-muted mt-2 text-base leading-relaxed">
              {{ $t('home.subtitlePrefix', { count: GAME_SIZE }) }}
              <UTooltip :text="$t('home.vocaloidTooltip')">
                <!-- eslint-disable-next-line -->
                <ULink class="border-b-2 border-dashed" href="https://wikipedia.org/wiki/Vocaloid" target="_blank">Vocaloid</ULink>
                <UIcon name="i-lucide-asterisk" class="size-3 text-muted align-super" />
              </UTooltip>
              {{ $t('home.subtitleSuffix') }}
            </p>

            <div class="flex gap-2 mt-6">
              <UButton
                :label="$t('home.startGame')"
                icon="i-lucide-play"
                block
                @click="startNewGame"
              />
              <UButton
                :label="$t('home.history')"
                icon="i-lucide-history"
                variant="outline"
                color="neutral"
                block
                @click="openHistory"
              />
            </div>
          </div>
        </div>

        <!-- SELECT SCREEN -->
        <SelectionScreen
          v-else-if="gamePhase === 'selecting'"
          :game-size="GAME_SIZE"
          :selected-song-ids="selectedSongIds"
          :auto-picking="autoPicking"
          :selection-hint="selectionHint"
          :available-song-ids="availableSongIds"
          @toggle="toggleSongSelection"
          @repick="repickSelection"
          @confirm="confirmSelection"
          @home="goHome"
        />

        <PlayingScreen
          v-else-if="gamePhase === 'playing'"
          :answered-count="answeredCount"
          :total-songs="totalSongs"
          :current-score="currentScore"
          :progress-percent="progressPercent"
          :current-index="currentIndex"
          :has-answered-current="hasAnsweredCurrent"
          :current-record="currentRecord"
          :current-song="currentSong"
          :is-last-song="isLastSong"
          :is-transitioning="isTransitioning"
          @home="goHome"
          @answer="handleAnswer"
          @next="handleNext"
        />

        <!-- RESULT SCREEN -->
        <ResultScreen
          v-else
          :session="currentSession"
          @restart="startNewGame"
          @home="goHome"
        />
      </div>
    </Transition>

    <!-- History modal -->
    <UModal v-model:open="historyOpen" :title="$t('history.title')">
      <template #body>
        <div v-if="sessions.length === 0" class="py-10 text-center">
          <UIcon name="i-lucide-history" class="size-10 mx-auto mb-3 text-muted" />
          <p class="text-muted text-sm">
            {{ $t('history.empty') }}
          </p>
        </div>
        <div v-else class="space-y-2 max-h-96 overflow-y-auto pr-1">
          <div
            v-for="s in sessions"
            :key="s.id"
            class="flex items-center justify-between p-3 rounded-lg bg-elevated border border-muted"
          >
            <div>
              <p class="text-sm font-medium">
                {{ s.date }}
              </p>
              <p class="text-xs text-muted">
                {{ $t('history.songsCount', { count: s.songs.length }) }}
              </p>
            </div>
            <div class="text-right">
              <p
                class="text-xl font-black"
                :class="
                  s.score / s.songs.length >= 0.8 ? 'text-green-500'
                  : s.score / s.songs.length >= 0.5 ? 'text-yellow-500'
                    : 'text-red-500'
                "
              >
                {{ s.score }} / {{ s.songs.length }}
              </p>
              <p class="text-xs text-muted">
                {{ Math.round(s.score / s.songs.length * 100) }}%
              </p>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.phase-swap-enter-active,
.phase-swap-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.phase-swap-enter-from,
.phase-swap-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.99);
}
</style>
