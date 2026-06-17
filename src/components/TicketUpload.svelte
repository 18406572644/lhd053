<script lang="ts">
  import { uploadTicket, ocrRecognize } from '@/utils/api'
  import { parseOcrText } from '@/utils/ocrParser'

  let { onUpload }: { onUpload?: () => void } = $props()

  let line = $state('')
  let startStation = $state('')
  let endStation = $state('')
  let type = $state<'bus' | 'metro'>('bus')
  let travelDate = $state('')
  let notes = $state('')
  let file = $state<File | null>(null)
  let dragging = $state(false)
  let submitting = $state(false)
  let previewUrl = $state('')
  let ocrLoading = $state(false)
  let ocrCompleted = $state(false)
  let ocrRawText = $state('')
  let ocrError = $state('')
  let showRawText = $state(false)

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement
    if (input.files?.[0]) {
      handleFileSelected(input.files[0])
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    dragging = false
    if (e.dataTransfer?.files[0]) {
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    dragging = true
  }

  function onDragLeave() {
    dragging = false
  }

  async function handleFileSelected(selectedFile: File) {
    file = selectedFile
    previewUrl = URL.createObjectURL(selectedFile)
    ocrCompleted = false
    ocrError = ''
    ocrRawText = ''
    
    await performOcr(selectedFile)
  }

  async function performOcr(imageFile: File) {
    ocrLoading = true
    ocrError = ''
    
    try {
      const result = await ocrRecognize(imageFile)
      
      if (result.success) {
        ocrRawText = result.rawText
        applyOcrResult(result.parsed)
        ocrCompleted = true
      } else {
        ocrError = '识别失败，请手动填写'
      }
    } catch (err) {
      ocrError = 'OCR 服务暂时不可用，请手动填写'
      console.error('OCR error:', err)
    } finally {
      ocrLoading = false
    }
  }

  function applyOcrResult(parsed: {
    line: string
    startStation: string
    endStation: string
    type: 'bus' | 'metro'
    travelDate: string
  }) {
    if (parsed.line) line = parsed.line
    if (parsed.startStation) startStation = parsed.startStation
    if (parsed.endStation) endStation = parsed.endStation
    if (parsed.type) type = parsed.type
    if (parsed.travelDate) travelDate = parsed.travelDate
  }

  async function retryOcr() {
    if (file) {
      await performOcr(file)
    }
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
      resetForm()
      onUpload?.()
    } finally {
      submitting = false
    }
  }

  function resetForm() {
    line = ''
    startStation = ''
    endStation = ''
    type = 'bus'
    travelDate = ''
    notes = ''
    file = null
    previewUrl = ''
    ocrCompleted = false
    ocrRawText = ''
    ocrError = ''
  }
</script>

<div class="upload-panel">
  <div class="panel-header">
    <h3 class="panel-title">上传票根</h3>
    <span class="panel-subtitle">智能识别线路、站点和日期</span>
  </div>

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
        <p class="drop-tip">支持自动识别线路、站点、日期</p>
      </div>
    {/if}
    <input type="file" accept="image/*" class="file-input" onchange={onFileChange} />
  </div>

  {#if ocrLoading}
    <div class="ocr-loading">
      <span class="loading-spinner"></span>
      <span>正在识别票根信息...</span>
    </div>
  {:else if ocrError}
    <div class="ocr-error">
      <span>⚠️ {ocrError}</span>
      <button class="retry-btn" onclick={retryOcr}>重试识别</button>
    </div>
  {:else if ocrCompleted}
    <div class="ocr-success">
      <span>✅ 识别完成，请确认以下信息是否正确</span>
      <button class="toggle-raw" onclick={() => showRawText = !showRawText}>
        {showRawText ? '隐藏' : '查看'}原始文本
      </button>
    </div>
    {#if showRawText}
      <div class="raw-text-box">
        <p class="raw-label">识别原始文本：</p>
        <pre class="raw-content">{ocrRawText}</pre>
      </div>
    {/if}
  {/if}

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
    {submitting ? '提交中...' : (ocrCompleted ? '确认并提交' : '上传票根')}
  </button>
</div>

<style>
  .upload-panel {
    background: var(--color-white);
    border-radius: var(--radius-md);
    padding: 20px;
    box-shadow: var(--shadow-sm);
  }

  .panel-header {
    margin-bottom: 16px;
  }

  .panel-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 4px 0;
  }

  .panel-subtitle {
    font-size: 12px;
    color: var(--color-text-light);
  }

  .drop-zone {
    position: relative;
    border: 2px dashed var(--color-gray-light);
    border-radius: var(--radius-sm);
    padding: 24px;
    text-align: center;
    margin-bottom: 12px;
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

  .drop-tip {
    font-size: 12px;
    color: var(--color-primary);
    margin-top: 6px;
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

  .ocr-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: var(--color-primary-bg);
    border-radius: var(--radius-sm);
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--color-primary);
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-primary-light);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .ocr-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: #FFF3E0;
    border-radius: var(--radius-sm);
    margin-bottom: 12px;
    font-size: 13px;
    color: #E65100;
  }

  .retry-btn {
    padding: 4px 10px;
    background: #FFF8E1;
    border: 1px solid #FFCC80;
    border-radius: var(--radius-sm);
    font-size: 12px;
    color: #E65100;
    cursor: pointer;
    transition: background 0.2s;
  }

  .retry-btn:hover {
    background: #FFECB3;
  }

  .ocr-success {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: #E8F5E9;
    border-radius: var(--radius-sm);
    margin-bottom: 12px;
    font-size: 13px;
    color: #2E7D32;
  }

  .toggle-raw {
    padding: 4px 10px;
    background: #C8E6C9;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 12px;
    color: #2E7D32;
    cursor: pointer;
    transition: background 0.2s;
  }

  .toggle-raw:hover {
    background: #A5D6A7;
  }

  .raw-text-box {
    padding: 12px;
    background: var(--color-gray-lighter);
    border-radius: var(--radius-sm);
    margin-bottom: 12px;
  }

  .raw-label {
    font-size: 12px;
    color: var(--color-text-light);
    margin: 0 0 6px 0;
  }

  .raw-content {
    font-size: 12px;
    color: var(--color-text);
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: monospace;
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
    outline: none;
  }

  .submit-btn {
    width: 100%;
    padding: 10px;
    background: var(--color-primary);
    color: var(--color-white);
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--color-primary-light);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
