<script setup lang="ts">
interface Props {
  song: Song | null
  correct?: boolean | null
}
defineProps<Props>();

const { t } = useI18n();
</script>

<template>
  <div
    class="rounded-xl border p-4 transition-all duration-300"
    :class="[
      correct !== false
        ? 'border-green-500/40 bg-green-500/5'
        : 'border-red-500/40 bg-red-500/5',
    ]"
  >
    <!-- Result header -->
    <div v-if="correct !== null" class="flex items-center gap-2 mb-3 pb-3 border-b border-muted">
      <UIcon
        :name="correct ? 'i-lucide-check-circle-2' : 'i-lucide-x-circle'"
        :class="correct ? 'text-green-500' : 'text-red-500'"
        class="size-5 shrink-0"
      />
      <span class="text-sm font-semibold" :class="correct ? 'text-green-500' : 'text-red-500'">
        {{ correct ? $t('songInfo.correct') : $t('songInfo.incorrect') }}
      </span>
    </div>

    <div class="space-y-3">
      <!-- Title -->
      <div>
        <p class="text-xs text-muted mb-1">
          {{ $t('songInfo.title') }}
        </p>
        <p class="text-base font-bold text-highlighted leading-tight">
          {{ song?.title }}
        </p>
      </div>

      <!-- Vocaloid -->
      <div>
        <p class="text-xs text-muted mb-1">
          {{ $t('songInfo.singer') }}
        </p>
        <p class="text-sm font-medium">
          {{ song?.singer }}
        </p>
      </div>

      <!-- voice + language -->
      <div>
        <p class="text-xs text-muted mb-1">
          {{ $t('songInfo.voice') }}
        </p>
        <div class="flex items-center gap-2 flex-wrap">
          <UBadge :label="song?.voice" color="neutral" variant="outline" size="sm" />
          <UBadge
            v-if="song?.language"
            :label="$t(`language.${song.language}`)"
            :color="LANGUAGE_COLORS[song.language]"
            variant="subtle"
            size="sm"
          />
        </div>
      </div>

      <!-- Producer -->
      <div>
        <p class="text-xs text-muted mb-1">
          {{ $t('songInfo.producer') }}
        </p>
        <p class="text-sm text-dimmed">
          {{ song?.producer }}
        </p>
      </div>

      <!-- Link -->
      <div>
        <UButton
          v-if="song?.link"
          :to="song.link"
          target="_blank"
          rel="noopener noreferrer"
          icon="i-lucide-external-link"
          variant="ghost"
          color="primary"
          size="sm"
          class="w-full"
        >
          {{ $t('songInfo.viewOriginal') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
