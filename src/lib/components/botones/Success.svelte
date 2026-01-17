<script>
    let {
        texto = "",
        onclick=()=>{},
        disabled = false,
        rounded="rounded-full",
        fuentepeso="font-normal",
        fuentesize="text-base",
        py="py-1",
        px="px-3",
        btn=""


    } = $props()
    const base = `border ${btn} ${rounded} ${fuentepeso} ${px} ${py} ${fuentesize} flex items-center gap-1 transition-colors`;

</script>
<button
    {onclick}
    {disabled}
    class={`
        ${base}
        bg-green-600 border-green-500 text-white hover:bg-green-700
        dark:bg-green-600 dark:border-green-700 dark:hover:bg-green-700
        
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:bg-green-700 disabled:dark:hover:bg-green-600
    `}
>
    {texto}
</button>