<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { addMessages, setLocale, v } from 'dh-validator'

addMessages('en', {
  required: '{label} is required',
  length_range: '{label} must be {min}-{max} characters',
  mobile: '{label} is not a valid mobile number',
  email: '{label} is not a valid email',
  idCard: '{label} is not a valid ID card number',
  sameAs: '{label} must match {otherLabel}',
})

const labels = {
  'zh-CN': { mobile: '手机号', email: '邮箱', pwd: '密码', pwd2: '确认密码', submit: '提交' },
  en: { mobile: 'Mobile', email: 'Email', pwd: 'Password', pwd2: 'Confirm password', submit: 'Submit' },
} as const

type Locale = keyof typeof labels

const locale = ref<Locale>('zh-CN')
const t = computed(() => labels[locale.value])

const form = ref({ mobile: '', email: '', pwd: '', pwd2: '' })
const errors = reactive<Record<string, string>>({})

const schema = computed(() =>
  v.object({
    mobile: v.string().required().mobile().label(t.value.mobile),
    email: v.string().required().email().label(t.value.email),
    pwd: v.string().required().lengthBetween(6, 20).label(t.value.pwd),
    pwd2: v.string().required().sameAs('pwd').label(t.value.pwd2),
  }),
)

const result = ref<{ ok: boolean; text: string } | null>(null)

function runValidate() {
  const r = schema.value.validate(form.value, { locale: locale.value })
  for (const k of Object.keys(errors)) delete errors[k]
  if (!r.success) {
    for (const e of r.errors) if (!errors[e.field]) errors[e.field] = e.message
  }
  return r
}

function switchLocale(next: Locale) {
  locale.value = next
  setLocale(next)
  if (Object.keys(errors).length || result.value) runValidate()
}

function onSubmit() {
  const r = runValidate()
  result.value = r.success
    ? { ok: true, text: (locale.value === 'zh-CN' ? '校验通过 ✓\n' : 'Valid ✓\n') + JSON.stringify(r.data, null, 2) }
    : { ok: false, text: r.errors.map((e) => `· [${e.field}] ${e.message}`).join('\n') }
}
</script>

<template>
  <section class="card">
    <h2>i18n 切换</h2>
    <p class="desc">
      <code>setLocale('en')</code> + <code>addMessages('en', {...})</code> 切换语言，同一组校验失败的
      文案与 label 即时切换。先点提交看错误，再切换语言。
    </p>

    <div class="field">
      <label>Locale</label>
      <div style="display: flex; gap: 8px">
        <button
          class="ghost"
          :style="locale === 'zh-CN' ? 'border-color:var(--c-primary);color:var(--c-primary);font-weight:600' : ''"
          @click="switchLocale('zh-CN')"
        >
          中文
        </button>
        <button
          class="ghost"
          :style="locale === 'en' ? 'border-color:var(--c-primary);color:var(--c-primary);font-weight:600' : ''"
          @click="switchLocale('en')"
        >
          English
        </button>
      </div>
    </div>

    <div class="field">
      <label>{{ t.mobile }}</label>
      <input v-model="form.mobile" :class="{ invalid: errors.mobile }" placeholder="13800138000" />
      <div class="err">{{ errors.mobile || '' }}</div>
    </div>

    <div class="field">
      <label>{{ t.email }}</label>
      <input v-model="form.email" :class="{ invalid: errors.email }" placeholder="hello@example.com" />
      <div class="err">{{ errors.email || '' }}</div>
    </div>

    <div class="field">
      <label>{{ t.pwd }}</label>
      <input v-model="form.pwd" type="password" :class="{ invalid: errors.pwd }" />
      <div class="err">{{ errors.pwd || '' }}</div>
    </div>

    <div class="field">
      <label>{{ t.pwd2 }}</label>
      <input v-model="form.pwd2" type="password" :class="{ invalid: errors.pwd2 }" />
      <div class="err">{{ errors.pwd2 || '' }}</div>
    </div>

    <div class="actions">
      <button class="primary" @click="onSubmit">{{ t.submit }}</button>
    </div>

    <div v-if="result" class="result" :class="result.ok ? 'success' : 'error'">{{ result.text }}</div>
  </section>
</template>
