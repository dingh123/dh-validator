<script setup lang="ts">
import { ref } from 'vue'
import { extend, useValidator, v } from 'dh-validator'

extend('employeeId', (message?: string) => (value: unknown) => {
  return /^E\d{6}$/.test(String(value)) || message || '工号格式：E + 6 位数字'
})

const TAKEN = ['admin', 'test', 'root', 'user']
async function fakeCheckUsername(name: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 600))
  return TAKEN.includes(name.toLowerCase())
}

const form = ref({
  username: '',
  employeeId: '',
})

const schema = v.object({
  username: v
    .string()
    .required()
    .lengthBetween(3, 20)
    .label('用户名')
    .customAsync(async (val) => {
      const taken = await fakeCheckUsername(String(val))
      return taken ? '用户名已被占用' : true
    }),
  employeeId: v.string().required().use('employeeId').label('工号'),
})

const { errors, validate, validateField, hasError, reset } = useValidator(schema, form)

const checking = ref(false)
const result = ref<{ ok: boolean; text: string } | null>(null)

async function onCheckUsername() {
  checking.value = true
  try {
    await validateField('username')
  } finally {
    checking.value = false
  }
}

async function onSubmit() {
  const r = await validate()
  result.value = r.success
    ? { ok: true, text: '校验通过 ✓\n' + JSON.stringify(r.data, null, 2) }
    : { ok: false, text: r.errors.map((e) => `· [${e.field}] ${e.message}`).join('\n') }
}

function clearAll() {
  form.value = { username: '', employeeId: '' }
  reset()
  result.value = null
}
</script>

<template>
  <section class="card">
    <h2>异步校验 / 插件扩展</h2>
    <p class="desc">
      <code>customAsync</code> 模拟"用户名查重"接口（已占用：admin / test / root / user）；
      <code>extend('employeeId', ...)</code> 注册业务规则后通过 <code>.use('employeeId')</code> 调用。
    </p>

    <div class="field">
      <label>用户名 <span class="hint">（失焦后异步校验，约 600ms）</span></label>
      <input
        v-model="form.username"
        :class="{ invalid: errors.username }"
        placeholder="3-20 位，避开 admin/test/root/user"
        @blur="onCheckUsername"
      />
      <div v-if="checking" class="loading">⏳ 查重中…</div>
      <div v-else class="err">{{ errors.username || '' }}</div>
    </div>

    <div class="field">
      <label>工号 <span class="hint">（自定义规则：E + 6 位数字，例 E123456）</span></label>
      <input
        v-model="form.employeeId"
        :class="{ invalid: errors.employeeId }"
        placeholder="E123456"
        @blur="validateField('employeeId')"
      />
      <div class="err">{{ errors.employeeId || '' }}</div>
    </div>

    <div class="actions">
      <button class="primary" :disabled="hasError || checking" @click="onSubmit">提交</button>
      <button class="ghost" @click="clearAll">清空</button>
    </div>

    <div v-if="result" class="result" :class="result.ok ? 'success' : 'error'">{{ result.text }}</div>
  </section>
</template>
