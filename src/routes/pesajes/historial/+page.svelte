<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Exportar from "$lib/components/Exportar.svelte";
    import PocketBase from "pocketbase";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Buscador from "$lib/components/pesajes/Buscador.svelte";
    import HistorialPesajes from "$lib/components/pesajes/HistorialPesajes.svelte";
    import { slide } from "svelte/transition";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { createUserer } from "$lib/stores/user.svelte";
    import estilos from "$lib/stores/estilos";
    import { shorterWord } from "$lib/stringutil/lib";
    import * as XLSX from "xlsx";
    import { isEmpty } from "$lib/stringutil/lib";
    //FILTROS
    import { createStorageProxy } from "$lib/filtros/filtros";
    import Limpiar from "$lib/filtros/Limpiar.svelte";
    import { goto } from "$app/navigation";
    import TablaPesajes from "$lib/components/pesajes/TablaPesajes.svelte";

    let caber = createCaber();
    let cab = caber.cab;
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);

    //Editar
    let caravana = $state("");
    let pesonuevo = $state(0);
    let pesoanterior = $state(0);
    let fecha = $state("");
    let idpesaje = $state("");
    //Datos filtrar
    let selecthash = $state({});
    let pageSize = $state(15);
    let todos = $state(false);
    let buscarcaravana = $state("");
    let fechadesde = $state("");
    let fechahasta = $state("");
    let pesajes = $state([]);
    let pesajesrows = $state([]);
    let cargados = $state(false);
    let defaultfiltro = {
        buscarcaravana: "",
        fechadesde: "",
        fechahasta: "",
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("historialpesajes", defaultfiltro);
    //open filter
    let isOpenFilter = $state(false);
    function clickFilter() {
        isOpenFilter = !isOpenFilter;
    }
    async function getPesajes() {
        const records = await pb.collection("pesaje").getFullList({
            sort: "-fecha",
            expand: "animal,animal.cab",
            filter: `animal.cab = '${cab.id}'`,
        });
        pesajes = records;
        cargados = true;
    }
    function setFilters() {
        buscarcaravana = proxyfiltros.buscarcaravana;
        fechadesde = proxyfiltros.fechadesde;
        fechahasta = proxyfiltros.fechahasta;
    }

    function setProxyFilter() {
        proxyfiltros.buscarcaravana = buscarcaravana;
        proxyfiltros.fechadesde = fechadesde;
        proxyfiltros.fechahasta = fechahasta;
    }

    function limpiarFiltros() {
        proxyfiltros = { ...defaultfiltro };

        setFilters();
        filterUpdate();
    }

    function filterUpdate() {
        setProxyFilter();
        proxy.save(proxyfiltros);
        pesajesrows = pesajes;
        if (!isEmpty(buscarcaravana)) {
            pesajesrows = pesajesrows.filter((p) =>
                p.expand.animal.caravana
                    .toLocaleLowerCase()
                    .includes(buscarcaravana.toLocaleLowerCase()),
            );
        }
        if (!isEmpty(fechadesde)) {
            pesajesrows = pesajesrows.filter((p) => p.fecha >= fechadesde);
        }
        if (!isEmpty(fechahasta)) {
            pesajesrows = pesajesrows.filter((p) => p.fecha <= fechahasta);
        }
    }
    async function editarPesaje() {
        try {
            let data = {
                fecha:
                    new Date(fecha).toISOString().split("T")[0] + " 03:00:00",
                pesonuevo,
            };
            await pb.collection("pesaje").update(idpesaje, data);
            await getPesajes();
            filterUpdate();
            Swal.fire(
                "Éxito editar pesaje",
                "Se pudo editar el pesaje",
                "success",
            );
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error editar pesaje",
                "No se pudo editar el pesaje",
                "error",
            );
        }
        detallePesaje.close();
    }
    function confirmDelete() {
        Swal.fire({
            title: "Eliminar pesaje",
            text: "¿Seguro que deseas eliminar el pesaje?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                eliminar();
            }
        });
    }
    async function eliminar() {
        try {
            await pb.collection("pesaje").delete(idpesaje);
            await getPesajes();
            filterUpdate();
            detallePesaje.close();
        } catch (err) {
            console.error(err);
            detallePesaje.close();
        }
    }
    function openDetalle(id) {
        idpesaje = id;
        let pesaje = pesajes.filter((p) => p.id == idpesaje)[0];
        caravana = pesaje.expand.animal.caravana;
        fecha = pesaje.fecha.split(" ")[0];
        pesoanterior = pesaje.pesoanterior;
        pesonuevo = pesaje.pesonuevo;

        detallePesaje.showModal();
    }
    function nuevo() {
        goto(pre + "/pesajes");
    }
    function ultimos() {
        goto(pre + "/pesajes/lista");
    }
    function clickTodos() {}
    function clickFila(id) {}
    onMount(async () => {
        proxyfiltros = proxy.load();
        setFilters();
        await getPesajes();
        filterUpdate();
    });
