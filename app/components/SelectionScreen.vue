<script setup lang="ts">
const props = defineProps<{
  gameSize: number
  selectedSongIds: number[]
  autoPicking: boolean
  selectionHint: string
  availableSongIds: number[]
}>();

const emit = defineEmits<{
  toggle: [songId: number]
  repick: []
  confirm: []
  home: []
}>();

const selectedCount = computed(() => props.selectedSongIds.length);
const canConfirmSelection = computed(() => selectedCount.value === props.gameSize && !props.autoPicking);

function isSelected(songId: number) {
  return props.selectedSongIds.includes(songId);
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-6">
    <div class="w-full max-w-3xl rounded-2xl border border-muted bg-elevated/70 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 class="text-xl sm:text-2xl font-black tracking-tight">
          选择 {{ gameSize }} 首歌曲
        </h2>
        <UBadge
          :label="`${selectedCount} / ${gameSize}`"
          :color="selectedCount === gameSize ? 'primary' : 'neutral'"
          variant="subtle"
          size="lg"
        />
      </div>

      <div class="mb-4 text-sm text-muted h-5">
        <span v-if="autoPicking" class="inline-flex items-center gap-2">
          <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
          正在随机抽取...
        </span>
        <span v-else-if="selectionHint">{{ selectionHint }}</span>
        <span v-else>可点击方框调整选题，确认后进入答题</span>
      </div>

      <div class="question-grid" :class="{ 'is-auto-picking': autoPicking }">
        <button
          v-for="songId in availableSongIds"
          :key="songId"
          type="button"
          class="question-tile"
          :class="{ 'question-tile-selected': isSelected(songId) }"
          @click="emit('toggle', songId)"
        >
          {{ songId }}
        </button>
      </div>

      <div class="mt-6 flex flex-col sm:flex-row gap-2">
        <UButton
          label="返回首页"
          icon="i-lucide-home"
          variant="outline"
          color="neutral"
          @click="emit('home')"
        />
        <UButton
          label="随机抽取"
          icon="i-lucide-shuffle"
          variant="soft"
          color="neutral"
          :disabled="autoPicking"
          @click="emit('repick')"
        />
        <UButton
          label="确认并开始"
          icon="i-lucide-check"
          class="sm:ml-auto"
          :disabled="!canConfirmSelection"
          @click="emit('confirm')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.question-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(54px, 1fr));
  gap: 0.5rem;
}

.question-tile {
  border: 1px solid color-mix(in oklab, var(--ui-border) 90%, transparent);
  border-radius: 0.75rem;
  height: 2.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  background: color-mix(in oklab, var(--ui-bg) 92%, transparent);
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.question-tile:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--ui-primary) 45%, var(--ui-border));
}

.question-tile-selected {
  background: color-mix(in oklab, var(--ui-primary) 16%, var(--ui-bg));
  color: color-mix(in oklab, var(--ui-primary) 70%, black);
  border-color: color-mix(in oklab, var(--ui-primary) 48%, var(--ui-border));
  box-shadow: 0 0 0 1px color-mix(in oklab, var(--ui-primary) 35%, transparent) inset;
}

.is-auto-picking .question-tile {
  animation: tile-breathe 0.9s ease-in-out infinite;
}

@keyframes tile-breathe {
  0%,
  100% {
    opacity: 0.72;
  }
  50% {
    opacity: 1;
  }
}
</style>
