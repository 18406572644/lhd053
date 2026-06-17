<script lang="ts">
  import { currentPage, currentCity } from '@/stores/app'
  import { cities } from '@/data/subwayData'
  import { onMount } from 'svelte'

  const tabs = [
    { key: 'tickets' as const, label: '票根存档' },
    { key: 'trips' as const, label: '出行记录' },
    { key: 'stats' as const, label: '数据统计' },
  ]

  let page = $state<'tickets' | 'trips' | 'stats'>('tickets')
  let selectedCity = $state($currentCity)
  let cityDropdownOpen = $state(false)

  currentPage.subscribe((v) => {
    page = v
  })

  currentCity.subscribe((v) => {
    selectedCity = v
  })

  function setTab(key: 'tickets' | 'trips' | 'stats') {
    currentPage.set(key)
  }

  function setCity(cityId: string) {
    console.log('切换城市:', cityId)
    currentCity.set(cityId)
    cityDropdownOpen = false
  }

  function toggleDropdown(e: Event) {
    e.stopPropagation()
    cityDropdownOpen = !cityDropdownOpen
  }

  function getCurrentCityName(): string {
    const city = cities.find((c) => c.id === selectedCity)
    return city ? city.name : '北京'
  }

  onMount(() => {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (!target.closest('.city-selector')) {
        cityDropdownOpen = false
      }
    })
  })

  let { children } = $props<{ children: any }>()
</script>

<div class="layout">
  <header class="header">
    <div class="header-inner">
      <div class="brand">
        <span class="brand-icon">🚇</span>
        <h1 class="brand-title">票根存档</h1>
      </div>
      <div class="city-selector">
        <button class="city-selector-btn" onclick={toggleDropdown}>
          <span class="city-icon">📍</span>
          <span class="city-name">{getCurrentCityName()}</span>
          <span class="city-arrow" class:open={cityDropdownOpen}>▼</span>
        </button>
        {#if cityDropdownOpen}
          <div
            class="city-dropdown"
            role="listbox"
            tabindex="0"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
          >
            {#each cities as city}
              <button
                role="option"
                aria-selected={selectedCity === city.id}
                class="city-option"
                class:active={selectedCity === city.id}
                onclick={(e) => { e.stopPropagation(); setCity(city.id) }}
              >
                {city.name}
              </button>
            {/each}
          </div>
        {/if}
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

  .city-selector {
    position: relative;
  }

  .city-selector-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-white);
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
  }

  .city-selector-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .city-icon {
    font-size: 16px;
  }

  .city-arrow {
    font-size: 10px;
    transition: transform 0.2s;
  }

  .city-arrow.open {
    transform: rotate(180deg);
  }

  .city-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 120px;
    background: var(--color-white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    z-index: 1000;
  }

  .city-option {
    display: block;
    width: 100%;
    padding: 10px 16px;
    text-align: left;
    font-size: 14px;
    color: var(--color-text-primary);
    background: transparent;
    transition: all 0.15s;
    cursor: pointer;
  }

  .city-option:hover {
    background: var(--color-bg-secondary);
  }

  .city-option.active {
    background: var(--color-primary-light);
    color: var(--color-primary);
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
