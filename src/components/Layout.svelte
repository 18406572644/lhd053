<script lang="ts">
  import { currentPage } from '@/stores/app'

  const tabs = [
    { key: 'tickets' as const, label: '票根存档' },
    { key: 'trips' as const, label: '出行记录' },
    { key: 'stats' as const, label: '数据统计' },
  ]

  let page = $state<'tickets' | 'trips' | 'stats'>('tickets')

  currentPage.subscribe((v) => {
    page = v
  })

  function setTab(key: 'tickets' | 'trips' | 'stats') {
    currentPage.set(key)
  }

  let { children } = $props<{ children: any }>()
</script>

<div class="layout">
  <header class="header">
    <div class="header-inner">
      <div class="brand">
        <span class="brand-icon">🚇</span>
        <h1 class="brand-title">票根存档</h1>
      </div>
      <nav class="nav">
        {#each tabs as tab}
          <button
            class="nav-tab"
            class:active={page === tab.key}
            onclick={() => setTab(tab.key)}
          >
            {tab.label}
          </button>
        {/each}
      </nav>
    </div>
  </header>
  <div class="body">
    <div class="side-strip">
      <div class="strip-segment" style="background: #1A5CD6;"></div>
      <div class="strip-segment" style="background: #E53935;"></div>
      <div class="strip-segment" style="background: #43A047;"></div>
      <div class="strip-segment" style="background: #FB8C00;"></div>
      <div class="strip-segment" style="background: #8E24AA;"></div>
    </div>
    <main class="content">
      {@render children()}
    </main>
  </div>
</div>

<style>
  .layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .header {
    background: var(--color-primary);
    color: var(--color-white);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--shadow-md);
  }

  .header-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-icon {
    font-size: 24px;
  }

  .brand-title {
    font-family: var(--font-mono);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--color-white);
  }

  .nav {
    display: flex;
    gap: 4px;
  }

  .nav-tab {
    padding: 8px 20px;
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    background: transparent;
    transition: all 0.2s;
  }

  .nav-tab:hover {
    color: var(--color-white);
    background: rgba(255, 255, 255, 0.1);
  }

  .nav-tab.active {
    color: var(--color-primary);
    background: var(--color-white);
    font-weight: 600;
  }

  .body {
    display: flex;
    flex: 1;
  }

  .side-strip {
    width: 4px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .strip-segment {
    flex: 1;
  }

  .content {
    flex: 1;
    padding: 24px;
    max-width: 1196px;
  }
</style>
