<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "antdv-next";
import { useAuthStore } from "@/stores/auth";
import AuthLayout from "@/layouts/AuthLayout.vue";

const router = useRouter();
const authStore = useAuthStore();

const model = reactive({
  email: "",
  password: "",
  remember: true,
});

const loading = ref(false);

const emailRules = [
  { required: true, message: "请输入邮箱地址" },
  { type: "email" as const, message: "邮箱格式不正确" },
];

const passwordRules = [
  { required: true, message: "请输入密码" },
  { min: 8, message: "密码至少 8 位" },
];

async function handleFinish(values: any) {
  loading.value = true;
  try {
    const result = await authStore.login(values.email, values.password, values.remember);
    if (result.success) {
      message.success("登录成功");
      router.push("/");
    } else {
      message.error(result.error || "登录失败");
    }
  } catch {
    message.error("登录失败，请重试");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthLayout>
    <template #subtitle>欢迎回来，请输入账号密码登录</template>

    <a-form name="login" :model="model" layout="vertical" @finish="handleFinish">
      <a-form-item name="email" :rules="emailRules">
        <a-input v-model:value="model.email" placeholder="邮箱" size="large" />
      </a-form-item>

      <a-form-item name="password" :rules="passwordRules">
        <a-input-password v-model:value="model.password" placeholder="密码" size="large" />
      </a-form-item>

      <a-form-item>
        <a-flex justify="space-between" align="center">
          <a-form-item name="remember" no-style>
            <a-checkbox v-model:checked="model.remember"> 记住我 </a-checkbox>
          </a-form-item>
          <a href="" class="text-sm text-ant-primary" @click.prevent> 忘记密码？ </a>
        </a-flex>
      </a-form-item>

      <a-form-item>
        <a-button block type="primary" html-type="submit" size="large" :loading="loading">
          登 录
        </a-button>
      </a-form-item>
    </a-form>

    <template #footer>
      <a-typography-text type="secondary">
        还没有账号？
        <router-link to="/register" class="text-ant-primary font-medium"> 立即注册 </router-link>
      </a-typography-text>
    </template>
  </AuthLayout>
</template>
