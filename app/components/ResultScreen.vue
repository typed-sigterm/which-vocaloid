<script setup lang="ts">
import type { DeepReadonly } from 'vue';
import type { GameSession } from '~/composables/useGame';
import confetti from 'canvas-confetti';

interface Props {
  session: DeepReadonly<GameSession> | null
}

const props = defineProps<Props>();
defineEmits<{
  restart: []
  home: []
}>();

const expandedSong = ref<number | null>(null);

const score = computed(() => props.session?.score ?? 0);
const total = computed(() => props.session?.songs?.length ?? 20);

function getRecord(songId: number) {
  return props.session?.records.find(r => r.songId === songId) ?? null;
}

function getLanguageLabel(language: 'japanese' | 'chinese' | 'other') {
  return $t(`language.${language}`);
}

onMounted(() => {
  if (Math.round((score.value / total.value) * 100) >= 80)
    setTimeout(confetti, 300);
});
</script>

<template>
  <div class="min-h-screen bg-default font-sans">
    <!-- Header -->
    <header class="sticky top-0 z-10 border-b border-muted bg-default/80 backdrop-blur-md">
      <div class="max-w-xl mx-auto px-4 py-3 flex items-center gap-2">
        <h1 class="text-base font-bold">
          {{ $t('result.title') }}
        </h1>
        <span class="text-sm text-muted">
          ◀ https://which-vocaloid.by-ts.top
        </span>
      </div>
    </header>

    <main class="max-w-xl mx-auto px-4 py-6 space-y-6">
      <!-- Score hero card -->
      <div class="text-center py-8 rounded-2xl border border-accented bg-elevated relative overflow-hidden">
        <div class="absolute inset-0 bg-primary/3 pointer-events-none" />
        <div class="relative z-10">
          <p class="text-sm uppercase tracking-[0.25em] text-muted">
            {{ $t('result.hero') }}
          </p>
          <div class="mt-3">
            <span class="text-7xl font-black text-primary">
              {{ score }}
            </span>
            <span class="text-3xl text-muted">
              / {{ total }}
            </span>
          </div>
        </div>
      </div>

      <div class="space-y-2 mt-2">
        <div
          v-for="(song, idx) in session?.songs"
          :key="song.id"
          class="rounded-xl border overflow-hidden transition-colors duration-200"
          :class="getRecord(song.id)?.correct
            ? 'border-green-500/25 bg-green-500/5'
            : 'border-red-500/25 bg-red-500/5'"
        >
          <button
            class="w-full flex items-center gap-3 p-3 text-left hover:bg-elevated/50 transition-colors"
            @click="expandedSong = expandedSong === song.id ? null : song.id"
          >
            <span class="text-xs text-muted w-5 shrink-0 text-center tabular-nums">{{ idx + 1 }}</span>
            <UIcon
              :name="getRecord(song.id)?.correct ? 'i-lucide-check-circle-2' : 'i-lucide-x-circle'"
              :class="getRecord(song.id)?.correct ? 'text-green-500' : 'text-red-500'"
              class="size-5 shrink-0"
            />
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <p class="text-sm font-medium truncate">
                {{ song.title }}
              </p>
              <p class="text-xs text-muted truncate">
                {{ song.singer }}
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <UBadge
                :label="getLanguageLabel(song.language)"
                :color="LANGUAGE_COLORS[song.language]"
                variant="subtle"
                size="sm"
              />
              <UIcon
                :name="expandedSong === song.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="size-4 text-muted"
              />
            </div>
          </button>

          <Transition name="expand">
            <div v-if="expandedSong === song.id" class="px-4 pb-4 border-t border-muted">
              <div class="pt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-xs text-muted mb-0.5">
                    {{ $t('result.voice') }}
                  </p>
                  <p class="font-medium text-xs">
                    {{ song.voice }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-muted mb-0.5">
                    {{ $t('result.producer') }}
                  </p>
                  <p class="font-medium text-xs">
                    {{ song.producer }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-muted mb-1">
                    {{ $t('result.yourAnswer') }}
                  </p>
                  <UBadge
                    :label="getRecord(song.id)?.answer
                      ? getLanguageLabel(getRecord(song.id)!.answer as 'japanese' | 'chinese' | 'other')
                      : $t('result.unanswered')"
                    :color="getRecord(song.id)?.correct ? 'success' : 'error'"
                    variant="subtle"
                    size="sm"
                  />
                </div>
                <div>
                  <p class="text-xs text-muted mb-1">
                    {{ $t('result.original') }}
                  </p>
                  <UButton
                    v-if="song.link"
                    :to="song.link"
                    target="_blank"
                    icon="i-lucide-external-link"
                    variant="outline"
                    color="neutral"
                    size="xs"
                  >
                    {{ $t('result.view') }}
                  </UButton>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <p class="text-center text-muted">
        <UIcon class="align-middle" name="i-lucide-share-2" />
        {{ $t('result.shareTip') }}
      </p>

      <!-- Bottom actions -->
      <div class="flex gap-3 pb-8">
        <UButton :label="$t('result.playAgain')" icon="i-lucide-refresh-cw" size="lg" block @click="$emit('restart')" />
        <UButton :label="$t('result.backHome')" icon="i-lucide-home" variant="outline" color="neutral" size="lg" block @click="$emit('home')" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 300px;
}
</style>
