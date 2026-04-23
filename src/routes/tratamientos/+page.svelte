<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Buscador from "$lib/components/tratamientos/Buscador.svelte";
    import Exportar from "$lib/components/Exportar.svelte";
    import PocketBase from "pocketbase";
    import { slide } from "svelte/transition";
    import permisos from "$lib/stores/permisos";
    import sexos from "$lib/stores/sexos";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { createUserer } from "$lib/stores/user.svelte";
    import categorias from "$lib/stores/categorias";
    import estilos from "$lib/stores/estilos";
    import { goto } from "$app/navigation";
    import { capitalize } from "$lib/stringutil/lib";
    import { shorterWord } from "$lib/stringutil/lib";

    //FILTROS
    import { createStorageProxy } from "$lib/filtros/filtros";
    import Limpiar from "$lib/filtros/Limpiar.svelte";
    import TablaTratamientos from "$lib/components/tratamientos/TablaTratamientos.svelte";
    import Success from "$lib/components/botones/Success.svelte";
    import ListaTratamientos from "$lib/components/tratamientos/ListaTratamientos.svelte";
    import {
        eliminarTratamiento,
        getAll,
        getAllTipos,
    } from "$lib/java/tratamientos/tratamientosback";
    let versionjava = $state(false);
    async function toggleJava() {
        versionjava = !versionjava;
        await getTiposTratamientos();
        await getTratamientos();
    }
    let esdev = import.meta.env.VITE_DEV == "si";
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let caber = createCaber();
    let cab = caber.cab;
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    //Datos filtrar
    let animales = $state([]);
    let tipotratamientos = $state([]);
    let tratamientos = $state([]);
    let tratamientosrow = $state([]);
    let cargadostratamientos = $state(false);
    //seleccionados
    let todos = $state(false);
    let algunos = $state(false);
    let ninguno = $state(true);
    let selectfilas = $state([]);
    let selecthash = $state({});
    let pageSize = $state(15);
    let caravana = $state("");
    let malcaravana = $state(false);
    let sexo = $state("");
    let peso = $state(0);

    let buscar = $state("");
    let fechadesde = $state("");
    let fechahasta = $state("");
    let buscarcategoria = $state("");
    let buscartipo = $state("");
    let isOpenFilter = $state(false);
    let defaultfiltro = {
        buscar: "",
        fechadesde: "",
        fechahasta: "",
        buscarcategoria: "",
        buscartipo: "",
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("listatratamientos", defaultfiltro);
    //detalle
    let vaciotratamiento = {
        idtratamiento: "",
        animal: "",
        caravana: "",
        categoria: "",
        fecha: "",
        tipo: "",
        observacion: "",
        versionjava: false,
        edit: false,
        tipos: [],
    };
    let detalletratamiento = $state({ ...vaciotratamiento });
    let proxydetalletratamiento = createStorageProxy(
        "detalletratamiento",
        vaciotratamiento,
    );
    //tipos
    let defaulttipos = {
        tipos: [],
    };

    let detallestipos = $state({
        ...defaulttipos,
    });
    let proxytipos = createStorageProxy("detallestipos", defaulttipos);
    //Datos tipo tratamiento
    let nombretipotratamiento = $state("");
    let idtipotratamiento = $state("");
    let addtipo = $state(false);
    //Datos tratamiento
    let idtratamiento = $state("");
    let animal = $state("");
    let categoria = $state("");
    let fecha = $state("");
    let tipo = $state("");
    let observacion = $state("");
    let totalTratamientosEncontrados = $state(0);
    //Para el edit
    let caravaedit = $state("");
    //Validaciones
    let malanimal = $state(false);
    let malcategoria = $state(false);
    let malfecha = $state(false);
    let maltipo = $state(false);
    let botonhabilitado = $state(false);
    let botonhabilitadoAnimal = $state(false);
    //Validaciones tipo
    let botontipo = $state(false);
    //Para el collapse de los filtros
    function clickFilter() {
        isOpenFilter = !isOpenFilter;
    }
    function isEmpty(str) {
        return !str || str.length === 0;
    }
    function validarBoton() {
        botonhabilitado = true;
        if (isEmpty(animal)) {
            botonhabilitado = false;
        }
        if (isEmpty(categoria)) {
            botonhabilitado = false;
        }
        if (isEmpty(tipo)) {
            botonhabilitado = false;
        }
        if (isEmpty(fecha)) {
            botonhabilitado = false;
        }
    }

    function validarBotonAnimal() {
        botonhabilitadoAnimal = true;
        if (isEmpty(caravana)) {
            botonhabilitadoAnimal = false;
        }
    }

    function validarBotonTipo() {
        botontipo = true;
        if (isEmpty(nombretipotratamiento)) {
            botontipo = false;
        }
    }

    function cambioAnimal() {
        if (animal == "agregar") {
            openNewAnimal();
        } else {
            let a = animales.filter((an) => an.id == animal)[0];
            categoria = a.categoria;
        }
    }

    function oninput(campo) {
        validarBoton();
        validarBotonAnimal();
        if (campo == "ANIMAL") {
            if (isEmpty(animal)) {
                malanimal = true;
            } else {
                malanimal = false;
                cambioAnimal();
            }
        } else if (campo == "FECHA") {
            if (isEmpty(fecha)) {
                malfecha = true;
            } else {
                malfecha = false;
            }
        } else if (campo == "CATEGORIA") {
            if (isEmpty(categoria)) {
                malcategoria = true;
            } else {
                malcategoria = false;
            }
        } else if (campo == "TIPO") {
            if (isEmpty(tipo)) {
                maltipo = true;
            } else {
                maltipo = false;
            }
        }
        if (campo == "NOMBRE") {
            if (isEmpty(caravana)) {
                malcaravana = true;
            } else {
                malcaravana = false;
            }
        }
    }

    async function getAnimales() {
        const recordsa = await pb.collection("animales").getFullList({
            filter: `active=true && cab='${cab.id}' && delete=false`,
        });

        animales = recordsa;
        animales = animales.sort((a, b) =>
            a.caravana.toLocaleLowerCase() < b.caravana.toLocaleLowerCase()
                ? -1
                : 1,
        );
    }
    async function getTratamientos() {
        let records = [];
        if (!versionjava) {
            records = await pb.collection("tratamientos").getFullList({
                filter: `cab='${cab.id}' && active = true`,
                expand: "animal,tipo",
                sort: "-created",
            });
        } else {
            records = await getAll();
        }

        tratamientos = records;
        tratamientosrow = records;
        cargadostratamientos = true;
    }
    async function getTiposTratamientos() {
        let records = [];
        if (!versionjava) {
            records = await pb.collection("tipotratamientos").getFullList({
                filter: `(cab='${cab.id}' || generico = true) && active = true`,
                sort: "-created",
            });
        } else {
            records = await getAllTipos();
        }

        tipotratamientos = records;
        tipotratamientos.sort((tp1, tp2) =>
            tp1.nombre.toLocaleLowerCase() > tp2.nombre.toLocaleLowerCase()
                ? 1
                : -1,
        );
    }
    async function guardar() {
        try {
            let data = {
                animal,
                categoria,
                tipo,
                fecha: fecha + " 03:00:00",
                observacion,
                active: true,
                cab: cab.id,
            };

            const record = await pb.collection("tratamientos").create(data);

            await getTratamientos();
            Swal.fire(
                "Éxito guardar",
                "Se pudo guardar el tratamiento con exito",
                "success",
            );
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error guardar",
                "Hubo un error para guardar el tratamiento",
                "error",
            );
        }
    }

    async function guardarAnimal() {
        try {
            let data = {
                caravana,
                active: true,
                delete: false,
                sexo,
                peso,
                cab: cab.id,
            };
            let recorda = await pb.collection("animales").create(data);
            Swal.fire(
                "Éxito guardar",
                "Se pudo guardar el animal con exito",
                "success",
            );
            caravana = "";
            sexo = "H";
        } catch (e) {
            console.error(e);
            Swal.fire(
                "Error guardar",
                "Hubo un error para guardar el animal",
                "error",
            );
        }
        await getAnimales();
    }

    async function editar() {
        try {
            let data = {
                //animal,
                categoria,
                tipo,
                observacion,
                fecha: fecha + " 03:00:00",
            };
            const record = await pb
                .collection("tratamientos")
                .update(idtratamiento, data);
            await getTratamientos();
            Swal.fire(
                "Éxito editar",
                "Se pudo editar el tratamiento con exito",
                "success",
            );
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error editar",
                "Hubo un error para editar el tratamiento",
                "error",
            );
        }
    }
    async function eliminar(id) {
        Swal.fire({
            title: "Eliminar tratamiento",
            text: "¿Seguro que deseas eliminar el tratamiento?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                let data = { active: false };
                try {
                    if (versionjava) {
                        await eliminarTratamiento(id);
                    } else {
                        const record = await pb
                            .collection("tratamientos")
                            .update(id, data);
                    }

                    tratamientos = tratamientos.filter((t) => t.id != id);
                    tratamientosrow = tratamientos;
                    Swal.fire(
                        "Éxito eliminar",
                        "Se pudo eliminar el tratamiento con exito",
                        "success",
                    );
                } catch (err) {
                    console.error(err);
                    Swal.fire(
                        "Error eliminar",
                        "Hubo un error para eliminar el tratamiento",
                        "error",
                    );
                }
            }
        });
    }
    function openTiposModal() {
        detallestipos.tipos = tipotratamientos;
        proxytipos.save(detallestipos);
        goto(pre + "/tratamientos/tipos");
        //tiposmodal.showModal();
    }

    function openEditTipoModal(id) {
        idtipotratamiento = id;
        let tipotratamiento = tipotratamientos.filter((tp) => tp.id == id)[0];
        nombretipotratamiento = tipotratamiento.nombre;
        addtipo = true;
    }
    function cerrarTipoModal() {
        idtipotratamiento = "";
        nombretipotratamiento = "";
        addtipo = false;
    }
    function nuevoTipo() {
        idtipotratamiento = "";
        nombretipotratamiento = "";
        addtipo = true;
    }
    async function guardarTipo() {
        if (idtipotratamiento == "") {
            try {
                let data = {
                    nombre: nombretipotratamiento,
                    active: true,
                    cab: cab.id,
                };
                const record = await pb
                    .collection("tipotratamientos")
                    .create(data);
                tipotratamientos.push(record);
                tipotratamientos.sort((tp1, tp2) =>
                    tp1.nombre.toLocaleLowerCase() >
                    tp2.nombre.toLocaleLowerCase()
                        ? 1
                        : -1,
                );

                cerrarTipoModal();
            } catch (err) {
                console.error(err);
            }
        } else {
            await editarTipo();
        }
    }
    async function editarTipo() {
        try {
            let data = {
                nombre: nombretipotratamiento,
            };
            const record = await pb
                .collection("tipotratamientos")
                .update(idtipotratamiento, data);
            let item = { ...data, id: idtipotratamiento };
            tipotratamientos = tipotratamientos.filter(
                (tp) => tp.id != idtipotratamiento,
            );
            tipotratamientos.push(item);
            tipotratamientos.sort((tp1, tp2) =>
                tp1.nombre.toLocaleLowerCase() > tp2.nombre.toLocaleLowerCase()
                    ? 1
                    : -11,
            );

            cerrarTipoModal();
        } catch (err) {
            console.error(err);
        }
    }
    async function eliminarTipo(id) {
        idtipotratamiento = id;
        try {
            let data = {
                active: false,
            };
            const record = await pb
                .collection("tipotratamientos")
                .update(idtipotratamiento, data);
            tipotratamientos = tipotratamientos.filter(
                (tp) => tp.id != idtipotratamiento,
            );
            tipotratamientos.sort((tp1, tp2) =>
                tp1.nombre.toLocaleLowerCase() > tp2.nombre.toLocaleLowerCase()
                    ? 1
                    : -11,
            );
        } catch (err) {
            console.error(err);
        }
    }
    function cerrarModal() {
        idtratamiento = "";
        fecha = "";
        animal = "";
        tipo = "";
        categoria = "";
    }

    function openNewModal() {
        idtratamiento = "";
        fecha = "";
        animal = "";
        tipo = "";
        categoria = "";
        nuevoModal.showModal();
    }

    function openNewAnimal() {
        if (permisos[4]) {
            caravana = "";
            sexo = "";
            peso = 0;
            botonhabilitadoAnimal = false;
            nuevoModal.showModal();
        } else {
            Swal.fire(
                "Sin permisos",
                "No tienes permisos para crear eventos",
                "error",
            );
        }
    }
    function irDetalle(id) {
        idtratamiento = id;
        let tratamiento = tratamientos.filter((t) => t.id == id)[0];
        fecha = tratamiento.fecha.split(" ")[0];
        animal = tratamiento.animal;
        caravaedit = tratamiento.expand.animal.caravana;

        tipo = tratamiento.tipo;
        categoria = tratamiento.expand.animal.categoria;
        observacion = tratamiento.observacion;

        detalletratamiento.idtratamiento = idtratamiento;
        detalletratamiento.animal = animal;
        detalletratamiento.caravana = caravaedit;
        detalletratamiento.categoria = categoria;
        detalletratamiento.fecha = fecha;
        detalletratamiento.tipo = tipo;
        detalletratamiento.observacion = observacion;
        detalletratamiento.tipos = tipotratamientos;
        detalletratamiento.versionjava = versionjava;
        detalletratamiento.edit = false;
        proxydetalletratamiento.save(detalletratamiento);

        goto(pre + "/tratamientos/" + idtratamiento);
    }
    function openEditModal(id) {
        idtratamiento = id;
        let tratamiento = tratamientos.filter((t) => t.id == id)[0];
        fecha = tratamiento.fecha.split(" ")[0];
        animal = tratamiento.animal;
        caravaedit = tratamiento.expand.animal.caravana;

        tipo = tratamiento.tipo;
        categoria = tratamiento.expand.animal.categoria;
        observacion = tratamiento.observacion;

        detalletratamiento.idtratamiento = idtratamiento;
        detalletratamiento.animal = animal;
        detalletratamiento.caravana = caravaedit;
        detalletratamiento.categoria = categoria;
        detalletratamiento.fecha = fecha;
        detalletratamiento.tipo = tipo;
        detalletratamiento.observacion = observacion;
        detalletratamiento.tipos = tipotratamientos;
        detalletratamiento.versionjava = versionjava;
        detalletratamiento.edit = true;
        proxydetalletratamiento.save(detalletratamiento);
        goto(pre + "/tratamientos/" + idtratamiento);
    }
    function setFilters() {
        buscar = proxyfiltros.buscar;
        fechadesde = proxyfiltros.fechadesde;
        fechahasta = proxyfiltros.fechahasta;
        buscarcategoria = proxyfiltros.buscarcategoria;
        buscartipo = proxyfiltros.buscartipo;
    }

    function setProxyFilter() {
        proxyfiltros.buscar = buscar;
        proxyfiltros.fechadesde = fechadesde;
        proxyfiltros.fechahasta = fechahasta;
        proxyfiltros.buscarcategoria = buscarcategoria;
        proxyfiltros.buscartipo = buscartipo;
    }

    function limpiarFiltros() {
        proxyfiltros = { ...defaultfiltro };

        setFilters();
        filterUpdate();
    }
    function filterUpdate() {
        setProxyFilter();
        proxy.save(proxyfiltros);
        tratamientosrow = tratamientos;
        totalTratamientosEncontrados = tratamientosrow.length;
        if (buscar != "") {
            tratamientosrow = tratamientosrow.filter((t) =>
                t.expand.animal.caravana
                    .toLocaleLowerCase()
                    .includes(buscar.toLocaleLowerCase()),
            );
            totalTratamientosEncontrados = tratamientosrow.length;
        }
        if (fechadesde != "") {
            tratamientosrow = tratamientosrow.filter(
                (t) => t.fecha >= fechadesde,
            );
            totalTratamientosEncontrados = tratamientosrow.length;
        }
        if (fechahasta != "") {
            tratamientosrow = tratamientosrow.filter(
                (t) => t.fecha <= fechahasta,
            );
            totalTratamientosEncontrados = tratamientosrow.length;
        }
        if (buscarcategoria != "") {
            tratamientosrow = tratamientosrow.filter(
                (t) => t.categoria == buscarcategoria,
            );
            totalTratamientosEncontrados = tratamientosrow.length;
        }
        if (buscartipo != "") {
            tratamientosrow = tratamientosrow.filter(
                (t) => t.tipo == buscartipo,
            );
            totalTratamientosEncontrados = tratamientosrow.length;
        }
        ordenarTratamientosDescendente(forma);
    }
    onMount(async () => {
        proxyfiltros = proxy.load();
        setFilters();
        await getTratamientos();
        await getTiposTratamientos();
        await getAnimales();
        filterUpdate();
        if (esCelu) {
            pageSize = 5;
        }
    });
    function prepararData(item) {
        return {
            CARAVANA: item.expand.animal.caravana,
            TRATAMIENTO: item.expand.tipo.nombre,
            FECHA: new Date(item.fecha).toLocaleDateString(),
            CATEGORIA: item.categoria,
        };
    }
    //Para el collapse de los ordenar
    let isOpenOrdenar = $state(false);
    function clickOrdenar() {
        isOpenOrdenar = !isOpenOrdenar;
    }
    //Para los ordenar
    let ascendente = $state(false);
    let forma = $state("fecha");
    let selectforma = $state("fecha");

    //Ordenar servicios
    function ordenarTratamientosDescendente(p_forma) {
        let escalar = 1;
        if (!ascendente) {
            escalar = -1;
        }
        forma = p_forma;
        if (forma == "fecha") {
            tratamientosrow.sort(
                (a1, a2) => escalar * a1.fecha.localeCompare(a2.fecha),
            );
        } else if (forma == "animal") {
            tratamientosrow.sort(
                (a1, a2) =>
                    escalar *
                    a1.expand.animal.caravana.localeCompare(
                        a2.expand.animal.caravana,
                    ),
            );
        } else if (forma == "categoria") {
            tratamientosrow.sort(
                (a1, a2) => escalar * (a1.categoria < a2.categoria ? -1 : 1),
            );
        } else if (forma == "tipo") {
            tratamientosrow.sort(
                (a1, a2) =>
                    escalar *
                    a1.expand.tipo.nombre.localeCompare(a2.expand.tipo.nombre),
            );
        }
    }
    function ordenarTratamientos(p_forma) {
        if (p_forma == forma) {
            ascendente = !ascendente;
        } else {
            ascendente = true;
        }
        ordenarTratamientosDescendente(p_forma);
    }
    function nuevo() {
        goto(pre + "/tratamientos/movimiento");
    }
    function nuevotipo() {
        openTiposModal();
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

            for (let i = 0; i < tratamientosrow.length; i++) {
                let s = tratamientosrow[i];
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
            let s_idx = tratamientosrow.findIndex((s) => s.id == id);
            if (s_idx != -1) {
                let s = tratamientosrow[s_idx];
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
        {tratamientosrow}
        cabnombre={cab.nombre}
        {tipotratamientos}
        {categorias}
        bind:isOpenFilter
        bind:buscar
        bind:fechadesde
        bind:fechahasta
        bind:buscarcategoria
        bind:buscartipo
        {limpiarFiltros}
        {prepararData}
        {nuevo}
        {nuevotipo}
        {filterUpdate}
        {clickFilter}
        {versionjava}
        {toggleJava}
    />
    {#if esdev}
        <Success
            texto={versionjava ? "Cerrar java" : "Ver java"}
            onclick={toggleJava}
        />
    {/if}
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
                            onchange={() => ordenarTratamientos(selectforma)}
                        >
                            <option value="fecha" class="rounded">Fecha</option>
                            <option value="animal" class="rounded"
                                >Animal</option
                            >
                            <option value="categoria" class="rounded"
                                >Categoria</option
                            >
                            <option value="tipo" class="rounded">Tipo</option>
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
                                onclick={() => ordenarTratamientos(selectforma)}
                            />
                        </label>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    {#if cargadostratamientos}
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
                <TablaTratamientos
                    bind:pageSize
                    {selecthash}
                    tratamientosrows={tratamientosrow}
                    {ordenarTratamientos}
                    {openEditModal}
                    openViewModal={irDetalle}
                    openDelModal={eliminar}
                    {clickTodos}
                    {clickFila}
                    {todos}
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
            <ListaTratamientos
                bind:pageSize
                {selecthash}
                tratamientosrows={tratamientosrow}
                {ordenarTratamientos}
                {openEditModal}
                openViewModal={irDetalle}
                openDelModal={eliminar}
                {clickTodos}
                {clickFila}
                {todos}
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
            modal-box w-11/12 max-w-3xl
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
        {#if idtratamiento == ""}
            <h3 class="text-lg font-bold">Nuevo tratamiento</h3>
        {:else}
            <h3 class="text-lg font-bold">Ver tratamiento</h3>
        {/if}
        <div class="form-control">
            <label for="madre" class="label">
                <span class="label-text text-base">Animal</span>
            </label>
            {#if idtratamiento == ""}
                <label class="input-group">
                    <select
                        class={`
                            select select-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 focus:border-green-500

                            ${estilos.bgdark2} 
                            ${malanimal ? "input-error" : ""}
                        `}
                        onchange={() => oninput("ANIMAL")}
                        bind:value={animal}
                    >
                        <option value="agregar">Agregar</option>
                        {#each animales as a}
                            <option value={a.id}>{a.caravana}</option>
                        {/each}
                    </select>
                    <div class={`label ${malanimal ? "" : "hidden"}`}>
                        <span class="label-text-alt text-red-400"
                            >Debe seleccionar el animal</span
                        >
                    </div>
                </label>
            {:else}
                <label for="madre" class="label">
                    <span class="label-text text-base">{caravaedit}</span>
                </label>
            {/if}
            {#if animal == "agregar"}
                <form method="dialog">
                    <button
                        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl"
                        >✕</button
                    >
                </form>
                <label for="nombre" class="label">
                    <span class="label-text text-base">Caravana</span>
                </label>
                <label class="input-group">
                    <input
                        id="nombre"
                        type="text"
                        class={`
                            input 
                            input-bordered 
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                            w-full
                            ${estilos.bgdark2} 
                            ${malcaravana ? "input-error" : ""}
                        `}
                        bind:value={caravana}
                        oninput={() => oninput("NOMBRE")}
                    />
                    <div class={`label ${malcaravana ? "" : "hidden"}`}>
                        <span class="label-text-alt text-red-400"
                            >Error debe escribir la caravana del animal</span
                        >
                    </div>
                </label>
                <label for="sexo" class="label">
                    <span class="label-text text-base">Sexo</span>
                </label>
                <label class="input-group">
                    <select
                        class={`
                            select select-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 focus:border-green-500
                            ${estilos.bgdark2}
                        `}
                        bind:value={sexo}
                    >
                        {#each sexos as s}
                            <option value={s.id}>{s.nombre}</option>
                        {/each}
                    </select>
                </label>
                <label for="peso" class="label">
                    <span class="label-text text-base">Peso (KG)</span>
                </label>
                <label class="input-group">
                    <input
                        id="peso"
                        type="number"
                        class={`
                            input input-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 focus:border-green-500
                            ${estilos.bgdark2}
                        `}
                        bind:value={peso}
                    />
                </label>
                <div class="modal-action justify-start">
                    <form method="dialog">
                        <button
                            class="btn btn-success text-white"
                            disabled={!botonhabilitadoAnimal}
                            onclick={guardarAnimal}>Guardar Animal</button
                        >
                    </form>
                </div>
            {/if}
            <label for="fecha" class="label">
                <span class="label-text text-base">Fecha</span>
            </label>
            <label class="input-group">
                <input
                    id="fecha"
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
                    onchange={() => oninput("FECHA")}
                />
                <div class={`label ${malfecha ? "" : "hidden"}`}>
                    <span class="label-text-alt text-red-400"
                        >Debe seleccionar la fecha</span
                    >
                </div>
            </label>
            <label for="categoria" class="label">
                <span class="label-text text-base">Categoria</span>
            </label>
            <label class="input-group">
                <select
                    class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                    bind:value={categoria}
                    read
                    onchange={() => oninput("CATEGORIA")}
                >
                    {#each categorias as c}
                        <option value={c.id}>{c.nombre}</option>
                    {/each}
                </select>
                <div class={`label ${malcategoria ? "" : "hidden"}`}>
                    <span class="label-text-alt text-red-400"
                        >Debe seleccionar la categoria</span
                    >
                </div>
            </label>

            <label for="tipo" class="label">
                <span class="label-text text-base">Tipo tratamiento</span>
            </label>
            <label class="input-group">
                <select
                    class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                    bind:value={tipo}
                    onchange={() => oninput("TIPO")}
                >
                    {#each tipotratamientos as t}
                        <option value={t.id}>{t.nombre}</option>
                    {/each}
                </select>
                <div class={`label ${maltipo ? "" : "hidden"}`}>
                    <span class="label-text-alt text-red-400"
                        >Debe seleccionar un tipo</span
                    >
                </div>
            </label>
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
                {#if idtratamiento == ""}
                    <button
                        class="btn btn-success text-white"
                        disabled={!botonhabilitado}
                        onclick={guardar}>Guardar</button
                    >
                {:else}
                    <button class="btn btn-success text-white" onclick={editar}
                        >Editar</button
                    >
                    <button
                        class="btn btn-error text-white"
                        onclick={() => eliminar(idtratamiento)}>Eliminar</button
                    >
                {/if}
                <button class="btn btn-neutral" onclick={cerrarModal}
                    >Cerrar</button
                >
            </form>
        </div>
    </div>
</dialog>
<dialog
    id="tiposmodal"
    class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle"
>
    <div
        class="
            modal-box max-w-xl w-11/12
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
        <h3 class="text-xl font-bold">Tipo tratamientos</h3>
        <div
            class="grid grid-cols-1 m-0 gap-2 lg:gap-10 mb-2 mt-1 mx-1 lg:mx-10"
        >
            <div class="w-11/12">
                <Success
                    text="text-center"
                    w="w-full"
                    onclick={() => nuevoTipo()}
                    texto="Nuevo tipo"
                />
                <button
                    class={`hidden w-full btn flex btn-primary ${estilos.btntext}`}
                    data-theme="forest"
                    onclick={() => nuevoTipo()}
                >
                    <span class="text-xl">Nuevo tipo</span>
                </button>
                {#if addtipo}
                    <div class="grid grid-cols-3 gap-1">
                        <div class="col-span-2">
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
                                    bind:value={nombretipotratamiento}
                                    oninput={validarBotonTipo}
                                />
                            </label>
                        </div>

                        <div class="flex flex-row gap-1 mt-10">
                            <button
                                aria-label="guardar"
                                class={`
                                ${estilos.basico} ${estilos.chico} ${estilos.primario}
                            `}
                                onclick={guardarTipo}
                                disabled={!botontipo}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    class="bi bi-floppy"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M11 2H9v3h2z" />
                                    <path
                                        d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"
                                    />
                                </svg>
                            </button>
                            <button
                                aria-label="cerrar"
                                class={`
                                ${estilos.basico} ${estilos.chico} ${estilos.danger}
                            `}
                                onclick={cerrarTipoModal}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1"
                                    stroke="currentColor"
                                    class="size-6"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                {/if}
                <div class="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table
                        class="table table-lg w-full bg-white dark:bg-slate-900"
                    >
                        <thead
                            class={`${estilos.tableheader}  sticky top-0 z-5`}
                        >
                            <tr>
                                <th
                                    class={`
                                            ${estilos.tableth}   
                                        `}
                                >
                                    <div
                                        class="flex flex-row justify-between uppercase"
                                    >
                                        Nombre
                                    </div>
                                </th>
                                <th
                                    class="text-base mx-1 px-1 text-center uppercase"
                                >
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each tipotratamientos as tp}
                                <tr>
                                    <td class={`text-base mx-1 px-4 `}>
                                        {tp.nombre}
                                    </td>
                                    <td
                                        class={`
                                            flex 
                                            items-center justify-center
                                            gap-2 px-1 
                                            ${tp.generico ? "hidden" : ""}
                                        `}
                                    >
                                        <div class="tooltip" data-tip="Editar">
                                            <button
                                                aria-label="Editar"
                                                onclick={() =>
                                                    openEditTipoModal(tp.id)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke-width="1.5"
                                                    stroke="currentColor"
                                                    class="size-6"
                                                >
                                                    <path
                                                        d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        <div
                                            class="tooltip"
                                            data-tip="Eliminar"
                                        >
                                            <button
                                                aria-label="Eliminar"
                                                onclick={() =>
                                                    eliminarTipo(tp.id)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke-width="1.5"
                                                    stroke="currentColor"
                                                    class="size-6"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="modal-action justify-start">
            <button
                class="btn btn-error text-white"
                onclick={() => tiposmodal.close()}>Cerrar</button
            >
        </div>
    </div>
</dialog>
