<script lang="ts">
  import { currentPage } from '@/stores/app'
  import Layout from '@/components/Layout.svelte'
  import Tickets from '@/pages/Tickets.svelte'
  import Trips from '@/pages/Trips.svelte'
  import Stats from '@/pages/Stats.svelte'

  let page = $state<'tickets' | 'trips' | 'stats'>('tickets')

  currentPage.subscribe((v) => {
    page = v
  })
</script>

<Layout>
  {#if page === 'tickets'}
    <Tickets />
  {:else if page === 'trips'}
    <Trips />
  {:else}
    <Stats />
  {/if}
</Layout>
