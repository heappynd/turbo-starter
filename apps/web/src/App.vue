<script setup lang="ts">
import { authClient } from "@/lib/auth-client"; //import the auth client
import { Button } from '@/components/ui/button'
import { ref } from "vue";

const name = ref('');
const email = ref('');
const password = ref('');

const signUp = async () => {
  const { data, error } = await authClient.signUp.email(
    {
      email: email.value,
      password: password.value,
      name: name.value,
      // image, // User image URL (optional)
      callbackURL: "/dashboard", // A URL to redirect to after the user verifies their email (optional)
    },
    {
      onRequest: (ctx) => {
        //show loading
        console.log('ctx', ctx)
      },
      onSuccess: (ctx) => {
        //redirect to the dashboard or sign in page
        console.log('ctx', ctx)
      },
      onError: (ctx) => {
        // display the error message
        alert(ctx.error.message);
      },
    },
  );
};
</script>

<template>
  <div>
    <input v-model="name" placeholder="昵称" />
    <input v-model="email" placeholder="邮箱地址" />
    <input v-model="password" type="password" placeholder="密码" />
  </div>
  <Button @click="signUp">注册</Button>
</template>

<style scoped></style>
