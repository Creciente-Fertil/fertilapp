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
    let pyfila = "py-1"
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
                        Peso nuevo
                    </div>
                </th>
                <th class="text-base mx-1 px-1 text-center uppercase">
                    Acciones
                </th>
            </tr>
        </thead>
        <tbody>
            {#each rows as p}
                <tr
                    
                >
                    <td class={`text-base ml-3 pl-3 mr-1 pr-1 ${pyfila}`}>
                        {new Date(p.fecha).toLocaleDateString()}
                    </td>
                    <td class={`justify-center items-center text-base ml-3 pl-3 mr-1 pr-1 ${pyfila}`}>
                        {`${p.pesonuevo}`}
                    </td>
                    <td
                        class="justify-center items-center"
                    >
                        <button onclick={() => openDetalle(p.id)}>
                            <Eye size="size-5" />
                        </button>
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
