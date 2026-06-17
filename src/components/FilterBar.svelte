<script lang="ts">
  let {
    onFilter,
    onKeywordChange,
    lines = [],
  }: {
    onFilter?: (f: { line: string; type: string; startDate: string; endDate: string }) => void;
    onKeywordChange?: (keyword: string) => void;
    lines?: string[];
  } = $props()

  let keyword = $state('')
  let line = $state('')
  let type = $state('')
  let startDate = $state('')
  let endDate = $state('')

  function apply() {
    onFilter?.({ line, type, startDate, endDate })
  }

  function reset() {
    keyword = ''; line = ''; type = ''; startDate = ''; endDate = ''
    onKeywordChange?.('')
    onFilter?.({ line: '', type: '', startDate: '', endDate: '' })
  }

  function onKeywordInput(e: Event) {
    const target = e.target as HTMLInputElement
    onKeywordChange?.(target.value)
  }
</script>

<div class="filter-bar">
  <div class="filter-grid">
    <div class="filter-item filter-search">
      <label for="fb-keyword">关键词</label>
      <input id="fb-keyword" type="text" bind:value={keyword} oninput={onKeywordInput} placeholder="站名、备注、线路名..." />
    </div>
    <div class="filter-item">
      <label for="fb-line">线路</label>
      <select id="fb-line" bind:value={line} onchange={apply}>
        <option value="">全部线路</option>
        {#each lines as l}
          <option value={l}>{l}</option>
        {/each}
      </select>
    </div>
    <div class="filter-item">
      <label for="fb-type">类型</label>
      <select id="fb-type" bind:value={type} onchange={apply}>
        <option value="">全部</option>
        <option value="bus">公交</option>
        <option value="metro">地铁</option>
      </select>
    </div>
       <div class="filter-item">
      <label for="fb-start">开始日期</label>
      <input id="fb-start" type="date" bind:value={startDate} onchange={apply} />
    </div>
    <div class="filter-item">
      <label for="fb-end">结束日期</label>
      <input id="fb-end" type="date" bind:value={endDate} onchange={apply} />
    </div>
  </div>
  <div class="filter-actions">
    <button class="btn-search" onclick={apply}>搜索</button>
    <button class="btn-reset" onclick={reset}>重置</button>
  </div>
</div>

<style>
  .filter-bar {
    background: var(--color-white);
    border-radius: var(--radius-md);
    padding: 16px 20px;
    box-shadow: var(--shadow-sm);
    display: flex;
    align-items: flex-end;
    gap: 16px;
    flex-wrap: wrap;
  }

  .filter-grid {
    display: flex;
    gap: 12px;
    flex: 1;
    flex-wrap: wrap;
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 140px;
  }

  .filter-item.filter-search {
    min-width: 220px;
    flex: 1;
  }

  .filter-item label {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-light);
  }

  .filter-item input,
  .filter-item select {
    padding: 7px 10px;
    border: 1px solid var(--color-gray-light);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--color-text);
    background: var(--color-white);
    transition: border-color 0.2s;
  }

  .filter-item input:focus,
  .filter-item select:focus {
    border-color: var(--color-primary);
  }

  .filter-actions {
    display: flex;
    gap: 8px;
  }

  .btn-search {
    padding: 7px 20px;
    background: var(--color-primary);
    color: var(--color-white);
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    transition: background 0.2s;
  }

  .btn-search:hover {
    background: var(--color-primary-light);
  }

  .btn-reset {
    padding: 7px 20px;
    background: var(--color-gray-light);
    color: var(--color-text-light);
    border-radius: var(--radius-sm);
    font-size: 13px;
    transition: background 0.2s;
  }

  .btn-reset:hover {
    background: #D1D5DB;
  }
</style>