</script>

<Navbar2>
    <HistorialPesajes
        {pesajesrows}
        bind:isOpenFilter
        bind:buscar={buscarcaravana}
        bind:fechadesde
        bind:fechahasta
        {limpiarFiltros}
        {filterUpdate}
        {clickFilter}
        {nuevo}
        {ultimos}
        {selecthash}
    />
    {#if cargados}
        <!--Tabla-->
        <div
            class={`
                hidden w-full xl:w-3/4 md:grid
                mx-auto py-1 px-4 max-w-7xl  
            `}
        >
            <div
                class={`
                overflow-hidden rounded-xl
                border dark:border-gray-700

            `}
            >
                <TablaPesajes
                    bind:pageSize
                    {selecthash}
                    {pesajesrows}
                    openViewModal={openDetalle}
                    openEditModal={openDetalle}
                    openDelModal={confirmDelete}
                    {clickTodos}
                    {clickFila}
                    bind:todos
                />
            </div>
        </div>

        <!--Lista de pesajes sin ordenar-->
        <div class="block w-full md:hidden justify-items-center mx-1">
            {#each pesajesrows as p}
                <div
                    class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
                >
                    <button onclick={() => openDetalle(p.id)}>
                        <div class="block p-4">
                            <div class="grid grid-cols-2 gap-y-2">
                                <div class="flex items-start">
                                    <span>Fecha:</span>
                                    <span class="mx-1 font-semibold">
                                        {new Date(p.fecha).toLocaleDateString()}
                                    </span>
                                </div>
                                <div class="flex items-start">
                                    <span>Caravana:</span>
                                    <span class="mx-1 font-semibold">
                                        {`${p.expand.animal.caravana}`}
                                    </span>
                                </div>
                                <div class="flex items-start">
                                    <span>Peso anterior:</span>
                                    <span class="mx-1 font-semibold">
                                        {`${p.pesoanterior}`}
                                    </span>
                                </div>
                                <div class="flex items-start">
                                    <span>Peso nuevo:</span>
                                    <span class="mx-1 font-semibold">
                                        {`${p.pesonuevo}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            {/each}
        </div>
    {/if}
</Navbar2>
<dialog
    id="detallePesaje"
    class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle"
>
    <div
        class="
        modal-box w-11/12 max-w-xl
        bg-gradient-to-br from-white to-gray-100
        dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl"
                >✕</button
            >
        </form>
        <h3 class="text-lg font-bold">Ver pesaje</h3>
        <div class="form-control">
            <div class="grid grid-cols-2 gap-1 lg:gap-6 mx-1 mb-2">
                <div class="mb-1 lg:mb-0">
                    <label for="caravana" class="label">
                        <span class="label-text text-base">Caravana</span>
                    </label>
                    <label
                        for="caravana"
                        class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                    >
                        {caravana}
                    </label>
                </div>
                <div class="mb-1 lg:mb-0">
                    <label for="caravana" class="label">
                        <span class="label-text text-base">Fecha</span>
                    </label>
                    <label class="input-group">
                        <input
                            id="fecha"
                            type="date"
                            class={`
                                input input-bordered 
                                w-full
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
                <div class="mb-1 lg:mb-0">
                    <label for="pesoanterior" class="label">
                        <span class="label-text text-base"
                            >Peso anterior(KG)</span
                        >
                    </label>
                    <label
                        for="pesoanterior"
                        class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                    >
                        {pesoanterior}
                    </label>
                </div>
                <div class="mb-1 lg:mb-0">
                    <label for="pesonuevo" class="label">
                        <span class="label-text text-base">Peso nuevo(KG)</span>
                    </label>
                    <input
                        id="pesonuevo"
                        type="number"
                        class={`
                            input 
                            input-bordered 
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                            w-full
                            ${estilos.bgdark2}
                        `}
                        bind:value={pesonuevo}
                        oninput={() => (pesonuevo = Math.max(pesonuevo, 0))}
                    />
                </div>
            </div>
        </div>
        <div class="modal-action justify-start">
            <button class="btn btn-success text-white" onclick={editarPesaje}
                >Editar</button
            >
            <button class="btn btn-error text-white" onclick={eliminar}
                >Eliminar</button
            >
            <button
                class={`
                    btn 
                    bg-transparent border rounded-lg focus:outline-none transition-colors duration-200
                    ${estilos.btnsecondary}`}
                onclick={() => detallePesaje.close()}>Cerrar</button
            >
        </div>
    </div>
</dialog>
