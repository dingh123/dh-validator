<script setup lang="ts">
import { ref } from 'vue'
import { useValidator, v } from 'dh-validator'

const form = ref({
  mobile: '',
  email: '',
  idCard: '',
  bankCard: '',
})

const schema = v.object({
  mobile: v.string().required().mobile().label('手机号'),
  email: v.string().required().email().label('邮箱'),
  idCard: v.string().required().idCard().label('身份证'),
  bankCard: v.string().required().bankCard().label('银行卡号'),
})

const { errors, validate, validateField, hasError, reset } = useValidator(schema, form)

const result = ref<{ ok: boolean; text: string } | null>(null)

async function onSubmit() {
  const r = await validate()
  result.value = r.success
    ? { ok: true, text: '校验通过 ✓\n' + JSON.stringify(r.data, null, 2) }
    : { ok: false, text: r.errors.map((e) => `· [${e.field}] ${e.message}`).join('\n') }
}

function fillSample() {
  form.value = {
    mobile: '13800138000',
    email: 'hello@example.com',
    idCard: '11010519491231002X',
    bankCard: '6225888888888888',
  }
  reset()
  result.value = null
}

function clearAll() {
  form.value = { mobile: '', email: '', idCard: '', bankCard: '' }
  reset()
  result.value = null
}
</script>

<template>
  <section class="card">
    <h2>基础链式校验</h2>
    <p class="desc">
      演示 <code>required</code> · <code>mobile</code> · <code>email</code> ·
      <code>idCard</code>（含校验位） · <code>bankCard</code>（Luhn 算法）。失焦实时校验。
    </p>

    <div class="field">
      <label>手机号（中国大陆）</label>
      <input
        v-model="form.mobile"
        :class="{ invalid: errors.mobile }"
        placeholder="13800138000"
        @blur="validateField('mobile')"
      />
      <div class="err">{{ errors.mobile || '' }}</div>
    </div>

    <div class="field">
      <label>邮箱</label>
      <input
        v-model="form.email"
        :class="{ invalid: errors.email }"
        placeholder="hello@example.com"
        @blur="validateField('email')"
      />
      <div class="err">{{ errors.email || '' }}</div>
    </div>

    <div class="field">
      <label>身份证号</label>
      <input
        v-model="form.idCard"
        :class="{ invalid: errors.idCard }"
        placeholder="18 位，最后一位可为 X"
        @blur="validateField('idCard')"
      />
      <div class="err">{{ errors.idCard || '' }}</div>
    </div>

    <div class="field">
      <label>银行卡号</label>
      <input
        v-model="form.bankCard"
        :class="{ invalid: errors.bankCard }"
        placeholder="校验 Luhn 算法"
        @blur="validateField('bankCard')"
      />
      <div class="err">{{ errors.bankCard || '' }}</div>
    </div>

    <div class="actions">
      <button class="primary" :disabled="hasError" @click="onSubmit">提交</button>
      <button class="ghost" @click="fillSample">填充示例</button>
      <button class="ghost" @click="clearAll">清空</button>
    </div>

    <div v-if="result" class="result" :class="result.ok ? 'success' : 'error'">{{ result.text }}</div>
  </section>
</template>
