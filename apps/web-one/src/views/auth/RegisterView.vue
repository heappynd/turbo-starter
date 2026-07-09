<script setup lang="ts">
import type { FormInstance } from "antdv-next";
import { reactive, ref, shallowRef, watch } from "vue";
import { useRouter } from "vue-router";
import { message } from "antdv-next";
import { useAuthStore } from "@/stores/auth";
import AuthLayout from "@/layouts/AuthLayout.vue";

const router = useRouter();
const authStore = useAuthStore();
const formRef = shallowRef<FormInstance>();

const model = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const loading = ref(false);

const nameRules = [
  { required: true, message: "请输入昵称" },
  { min: 2, message: "昵称至少 2 个字符" },
  { max: 20, message: "昵称最多 20 个字符" },
];

const emailRules = [
  { required: true, message: "请输入邮箱地址" },
  { type: "email" as const, message: "邮箱格式不正确" },
];

const passwordRules = [
  { required: true, message: "请输入密码" },
  { min: 8, message: "密码至少 8 位" },
];

const confirmPasswordRules = [
  { required: true, message: "请确认密码" },
  {
    validator: async (_rule: any, value: string) => {
      if (!value || value === model.password) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("两次输入的密码不一致"));
    },
  },
];

watch(
  () => model.password,
  () => {
    if (model.confirmPassword) {
      formRef.value?.validateFields?.(["confirmPassword"]);
    }
  },
);

async function handleFinish(values: any) {
  loading.value = true;
  try {
    const result = await authStore.register(values.name, values.email, values.password);
    if (result.success) {
      message.success("注册成功");
      // Better Auth auto-signs in after sign up
      router.push("/");
    } else {
      message.error(result.error || "注册失败");
    }
  } catch {
    message.error("注册失败，请重试");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthLayout>
    <template #subtitle>创建账号，开始使用</template>

    <a-form
      ref="formRef"
      name="register"
      :model="model"
      layout="vertical"
      scroll-to-first-error
      @finish="handleFinish"
    >
      <a-form-item name="name" :rules="nameRules">
        <a-input v-model:value="model.name" placeholder="昵称" size="large" />
      </a-form-item>

      <a-form-item name="email" :rules="emailRules">
        <a-input v-model:value="model.email" placeholder="邮箱" size="large" />
      </a-form-item>

      <a-form-item name="password" :rules="passwordRules" has-feedback>
        <a-input-password v-model:value="model.password" placeholder="密码" size="large" />
      </a-form-item>

      <a-form-item name="confirmPassword" :rules="confirmPasswordRules" has-feedback>
        <a-input-password
          v-model:value="model.confirmPassword"
          placeholder="确认密码"
          size="large"
        />
      </a-form-item>

      <a-form-item>
        <a-button block type="primary" html-type="submit" size="large" :loading="loading">
          注 册
        </a-button>
      </a-form-item>
    </a-form>

    <template #footer>
      <a-typography-text type="secondary">
        已有账号？
        <router-link to="/login" class="text-ant-primary font-medium"> 立即登录 </router-link>
      </a-typography-text>
    </template>
  </AuthLayout>
</template>
