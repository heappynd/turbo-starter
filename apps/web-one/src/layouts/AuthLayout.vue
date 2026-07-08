<script setup lang="ts">
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4"
  >
    <div
      class="w-full max-w-md bg-white rounded-xl shadow-lg p-8"
    >
      <div class="text-center mb-8">
        <a-typography-title :level="3" class="mb-1!">
          Web One
        </a-typography-title>
        <a-typography-text type="secondary">
          <slot name="subtitle" />
        </a-typography-text>
      </div>

      <slot />

      <a-divider />

      <div class="text-center">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
