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
        bg-red-500 border-red-600 text-white hover:bg-red-600
        dark:bg-red-600 dark:border-red-700 dark:hover:bg-red-700
        
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:bg-red-700 disabled:dark:hover:bg-red-600
    `}
>
    {texto}
</button>