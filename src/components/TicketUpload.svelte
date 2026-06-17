<script lang="ts">
  import { uploadTicket } from '@/utils/api'

  let { onUpload }: { onUpload?: () => void } = $props()

  let line = $state('')
  let startStation = $state('')
  let endStation = $state('')
  let type = $state('bus')
  let travelDate = $state('')
  let notes = $state('')
  let file = $state<File | null>(null)
  let dragging = $state(false)
  let submitting = $state(false)
  let previewUrl = $state('')

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement
    if (input.files?.[0]) {
      file = input.files[0]
      previewUrl = URL.createObjectURL(file!)
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    dragging = false
    if (e.dataTransfer?.files[0]) {
      file = e.dataTransfer.files[0]
      previewUrl = URL.createObjectURL(file!)
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    dragging = true
  }

  function onDragLeave() {
    dragging = false
  }

  async function handleSubmit() {
    if (!file && !line && !startStation && !endStation) return
    submitting = true
    const formData = new FormData()
    if (file) formData.append('image', file)
    formData.append('line', line)
    formData.append('startStation', startStation)
    formData.append('endStation', endStation)
    formData.append('type', type)
    formData.append('travelDate', travelDate)
    formData.append('notes', notes)

    try {
      await uploadTicket(formData)
      line = ''; startStation = ''; endStation = ''; type = 'bus'
      travelDate = ''; notes = ''; file = null; previewUrl = ''
      onUpload?.()
    } finally {
      submitting = false
    }
  }
</script>

<div class="upload-panel">
  <div
    class="drop-zone"
    class:dragging
    role="region"
    ondrop={onDrop}
    ondragover={onDragOver}
    ondragleave={onDragLeave}
  >
    {#if previewUrl}
      <img src={previewUrl} alt="预览" class="preview-img" />
    {:else}
      <div class="drop-hint">
        <span class="drop-icon">📎</span>
        <p>拖拽或点击上传票根图片</p>
      </div>
    {/if}
    <input type="file" accept="image/*" class="file-input" onchange={onFileChange} />
  </div>

  <div class="form-grid">
    <div class="form-item">
      <label for="tu-line">线路</label>
      <input id="tu-line" type="text" bind:value={line} placeholder="如: 1号线" />
    </div>
    <div class="form-item">
      <label for="tu-type">类型</label>
      <select id="tu-type" bind:value={type}>
        <option value="bus">公交</option>
        <option value="metro">地铁</option>
      </select>
    </div>
    <div class="form-item">
      <label for="tu-start">起始站</label>
      <input id="tu-start" type="text" bind:value={startStation} placeholder="起始站" />
    </div>
    <div class="form-item">
      <label for="tu-end">终点站</label>
      <input id="tu-end" type="text" bind:value={endStation} placeholder="终点站" />
    </div>
    <div class="form-item">
      <label for="tu-date">出行日期</label>
      <input id="tu-date" type="date" bind:value={travelDate} />
    </div>
    <div class="form-item full">
      <label for="tu-notes">备注</label>
      <textarea id="tu-notes" bind:value={notes} placeholder="可选备注" rows="2"></textarea>
    </div>
  </div>

  <button class="submit-btn" onclick={handleSubmit} disabled={submitting}>
    {submitting ? '提交中...' : '上传票根'}
  </button>
</div>

<style>
  .upload-panel {
    background: var(--color-white);
    border-radius: var(--radius-md);
    padding: 20px;
    box-shadow: var(--shadow-sm);
  }

  .drop-zone {
    position: relative;
    border: 2px dashed var(--color-gray-light);
    border-radius: var(--radius-sm);
    padding: 24px;
    text-align: center;
    margin-bottom: 16px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }

  .drop-zone:hover,
  .drop-zone.dragging {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
  }

  .drop-hint {
    color: var(--color-text-light);
    font-size: 14px;
  }

  .drop-icon {
    font-size: 28px;
    display: block;
    margin-bottom: 8px;
  }

  .preview-img {
    max-height: 120px;
    border-radius: var(--radius-sm);
  }

  .file-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-item.full {
    grid-column: 1 / -1;
  }

  .form-item label {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-light);
  }

  .form-item input,
  .form-item select,
  .form-item textarea {
    padding: 8px 12px;
    border: 1px solid var(--color-gray-light);
    border-radius: var(--radius-sm);
    font-size: 14px;
    color: var(--color-text);
    background: var(--color-white);
    transition: border-color 0.2s;
  }

  .form-item input:focus,
  .form-item select:focus,
  .form-item textarea:focus {
    border-color: var(--color-primary);
  }

  .submit-btn {
    width: 100%;
    padding: 10px;
    background: var(--color-primary);
    color: var(--color-white);
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-weight: 600;
    transition: background 0.2s;
  }

  .submit-btn:hover {
    background: var(--color-primary-light);
  }

  .submit-btn:disabled {
    opacity: 0.6;
  }
</style>
