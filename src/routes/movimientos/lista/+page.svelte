<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import estilos from "$lib/stores/estilos";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import {
        eliminarMove,
        getAll,
    } from "$lib/java/movimientos/movimientosback";
    import BuscadorMovimientos from "$lib/components/movimientos/BuscadorMovimientos.svelte";
    import { loadStorageEstablecimiento } from "$lib/java/establecimientos/establecimientostorage";
    import TablaMovimientos from "$lib/components/movimientos/TablaMovimientos.svelte";
    import ListaMovimientos from "$lib/components/movimientos/ListaMovimientos.svelte";
    import { goto } from "$app/navigation";

    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    let esdev = import.meta.env.VITE_DEV == "si";
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");
    let cabnombre = $state("");

    let movimientos = [];
    let movimientosrows = $state([]);
    let cargados = $state(false);
    //filtros
    let isOpenFilter = $state(false);
    let buscar = $state("");
    let fechadesde = $state("");
    let fechahasta = $state("");
    let tipo = $state("");
    //movimiento
    let defaultmovimiento = {
        id: "",
        animal: "",
        fecha: "",
        tipo: "",
        fromLotId: "",
        toLotId: "",
        fromHerdId: "",
        toHerdId: "",
        fromEstablishmentId: "",
        toEstablishmentId: "",
        observaciones: "",
        edit: false,
    };
    let detallemovimento = $state({ ...defaultmovimiento });
    let storage = createStorageProxy("detallemovimento", defaultmovimiento);
    //Seleccionados
    let selectmovimientos = $state([]);
    let selecthashmap = $state({});
    let todos = $state(false);
    let algunos = $state(false);
    let ninguno = $state(true);
    let pageSize = $state(15);
    function clickFilter() {
        isOpenFilter = !isOpenFilter;
    }
    function prepararData(item) {
        return {
            FECHA: new Date(item.fecha).toLocaleDateString(),
        };
    }
    function limpiar() {
        selectanimales = [];
        let lista = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            lista.push(key);
        }
        for (let i = 0; i < lista.length; i++) {
            selecthashmap[lista[i]] = null;
        }
        algunos = false;
        todos = false;
        ninguno = true;
    }
    function limpiarFiltros() {
        buscar = "";
        fechadesde = "";
        fechahasta = "";
        tipo = "";
        filterUpdate();
    }
    function filterUpdate() {
        movimientosrows = movimientos;
        if (buscar != "") {
            movimientosrows = movimientosrows.filter((a) =>
                a.caravana
                    .toLocaleLowerCase()
                    .includes(buscar.toLocaleLowerCase()),
            );
        }
        if (fechadesde != "") {
            movimientosrows = movimientosrows.filter(
                (t) => t.fecha >= fechadesde,
            );
        }
        if (fechahasta != "") {
            movimientosrows = movimientosrows.filter(
                (t) => t.fecha <= fechahasta,
            );
        }
        if (tipo != "") {
            movimientosrows = movimientosrows.filter((t) => t.tipo == tipo);
        }
    }
    function clickTodos() {
        if (todos) {
            todos = false;
            ninguno = true;
            algunos = false;
            selecthashmap = {};
        } else if (ninguno) {
            ninguno = false;
            todos = true;

            for (let i = 0; i < movimientosrows.length; i++) {
                let s = movimientosrows[i];
                selecthashmap[s.id] = { ...s };
            }
        } else {
            todos = false;
            ninguno = true;
            algunos = false;
            selecthashmap = {};
        }
    }
    function clickFila(id) {
        if (selecthashmap[id]) {
            if (todos) {
                todos = false;
                algunos = true;
            }
            delete selecthashmap[id];
            if (Object.keys(selecthashmap).length == 0) {
                todos = false;
                algunos = false;
                ninguno = true;
            }
        } else {
            if (ninguno) {
                algunos = true;
                ninguno = false;
            }
            let s_idx = movimientosrows.findIndex((s) => s.id == id);
            if (s_idx != -1) {
                let s = movimientosrows[s_idx];
                selecthashmap[s.id] = {
                    ...s,
                };
            }
        }
    }
    function openViewModal(_id) {
        let m_idx = movimientos.findIndex((m) => m.id == _id);
        if (m_idx != -1) {
            detallemovimento = {
                ...movimientos[m_idx],
            };
            storage.save(detallemovimento)
            goto(pre + "/movimientos/" + _id);
        }
    }
    function openEditModal(_id) {}
    async function openDelModal(_id) {
        let m_idx = movimientos.findIndex((m) => m.id == _id);
        if (m_idx != -1) {
            let id_move = movimientos[m_idx].id;
            try {
                await eliminarMove(id_move);
                await getData();
                Swal.fire(
                    "Éxito eliminar",
                    "Se pudo eliminar el movimiento",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error eliminar",
                    "No se pudo eliminar el movimiento",
                    "error",
                );
            }
        }
    }
    function nuevoMovimiento() {
        goto(pre + "/movimientos");
    }
    async function getData() {
        let est = loadStorageEstablecimiento();
        cabnombre = est.nombre;
        movimientos = await getAll(est.id);
        cargados = true;
        filterUpdate();
    }
    onMount(async () => {
        await getData();
        if (esCelu) {
            pageSize = 5;
        }
    });
</script>

<Navbar2>
    {#if versionjava}
        <BuscadorMovimientos
            {movimientosrows}
            {cabnombre}
            selecthash={selecthashmap}
            bind:isOpenFilter
            bind:buscar
            bind:fechadesde
            bind:fechahasta
            bind:buscartipo={tipo}
            {limpiarFiltros}
            {prepararData}
            nuevo={nuevoMovimiento}
            {filterUpdate}
            {clickFilter}
            {versionjava}
        />
        {#if cargados}
            <!--Tabla-->
            <div
                class={`
                pt-1 md:pt-2 lg:pt-5
                hidden w-full xl:w-3/4 md:grid
                mx-auto px-4 max-w-7xl  
            `}
            >
                <div
                    class={`
                        overflow-hidden rounded-xl
                        border dark:border-gray-700
                    `}
                >
                    <TablaMovimientos
                        bind:pageSize
                        selecthash={selecthashmap}
                        {movimientosrows}
                        {todos}
                        {openDelModal}
                        {openViewModal}
                        {openEditModal}
                        {clickFila}
                        {clickTodos}
                    />
                </div>
            </div>
            <div
                class={`
                md:hidden 
                w-full grid grid-cols-1
                mx-auto py-6 px-4 max-w-7xl
            `}
            >
                <ListaMovimientos
                    bind:pageSize
                    selecthash={selecthashmap}
                    {movimientosrows}
                    {todos}
                    {openDelModal}
                    {openViewModal}
                    {openEditModal}
                    {clickFila}
                    {clickTodos}
                />
            </div>
        {/if}
    {:else}
        No esta habilitada la seccion
    {/if}
</Navbar2>
