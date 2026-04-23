<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Buscador from "$lib/components/nacimientos/Buscador.svelte";
    import Exportar from "$lib/components/Exportar.svelte";
    import PocketBase from "pocketbase";
    import { slide } from "svelte/transition";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import sexos from "$lib/stores/sexos";
    import estilos from "$lib/stores/estilos";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { guardarHistorial } from "$lib/historial/lib";
    import PredictSelect from "$lib/components/PredictSelect.svelte";
    import { verificarNivel } from "$lib/permisosutil/lib";
    import AgregarAnimal from "$lib/components/eventos/AgregarAnimal.svelte";
    import { goto } from "$app/navigation";
    import { shorterWord } from "$lib/stringutil/lib";
    //Filtros

    import { createStorageProxy } from "$lib/filtros/filtros";
    import Limpiar from "$lib/filtros/Limpiar.svelte";
    //Permisos
    import {
        getPermisosCabUser,
        getPermisosEstXColab,
    } from "$lib/permisosutil/lib";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosList } from "$lib/permisosutil/lib";
    import RadioButton from "$lib/components/RadioButton.svelte";
    import CustomDate from "$lib/components/CustomDate.svelte";
    import TablaNacimientos from "$lib/components/nacimientos/TablaNacimientos.svelte";
    import ListaNacimientos from "$lib/components/nacimientos/ListaNacimientos.svelte";
    import {
        eliminarNacimiento,
        getAll,
    } from "$lib/java/nacimientos/nacimientosback";
    let versionjava = $state(false);
    async function toggleJava() {
        versionjava = !versionjava;
        await getNacimientos();
        filterUpdate();
    }
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let caber = createCaber();
    let cab = caber.cab;
    let ruta = import.meta.env.VITE_RUTA;
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    let pre = import.meta.env.VITE_PRE;
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let usuarioid = $state("");
    //Datos filtrar
    let pageSize = $state(15);
    let nacimientos = $state([]);
    let nacimientosrow = $state([]);
    let selecthash = $state({});
    let buscar = $state("");
    let fechadesde = $state("");
    let fechahasta = $state("");
    let isOpenFilter = $state(false);
    let buscarmadre = $state("");
    let buscarpadre = $state("");
    let cargadoanimales = $state(false);
    let cargadonacimientos = $state(false);
    let todos = $state(false);
    let algunos = $state(false);
    let ninguno = $state(true);

    let defaultfiltro = {
        buscar: "",
        fechadesde: "",
        fechahasta: "",
        buscarmadre: "",
        buscarpadre: "",
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("listanacimientos", defaultfiltro);
    //Detalle para nacimiento
    let defaultNacimiento = {
        edit: false,
        idanimal: "",
        caravana: "",
        id: "",
        fecha: "",
        madre: "",
        nombremadre: "",
        padre: "",
        nombrepadre: "",
        observacion: "",
    };
    let detalleNacimiento = $state({ ...defaultNacimiento });
    let proxyNacimiento = createStorageProxy(
        "detalleNacimiento",
        defaultNacimiento,
    );
    //Datos nacimiento
    let agregaranimal = $state(false);
    let nacimiento = $state(null);
    let idnacimiento = $state("");
    let caravana = $state("");
    let sexo = $state("");
    let padre = $state("");
    let madre = $state("");
    let peso = $state("");
    let categoria = $state("");
    let nombremadre = $state("");
    let nombrepadre = $state("");
    let cadenamadre = $state("");
    let cadenapadre = $state("");
    let fecha = $state("");
    let madres = $state([]);
    let padres = $state([]);
    let listamadres = $state([]);
    let listapadres = $state([]);
    let idanimal = $state("");
    let observacion = $state("");
    let totalNacimientosEncontrados = $state(0);
    //Validacion
    let malmadre = $state(false);
    let malpadre = $state(false);
    let malfecha = $state(false);
    let malcaravana = $state(false);
    let malsexo = $state(false);
    let botonhabilitado = $state(false);
    function clickFilter() {
        isOpenFilter = !isOpenFilter;
    }
    function isEmpty(str) {
        return !str || str.length === 0;
    }
    async function getAnimales() {
        let recordsa = await pb.collection("animales").getFullList({
            filter: `active=true && cab='${cab.id}' && delete = false`,
            expand: "nacimiento",
        });
        recordsa = recordsa.sort((a, b) =>
            a.caravana.toLocaleLowerCase() < b.caravana.toLocaleLowerCase()
                ? -1
                : 1,
        );
        madres = recordsa.filter((a) => a.sexo == "H" || a.sexo == "F");
        padres = recordsa.filter((a) => a.sexo == "M");
        cargadoanimales = true;
        listamadres = madres.map((item) => {
            return {
                id: item.id,
                nombre: item.caravana,
            };
        });
        listamadres.sort((a1, a2) =>
            a1.nombre.toLocaleLowerCase() < a2.nombre.toLocaleLowerCase()
                ? -1
                : 1,
        );
        listapadres = padres.map((item) => {
            return {
                id: item.id,
                nombre: item.caravana,
            };
        });
        listapadres.sort((a1, a2) =>
            a1.nombre.toLocaleLowerCase() < a2.nombre.toLocaleLowerCase()
                ? -1
                : 1,
        );
    }
    async function getNacimientos() {
        if (!versionjava) {
            const recordsn = await pb.collection("nacimientosall").getFullList({
                filter: `cab='${cab.id}'`,
                sort: "-fecha",
                expand: "madre,padre",
            });
            nacimientos = recordsn;
            nacimientosrow = nacimientos;
            cargadonacimientos = true;
        } else {
            let data_nacimientos = await getAll();
            nacimientos = data_nacimientos;
            nacimientosrow = nacimientos;
            cargadonacimientos = true;
        }
    }
    async function guardar() {
        if (agregaranimal) {
            let verificar = await verificarNivel(cab.id);
            if (!verificar) {
                Swal.fire(
                    "Error guardar",
                    `No tienes el nivel de la cuenta para tener más animales`,
                    "error",
                );
                return;
            }
        }
        //No todo nacimiento es nuevo animal

        try {
            let ms = madres.filter((ma) => ma.id == madre);
            let m = {
                id: "",
                nombremadre: "",
                rodeo: "",
                lote: "",
            };
            if (ms.length > 0) {
                m.id = ms[0].id;
                m.nombremadre = ms[0].caravana;
                m.lote = ms[0].lote;
                m.rodeo = ms[0].rodeo;
            }
            let tipomadre = m.categoria;
            let dataparicion = {
                madre: m.id,
                padre,
                fecha: fecha + " 03:00:00",
                nombremadre: m.nombremadre,
                nombrepadre,
                observacion,
                cab: cab.id,
            };
            const recordparicion = await pb
                .collection("nacimientos")
                .create(dataparicion);
            if (agregaranimal) {
                let data = {
                    caravana,
                    active: true,
                    delete: false,
                    fechanacimiento: fecha + " 03:00:00",
                    sexo,
                    cab: cab.id,
                    peso,
                    lote: m.lote,
                    rodeo: m.rodeo,
                    nacimiento: recordparicion.id,
                };
                let recorda = await pb.collection("animales").create(data);
            }
            //Pensar las fechas
            //if(m.id != ""){
            //    let datamadre = {
            //        prenada:0
            //    }
            //    if(m.categoria == "vaquillona"){
            //        datamadre.categoria = "vaca"
            //        let datamadre = {
            //            categoria:"vaca"
            //        }
            //    }
            //    await guardarHistorial(pb,madre)
            //    await pb.collection('animales').update(madre,datamadre)
            //}

            Swal.fire(
                "Éxito guardar",
                "Se pudo guardar el nacimiento con exito",
                "success",
            );

            await getNacimientos();
            filterUpdate();
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error guardar",
                "Hubo un error para guardar el nacimiento",
                "error",
            );
        }
    }
    async function editar() {
        let ms = madres.filter((ma) => ma.id == madre);
        let m = {
            id: "",
            nombremadre: "",
            rodeo: "",
            lote: "",
        };
        if (ms.length > 0) {
            m.id = ms[0].id;
            m.nombremadre = ms[0].caravana;
            m.lote = ms[0].lote;
            m.rodeo = ms[0].rodeo;
        }
        //Si es que hay un animal
        let datanimal = {
            fechanacimiento: fecha + " 03:00:00",
        };
        let dataparicion = {
            madre: m.id,
            padre,
            fecha: fecha + " 03:00:00",
            nombremadre: m.nombremadre,
            nombrepadre,
            observacion,
        };
        try {
            //const recorda = await pb.collection('animales').update(idanimal, datanimal);
            const record = await pb
                .collection("nacimientos")
                .update(idnacimiento, dataparicion);
            Swal.fire(
                "Éxito editar",
                "Se pudo editar el nacimiento con exito",
                "success",
            );

            await getNacimientos();
            filterUpdate();
            idnacimiento = "";
            caravana = "";
            sexo = "";
            padre = "";
            madre = "";
            nombremadre = "";
            nombrepadre = "";
            fecha = "";
            observacion = "";
            peso = "";
            idanimal = "";
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error editar",
                "Hubo un error para editar el nacimiento",
                "error",
            );
        }
    }
    function limpiarFiltros() {
        proxyfiltros = { ...defaultfiltro };
        setFilters();
        filterUpdate();
    }
    function setFilters() {
        buscar = proxyfiltros.buscar;
        fechadesde = proxyfiltros.fechadesde;
        fechahasta = proxyfiltros.fechahasta;
        buscarmadre = proxyfiltros.buscarmadre;
        buscarpadre = proxyfiltros.buscarpadre;
    }
    function setProxyFilter() {
        proxyfiltros.buscar = buscar;
        proxyfiltros.fechadesde = fechadesde;
        proxyfiltros.fechahasta = fechahasta;
        proxyfiltros.buscarmadre = buscarmadre;
        proxyfiltros.buscarpadre = buscarpadre;
    }
    function filterUpdate() {
        nacimientosrow = nacimientos;
        setProxyFilter();
        proxy.save(proxyfiltros);
        totalNacimientosEncontrados = nacimientosrow.length;
        if (buscar != "") {
            nacimientosrow = nacimientosrow.filter((n) =>
                n.caravana
                    .toLocaleLowerCase()
                    .includes(buscar.toLocaleLowerCase()),
            );
        }
        if (fechadesde != "") {
            nacimientosrow = nacimientosrow.filter(
                (t) => t.fecha >= fechadesde,
            );
        }
        if (fechahasta != "") {
            nacimientosrow = nacimientosrow.filter(
                (t) => t.fecha <= fechahasta,
            );
        }
        if (buscarmadre != "") {
            nacimientosrow = nacimientosrow.filter((t) =>
                t.nombremadre
                    .toLocaleLowerCase()
                    .includes(buscarmadre.toLocaleLowerCase()),
            );
        }
        if (buscarpadre != "") {
            nacimientosrow = nacimientosrow.filter((t) =>
                t.nombrepadre
                    .toLocaleLowerCase()
                    .includes(buscarpadre.toLocaleLowerCase()),
            );
        }
        totalNacimientosEncontrados = nacimientosrow.length;
    }
    function openNewModal() {
        idnacimiento = "";
        caravana = "";
        sexo = "";
        padre = "";
        madre = "";
        nombremadre = "";
        nombrepadre = "";
        fecha = "";
        observacion = "";
        peso = "";
        idanimal = "";
        botonhabilitado = false;
        malcaravana = false;
        malfecha = false;
        malmadre = false;
        malpadre = false;
        goto(pre + "/nacimientos/0");
        //nuevoModal.showModal();
    }
    function cerrar() {
        nuevoModal.close();
    }
    function openEditModal(id) {
        botonhabilitado = true;
        malcaravana = false;
        malfecha = false;
        malmadre = false;
        malpadre = false;
        idnacimiento = id;

        nacimiento = nacimientos.filter((n) => n.id == id)[0];
        if (nacimiento.padre) {
            padre = nacimiento.padre;
            nombrepadre = nacimiento.nombrepadre;
        } else {
            padre = "";
        }
        if (nacimiento.madre) {
            madre = nacimiento.madre;
            nombremadre = nacimiento.nombremadre;
        } else {
            madre = "";
        }
        fecha = nacimiento.fecha.split(" ")[0];
        nombremadre = nacimiento.nombremadre;
        nombrepadre = nacimiento.nombrepadre;
        observacion = nacimiento.observacion;
        caravana = nacimiento.caravana;
        idanimal = nacimiento.animalid;
        detalleNacimiento = {
            fecha,
            nombremadre,
            madre,
            nombrepadre,
            padre,
            caravana,
            idanimal,
            id,
            edit: true,
            observacion,
        };

        proxyNacimiento.save(detalleNacimiento);
        goto(pre + "/nacimientos/" + id);
        //nuevoModal.showModal();
    }
    function openViewModal(id) {
        botonhabilitado = true;
        malcaravana = false;
        malfecha = false;
        malmadre = false;
        malpadre = false;
        idnacimiento = id;

        nacimiento = nacimientos.filter((n) => n.id == id)[0];
        if (nacimiento.padre) {
            padre = nacimiento.padre;
            nombrepadre = nacimiento.nombrepadre;
        } else {
            padre = "";
        }
        if (nacimiento.madre) {
            madre = nacimiento.madre;
            nombremadre = nacimiento.nombremadre;
        } else {
            madre = "";
        }
        fecha = nacimiento.fecha.split(" ")[0];
        nombremadre = nacimiento.nombremadre;
        nombrepadre = nacimiento.nombrepadre;
        observacion = nacimiento.observacion;
        caravana = nacimiento.caravana;
        idanimal = nacimiento.animalid;
        detalleNacimiento = {
            fecha,
            nombremadre,
            madre,
            nombrepadre,
            padre,
            caravana,
            idanimal,
            id,
            edit: false,
            observacion,
        };
        proxyNacimiento.save(detalleNacimiento);
        goto(pre + "/nacimientos/" + id);
        //nuevoModal.showModal();
    }
    function eliminar(id) {
        Swal.fire({
            title: "Eliminar nacimiento",
            text: "¿Seguro que deseas eliminar el nacimiento?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                idnacimiento = id;

                try {
                    if (versionjava) {
                        await eliminarNacimiento(id);
                        nacimientos = nacimientos.filter(
                            (n) => n.id != idnacimiento,
                        );
                    } else {
                        await pb.collection("nacimientos").delete(idnacimiento);
                        nacimientos = nacimientos.filter(
                            (n) => n.id != idnacimiento,
                        );
                    }

                    //const recorda = await pb.collection('animales').getFirstListItem(`nacimiento='${idnacimiento}'`, {});

                    //const recordupdate = await pb.collection('animales').update(recorda.id, {nacimiento:""});
                    filterUpdate();
                    Swal.fire(
                        "Nacimiento eliminado!",
                        "Se eliminó el nacimiento correctamente.",
                        "success",
                    );
                } catch (e) {
                    console.error(e);
                    Swal.fire(
                        "Acción cancelada",
                        "No se pudo eliminar al nacimiento",
                        "error",
                    );
                }
                idnacimiento = "";
                nacimiento = null;
            }
        });
    }
    onMount(async () => {
        proxyfiltros = proxy.load();
        setFilters();
        let pb_json = await JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        await getNacimientos();
        ordenarNacimientos(forma);
        filterUpdate();
        await getAnimales();
        if (esCelu) {
            pageSize = 5;
        }
    });
    function clickTodos() {
        if (todos) {
            todos = false;
            ninguno = true;
            algunos = false;
            selecthash = {};
        } else if (ninguno) {
            ninguno = false;
            todos = true;

            for (let i = 0; i < nacimientosrow.length; i++) {
                let s = nacimientosrow[i];
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
            let s_idx = nacimientosrow.findIndex((s) => s.id == id);
            if (s_idx != -1) {
                let s = nacimientosrow[s_idx];
                selecthash[s.id] = {
                    ...s,
                };
            }
        }
    }
    function onwriteMadre() {}
    function onwritePadre() {
        onchange("PADRE");
    }
    function onelegirMadre() {
        onchange("MADRE");
    }
    function onelegirPadre() {
        onchange("PADRE");
    }
    function cerrarModal() {
        idnacimiento = "";
        caravana = "";
        sexo = "";
        padre = "";
        madre = "";
        nombremadre = "";
        nombrepadre = "";
        fecha = "";
        observacion = "";
        peso = "";
        nuevoModal.close();
    }
    function getNombreMadre() {
        let m = madres.filter((item) => item.id == madre)[0];
        nombremadre = m.caravana;
        onchange("MADRE");
    }
    function getNombrePadre() {
        let p = padres.filter((item) => item.id == padre)[0];
        nombrepadre = p.caravana;
        onchange("PADRE");
    }
    function validarBoton() {
        botonhabilitado = true;
        if (isEmpty(fecha)) {
            botonhabilitado = false;
        }
        if (isEmpty(madre)) {
            botonhabilitado = false;
        }
        //if(isEmpty(nombrepadre)){
        //    botonhabilitado = false
        //
        //}
        //if(idnacimiento == "" && isEmpty(sexo)){
        //    botonhabilitado = false
        //
        //}
    }
    function onchange(nombreCampo) {
        validarBoton();
        if (nombreCampo == "FECHA") {
            if (isEmpty(fecha)) {
                malfecha = true;
            } else {
                malfecha = false;
            }
        }
        if (nombreCampo == "MADRE") {
            if (isEmpty(madre)) {
                malmadre = true;
            } else {
                malmadre = false;
            }
        }
    }
    function prepararData(item) {
        return {
            CARAVANA: item.caravana,
            FECHA: new Date(item.fecha).toLocaleDateString(),
            MADRE: item.nombremadre,
            PADRE: item.nombrepadre,
            OBSERVACION: item.observacion,
        };
    }
    //Para el collapse de los ordenar
    let isOpenOrdenar = $state(false);
    function clickOrdenar() {
        isOpenOrdenar = !isOpenOrdenar;
    }
    //Para los ordenar
    let ascendente = $state(true);
    let forma = $state("fecha");
    let selectforma = $state("fecha");
    //Ordenar nacimientos
    function ordenarNacimientosDescendente(p_forma) {
        let escalar = 1;
        if (!ascendente) {
            escalar = -1;
        }
        forma = p_forma;
        if (forma == "fecha") {
            nacimientosrow.sort(
                (a1, a2) => escalar * a1.fecha.localeCompare(a2.fecha),
            );
        } else if (forma == "caravana") {
            nacimientosrow.sort(
                (a1, a2) => escalar * a1.caravana.localeCompare(a2.caravana),
            );
        } else if (forma == "madre") {
            nacimientosrow.sort(
                (a1, a2) =>
                    escalar * a1.nombremadre.localeCompare(a2.nombremadre),
            );
        } else if (forma == "padre") {
            nacimientosrow.sort(
                (a1, a2) =>
                    escalar * a1.nombrepadre.localeCompare(a2.nombrepadre),
            );
        }
    }
    function ordenarNacimientos(p_forma) {
        if (p_forma == forma) {
            ascendente = !ascendente;
        } else {
            ascendente = true;
        }
        ordenarNacimientosDescendente(p_forma);
    }
    function nuevo() {
        openNewModal();
    }
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Navbar2>
    <Buscador
        {nacimientosrow}
        cabnombre={cab.nombre}
        bind:isOpenFilter
        bind:fechadesde
        bind:fechahasta
        bind:buscar
        bind:buscarmadre
        bind:buscarpadre
        {limpiarFiltros}
        {prepararData}
        {filterUpdate}
        {nuevo}
        {clickFilter}
        {toggleJava}
        {versionjava}
    />

    <!--Ordenar-->
    <div class="hidden w-11/12 m-1 mb-2 lg:mx-10 rounded-lg bg-transparent">
        <button aria-label="Ordenar" class="w-full" onclick={clickOrdenar}>
            <div class="flex justify-between items-center px-1">
                <h1 class="font-semibold text-lg py-2">Ordenar</h1>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={`size-6 transition-all duration-300 ${isOpenOrdenar ? "transform rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>
        </button>
        {#if isOpenOrdenar}
            <div transition:slide>
                <div class="my-0 py-0">
                    <label class="input-group">
                        <select
                            class={`
                                select select-bordered w-full
                                rounded-md
                                focus:outline-none focus:ring-2 
                                focus:ring-green-500 
                                focus:border-green-500
                                
                                ${estilos.bgdark2}
                            `}
                            bind:value={selectforma}
                            onchange={() => ordenarNacimientos(selectforma)}
                        >
                            <option value="fecha" class="rounded">Fecha</option>
                            <option value="caravana" class="rounded"
                                >Caravana</option
                            >
                            <option value="madre" class="rounded">Madre</option>
                            <option value="padre" class="rounded">Padre</option>
                        </select>
                    </label>
                </div>
                <div class="my-1">
                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <span class="label-text">Ascendente</span>
                            <input
                                type="checkbox"
                                class="toggle"
                                bind:checked={ascendente}
                                onclick={() => ordenarNacimientos(selectforma)}
                            />
                        </label>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    {#if cargadonacimientos}
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
                <TablaNacimientos
                    bind:pageSize
                    {selecthash}
                    {nacimientosrow}
                    {ordenarNacimientos}
                    {openViewModal}
                    {openEditModal}
                    openDelModal={eliminar}
                    {shorterWord}
                    {clickTodos}
                    {clickFila}
                    bind:todos
                    {ascendente}
                    {forma}
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
            <ListaNacimientos
                {selecthash}
                {nacimientosrow}
                {ordenarNacimientos}
                {openViewModal}
                {openEditModal}
                openDelModal={eliminar}
                {shorterWord}
                {clickTodos}
                {clickFila}
                bind:todos
                {ascendente}
                {forma}
                bind:pageSize
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
        {#if idnacimiento == ""}
            <h3 class="text-lg font-bold">Nuevo nacimiento</h3>
        {:else}
            <h3 class="text-lg font-bold">Ver nacimiento</h3>
        {/if}
        <div class="form-control">
            <AgregarAnimal
                bind:agregaranimal
                bind:caravana
                bind:categoria
                bind:sexo
                bind:peso
                bind:fechanacimiento={fecha}
                confechanac={true}
            />

            <label for="fechanacimiento" class="label">
                <span class={estilos.labelForm}>Fecha nacimiento</span>
            </label>
            <label class="input-group">
                <input
                    id="fechanacimiento"
                    type="date"
                    max={HOY}
                    class={`
                        input input-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                    bind:value={fecha}
                    onchange={() => onchange("FECHA")}
                />
                {#if malfecha}
                    <div class="label">
                        <span class="label-text-alt text-red-500"
                            >Debe seleccionar la fecha del nacimiento</span
                        >
                    </div>
                {/if}
            </label>
            {#if cargadoanimales}
                <PredictSelect
                    bind:valor={madre}
                    etiqueta={"Madre"}
                    bind:cadena={nombremadre}
                    lista={listamadres}
                    onelegir={onelegirMadre}
                    onwrite={onwriteMadre}
                />
                <PredictSelect
                    bind:valor={padre}
                    etiqueta={"Padre"}
                    bind:cadena={nombrepadre}
                    lista={listapadres}
                    onelegir={onelegirPadre}
                    onwrite={onwritePadre}
                />
            {/if}

            <label class="form-control">
                <div class="label">
                    <span class="label-text">Observacion</span>
                </div>
                <input
                    id="observacion"
                    type="text"
                    class={`
                        input 
                        input-bordered 
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        w-full
                        ${estilos.bgdark2}
                    `}
                    bind:value={observacion}
                />
            </label>
        </div>
        <div class="modal-action justify-start">
            <form method="dialog">
                <!-- if there is a button, it will close the modal -->
                {#if idnacimiento == ""}
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
                        onclick={() => eliminar(idnacimiento)}>Eliminar</button
                    >
                {/if}
                <button class="btn btn-neutral" onclick={cerrar}>Cerrar</button>
            </form>
        </div>
    </div>
</dialog>
