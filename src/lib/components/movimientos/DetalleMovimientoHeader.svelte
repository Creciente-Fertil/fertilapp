<script>
    import estilos from "$lib/stores/estilos";
    import estados from "$lib/stores/estados";

    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let {
        lotes = [],
        rodeos = [],
        categorias = [],
        motivos = [],
        seccionAbierta = "",

        nuevacategoria = $bindable(""),
        nuevolote = $bindable(""),
        nuevorodeo = $bindable(""),
        tipotratamiento = $bindable(""),
        fecha = $bindable(""),
        fechabaja = $bindable(""),
        motivo = $bindable(""),
        codigo = $bindable(""),
    } = $props();
    function getNombre(id) {
        let s = "";
        if (seccionAbierta == "CATEGORIA") {
            let idx_c = categorias.findIndex((c) => c.id == id);

            if (idx_c != -1) {
                s = categorias[idx_c].nombre;
            }
        } else if (seccionAbierta == "LOTE") {
            let idx_c = lotes.findIndex((c) => c.id == id);
            if (idx_c != -1) {
                s = lotes[idx_c].nombre;
            }
        } else if (seccionAbierta == "RODEO") {
            let idx_c = rodeos.findIndex((c) => c.id == id);
            if (idx_c != -1) {
                s = rodeos[idx_c].nombre;
            }
        } else if (seccionAbierta == "BAJA") {
            let idx_c = motivos.findIndex((c) => c.id == id);
            if (idx_c != -1) {
                s = motivos[idx_c].nombre;
            }
        }
        return s;
    }
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div
    class="
        container py-3 px-4 max-w-7xl
        "
>
    <!--Header-->
    <div
        class={`
            rounded-2xl p-1 md:p-3 
            dark:bg-slate-900 bg-white
            shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)]
            dark:shadow-none
            
        `}
    >
        <div class="flex flex-col gap-1 mb-1">
            <div
                class={`
                    bg-transparent
                    py-1 
                `}
            >
                <h1
                    class={`
                            flex text-left
                            text-2xl font-semibold 
                            dark:text-[#24a579] text-[#115642]
                        `}
                >
                    Información general
                </h1>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div class="grid grid-cols-1">
                {#if seccionAbierta === "CATEGORIA"}
                    <div class="">
                        <label for="cate" class="label mb-0 pb-0">
                            <span
                                class="
                                    label-text tracking-wide
                                    text-md uppercase
                                    font-semibold dark:text-gray-400
                                    text-gray-500
                                "
                            >
                                Categoria</span
                            >
                        </label>
                        <label class="input-group">
                            <span
                                class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}
                                >{getNombre(nuevacategoria)}</span
                            >
                            <select
                                class={`
                                hidden
                                select select-bordered w-full
                                rounded-md
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                                bind:value={nuevacategoria}
                            >
                                {#each categorias as r}
                                    <option value={r.id}>{r.nombre}</option>
                                {/each}
                            </select>
                        </label>
                    </div>
                {/if}
                {#if seccionAbierta === "LOTE"}
                    <div class="">
                        <label for="lote" class="label mb-0 pb-0">
                            <span
                                class="
                                    label-text tracking-wide
                                    text-md uppercase
                                    font-semibold dark:text-gray-400
                                    text-gray-500
                                "
                            >
                                Lote</span
                            >
                        </label>
                        <label class="input-group">
                            <span
                                class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}
                                >{getNombre(nuevolote)}</span
                            >
                            <select
                                class={`
                                hidden
                                select select-bordered w-full
                                rounded-md
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                                bind:value={nuevolote}
                            >
                                {#each lotes as r}
                                    <option value={r.id}>{r.nombre}</option>
                                {/each}
                            </select>
                        </label>
                    </div>
                {/if}
                {#if seccionAbierta === "RODEO"}
                    <div class="">
                        <label for="rod" class="label mb-0 pb-0">
                            <span
                                class="
                                    label-text tracking-wide
                                    text-md uppercase
                                    font-semibold dark:text-gray-400
                                    text-gray-500
                                "
                            >
                                Rodeo</span
                            >
                        </label>
                        <label class="input-group">
                            <span
                                class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}
                                >{getNombre(nuevorodeo)}</span
                            >
                            <select
                                class={`
                                hidden
                                select select-bordered w-full
                                rounded-md
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                                bind:value={nuevorodeo}
                            >
                                {#each rodeos as r}
                                    <option value={r.id}>{r.nombre}</option>
                                {/each}
                            </select>
                        </label>
                    </div>
                {/if}
                {#if seccionAbierta === "BAJA"}
                    <div>
                        <label for="mot" class="label mb-0 pb-0">
                            <span
                                class="
                                    label-text tracking-wide
                                    text-md uppercase
                                    font-semibold dark:text-gray-400
                                    text-gray-500
                                "
                            >
                                Motivo
                            </span>
                        </label>
                        <label class="input-group">
                            <span
                                class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}
                                >{getNombre(motivo)}</span
                            >
                            <select
                                class={`
                                hidden
                                select select-bordered w-full
                                rounded-md
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                                bind:value={motivo}
                            >
                                {#each motivos as r}
                                    <option value={r.id}>{r.nombre}</option>
                                {/each}
                            </select>
                        </label>
                    </div>
                    <div class="hidden">
                        <label for="fecha" class="label">
                            <span class="label-text text-base">Fecha</span>
                        </label>
                        <label class="input-group">
                            <input
                                id="fecha"
                                type="date"
                                class={`
                                        input input-bordered w-full
                                        border border-gray-300 rounded-md
                                        focus:outline-none focus:ring-2 
                                        focus:ring-green-500 
                                        focus:border-green-500
                                        ${estilos.bgdark2} 
                                    `}
                                bind:value={fechabaja}
                                onchange={() => oninput("FECHABAJA")}
                            />
                        </label>
                    </div>
                {/if}
                {#if seccionAbierta === "TRANSFERIR"}
                    <div>
                        <label for="codigo" class="label">
                            <span class="label-text text-base">RENSPA</span>
                        </label>
                        <input
                            id="codigo"
                            type="text"
                            class={`input input-bordered w-full ${estilos.bgdark2}`}
                            bind:value={codigo}
                        />
                    </div>
                {/if}
            </div>
            {#if seccionAbierta == "BAJA"}
                <div class="grid grid-cols-1">
                    <div>
                        <label for="fecha" class="label">
                            <span
                                class="
                                    label-text tracking-wide
                                    text-md uppercase
                                    font-semibold dark:text-gray-400
                                    text-gray-500
                                "
                            >
                                Fecha baja
                            </span>
                        </label>
                        {#if fechabaja.length > 0}
                            <span
                                class={`text-lg font-semibold tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
                                >{new Date(
                                    fechabaja,
                                ).toLocaleDateString()}</span
                            >
                        {/if}
                    </div>
                </div>
            {:else}
                <div class="grid grid-cols-1">
                    <div>
                        <label for="fecha" class="label">
                            <span
                                class="
                                    label-text tracking-wide
                                    text-md uppercase
                                    font-semibold dark:text-gray-400
                                    text-gray-500
                                "
                            >
                                Fecha
                            </span>
                        </label>
                        <label class="input-group">
                            <input
                                id="fecha"
                                type="date"
                                class={`
                                        input input-bordered w-full
                                        border border-gray-300 rounded-md
                                        focus:outline-none focus:ring-2 
                                        focus:ring-green-500 
                                        focus:border-green-500
                                        ${estilos.bgdark2} 
                                    `}
                                bind:value={fecha}
                            />
                        </label>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
