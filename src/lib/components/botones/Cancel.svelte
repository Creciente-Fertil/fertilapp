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
        mt="mt-1",
        mb="mb-1",
        w="",
        items="items-center",
        text="text-start",
        btn="",
        conhijo=false,
        children
    } = $props()
    
    const base = $derived(
        `${btn} ${rounded} ${fuentepeso} ${px} ${py} ${fuentesize} flex ${items} gap-1 ${mt} ${mb}`
    );

</script>
<button
    {onclick}
    {disabled}
    class={`
        ${base}
        ${w} ${text}
        bg-white border-gray-300 text-gray-800 hover:bg-gray-100
        dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600

        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:bg-gray-700 disabled:dark:hover:bg-gray-600
    `}
>
    {#if conhijo}
        {@render children()}
    {:else}
        {texto}
    {/if}
</button>