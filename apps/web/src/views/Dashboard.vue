<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MailIcon, CalendarIcon, KeyRoundIcon, LogOutIcon } from '@lucide/vue'

const router = useRouter()

// useSession() 返回一个 Ref<{ data: Session | null, isPending: boolean }>
// 在 <script> 中通过 .value 访问，在 <template> 中自动解包
const session = authClient.useSession()

// 当会话解析为 null 时（未登录），跳转到登录页
watch(() => session.value.data, (newVal) => {
  if (newVal === null) {
    router.push('/login')
  }
}, { immediate: true })

function getInitials(name: string): string {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleSignOut() {
  await authClient.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-muted/30 p-4">
    <!-- 加载状态 -->
    <Card v-if="session.isPending" class="w-full max-w-md">
      <CardContent class="flex items-center justify-center py-12">
        <Spinner class="size-6" />
        <span class="ml-3 text-muted-foreground">加载中...</span>
      </CardContent>
    </Card>

    <!-- 用户信息 -->
    <Card v-else-if="session.data" class="w-full max-w-md">
      <CardHeader class="text-center">
        <!-- 头像占位 -->
        <div
          class="mx-auto mb-3 flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary"
        >
          {{ getInitials(session.data.user.name) }}
        </div>
        <CardTitle class="text-2xl">{{ session.data.user.name }}</CardTitle>
        <CardDescription>
          欢迎回来！
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div class="space-y-4">
          <!-- 邮箱 -->
          <div class="flex items-center gap-3">
            <MailIcon class="size-5 text-muted-foreground shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-muted-foreground">邮箱</p>
              <p class="text-sm font-medium truncate">
                {{ session.data.user.email }}
                <span
                  v-if="session.data.user.emailVerified"
                  class="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  已验证
                </span>
                <span
                  v-else
                  class="ml-1.5 inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                >
                  未验证
                </span>
              </p>
            </div>
          </div>

          <Separator />

          <!-- 用户 ID -->
          <div class="flex items-center gap-3">
            <KeyRoundIcon class="size-5 text-muted-foreground shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-muted-foreground">用户 ID</p>
              <p class="text-sm font-mono text-muted-foreground truncate">
                {{ session.data.user.id }}
              </p>
            </div>
          </div>

          <Separator />

          <!-- 注册时间 -->
          <div class="flex items-center gap-3">
            <CalendarIcon class="size-5 text-muted-foreground shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-muted-foreground">注册时间</p>
              <p class="text-sm text-muted-foreground">
                {{ formatDate(session.data.user.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="destructive"
          class="w-full"
          @click="handleSignOut"
        >
          <LogOutIcon class="size-4" />
          退出登录
        </Button>
      </CardFooter>
    </Card>

    <!-- 未登录（fallback） -->
    <Card v-else class="w-full max-w-md">
      <CardContent class="py-8 text-center">
        <p class="text-muted-foreground mb-4">你尚未登录</p>
        <Button class="w-full" @click="router.push('/login')">
          前往登录
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
