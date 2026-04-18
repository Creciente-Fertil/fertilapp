<script>
    import estilos from "$lib/stores/estilos";
    import Eye from "$lib/svgs/eye.svelte";
    import Trash from "$lib/svgs/trash.svelte";
    import Pencil from "$lib/svgs/pencil.svelte";
    import { goto } from "$app/navigation";
    let pre = import.meta.env.VITE_PRE;
    let {
        esColab=false,
        establecimientos=[],
        irEstablecimiento = (_p) => {},
        
        eliminar = (_p) => {},
        cab={},
        totales=[]

    } = $props();
</script>

<div class="max-h-[600px] overflow-y-auto custom-scrollbar">
    <!-- Cards -->
    <div class="flex flex-col gap-3">
        {#each establecimientos as e, i}
            <div
                class="
                rounded-xl border border-gray-200 dark:border-gray-700
                bg-white dark:bg-slate-900 p-4
                transition-all hover:shadow-md
            "
            >
                <!-- Cabecera con nombre y botón eliminar -->
                <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="flex-1 min-w-0">
                        <h3
                            class="text-lg font-bold text-gray-900 dark:text-gray-100 truncate"
                        >
                            {esColab?e.expand.cab.nombre:e.nombre}
                        </h3>
                    </div>

                    {#if !esColab && e.id != cab.id}
                        <button
                            aria-label="Eliminar"
                            onclick={() => eliminar(e.id)}
                            class="
                            flex items-center justify-center p-2
                            rounded-full
                            transition-colors duration-300
                            bg-red-600 text-white hover:bg-red-700
                            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                            shrink-0
                        "
                        >
                            <Trash
                                size="size-5"
                            />
                        </button>
                    {/if}
                </div>

                <!-- Grid de datos (2 columnas) -->
                <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400"
                            >Dirección</span
                        >
                        <p
                            class="text-gray-900 dark:text-gray-100 font-medium break-words"
                        >
                            {esColab?e.expand.cab.direccion:e.direccion || "-"}
                        </p>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400"
                            >Animales</span
                        >
                        <p class="text-gray-900 dark:text-gray-100 font-medium">
                            {totales[i] || 0}
                        </p>
                    </div>
                </div>

                <!-- Botón ir establecimiento -->
                <div class="mt-4">
                    <button
                        onclick={() => irEstablecimiento(e.id)}
                        class="
                        inline-flex items-center
                        text-emerald-600 dark:text-emerald-400
                        hover:text-emerald-700 dark:hover:text-emerald-300
                        font-medium transition-colors
                    "
                    >
                        Ir establecimiento
                        <svg
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            class="w-4 h-4 ml-2"
                            viewBox="0 0 24 24"
                        >
                            <path d="M5 12h14M12 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </div>
        {/each}
    </div>
</div>
