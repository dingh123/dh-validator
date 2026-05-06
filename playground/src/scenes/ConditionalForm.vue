<script setup lang="ts">
import { ref } from 'vue'
import { useValidator, v } from 'dh-validator'

const form = ref({
  userType: 'personal' as 'personal' | 'enterprise',
  idCard: '',
  bizLicense: '',
  pwd: '',
  pwd2: '',
})

const schema = v.object({
  userType: v.string().required().oneOf(['personal', 'enterprise']).label('用户类型'),

  idCard: v.string().when('userType', {
    is: 'personal',
    then: v.string().required().idCard().label('身份证'),
    otherwise: v.string().optional(),
  }),

  bizLicense: v.string().when('userType', {
    is: 'enterprise',
    then: v.string().required().lengthBetween(15, 20).label('营业执照号'),
    otherwise: v.string().optional(),
  }),

  pwd: v.string().required().lengthBetween(6, 20).label('密码'),
  pwd2: v.string().required().sameAs('pwd', '两次密码不一致').label('确认密码'),
})

const { errors, validate, validateField, hasError, reset } = useValidator(schema, form)

const result = ref<{ ok: boolean; text: string } | null>(null)

async function onSubmit() {
  const r = await validate()
  result.value = r.success
    ? { ok: true, text: '校验通过 ✓\n' + JSON.stringify(r.data, null, 2) }
    : { ok: false, text: r.errors.map((e) => `· [${e.field}] ${e.message}`).join('\n') }
}

function clearAll() {
  form.value = { userType: 'personal', idCard: '', bizLicense: '', pwd: '', pwd2: '' }
  reset()
  result.value = null
}
</script>

<template>
  <section class="card">
    <h2>跨字段 / 条件校验</h2>
    <p class="desc">
      <code>when(field, { is, then, otherwise })</code> 根据 userType 切换必填项；
      <code>sameAs('pwd')</code> 比对两次密码。切换"用户类型"看身份证 / 营业执照的必填规则随之切换。
    </p>

    <div class="field">
      <label>用户类型</label>
      <select v-model="form.userType" @change="reset()">
        <option value="personal">个人</option>
        <option value="enterprise">企业</option>
      </select>
    </div>

    <div v-if="form.userType === 'personal'" class="field">
      <label>身份证号 <span class="hint">（个人必填）</span></label>
      <input
        v-model="form.idCard"
        :class="{ invalid: errors.idCard }"
        placeholder="11010519491231002X"
        @blur="validateField('idCard')"
      />
      <div class="err">{{ errors.idCard || '' }}</div>
    </div>

    <div v-if="form.userType === 'enterprise'" class="field">
      <label>统一社会信用代码 <span class="hint">（企业必填，15-20 位）</span></label>
      <input
        v-model="form.bizLicense"
        :class="{ invalid: errors.bizLicense }"
        placeholder="91110000123456789X"
        @blur="validateField('bizLicense')"
      />
      <div class="err">{{ errors.bizLicense || '' }}</div>
    </div>

    <div class="field">
      <label>密码</label>
      <input
        v-model="form.pwd"
        type="password"
        :class="{ invalid: errors.pwd }"
        placeholder="6-20 位"
        @blur="validateField('pwd')"
      />
      <div class="err">{{ errors.pwd || '' }}</div>
    </div>

    <div class="field">
      <label>确认密码</label>
      <input
        v-model="form.pwd2"
        type="password"
        :class="{ invalid: errors.pwd2 }"
        placeholder="再次输入"
        @blur="validateField('pwd2')"
      />
      <div class="err">{{ errors.pwd2 || '' }}</div>
    </div>

    <div class="actions">
      <button class="primary" :disabled="hasError" @click="onSubmit">提交</button>
      <button class="ghost" @click="clearAll">清空</button>
    </div>

    <div v-if="result" class="result" :class="result.ok ? 'success' : 'error'">{{ result.text }}</div>
  </section>
</template>
