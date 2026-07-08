import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { authClient } from "@/lib/auth-client";

export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isLoading = ref(true);
  const initialized = ref(false);

  const isAuthenticated = computed(() => !!user.value);

  async function checkAuth() {
    isLoading.value = true;
    try {
      const { data } = await authClient.getSession();
      user.value = (data?.user as User | null) ?? null;
    } catch {
      user.value = null;
    } finally {
      isLoading.value = false;
      initialized.value = true;
    }
  }

  async function login(email: string, password: string, rememberMe = true) {
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });
      if (error) {
        return { success: false as const, error: error.message };
      }
      await checkAuth();
      return { success: true as const };
    } catch (e: any) {
      return { success: false as const, error: e.message || "登录失败" };
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
      });
      if (error) {
        return { success: false as const, error: error.message };
      }
      // After sign up, user is auto-signed-in by default
      await checkAuth();
      return { success: true as const };
    } catch (e: any) {
      return { success: false as const, error: e.message || "注册失败" };
    }
  }

  async function logout() {
    await authClient.signOut();
    user.value = null;
  }

  // Initialize auth state on store creation
  checkAuth();

  return { user, isLoading, initialized, isAuthenticated, checkAuth, login, register, logout };
});
