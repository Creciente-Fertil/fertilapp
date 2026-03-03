<script>
    let {
        activo = $bindable(false),
        onchange = (e) => {},
        etiqueta = "",
    } = $props();
    function handleChange(e) {
        activo = e.target.checked;
        onchange(e);
    }
</script>

<label
    class="inline-flex items-center justify-center cursor-pointer select-none"
>
    <!-- Input checkbox real (oculto pero funcional) -->
    <input
        type="checkbox"
        checked={activo}
        onchange={handleChange}
        class="peer sr-only"
        aria-label={etiqueta}
    />

    <!-- Botón con estilos condicionales vía peer-checked -->
    <span
        class="
            px-2 py-1 md:px-4 
            font-medium rounded-full shadow-sm
            transition-colors text-base cursor-pointer
            
            dark:bg-transparent bg-white
            text-gray-800 dark:text-white
            border border-gray-300 dark:border-gray-600
            hover:bg-gray-200 dark:hover:bg-gray-500
            
            peer-checked:bg-[#115642] peer-checked:text-white
            peer-checked:border-transparent
            peer-checked:hover:bg-green-700
            peer-checked:shadow-md
        "
    >
        {etiqueta}
    </span>
</label>
