<script>
    let {
        cancelar = () => {},
        siguiente = () => {},
        rounded = "rounded-b-xl",
    } = $props();
</script>

<div class={`${rounded} bg-white dark:bg-slate-900 p-4 shadow-sm`}>
    <div class="mt-6 flex space-x-3 justify-end border-t dark:border-gray-800">
        <!-- Botón Volver -->
        <button
            class="
                        hidden md:block
                        mt-2 px-10 py-2
                        dark:bg-transparent
                        bg-white
                        text-gray-800
                        dark:text-white
                        font-medium
                        rounded-full shadow-sm border
                        border-gray-300
                        hover:bg-gray-200
                        dark:hover:bg-gray-800
                        transition-colors
                        text-base"
            onclick={cancelar}
        >
            Cancelar
        </button>
        <!-- Botón Editar -->
        <button
            class="mt-2 px-10 py-2 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base"
            onclick={siguiente}
        >
            Siguiente
        </button>
    </div>
</div>
