<script setup lang="ts">
import { shallowRef } from 'vue'
import BasicForm from './scenes/BasicForm.vue'
import ConditionalForm from './scenes/ConditionalForm.vue'
import AsyncExtendForm from './scenes/AsyncExtendForm.vue'
import I18nForm from './scenes/I18nForm.vue'
import UploadForm from './scenes/UploadForm.vue'

const tabs = [
  { key: 'basic', label: '基础链式校验', comp: BasicForm },
  { key: 'cond', label: '跨字段 / 条件', comp: ConditionalForm },
  { key: 'async', label: '异步 / 插件', comp: AsyncExtendForm },
  { key: 'i18n', label: 'i18n 切换', comp: I18nForm },
  { key: 'upload', label: '数组 / 上传', comp: UploadForm },
] as const

const active = shallowRef<(typeof tabs)[number]['key']>('basic')
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>dh-validator <code>playground</code></h1>
      <p>实时验证规则效果，所有 schema 直接 import 自项目源码（vite alias）</p>
    </header>

    <nav class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tab"
        :class="{ active: active === t.key }"
        @click="active = t.key"
      >
        {{ t.label }}
      </button>
    </nav>

    <component :is="tabs.find((t) => t.key === active)!.comp" />
  </div>
</template>
