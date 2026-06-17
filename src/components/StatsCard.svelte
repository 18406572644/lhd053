<script lang="ts">
  let {
    label,
    value,
    icon,
    color = '#1A5CD6',
  }: {
    label: string;
    value: string | number;
    icon: string;
    color?: string;
  } = $props()
</script>

<div class="stats-card" style="--accent: {color};">
  <div class="card-icon">{icon}</div>
  <div class="card-info">
    <span class="card-value">{value}</span>
    <span class="card-label">{label}</span>
  </div>
</div>

<style>
  .stats-card {
    background: var(--color-white);
    border-radius: var(--radius-md);
    padding: 20px;
    box-shadow: var(--shadow-sm);
    display: flex;
    align-items: center;
    gap: 16px;
    border-left: 4px solid var(--accent);
    transition: box-shadow 0.2s;
  }

  .stats-card:hover {
    box-shadow: var(--shadow-md);
  }

  .card-icon {
    font-size: 32px;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    background: var(--color-primary-bg);
    flex-shrink: 0;
  }

  .card-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .card-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text);
    font-family: var(--font-mono);
    line-height: 1.2;
  }

  .card-label {
    font-size: 13px;
    color: var(--color-text-light);
  }
</style>
