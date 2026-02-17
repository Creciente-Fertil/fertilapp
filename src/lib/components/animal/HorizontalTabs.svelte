<script>
    import { onMount, onDestroy } from "svelte";

    let { pestañas = $bindable([]), tab = $bindable("") } = $props();

    function select(optionId) {
        tab = optionId;
    }

    function getNombreOpcion(id) {
        const p_idx = pestañas.findIndex(pes => pes.id === id);
        return p_idx !== -1 ? pestañas[p_idx].nombre : "";
    }

    // Aseguramos que siempre haya una pestaña seleccionada
    onMount(() => {
        if (!tab && pestañas.length > 0) {
            tab = pestañas[0].id;
        }
    });
    //#115642
</script>

<div class="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 pb-1">
    {#each pestañas as option}
        <button
            onclick={() => select(option.id)}
            class="px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap
                   {tab === option.id 
                       ? 'bg-transparent  text-[#115642] dark:text-[#24a579]  border-t-2 border-e-2 border-s-2 border-[#115642] shadow-sm' 
                       : 'text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}"
        >
            {getNombreOpcion(option.id)}
        </button>
    {/each}
</div>