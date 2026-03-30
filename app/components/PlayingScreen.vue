<script setup lang="ts">
import type { GameRecord } from '~/composables/useGame';

defineProps<{
  answeredCount: number
  totalSongs: number
  currentScore: number
  progressPercent: number
  currentIndex: number
  hasAnsweredCurrent: boolean
  currentRecord: GameRecord | null
  currentSong: Song | null
  isLastSong: boolean
  isTransitioning: boolean
}>();

defineEmits<{
  home: []
  answer: [lang: 'japanese' | 'chinese' | 'other']
  next: []
}>(); ;
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-10 border-b border-muted bg-default/80 backdrop-blur-md">
      <div class="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <UButton icon="i-lucide-home" variant="ghost" color="neutral" size="sm" @click="$emit('home')" />
        <div class="flex items-center gap-3">
          <span class="text-sm text-muted tabular-nums">
            {{ answeredCount }} / {{ totalSongs }}
          </span>
          <UBadge :label="$t('playing.scoreBadge', { score: currentScore })" color="primary" variant="subtle" />
        </div>
      </div>
      <UProgress :model-value="progressPercent" :max="100" color="primary" size="xs" class="rounded-none" />
    </header>

    <main class="flex-1 max-w-xl mx-auto w-full px-4 py-5 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold">
          {{ $t('playing.songIndex', { index: currentIndex + 1 }) }}
        </h2>
        <div v-if="hasAnsweredCurrent && currentRecord" class="flex items-center gap-1.5">
          <UIcon
            :name="currentRecord.correct ? 'i-lucide-check-circle-2' : 'i-lucide-x-circle'"
            :class="currentRecord.correct ? 'text-green-500' : 'text-red-500'"
            class="size-5"
          />
          <span class="text-sm font-medium" :class="currentRecord.correct ? 'text-green-500' : 'text-red-500'">
            {{ currentRecord.correct
              ? $t('playing.correct')
              : $t('playing.wrongWithAnswer', { answer: $t(`language.${currentSong?.language ?? 'japanese'}`) }) }}
          </span>
        </div>
      </div>

      <Transition name="fade" mode="out-in">
        <div v-if="!isTransitioning" :key="currentSong?.id ?? 0">
          <AudioPlayer
            v-if="currentSong"
            :song-id="currentSong.id"
            :chorus-start="currentSong.chorusStart"
            :chorus-end="currentSong.chorusEnd"
          />
        </div>
      </Transition>

      <SongInfoCard
        v-if="hasAnsweredCurrent"
        :song="currentSong"
        :correct="currentRecord?.correct ?? null"
      />

      <AnswerButtons
        :disabled="!currentSong"
        :answered="hasAnsweredCurrent"
        :correct-answer="currentSong?.language ?? null"
        :selected-answer="currentRecord?.answer ?? null"
        @answer="$emit('answer', $event)"
      />

      <Transition name="slide-up">
        <UButton
          v-if="hasAnsweredCurrent"
          :label="isLastSong ? $t('playing.viewResult') : $t('playing.nextSong')"
          :icon="isLastSong ? 'i-lucide-flag' : 'i-lucide-chevron-right'"
          block
          size="lg"
          @click="$emit('next')"
        />
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>
