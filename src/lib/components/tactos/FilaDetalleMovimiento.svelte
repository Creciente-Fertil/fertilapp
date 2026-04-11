<script>
    import estilos from "$lib/stores/estilos";
    import { shorterWord } from "$lib/stringutil/lib";
    import estados from "$lib/stores/estados";
    import tipostacto from "$lib/stores/tipostacto";
    let {
        selectanimales = $bindable([]),

        animal = null,
        id = "",
        quitarAnimal = (id) => {},
        verAnimal = (id) => {},
        cambiar = () => {},

        i,
    } = $props();
    // Toggle estado de expansión
    function toggleEstado(id) {
        animal.estado = !animal.estado ? true : false;
    }
</script>

<!-- Fila principal (visible siempre) -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
    <!-- Caravana -->
    <div class="md:col-span-3">
        <div class="font-bold text-slate-800 dark:text-slate-200 mx-4 px-4">
            {animal.caravana}
        </div>
    </div>
    <div class="md:col-span-3">
        <select
            class={`
                w-full
                select select-bordered
                border border-gray-300 rounded-md
                focus:outline-none focus:ring-2 
                focus:ring-green-500 focus:border-green-500
                ${estilos.bgdark2}
                pr-3
            `}
            bind:value={selectanimales[i].prenada}
        >
            {#each estados.filter(e => e.id > -1) as t}
                <option value={t.id}>{t.nombre}</option>
            {/each}
        </select>
    </div>
    <!-- Observaciones -->
    <div class="md:col-span-4">
        <div class="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {selectanimales[i].observacion || "Sin observaciones"}
        </div>
    </div>
    <div class="md:col-span-2 flex justify-end items-center gap-2">
        <button
            onclick={() => toggleEstado(animal.id)}
            class={`
                inline-flex items-center gap-1.5 px-3 py-1.5
                text-xs font-medium rounded-lg
                border transition-colors duration-200
                bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600
                
              `}
        >
            {animal.estado ? "Cerrar" : "Ver"}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class={`w-3 h-3 transition-transform duration-200 ${animal.estado ? "rotate-180" : ""}`}
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
            </svg>
        </button>
        <button
            onclick={() => quitarAnimal(animal.id)}
            class="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150"
            aria-label="Eliminar"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        </button>
    </div>
</div>
{#if animal.estado}
    <div
        class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-fadeIn"
    >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="">
                <label for="observacion" class="label">
                    <span
                        class="label-text text-sm uppercase font-semibold dark:text-gray-400 text-gray-500"
                    >
                        Editar observación</span
                    >
                </label>
                <textarea
                    bind:value={selectanimales[i].observacion}
                    placeholder="Observación"
                    class={`
                        p-2 m-1
                        min-h-32
                        leading-tight
                        textarea textarea-bordered textarea-lg
                        
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        w-full
                        ${estilos.bgdark2}
                    `}
                    onchange={cambiar}
                >
                </textarea>
            </div>
            <div>
                <label for="Estado" class="label">
                    <span
                        class="label-text text-base uppercase font-semibold dark:text-gray-400 text-gray-500"
                    >
                        Estado
                    </span>
                </label>
                <select
                    class={`
                        w-full
                        select select-bordered
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2}
                        pr-3
                    `}
                    bind:value={selectanimales[i].prenada}
                >
                    {#each estados as t}
                        <option value={t.id}>{t.nombre}</option>
                    {/each}
                </select>
            </div>
        </div>
    </div>
{/if}
