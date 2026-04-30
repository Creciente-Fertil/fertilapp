<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Buscador from "$lib/components/lotes/Buscador.svelte";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import estilos from "$lib/stores/estilos";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosList } from "$lib/permisosutil/lib";
    import { goto } from "$app/navigation";
    //filtros
    import { createStorageProxy } from "$lib/filtros/filtros";
    import Limpiar from "$lib/filtros/Limpiar.svelte";
    import TablaLotes from "$lib/components/lotes/TablaLotes.svelte";
    import { shorterWord } from "$lib/stringutil/lib";
    import { eliminarLote, getAll } from "$lib/java/lotes/lotesback";
    import ListaLotes from "$lib/components/lotes/ListaLotes.svelte";
    import { loadStorageEstablecimiento } from "$lib/java/establecimientos/establecimientostorage";
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    let caber = createCaber();
    let cab = $state(caber.cab);
    let per = createPer();
    let userpermisos = getPermisosList(per.per.permisos);

    //ver java
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");

    async function toggleJava() {
        versionjava = !versionjava;
        await getLotes();
    }

    //Datos para mostrar
    let lotes = $state([]);
    let lotesrows = $state([]);
    let selecthash = $state({});
    let buscar = $state("");
    let mostrarVacios = $state(true);
    let cargadolotes = $state(false);
    let todos = $state(false);
    let ninguno = $state(true);
    let algunos = $state(false);
    //Paginacion
    let pageSize = $state(15);
    //filtros

    let defaultfiltro = {
        buscar: "",
        mostrarVacios: true,
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("listalotes", defaultfiltro);

    //filtros animales
    let defaultfiltroanimales = {
        buscar: "",
        rodeobuscar: "",
        rodeoseleccion: [],
        loteseleccion: [],
        categoriaseleccion: [],
        sexobuscar: "",
        lotebuscar: "",
        estadobuscar: "",
        categoriabuscar: "",
        activosbuscar: "activos",
    };
    let proxyfiltrosanimales = $state({
        ...defaultfiltroanimales,
    });
    let proxyanimales = createStorageProxy("listaanimales", defaultfiltro);

    //lote
    let defaultLote = {
        id: "",
        nombre: "",
        edit: false,
        versionjava:false
    };
    let detalleLote = $state({ ...defaultLote });
    let proxyLote = createStorageProxy("detalleLote", defaultLote);
    //Guardar
    let idlote = $state("");
    let nombre = $state("");

    //filtros
    function goToAnimales() {
        proxyanimales.load();
        proxyfiltrosanimales.loteseleccion = [`${idlote}`];
        proxyanimales.save(proxyfiltrosanimales);
        goto(pre + "/animales");
    }

    //validacciones
    let malnombre = $state(false);
    let botonhabilitado = $state(false);
    function ordenar(lista) {
        lista.sort((r1, r2) =>
            r1.nombre.toLocaleLowerCase() > r2.nombre.toLocaleLowerCase()
                ? 1
                : -1,
        );
    }
    async function getLotes() {
        if (!versionjava) {
            const records = await pb.collection("lotes").getFullList({
                filter: `active=True && cab='${cab.id}'`,
                sort: "nombre",
            });
            lotes = records;
            ordenar(lotes);
            lotesrows = lotes;
            for (let i = 0; i < lotes.length; i++) {
                let total = await getAnimalesTotal(lotes[i].id);
                lotes[i].total = total;
            }
            filterUpdate();
            cargadolotes = true;
        } else {
            cab = loadStorageEstablecimiento()
            let data_lotes = await getAll(cab.id);
            lotes = data_lotes;
            lotesrows = lotes;
            
            for (let i = 0; i < lotes.length; i++) {
                lotes[i].total = lotes[i].animalCount;
            }
            filterUpdate();
            cargadolotes = true;
        }
    }
    function openNewModal() {
        idlote = "";
            nombre = "";
            goto(pre + "/lotes/0");
        
        //if (userpermisos[1]) {
        //    idlote = "";
        //    nombre = "";
        //    goto(pre + "/lotes/0");
        //    //nuevoModal.showModal();
        //} else {
        //    Swal.fire(
        //        "Error lotes",
        //        "No tienes permisos para guardar lotes",
        //        "error",
        //    );
        //}
    }
    function setFilters() {
        buscar = proxyfiltros.buscar;
    }

    function setProxyFilter() {
        proxyfiltros.buscar = buscar;
    }
    function limpiarFiltros() {
        proxyfiltros = { ...defaultfiltro };

        setFilters();
        filterUpdate();
    }
    async function guardar() {
        try {
            let data = {
                nombre,
                active: true,
                cab: cab.id,
            };
            let record = await pb.collection("lotes").create(data);
            record.total = 0;
            lotes.push(record);
            ordenar(lotes);
            filterUpdate();
            Swal.fire("Éxito guardar", "Se pudo guardar el lote", "success");
        } catch (err) {
            console.error(err);
            Swal.fire("Error guardar", "No se pudo guardar el lote", "error");
        }
    }
    function openEditModal(id) {
        idlote = id;
        let lote = lotes.filter((r) => r.id == idlote)[0];
        nombre = lote.nombre;
        proxyLote.save({ id, nombre, edit: true,versionjava });
        goto(pre + "/lotes/" + idlote);

        //nuevoModal.showModal();
    }
    function openViewModal(id) {
        idlote = id;
        let lote = lotes.filter((r) => r.id == idlote)[0];
        nombre = lote.nombre;
        proxyLote.save({ id, nombre, edit: false,versionjava });
        goto(pre + "/lotes/" + idlote);

        //nuevoModal.showModal();
    }
    async function editar(id) {
        try {
            let data = {
                nombre,
            };

            const record = await pb.collection("lotes").update(idlote, data);
            let idx = lotes.findIndex((r) => r.id == idlote);
            let total = lotes[idx].total;
            lotes[idx] = record;
            lotes[idx].total = total;
            ordenar(lotes);
            filterUpdate();
            Swal.fire("Éxito editar", "Se pudo editar el lote", "success");
        } catch (err) {
            console.error(err);
            Swal.fire("Error editar", "No se pudo editar el lote", "error");
        }
        idlote = "";
        nombre = "";
    }
    async function eliminar(id) {
        Swal.fire({
            title: "Eliminar lote",
            text: "¿Seguro que deseas eliminar el lote?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                idlote = id;
                try {
                    let data = {
                        active: false,
                    };
                    if (versionjava) {
                        await eliminarLote(idlote);
                    } else {
                        const record = await pb
                            .collection("lotes")
                            .update(idlote, data);
                    }

                    lotes = lotes.filter((r) => r.id != idlote);
                    ordenar(lotes);
                    filterUpdate();
                    //ver como hago para actualizar la lista
                    Swal.fire(
                        "Lote eliminada!",
                        "Se eliminó el lote correctamente.",
                        "success",
                    );
                } catch (e) {
                    Swal.fire(
                        "Acción cancelada",
                        "No se pudo eliminar el lote",
                        "error",
                    );
                }
                idlote = "";
                nombre = "";
            }
        });
    }
    function filterUpdate() {
        setProxyFilter();
        proxy.save(proxyfiltros);
        lotesrows = lotes;
        if (buscar != "") {
            lotesrows = lotesrows.filter((r) =>
                r.nombre
                    .toLocaleLowerCase()
                    .includes(buscar.toLocaleLowerCase()),
            );
        }
    }
    function cerrarModal() {
        idlote = "";
        nombre = "";
        nuevoModal.close();
    }
    async function getAnimalesTotal(id) {
        const results = await pb.collection("animales").getList(1, 10, {
            filter: `active = true && delete = false && lote='${id}'`,
        });
        return results.totalItems;
    }
    onMount(async () => {
        proxyfiltros = proxy.load();
        setFilters();
        
        await getLotes();
    });
    function isEmpty(str) {
        return !str || str.length === 0;
    }
    function validarBoton() {
        botonhabilitado = true;
        if (isEmpty(nombre)) {
            botonhabilitado = false;
        }
    }
    function oninput() {
        validarBoton();

        if (isEmpty(nombre)) {
            malnombre = true;
        } else {
            malnombre = false;
        }
    }
    function nuevo() {
        openNewModal();
    }
    function clickTodos() {
        if (todos) {
            todos = false;
            ninguno = true;
            algunos = false;
            selecthash = {};
        } else if (ninguno) {
            ninguno = false;
            todos = true;

            for (let i = 0; i < lotesrows.length; i++) {
                let s = lotesrows[i];
                selecthash[s.id] = { ...s };
            }
        } else {
            todos = false;
            ninguno = true;
            algunos = false;
            selecthash = {};
        }
    }
    function clickFila(id) {
        if (selecthash[id]) {
            if (todos) {
                todos = false;
                algunos = true;
            }
            delete selecthash[id];
            if (Object.keys(selecthash).length == 0) {
                todos = false;
                algunos = false;
                ninguno = true;
            }
        } else {
            if (ninguno) {
                algunos = true;
                ninguno = false;
            }
            let s_idx = lotesrows.findIndex((s) => s.id == id);
            if (s_idx != -1) {
                let s = lotesrows[s_idx];
                selecthash[s.id] = {
                    ...s,
                };
            }
        }
    }
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Navbar2>
    <Buscador
        cabnombre={cab.nombre}
        {selecthash}
        {lotesrows}
        bind:buscar
        {limpiarFiltros}
        {filterUpdate}
        {nuevo}
        {versionjava}
        {toggleJava}
        {esdev}
    />

    {#if cargadolotes}
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
                <TablaLotes
                    bind:pageSize
                    {selecthash}
                    {lotesrows}
                    openView={openViewModal}
                    openEdit={openEditModal}
                    openEliminar={eliminar}
                    {clickFila}
                    {clickTodos}
                    {todos}
                    {shorterWord}
                    {esCelu}
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
            <ListaLotes
                bind:pageSize
                {selecthash}
                {lotesrows}
                openView={openViewModal}
                openEdit={openEditModal}
                openEliminar={eliminar}
                {clickFila}
                {clickTodos}
                {todos}
                {shorterWord}
                {esCelu}
            />
        </div>
    {/if}
</Navbar2>
<dialog
    id="nuevoModal"
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
        {#if idlote == ""}
            <h3 class="text-lg font-bold">Nuevo Lote</h3>
        {:else}
            <h3 class="text-lg font-bold">Ver Lote</h3>
        {/if}
        <div class="form-control">
            <label for="nombre" class="label">
                <span class="label-text text-base">Nombre</span>
            </label>
            <label class="input-group">
                <input
                    id="nombre"
                    type="text"
                    class={`
                            input input-bordered 
                            w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                    bind:value={nombre}
                    {oninput}
                />
                {#if malnombre}
                    <div class="label">
                        <span class="label-text-alt text-red-500"
                            >Debe escribir el nombre del lote</span
                        >
                    </div>
                {/if}
            </label>
        </div>
        <div class="modal-action justify-start">
            <form method="dialog">
                <!-- if there is a button, it will close the modal -->
                {#if idlote == ""}
                    <button
                        class="btn btn-success text-white"
                        disabled={!botonhabilitado}
                        onclick={guardar}>Guardar</button
                    >
                {:else}
                    <button
                        class="btn btn-success text-white"
                        disabled={!botonhabilitado}
                        onclick={editar}>Editar</button
                    >
                    <button
                        class="btn btn-error text-white"
                        onclick={() => eliminar(idlote)}>Eliminar</button
                    >
                {/if}
                <button class="btn btn-info text-white" onclick={goToAnimales}
                    >Ver animales</button
                >
                <button class="btn btn-neutral" onclick={cerrarModal}
                    >Cerrar</button
                >
            </form>
        </div>
    </div>
</dialog>
