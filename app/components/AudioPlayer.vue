<script setup lang="ts">
interface Props {
  songId: number
  chorusStart: number
  chorusEnd: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isFullSong = ref(false);
const isDragging = ref(false);
const progressBarRef = ref<HTMLDivElement | null>(null);
const isLoading = ref(false);
const hasError = ref(false);

const audioSrc = computed(() => `/songs/${props.songId}.mp3`);

const displayDuration = computed(() =>
  isFullSong.value ? duration.value : props.chorusEnd - props.chorusStart,
);

const displayCurrentTime = computed(() =>
  isFullSong.value ? currentTime.value : Math.max(0, currentTime.value - props.chorusStart),
);

const progress = computed(() =>
  displayDuration.value === 0 ? 0 : (displayCurrentTime.value / displayDuration.value) * 100,
);

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function togglePlay() {
  if (!audioRef.value || props.disabled)
    return;
  if (isPlaying.value) {
    audioRef.value.pause();
    isPlaying.value = false;
  } else {
    try {
      if (!isFullSong.value) {
        if (currentTime.value < props.chorusStart || currentTime.value >= props.chorusEnd) {
          audioRef.value.currentTime = props.chorusStart;
        }
      }
      await audioRef.value.play();
      isPlaying.value = true;
    } catch {
      hasError.value = true;
    }
  }
}

function onTimeUpdate() {
  if (!audioRef.value || isDragging.value)
    return;
  currentTime.value = audioRef.value.currentTime;
  if (!isFullSong.value && currentTime.value >= props.chorusEnd) {
    audioRef.value.pause();
    isPlaying.value = false;
    audioRef.value.currentTime = props.chorusStart;
    currentTime.value = props.chorusStart;
  }
}

function onLoadedMetadata() {
  if (!audioRef.value)
    return;
  duration.value = audioRef.value.duration;
  isLoading.value = false;
  if (!isFullSong.value) {
    audioRef.value.currentTime = props.chorusStart;
    currentTime.value = props.chorusStart;
  }
}

function onCanPlay() {
  isLoading.value = false;
}
function onWaiting() {
  isLoading.value = true;
}
function onError() {
  hasError.value = true;
  isLoading.value = false;
}

function toggleFullSong() {
  isFullSong.value = !isFullSong.value;
  if (!audioRef.value)
    return;
  if (!isFullSong.value) {
    audioRef.value.currentTime = props.chorusStart;
    currentTime.value = props.chorusStart;
  } else {
    audioRef.value.currentTime = 0;
    currentTime.value = 0;
  }
  if (isPlaying.value)
    audioRef.value.play().catch(() => {});
}

function seekToPosition(clientX: number) {
  if (!progressBarRef.value || !audioRef.value)
    return;
  const rect = progressBarRef.value.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const newTime = isFullSong.value
    ? ratio * duration.value
    : props.chorusStart + ratio * (props.chorusEnd - props.chorusStart);
  audioRef.value.currentTime = newTime;
  currentTime.value = newTime;
}

function onProgressMouseDown(e: MouseEvent) {
  isDragging.value = true;
  seekToPosition(e.clientX);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e: MouseEvent) {
  if (isDragging.value)
    seekToPosition(e.clientX);
}

function onMouseUp() {
  isDragging.value = false;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
}

function onTouchStart(e: TouchEvent) {
  isDragging.value = true;
  seekToPosition(e.touches[0].clientX);
}

function onTouchMove(e: TouchEvent) {
  if (isDragging.value)
    seekToPosition(e.touches[0].clientX);
}

function onTouchEnd() {
  isDragging.value = false;
}

onUnmounted(() => {
  audioRef.value?.pause();
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
});

watch(() => props.songId, () => {
  isPlaying.value = false;
  currentTime.value = 0;
  duration.value = 0;
  isFullSong.value = false;
  hasError.value = false;
  isLoading.value = false;
});
</script>

<template>
  <div class="rounded-xl border border-accented bg-elevated p-4 select-none">
    <audio
      ref="audioRef"
      :src="audioSrc"
      preload="metadata"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @canplay="onCanPlay"
      @waiting="onWaiting"
      @error="onError"
    />

    <!-- Visualizer / icon -->
    <div class="flex items-end justify-center gap-1 mb-4 h-10">
      <template v-if="isPlaying && !hasError">
        <div
          v-for="i in 5"
          :key="i"
          class="sound-bar w-2 rounded-full bg-primary"
          :style="{ height: '100%', animationDelay: `${(i - 1) * 0.1}s` }"
        />
      </template>
      <template v-else>
        <UIcon name="i-lucide-music" class="size-8 text-muted" />
      </template>
    </div>

    <!-- Progress bar -->
    <div
      ref="progressBarRef"
      class="relative h-2 rounded-full bg-accented cursor-pointer mb-2 group"
      @mousedown="onProgressMouseDown"
      @touchstart.prevent="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div
        class="absolute left-0 top-0 h-full rounded-full bg-primary transition-[width] duration-75"
        :style="{ width: `${progress}%` }"
      />
      <div
        class="absolute top-1/2 -translate-y-1/2 size-4 rounded-full bg-white shadow-md border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity"
        :style="{ left: `calc(${progress}% - 8px)` }"
      />
    </div>

    <!-- Time display -->
    <div class="flex justify-between text-xs text-muted mb-4">
      <span>{{ formatTime(displayCurrentTime) }}</span>
      <span>{{ formatTime(displayDuration) }}</span>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-3">
      <UButton
        :icon="isLoading ? 'i-lucide-loader-circle' : isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
        size="lg"
        :loading="isLoading"
        :disabled="disabled || hasError"
        block
        @click="togglePlay"
      >
        {{ isLoading ? '加载中' : isPlaying ? '暂停' : '播放' }}
      </UButton>

      <UTooltip :text="isFullSong ? '切换到副歌片段' : '播放完整歌曲'">
        <UButton
          :icon="isFullSong ? 'i-lucide-music-2' : 'i-lucide-disc-3'"
          variant="outline"
          :color="isFullSong ? 'primary' : 'neutral'"
          :disabled="disabled || hasError"
          size="lg"
          @click="toggleFullSong"
        />
      </UTooltip>
    </div>

    <!-- Error state -->
    <UAlert
      v-if="hasError"
      icon="i-lucide-alert-triangle"
      color="error"
      variant="soft"
      title="音频加载失败"
      description="请检查网络后重试"
      class="mt-3"
    />
  </div>
</template>

<style scoped>
@keyframes soundWave {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

.sound-bar {
  animation: soundWave 0.8s ease-in-out infinite;
}
.sound-bar:nth-child(2) { animation-delay: 0.1s; }
.sound-bar:nth-child(3) { animation-delay: 0.2s; }
.sound-bar:nth-child(4) { animation-delay: 0.3s; }
.sound-bar:nth-child(5) { animation-delay: 0.4s; }
</style>
