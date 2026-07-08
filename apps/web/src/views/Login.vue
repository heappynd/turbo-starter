<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { MailIcon, LockKeyholeIcon, EyeIcon, EyeOffIcon } from '@lucide/vue'

const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const showPassword = ref(false)
const loading = ref(false)
const errors = reactive({
  email: '',
  password: '',
})
const authError = ref('')

function validate(): boolean {
  let valid = true
  errors.email = ''
  errors.password = ''

  if (!form.email.trim()) {
    errors.email = '请输入邮箱地址'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    valid = false
  }

  if (!form.password) {
    errors.password = '请输入密码'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  authError.value = ''
  if (!validate()) return

  loading.value = true

  await authClient.signIn.email(
    {
      email: form.email,
      password: form.password,
    },
    {
      onSuccess: () => {
        router.push('/dashboard')
      },
      onError: (ctx) => {
        authError.value = ctx.error.message
      },
    },
  )

  loading.value = false
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-muted/30 p-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>登录</CardTitle>
        <CardDescription>欢迎回来，请登录你的账号</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleSubmit">
          <FieldGroup class="gap-5">
            <!-- 邮箱 -->
            <Field :data-invalid="!!errors.email || undefined">
              <FieldLabel for="email">邮箱</FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <MailIcon class="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="name@example.com"
                  autocomplete="email"
                  :disabled="loading"
                  :aria-invalid="!!errors.email || undefined"
                />
              </InputGroup>
              <FieldError v-if="errors.email">
                {{ errors.email }}
              </FieldError>
            </Field>

            <!-- 密码 -->
            <Field :data-invalid="!!errors.password || undefined">
              <FieldLabel for="password">密码</FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <LockKeyholeIcon class="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                  :disabled="loading"
                  :aria-invalid="!!errors.password || undefined"
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    type="button"
                    tabindex="-1"
                    :disabled="loading"
                    @click="showPassword = !showPassword"
                  >
                    <EyeIcon v-if="showPassword" data-icon />
                    <EyeOffIcon v-else data-icon />
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              <FieldError v-if="errors.password">
                {{ errors.password }}
              </FieldError>
            </Field>

            <!-- 服务端错误 -->
            <div
              v-if="authError"
              role="alert"
              class="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3"
            >
              {{ authError }}
            </div>

            <!-- 提交按钮 -->
            <Button type="submit" class="w-full" :disabled="loading">
              <Spinner v-if="loading" data-icon="inline-start" />
              <template v-else>登录</template>
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter class="justify-center">
        <p class="text-sm text-muted-foreground">
          还没有账号？
          <router-link
            to="/register"
            class="text-primary font-medium hover:underline"
          >
            立即注册
          </router-link>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
