<script setup lang="ts">
import type { DeepReadonly } from 'vue';
import type { GameSession } from '~/composables/useGame';
import confetti from 'canvas-confetti';

interface Props {
  session: DeepReadonly<GameSession> | null
}

const props = defineProps<Props>();
const emit = defineEmits<{ restart: [], home: [] }>();

const expandedSong = ref<number | null>(null);

const score = computed(() => props.session?.score ?? 0);
const total = computed(() => props.session?.songs?.length ?? 20);

function getRecord(songId: number) {
  return props.session?.records.find(r => r.songId === songId) ?? null;
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
      <div class="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-base font-bold">
          游戏结果
        </h1>
        <div class="flex gap-2">
          <UButton label="再来一局" icon="i-lucide-refresh-cw" size="sm" @click="emit('restart')" />
          <UButton icon="i-lucide-home" variant="ghost" color="neutral" size="sm" @click="emit('home')" />
        </div>
      </div>
    </header>

    <main class="max-w-xl mx-auto px-4 py-6 space-y-6">
      <!-- Score hero card -->
      <div class="text-center py-8 rounded-2xl border border-accented bg-elevated relative overflow-hidden">
        <div class="absolute inset-0 bg-primary/3 pointer-events-none" />
        <div class="relative z-10">
          <p class="text-sm uppercase tracking-[0.25em] text-muted">
            Result
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
                :label="LANGUAGE_LABELS[song.language]"
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
                    声库
                  </p>
                  <p class="font-medium text-xs">
                    {{ song.voice }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-muted mb-0.5">
                    作者
                  </p>
                  <p class="font-medium text-xs">
                    {{ song.producer }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-muted mb-1">
                    你的答案
                  </p>
                  <UBadge
                    :label="getRecord(song.id)?.answer
                      ? LANGUAGE_LABELS[getRecord(song.id)!.answer as keyof typeof LANGUAGE_LABELS]
                      : '未作答'"
                    :color="getRecord(song.id)?.correct ? 'success' : 'error'"
                    variant="subtle"
                    size="sm"
                  />
                </div>
                <div>
                  <p class="text-xs text-muted mb-1">
                    原曲
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
                    查看
                  </UButton>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Bottom actions -->
      <div class="flex gap-3 pb-8">
        <UButton label="再来一次" icon="i-lucide-refresh-cw" size="lg" block @click="emit('restart')" />
        <UButton label="返回主页" icon="i-lucide-home" variant="outline" color="neutral" size="lg" block @click="emit('home')" />
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
