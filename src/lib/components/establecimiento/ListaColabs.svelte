<script>
    import estilos from "$lib/stores/estilos";
    import { isEmpty } from "$lib/stringutil/lib";
    import { goto } from "$app/navigation";
    
    import Paginacion from "../paginacion.svelte";
    let { colabs = $bindable([]), pageSize = $bindable(15) } = $props();
    import Eye from "$lib/svgs/eye.svelte";
    let pre = import.meta.env.VITE_PRE;
    let firstRun = true;
    function onChangePageSize() {
        paginaActual = 1;
    }
    //$effect(() => {
    //    if (firstRun) {
    //        firstRun = false;
    //        return;
    //    }
    //    paginaActual = 1;
    //
    //});

    let paginaActual = $state(1);

    let paginaAnterior = $derived(paginaActual - 1);

    let rows = $derived(
        colabs.slice(paginaAnterior * pageSize, paginaActual * pageSize),
    );

    let count = $derived(colabs.length);

    let totalPaginas = $derived(Math.ceil(count / pageSize));
    let pyfila = "py-1"
    function getColab(id) {
        goto(pre + "/colaboradores/" + id);
    }
</script>

<!--Tabla-->
<div
    class={`
                w-full md:grid
                mx-auto py-1 px-4 max-w-7xl  
            `}
>
    <div
        class={`
                overflow-hidden rounded-xl
                border dark:border-gray-700

            `}
    >
        <div class="max-h-[600px] overflow-y-auto custom-scrollbar">
            <table class="table table-lg w-full bg-white dark:bg-slate-900">
                <thead
                    class={`${estilos.tableheader}  sticky top-0 z-5 shadow-sm`}
                >
                    <tr>
                        <th class="text-base mx-1 px-1 text-center uppercase">
                            Nombre
                        </th>
                        <th class="text-base mx-1 px-1 text-center uppercase">
                            Apellido
                        </th>
                        <th class="text-base mx-1 px-1 text-center uppercase">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each colabs as c}
                        <tr>
                            <td class={`text-base mx-1 px-1 text-center ${pyfila}`}
                                >{c.expand.colab.nombre}</td
                            >
                            <td class={`text-base mx-1 px-1 text-center ${pyfila}`}
                                >{c.expand.colab.apellido}</td
                            >
                            <td
                                class={`flex items-center justify-center gap-2 px-1 ${pyfila}`}
                            >
                                <button onclick={() => getColab(c.id)}>
                                    <Eye size="size-5" />
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <Paginacion
            rows={colabs}
            bind:paginaActual
            bind:pageSize
            {totalPaginas}
            {onChangePageSize}
        />
    </div>
</div>

