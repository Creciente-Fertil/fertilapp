<script>
    import estilos from "$lib/stores/estilos";
    import Paginacion from "../paginacion.svelte";
    import Eye from "$lib/svgs/eye.svelte";
    import Trash from "$lib/svgs/trash.svelte";
    import Pencil from "$lib/svgs/pencil.svelte";

    let pre = import.meta.env.VITE_PRE;
    let {
        pageSize = $bindable(15),
        selecthash = {},
        pesajesrows = [],
        clickTodos = () => {},
        clickFila = (id) => {},
        openDetalle = (id) => {},
        todos = $bindable(false),
        ascendente,
        forma,
    } = $props();
    let firstRun = true;
    function onChangePageSize() {
        paginaActual = 1;
    }

    let paginaActual = $state(1);

    let paginaAnterior = $derived(paginaActual - 1);

    let rows = $derived(
        pesajesrows.slice(paginaAnterior * pageSize, paginaActual * pageSize),
    );

    let count = $derived(pesajesrows.length);

    let totalPaginas = $derived(Math.ceil(count / pageSize));
    let pyfila = "py-2"
</script>

<div class="max-h-[400px] overflow-y-auto custom-scrollbar">
    <table class="table table-lg w-full bg-white dark:bg-slate-900">
        <thead class={`${estilos.tableheader}  sticky top-0 z-5 shadow-sm`}>
            <tr>
                <th
                    class={`
                        ${estilos.tableth}   
                    `}
                >
                    <div class="flex flex-row justify-between uppercase">
                        FECHA
                    </div>
                </th>
                <th
                    class={`
                        ${estilos.tableth}   
                    `}
                >
                    <div class="flex flex-row justify-between uppercase">
                        Peso anterior
                    </div>
                </th>
                <th
                    class={`
                        ${estilos.tableth}   
                    `}
                >
                    <div class="flex flex-row justify-between uppercase">
                        Peso nuevo
                    </div>
                </th>
            </tr>
        </thead>
        <tbody>
            {#each rows as p}
                <tr
                    onclick={() => openDetalle(p.id)}
                    class="hover:bg-gray-200 dark:hover:bg-gray-900"
                >
                    <td class={`text-base ml-3 pl-3 mr-1 pr-1 ${pyfila}`}>
                        {new Date(p.fecha).toLocaleDateString()}
                    </td>
                    <td class={`text-base ml-3 pl-3 mr-1 pr-1 ${pyfila}`}>
                        {`${p.pesoanterior}`}
                    </td>
                    <td class={`text-base ml-3 pl-3 mr-1 pr-1 ${pyfila}`}>
                        {`${p.pesonuevo}`}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
<Paginacion
    rows={pesajesrows}
    bind:paginaActual
    bind:pageSize
    {totalPaginas}
    {onChangePageSize}
/>
