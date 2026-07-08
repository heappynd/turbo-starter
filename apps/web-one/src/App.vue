<script setup lang="ts"></script>

<template>
  <a-config-provider
    :theme="{
      token: {},
    }"
  >
    <a-app>
      <router-view />
    </a-app>
  </a-config-provider>
</template>

<style scoped></style>
