<script>
    import estilos from "$lib/stores/estilos";
    import Paginacion from "../paginacion.svelte";
    import Eye from "$lib/svgs/eye.svelte";
    import Trash from "$lib/svgs/trash.svelte";
    import Pencil from "$lib/svgs/pencil.svelte";
    import { shorterWord } from "$lib/stringutil/lib";
    let pre = import.meta.env.VITE_PRE;
    let {
        pageSize = $bindable(15),
        
        tiposrows = [],
        ordenarTratamientos = (campo, mantener) => {},
        openViewModal = (_p) => {},
        openEditModal = (_p) => {},
        openDelModal = (_p) => {},
        clickTodos = () => {},
        clickFila = (id) => {},
        todos = $bindable(false),
        ascendente = false,
        forma = "",
    } = $props();
    let firstRun = true;
    function onChangePageSize() {
        paginaActual = 1;
    }

    let paginaActual = $state(1);

    let paginaAnterior = $derived(paginaActual - 1);

    let rows = $derived(
        tiposrows.slice(
            paginaAnterior * pageSize,
            paginaActual * pageSize,
        ),
    );

    let count = $derived(tiposrows.length);

    let totalPaginas = $derived(Math.ceil(count / pageSize));
    let pyfila = "py-1";
</script>
<div class="max-h-[600px] overflow-y-auto custom-scrollbar">
    <table class="table table-lg w-full bg-white dark:bg-slate-900">
        <thead class={`${estilos.tableheader}  sticky top-0 z-5 shadow-sm`}>
            <tr>
                <th
                    class={`
                        ${estilos.tableth}   
                    `}
                >
                    <div class="flex flex-row justify-between uppercase">
                        Nombre
                    </div>
                </th>
                <th class="text-base mx-1 px-1 text-center uppercase">
                    Acciones
                </th>
            </tr>
        </thead>
        <tbody>
            {#each rows as t}
                <tr>
                    <td class={`text-base mx-1 px-4 ${pyfila}`}>
                        {`${shorterWord(t.nombre,30)}`}
                    </td>
                    <td
                        class={`flex items-center justify-center gap-2 px-1 ${pyfila}`}
                    >
                        <button onclick={() => openViewModal(t.id)}>
                            <Eye size="size-5" />
                        </button>
                        <button onclick={() => openEditModal(t.id)}>
                            <Pencil size="size-5" />
                        </button>
                        <button onclick={() => openDelModal(t.id)}>
                            <Trash size="size-5" />
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>

</div>
<Paginacion
    rows={tiposrows}
    bind:paginaActual
    bind:pageSize
    {totalPaginas}
    {onChangePageSize}
/>