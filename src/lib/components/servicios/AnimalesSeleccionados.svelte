<script>
    import estilos from "$lib/stores/estilos";
    import X from "$lib/svgs/x.svelte";
    import Badge from "../Badge.svelte";
    let {
        selecthashmap = $bindable({}),
        seleccionados = $bindable([]),
        quitarAnimal = (id) => {},
    } = $props();
</script>

<div
    class={`
            rounded-xl p-1 shadow-2xl
            dark:bg-slate-900 bg-white
            px-6
        `}
>
    <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
        <div
            class={`
                bg-transparent
            `}
        >
            <span
                class="label-text text-base uppercase font-semibold dark:text-[#24a579] text-[#115642]"
            >
                Animales seleccionados</span
            >
        </div>
    </div>
    <div class="flex flex-col gap-4 mb-8">
        <div
            class={`
                bg-transparent
            `}
        >
            <h3
                class={`
                    text-4xl uppercase font-semibold dark:text-[#24a579] text-[#115642]
                `}
            >
                {Object.entries(selecthashmap).length}
            </h3>
        </div>
    </div>
    <div class="flex flex-wrap gap-2">
        {#each Object.entries(selecthashmap) as [key, animal]}
            <button
                onclick={() => quitarAnimal(animal.id)}
                class="ml-0.5 rounded-sm hover:text-destructive"
                aria-label={`Quitar ${animal.caravana}`}
            >
                <Badge text="#{animal.caravana} X" color="creciente" />
            </button>
        {/each}
    </div>
</div>
