<script>
    
    import estilos from "$lib/stores/estilos";
    import Badge from "../Badge.svelte";
    
    let { data = [],ordenarFecha = ()=>{} } = $props();
    const colorMap = {
        "Lote": "blue",
        "Rodeo":  "purple",
        "Categoria": "green"
    }
    let pageSize = $state(15);
    let paginaActual = $state(1);

    let paginaAnterior = $derived(paginaActual - 1);

    let rows = $derived(
        data.slice(paginaAnterior * pageSize, paginaActual * pageSize),
    );

    let count = $derived(data.length);

    let totalPaginas = $derived(Math.ceil(count / pageSize));
    function onChangePageSize(){
        paginaActual = 1
    }
    let pyfila = "py-1";
</script>

<!-- Cards -->
<div class="flex flex-col gap-3">
    {#each data as h (h.id)}
        <div
            class={`
                flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-all
                border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900
                hover:shadow-md
            `}
        >
            <!-- Checkbox y fecha (mobile: arriba, desktop: alineados) -->
            <div class="flex items-center gap-3">
                
                
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {new Date(h.fecha).toLocaleDateString()}
                </span>
            </div>

            <!-- Tipo (Badge) -->
            <div class="">
                <Badge 
                    text={`Cambio de ${h.nombre}`}
                    color={colorMap[h.nombre]}
                />
            </div>

            <!-- Detalle (info) -->
            <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-600 dark:text-gray-400 break-words">
                    {@html h.info}
                </div>
            </div>

            
        </div>
    {/each}
</div>
