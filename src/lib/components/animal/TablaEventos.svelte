<script>
    import Paginacion from "../paginacion.svelte";
    import estilos from "$lib/stores/estilos";
    import Badge from "../Badge.svelte";
    
    let { data = [] } = $props();
    const colorMap = {
        "inse": "blue",
        "ser":  "purple",
        "pari": "green",
        "obser":"red",
        "tacto":"yellow",
        "trata":"gray"
    }
    let pageSize = $state(5);
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
                Informacion
            </th>
        </tr>
    </thead>
    <tbody>
        {#each rows as h (h.id)}
            
            <tr>
                <td class="text-base mx-1 px-1 text-center">
                    {new Date(h.fecha).toLocaleDateString()}
                </td>
                <td class="text-base mx-1 px-1 text-center">
                    <Badge 
                        text = {h.nombre}
                        color = {colorMap[h.coleccion]}
                    />
                    
                </td>
                <td class="text-base mx-1 px-1 text-center">
                    {@html h.info}
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
