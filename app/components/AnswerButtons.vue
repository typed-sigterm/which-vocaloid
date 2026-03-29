<script setup lang="ts">
interface Props {
  disabled?: boolean
  answered?: boolean
  correctAnswer?: string | null
  selectedAnswer?: string | null
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  answered: false,
  correctAnswer: null,
  selectedAnswer: null,
});

const emit = defineEmits<{
  answer: [lang: 'japanese' | 'chinese' | 'other']
}>();

const options = [
  { value: 'japanese' as const, label: '日语', flag: '🇯🇵' },
  { value: 'chinese' as const, label: '中文', flag: '🇨🇳' },
  { value: 'other' as const, label: '混合 / 其他', flag: '🌐' },
];
</script>

<template>
  <div class="grid grid-cols-3 gap-3">
    <button
      v-for="option in options"
      :key="option.value"
      :disabled="disabled || answered"
      class="relative flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed"
      :class="[
        answered
          ? option.value === correctAnswer
            ? 'border-green-500 bg-green-500/10 text-green-500'
            : option.value === selectedAnswer
              ? 'border-red-500 bg-red-500/10 text-red-500'
              : 'border-muted bg-muted text-muted opacity-40'
          : 'border-accented bg-elevated text-default hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95',
      ]"
      @click="() => !answered && !disabled && emit('answer', option.value)"
    >
      <div v-if="answered" class="absolute top-2 right-2">
        <UIcon
          v-if="option.value === correctAnswer"
          name="i-lucide-check"
          class="size-3.5 text-green-500"
        />
        <UIcon
          v-else-if="option.value === selectedAnswer"
          name="i-lucide-x"
          class="size-3.5 text-red-500"
        />
      </div>
      <span class="text-2xl leading-none">{{ option.flag }}</span>
      <span class="font-bold text-sm">{{ option.label }}</span>
    </button>
  </div>
</template>
