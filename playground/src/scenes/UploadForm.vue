<script setup lang="ts">
import { reactive, ref } from 'vue'
import { v } from 'dh-validator'

interface FileItem {
  id: number
  name: string
  loading?: boolean
  error?: boolean
  url?: string
}

const files = ref<FileItem[]>([])
const errors = reactive<Record<string, string>>({})
const result = ref<{ ok: boolean; text: string } | null>(null)

const schema = v.object({
  files: v.array<FileItem>().min(1).max(5).uploading().uploadFailed().label('附件'),
})

let nextId = 1

function addFile(forceFail = false) {
  const item: FileItem = {
    id: nextId++,
    name: `IMG_${String(item_seq()).padStart(3, '0')}.png`,
    loading: true,
  }
  files.value.push(item)
  // 模拟上传：随机 800-1500ms，10% 失败（点"模拟失败上传"按钮则强制失败）
  const delay = 800 + Math.random() * 700
  setTimeout(() => {
    const idx = files.value.findIndex((f) => f.id === item.id)
    if (idx === -1) return
    const success = forceFail ? false : Math.random() > 0.1
    files.value[idx] = {
      ...files.value[idx],
      loading: false,
      error: !success,
      url: success ? `https://cdn.example.com/${item.name}` : undefined,
    }
  }, delay)
}

let _seq = 0
function item_seq() {
  return ++_seq
}

function removeFile(id: number) {
  files.value = files.value.filter((f) => f.id !== id)
}

function retry(id: number) {
  const idx = files.value.findIndex((f) => f.id === id)
  if (idx === -1) return
  files.value[idx] = { ...files.value[idx], loading: true, error: false }
  setTimeout(() => {
    const i2 = files.value.findIndex((f) => f.id === id)
    if (i2 === -1) return
    files.value[i2] = {
      ...files.value[i2],
      loading: false,
      error: false,
      url: `https://cdn.example.com/${files.value[i2].name}`,
    }
  }, 800)
}

function onSubmit() {
  const r = schema.validate({ files: files.value })
  for (const k of Object.keys(errors)) delete errors[k]
  if (!r.success) {
    for (const e of r.errors) if (!errors[e.field]) errors[e.field] = e.message
  }
  result.value = r.success
    ? { ok: true, text: '校验通过 ✓\n' + JSON.stringify(r.data, null, 2) }
    : { ok: false, text: r.errors.map((e) => `· [${e.field}] ${e.message}`).join('\n') }
}

function clearAll() {
  files.value = []
  for (const k of Object.keys(errors)) delete errors[k]
  result.value = null
}
</script>

<template>
  <section class="card">
    <h2>数组 / 上传校验</h2>
    <p class="desc">
      <code>v.array().min(1).max(5).uploading().uploadFailed()</code> 校验"至少 1 项 / 最多 5 项 /
      没有上传中 / 没有失败"。规则识别每个 item 的 <code>loading</code> / <code>error</code> 字段。
    </p>

    <div class="field">
      <label>附件列表 ({{ files.length }} / 5)</label>

      <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px">
        <li
          v-for="f in files"
          :key="f.id"
          style="
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border: 1px solid var(--c-border);
            border-radius: 8px;
            background: #fafbfd;
            font-size: 13px;
          "
        >
          <span style="flex: 1">{{ f.name }}</span>
          <span v-if="f.loading" style="color: var(--c-muted)">⏳ 上传中…</span>
          <span v-else-if="f.error" style="color: var(--c-error)">✗ 失败</span>
          <span v-else style="color: var(--c-success)">✓ 完成</span>

          <button
            v-if="f.error"
            class="ghost"
            style="padding: 4px 10px; font-size: 12px"
            @click="retry(f.id)"
          >
            重试
          </button>
          <button
            class="ghost"
            style="padding: 4px 10px; font-size: 12px"
            @click="removeFile(f.id)"
          >
            移除
          </button>
        </li>
      </ul>

      <div v-if="!files.length" style="font-size: 13px; color: var(--c-muted); padding: 8px 0">
        暂无文件，点击下方按钮添加
      </div>

      <div class="err">{{ errors.files || '' }}</div>
    </div>

    <div class="actions">
      <button class="ghost" :disabled="files.length >= 5" @click="addFile(false)">＋ 添加文件</button>
      <button class="ghost" :disabled="files.length >= 5" @click="addFile(true)">
        ＋ 添加（强制失败）
      </button>
      <button class="primary" @click="onSubmit">提交</button>
      <button class="ghost" @click="clearAll">清空</button>
    </div>

    <div v-if="result" class="result" :class="result.ok ? 'success' : 'error'">{{ result.text }}</div>
  </section>
</template>
