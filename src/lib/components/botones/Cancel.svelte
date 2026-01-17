<script>
    let {
        texto = "",
        onclick=()=>{},
        disabled = false
    } = $props()
    const base = "border rounded-full px-3 py-1 text-md flex items-center gap-1 transition-colors";

</script>
<button
    {onclick}
    {disabled}
    class={`
        ${base}
        bg-white border-gray-300 text-gray-800 hover:bg-gray-100
        dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600

        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:bg-gray-700 disabled:dark:hover:bg-gray-600
    `}
>
    {texto}
</button>