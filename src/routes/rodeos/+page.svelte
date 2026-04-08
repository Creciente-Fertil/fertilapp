<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Buscador from "$lib/components/rodeos/Buscador.svelte";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import estilos from "$lib/stores/estilos";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { goto } from "$app/navigation";
    let pre = import.meta.env.VITE_PRE;
    //FILTROS
    import { createStorageProxy } from "$lib/filtros/filtros";
    import Limpiar from "$lib/filtros/Limpiar.svelte";
    import { shorterWord } from "$lib/stringutil/lib";
    import TablaRodeos from "$lib/components/rodeos/TablaRodeos.svelte";
    let ruta = import.meta.env.VITE_RUTA;

    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    let caber = createCaber();
    let cab = caber.cab;

    //Datos para mostrar
    let rodeos = $state([]);
    let rodeosrows = $state([]);
    let selecthash = $state({});
    let buscar = $state("");
    let mostrarVacios = $state(true);
    let cargadorodeos = $state(false);
    let todos = $state(false);
    let ninguno = $state(false);
    let algunos = $state(false);
    //Paginacion
    let pageSize = $state(15);

    let defaultfiltro = {
        buscar: "",
        mostrarVacios: true,
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("listarodeos", defaultfiltro);
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
    //rodeo
    let defaultRodeo = {
        id:"",
        nombre:"",
        edit:false
    }
    let detalleRodeo = $state({...defaultRodeo})
    let proxyLote = createStorageProxy("detalleRodeo", defaultRodeo);
    //Guardar
    let idrodeo = $state("");
    let nombre = $state("");
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
    async function getRodeos() {
        const records = await pb.collection("rodeos").getFullList({
            filter: `active=true && cab='${cab.id}'`,
            sort: "nombre",
        });
        rodeos = records;
        ordenar(rodeos);
        rodeosrows = rodeos;
        for (let i = 0; i < rodeos.length; i++) {
            let total = await getAnimalesTotal(rodeos[i].id);
            rodeos[i].total = total;
        }

        cargadorodeos = true;
    }
    function openNewModal() {
        idrodeo = "";
        nombre = "";
        nuevoModal.showModal();
    }
    async function guardar() {
        try {
            let data = {
                nombre,
                active: true,
                cab: cab.id,
            };
            let record = await pb.collection("rodeos").create(data);
            record.total = 0;
            rodeos.push(record);
            ordenar(rodeos);
            filterUpdate();
            Swal.fire("Éxito guardar", "Se pudo guardar el rodeo", "success");
        } catch (err) {
            console.error(err);
            Swal.fire("Error guardar", "No se pudo guardar el rodeo", "error");
        }
    }
    function openEditModal(id) {
        idrodeo = id;
        let rodeo = rodeos.filter((r) => r.id == idrodeo)[0];
        nombre = rodeo.nombre;
        proxyLote.save({id,edit:true,nombre})
        goto(pre+"/rodeos/"+id)
        //nuevoModal.showModal();
    }
    function openViewModal(id) {
        idrodeo = id;
        let rodeo = rodeos.filter((r) => r.id == idrodeo)[0];
        nombre = rodeo.nombre;
        proxyLote.save({id,edit:false,nombre})
        goto(pre+"/rodeos/"+id)
        //nuevoModal.showModal();
    }
    async function editar(id) {
        try {
            let data = {
                nombre,
            };
            const record = await pb.collection("rodeos").update(idrodeo, data);
            let idx = rodeos.findIndex((r) => r.id == idrodeo);
            let total = rodeos[idx].total;
            rodeos[idx] = record;
            rodeos[idx].total = total;
            ordenar(rodeos);
            filterUpdate();
            Swal.fire("Éxito editar", "Se pudo editar el rodeo", "success");
        } catch (err) {
            console.error(err);
            Swal.fire("Error editar", "No se pudo editar el rodeo", "error");
        }
        idrodeo = "";
        nombre = "";
    }
    async function eliminar(id) {
        Swal.fire({
            title: "Eliminar rodeo",
            text: "¿Seguro que deseas eliminar el rodeo?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                idrodeo = id;
                try {
                    let data = {
                        active: false,
                    };
                    const record = await pb
                        .collection("rodeos")
                        .update(idrodeo, data);
                    rodeos = rodeos.filter((r) => r.id != idrodeo);
                    ordenar(rodeos);
                    filterUpdate();
                    //ver como hago para actualizar la lista
                    Swal.fire(
                        "Rodeo eliminado!",
                        "Se eliminó el rodeo correctamente.",
                        "success",
                    );
                } catch (e) {
                    Swal.fire(
                        "Acción cancelada",
                        "No se pudo eliminar el rodeo",
                        "error",
                    );
                }
                idrodeo = "";
                nombre = "";
            }
        });
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
    function filterUpdate() {
        setProxyFilter();
        proxy.save(proxyfiltros);
        rodeosrows = rodeos;
        if (buscar != "") {
            rodeosrows = rodeosrows.filter((r) =>
                r.nombre
                    .toLocaleLowerCase()
                    .includes(buscar.toLocaleLowerCase()),
            );
        }
    }
    function cerrarModal() {
        idrodeo = "";
        nombre = "";
        nuevoModal.close();
    }
    async function getAnimalesTotal(id) {
        const results = await pb.collection("animales").getList(1, 10, {
            filter: `active = true && delete = false && rodeo='${id}'`,
        });
        return results.totalItems;
    }
    function goToAnimales() {
        proxyanimales.load();
        proxyfiltrosanimales.rodeoseleccion = [`${idrodeo}`];
        proxyanimales.save(proxyfiltrosanimales);
        goto(pre + "/animales");
    }
    onMount(async () => {
        proxyfiltros = proxy.load();
        setFilters();
        await getRodeos();
        filterUpdate();
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
        goto(pre+"/rodeos/0")
        //openNewModal();
    }
    function clickTodos() {}
    function clickFila(id) {}
</script>

<Navbar2>
    <Buscador
        {rodeosrows}
        bind:buscar
        {nuevo}
        {limpiarFiltros}
        {filterUpdate}
        {selecthash}
        cabnombre={cab.nombre}
    />
    {#if cargadorodeos}
        <!--Tabla-->
        <div
            class={`
                w-full xl:w-3/4 md:grid
                mx-auto py-1 px-4 max-w-7xl  
            `}
        >
            <div
                class={`
                overflow-hidden rounded-xl
                border dark:border-gray-700

            `}
            >
                <TablaRodeos
                    bind:pageSize
                    {selecthash}
                    {rodeosrows}
                    openView={openViewModal}
                    openEdit={openEditModal}
                    openEliminar={eliminar}
                    {clickFila}
                    {clickTodos}
                    {todos}
                    {shorterWord}
                />
            </div>
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
        {#if idrodeo == ""}
            <h3 class="text-lg font-bold">Nuevo rodeo</h3>
        {:else}
            <h3 class="text-lg font-bold">Ver rodeo</h3>
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
                            >Debe escribir el nombre del rodeo</span
                        >
                    </div>
                {/if}
            </label>
        </div>
        <div class="modal-action justify-start">
            <form method="dialog">
                <!-- if there is a button, it will close the modal -->
                {#if idrodeo == ""}
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
                        onclick={() => eliminar(idrodeo)}>Eliminar</button
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
