<script setup lang="ts">
import { de, en, zh_cn } from '@nuxt/ui/locale';

const locales = [en, zh_cn, de];

const { locale, setLocale } = useI18n();
const isCopyrightOpen = ref(false);
</script>

<template>
  <UApp>
    <div class="flex flex-col justify-center items-center fixed bottom-3 right-3 z-30 rounded-lg border border-muted bg-default/90 shadow-sm backdrop-blur-sm">
      <ULocaleSelect
        :model-value="locale"
        :locales
        size="xs"
        variant="ghost"
        class="w-30"
        @update:model-value="v => setLocale(v as any)"
      />
      <div class="space-x-1">
        <UButton
          icon="i-lucide-copyright"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Open copyright notice"
          @click="isCopyrightOpen = true"
        />
        <ULink href="https://github.com/typed-sigterm/which-vocaloid" target="_blank">
          <UIcon name="i-logos-github-icon" />
        </ULink>
      </div>
    </div>

    <UModal
      v-model:open="isCopyrightOpen"
      title="Copyright Notice"
      :ui="{ body: 'space-y-3' }"
    >
      <template #body>
        <p class="text-sm">
          Copyright &copy; 2026-present
          <ULink href="https://typed-sigterm.me/?utm_source=which-vocaloid.by-ts.top&utm_medium=copyright" target="_blank" active>
            Typed SIGTERM
          </ULink>
        </p>
        <p class="text-sm">
          Song audio clips, song titles, and related media remain the property
          of their respective copyright owners and rightsholders.
        </p>
        <p class="text-sm">
          <strong>
            VOCALOID
          </strong>
          and associated character/brand names are trademarks of their
          respective owners, including Yamaha Corporation and other rightsholders.
          This project is an unofficial fan-made quiz and is not affiliated with,
          endorsed by, or sponsored by those trademark owners.
        </p>
      </template>
    </UModal>

    <WhichVocaloid />
  </UApp>
</template>
