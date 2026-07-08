<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { message } from "antdv-next";

const authStore = useAuthStore();
const router = useRouter();

async function handleLogout() {
  await authStore.logout();
  message.success("已退出登录");
  router.push("/login");
}
</script>

<template>
  <div class="p-8">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <a-typography-title :level="2" class="mb-0!">
          You did it!
        </a-typography-title>
        <div class="flex items-center gap-4">
          <a-typography-text v-if="authStore.user">
            {{ authStore.user.name }}
          </a-typography-text>
          <a-button danger @click="handleLogout">
            退出登录
          </a-button>
        </div>
      </div>

      <a-typography-paragraph>
        欢迎使用 Web One！你已成功登录。
      </a-typography-paragraph>

      <div class="flex gap-4 mt-4">
        <router-link to="/about">
          <a-button type="primary">About</a-button>
        </router-link>
      </div>
    </div>
  </div>
</template>
