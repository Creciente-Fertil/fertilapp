<script>
    import Paginacion from "../paginacion.svelte";
    import estilos from "$lib/stores/estilos";
    import Badge from "../Badge.svelte";
    
    let { data = [] } = $props();
    const colorMap = {
        "Lote": "blue",
        "Rodeo":  "purple",
        "Categoria": "green"
    }
    let pageSize = $state(15);
    let paginaActual = $state(1);

    let paginaAnterior = $derived(paginaActual - 1);

    let rows = $derived(
        data.slice(paginaAnterior * pageSize, paginaActual * pageSize),
    );

    let count = $derived(data.length);

    let totalPaginas = $derived(Math.ceil(count / pageSize));
    function onChangePageSize(){
        paginaActual = 1
    }
    let pyfila = "py-1";
</script>

<table class="table table-lg w-full bg-white dark:bg-slate-900">
    <thead class={`${estilos.tableheader}`}>
        <tr>
            <th
                class={`
                    ${estilos.tableth}   

                `}
            >
                Fecha
            </th>
            <th
                class={`
                    ${estilos.tableth}   

                `}
            >
                Tipo
            </th>
            <th
                class={`
                    ${estilos.tableth}   

                `}
            >
                Detalle
            </th>
        </tr>
    </thead>
    <tbody>
        {#each rows as h }
            
            <tr>
                <td class={`text-base mx-1 px-1 text-center ${pyfila}`}>
                    {new Date(h.fecha).toLocaleDateString()}
                </td>
                <td class={`text-base mx-1 px-1 text-center ${pyfila}`}>
                    <Badge 
                        text = {`Cambio de ${h.nombre}`}
                        color = {colorMap[h.nombre]}
                    />
                    
                </td>
                <td class={`text-base mx-1 px-1 text-center ${pyfila}`}>
                    {h.info}
                </td>
            </tr>
        {/each}
    </tbody>
</table>
<Paginacion
    rows={data}
    bind:paginaActual
    bind:pageSize
    {totalPaginas}
    {onChangePageSize}  
/>
