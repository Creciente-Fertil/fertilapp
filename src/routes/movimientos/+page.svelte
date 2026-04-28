<script>
    import CustomModalMove from "$lib/components/movimientos/CustomModalMove.svelte";
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Buscador from "$lib/components/movimientos/Buscador.svelte";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import estilos from "$lib/stores/estilos";
    import { createCaber } from "$lib/stores/cab.svelte";
    import categorias from "$lib/stores/categorias";
    import sexos from "$lib/stores/sexos";
    import { guardarHistorial } from "$lib/historial/lib";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosList } from "$lib/permisosutil/lib";
    import motivos from "$lib/stores/motivos";
    import MultiSelect from "$lib/components/MultiSelect.svelte";
    import tiponoti from "$lib/stores/tiponoti";
    import {
        getEstadoNombre,
        getEstadoColor,
    } from "$lib/components/estadosutils/lib";
    import { getSexoNombre, capitalize } from "$lib/stringutil/lib";
    import { goto } from "$app/navigation";
    import Secondary from "$lib/components/botones/Secondary.svelte";
    import AnimalesSeleccionados from "$lib/components/movimientos/AnimalesSeleccionados.svelte";
    import DetalleMovimiento from "$lib/components/movimientos/DetalleMovimiento.svelte";
    import TablaMovimiento from "$lib/components/TablaMovimiento.svelte";
    import InfoAnimal from "$lib/components/InfoAnimal.svelte";
    import * as LotesService from "$lib/java/lotes/lotesback";
    import * as RodeosService from "$lib/java/rodeos/rodeosback";
    import * as AnimalService from "$lib/java/animales/animalesback";
    import Success from "$lib/components/botones/Success.svelte";
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let ruta = import.meta.env.VITE_RUTA;
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    let pre = import.meta.env.VITE_PRE;
    let caber = createCaber();
    let cab = caber.cab;
    let per = createPer();
    let userpermisos = getPermisosList(per.per.permisos);
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");
    let esdev = import.meta.env.VITE_DEV == "si";
    async function toggleJava() {
        versionjava = !versionjava;
        await getData()
    }
    //boton
    let textoboton = $state("Mover");
    //Datos animales
    let animal = $state({});
    let animales = $state([]);
    let animalesrows = $state([]);
    let cargado = $state(false);
    //paginacon
    let pageSize = $state(5);
    let paginaActual = $state(1);
    //Filtros
    let buscar = $state("");
    let lote = $state("");
    let loteseleccion = $state([]);
    let rodeo = $state("");
    let rodeoseleccion = $state([]);
    let categoriaseleccion = $state([]);
    let categoria = $state("");
    let sexo = $state("");
    let raza = $state("");
    let color = $state("");

    let lotes = $state([]);
    let rodeos = $state([]);
    let tipos = $state([]);
    let cargadosmovs = $state(false);
    let isOpenFilter = $state(false);
    //Seleccionados
    let selectanimales = $state([]);
    let listaanimales = $state([]);
    let selecthashmap = $state({});
    let todos = $state(false);
    let algunos = $state(false);
    let ninguno = $state(true);
    //movimientos

    //movimiento
    let seccionAbierta = $state("CATEGORIA");
    let nuevacategoria = $state(categorias[0]);
    let nuevolote = $state("");
    let nuevorodeo = $state("");
    let tipotratamiento = $state("");
    let fecha = $state("");
    let fechabaja = $state("");
    let motivo = $state("");
    let codigo = $state("");

    let defaultmovimiento = {
        categoria: "",
        lote: "",
        rodeo: "",
        fecha: "",
        motivo: "",
        fechabaja: "",
        codigo: "",
        listaanimales: [],
        selecthashmap: {},
        lotes: [],
        rodeos: [],
        categorias: [],
        seccion: "",
        versionjava:false
    };
    let detallemovimiento = $state({
        ...defaultmovimiento,
    });
    let proxyDetalleMovimiento = createStorageProxy(
        "detallemovimiento",
        defaultmovimiento,
    );
    //validar
    let malcategoria = $state("");
    let mallote = $state("");
    let malrodeo = $state("");
    let maltipo = $state("");
    let malfecha = $state("");
    let malfechabaja = $state("");
    let malmotivo = $state("");
    let malcodigo = $state("");
    let habilitarboton = $state(false);

    //Seleecionar
    let selectcategoria = $state(true);
    let selectlote = $state(false);
    let selectrodeo = $state(false);
    let selecttratamiento = $state(false);
    let selectbaja = $state(false);
    let selecttransfer = $state(false);

    function clickFilter() {
        isOpenFilter = !isOpenFilter;
    }
    function limpiar() {
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
    function filterUpdate() {
        animalesrows = animales;
        if (buscar != "") {
            animalesrows = animalesrows.filter((a) =>
                a.caravana
                    .toLocaleLowerCase()
                    .includes(buscar.toLocaleLowerCase()),
            );
        }
        if (raza != "") {
            animalesrows = animalesrows.filter((a) =>
                a.raza.toLocaleLowerCase().includes(raza.toLocaleLowerCase()),
            );
        }
        if (color != "") {
            animalesrows = animalesrows.filter((a) =>
                a.color.toLocaleLowerCase().includes(color.toLocaleLowerCase()),
            );
        }
        if (sexo != "") {
            animalesrows = animalesrows.filter((a) => a.sexo == sexo);
        }
        if (categoria != "") {
            animalesrows = animalesrows.filter((a) => a.categoria == categoria);
        }
        if (rodeoseleccion.length != 0) {
            if (rodeoseleccion.length == 1 && rodeoseleccion[0] == "-1") {
                animalesrows = animalesrows.filter((a) => !a.rodeo);
            } else {
                animalesrows = animalesrows.filter((a) =>
                    rodeoseleccion.includes(a.rodeo),
                );
            }
        }
        if (loteseleccion.length != 0) {
            if (loteseleccion.length == 1 && loteseleccion[0] == "-1") {
                animalesrows = animalesrows.filter((a) => !a.lote);
            } else {
                animalesrows = animalesrows.filter((a) =>
                    loteseleccion.includes(a.lote),
                );
            }
        }
        if (categoriaseleccion.length != 0) {
            if (
                categoriaseleccion.length == 1 &&
                categoriaseleccion[0] == "-1"
            ) {
                animalesrows = animalesrows.filter((a) => !a.categoria);
            } else {
                animalesrows = animalesrows.filter((a) =>
                    categoriaseleccion.includes(a.categoria),
                );
            }
        }
    }

    function ordenarNombre(lista) {
        lista.sort((r1, r2) =>
            r1.nombre.toLocaleLowerCase() > r2.nombre.toLocaleLowerCase()
                ? 1
                : -1,
        );
    }
    function clickAnimal(id) {
        if (selecthashmap[id]) {
            if (todos) {
                todos = false;
                algunos = true;
            }
            delete selecthashmap[id];
        } else {
            if (ninguno) {
                algunos = true;
                ninguno = false;
            }
            let a = animales.filter((an) => an.id == id)[0];
            selecthashmap[id] = {
                ...a,
            };
        }
        saveDetalleMovmiento();
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
            for (let i = 0; i < animalesrows.length; i++) {
                let a = animalesrows[i];
                selecthashmap[animalesrows[i].id] = {
                    ...a,
                };
            }
        } else if (algunos) {
            selecthashmap = {};
            algunos = false;
            todos = false;
            ninguno = true;
        }
        saveDetalleMovmiento();
    }
    async function getLotes() {
        if (versionjava) {
            const records = await LotesService.getAll();
            lotes = records;
            ordenarNombre(lotes);
        } else {
            const records = await pb.collection("lotes").getFullList({
                filter: `active = true && cab ~ '${cab.id}'`,
                sort: "nombre",
            });
            lotes = records;
            ordenarNombre(lotes);
        }
    }
    async function getRodeos() {
        if (versionjava) {
            const records = await RodeosService.getAll();
            rodeos = records;
            ordenarNombre(rodeos);
        } else {
            const records = await pb.collection("rodeos").getFullList({
                filter: `active = true && cab ~ '${cab.id}'`,
                sort: "nombre",
            });
            rodeos = records;
            ordenarNombre(rodeos);
        }
    }
    async function getTipos() {
        const records = await pb.collection("tipotratamientos").getFullList({
            filter: `(cab='${cab.id}' || generico = true) && active = true`,
            sort: "-created",
        });
        tipos = records;
        tipos.sort((tp1, tp2) => (tp1.nombre > tp2.nombre ? 1 : -1));
    }
    async function getAnimales() {
        if (versionjava) {
            const recordsa = await AnimalService.getAll();

            animales = recordsa;
        } else {
            const recordsa = await pb.collection("animales").getFullList({
                filter: `active=true && delete=false && cab='${cab.id}'`,
                expand: "rodeo,lote,cab",
            });

            animales = recordsa;
        }

        animales.sort((a1, a2) =>
            a1.caravana.toLocaleLowerCase() > a2.caravana.toLocaleLowerCase()
                ? 1
                : -1,
        );
        animalesrows = animales;
        cargado = true;
    }
    function openNewModal() {
        listaanimales = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                listaanimales.push(value);
            }
        }
        if (listaanimales.length == 0) {
            Swal.fire(
                "Error movimiento",
                "No hay animales seleccionados",
                "error",
            );
            nuevorodeo = "";
            nuevolote = "";
            nuevacategoria = "";
            return;
        } else {
            nuevoModal.showModal();
        }
        if (userpermisos[3]) {
            nuevoModal.showModal();
        } else {
            Swal.fire(
                "Error movimiento",
                "No tienes permisos para hacer movimientos",
                "error",
            );
        }
    }
    function irDetalle() {
        listaanimales = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                listaanimales.push(value);
            }
        }
        if (listaanimales.length == 0) {
            Swal.fire(
                "Error movimiento",
                "No hay animales seleccionados",
                "error",
            );
            nuevorodeo = "";
            nuevolote = "";
            nuevacategoria = "";
            return;
        }
        if (!userpermisos[3]) {
            Swal.fire(
                "Error movimiento",
                "No tienes permisos para hacer movimientos",
                "error",
            );
        }
        let defaultmovimiento = {
            categoria: "",
            lote: "",
            rodeo: "",
            fecha: "",
            motivo: "",
            fechabaja: "",
            codigo: "",
            listaanimales: [],
            selecthashmap: {},
        };
        let proxymovimiento = $state({
            ...defaultmovimiento,
        });
        let proxy = createStorageProxy("detallemovimiento", defaultmovimiento);

        let movimiento = {
            ...defaultmovimiento,
            categoria: nuevacategoria,
            lote: nuevolote,
            rodeo: nuevorodeo,
            fecha: fecha,
            motivo: motivo,
            fechabaja: fechabaja,
            codigo: codigo,
            listaanimales,
            selecthashmap,
        };
        proxy.save(movimiento);

        goto(pre + "/movimientos/detalle");
    }
    async function mover() {
        if (ninguno) {
            Swal.fire(
                "Error movimiento",
                "No hay animales seleccionados",
                "error",
            );
            nuevorodeo = "";
            nuevolote = "";
            nuevacategoria = "";
            return;
        }
        let lista = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                lista.push(value);
            }
        }
        if (lista.length == 0) {
            Swal.fire(
                "Error movimiento",
                "No hay animales seleccionados",
                "error",
            );
            nuevorodeo = "";
            nuevolote = "";
            nuevacategoria = "";
            return;
        }

        let data = {};
        let nombrelote = "";
        let nombrerodeo = "";
        if (selectcategoria) {
            data.categoria = nuevacategoria;
        }
        if (selectlote) {
            data.lote = nuevolote;
            nombrelote = lotes.filter((l) => l.id == nuevolote)[0];
        }
        if (selectrodeo) {
            data.rodeo = nuevorodeo;
            nombrerodeo = rodeos.filter((r) => r.id == nuevorodeo)[0];
        }
        if (selecttratamiento) {
            data.fecha = fecha + " 03:00:00";
            data.tipo = tipotratamiento;
            data.active = true;
            data.cab = cab.id;
        }
        if (selectbaja) {
            data.active = false;
            data.motivobaja = motivo;
            data.fechafallecimiento = fechabaja + " 03:00:00";
        }
        if (selecttransfer) {
            const resultList = await pb.collection("cabs").getList(1, 1, {
                filter: `active = true && renspa = '${codigo}'`,
            });
            if (resultList.items.length == 0) {
                malcodigo = true;
                Swal.fire(
                    "Error transferencia",
                    "No hay ningún establecimiento con ese RENSPA",
                    "error",
                );
                return;
            }
            if (resultList.totalItems > 1) {
                Swal.fire(
                    "Error transferencia",
                    "Hay varios establecimientos con ese RENSPA",
                    "error",
                );
                return;
            }
            data.cab = resultList.items[0].id;
            data.lote = "";
            data.rodeo = "";
            try {
                let pb_json = JSON.parse(
                    localStorage.getItem("pocketbase_auth"),
                );

                let origenusuarioid = pb_json.record.id;
                let datanoti = {
                    texto: `Se transfirieron ${lista.length} animales`,
                    titulo: `Transferencia de ${lista.length} animales`,
                    tipo: tiponoti[1].id,
                    origen: origenusuarioid,
                    destino: resultList.items[0].user,
                    leido: false,
                };
                const record = await pb
                    .collection("notificaciones")
                    .create(datanoti);
            } catch (err) {
                console.error(err);
            }
        }
        let bulkcambios = [];
        let bulkhistoriales = [];
        let bulktratamientos = [];
        for (let i = 0; i < lista.length; i++) {
            let a = lista[i];
            if (!selecttratamiento) {
                let datacambio = {
                    ...data,
                };
                bulkcambios.push(datacambio);
                let datahistorial = {
                    animal: a.id,
                    caravana: a.caravana,
                    user: a.expand.cab.user,
                    active: true,
                    delete: false,
                    fechanacimiento: a.fechanacimiento,
                    sexo: a.sexo,
                    peso: a.peso,
                    lote: a.lote,
                    rodeo: a.rodeo,
                    categoria: a.categoria,
                    prenada: a.prenada,
                    cab: cab.id,
                };
                bulkhistoriales.push(datahistorial);
                //await guardarHistorial(pb,lista[i].id)
                //await pb.collection('animales').update(lista[i].id, data);
            } else {
                let a = lista[i];
                let datatratamiento = {
                    ...data,
                    animal: a.id,
                    categoria: a.categoria,
                };
                bulktratamientos.push(datatratamiento);
            }
        }
        try {
            const batch = pb.createBatch();
            for (let i = 0; i < lista.length; i++) {
                if (!selecttratamiento) {
                    batch
                        .collection("animales")
                        .update(lista[i].id, bulkcambios[i]);
                    batch
                        .collection("historialanimales")
                        .create(bulkhistoriales[i]);
                } else {
                    batch
                        .collection("tratamientos")
                        .create(bulktratamientos[i]);
                }
            }
            const result = await batch.send();
            Swal.fire("Éxito movimiento", "Movimiento exitoso", "success");
        } catch (err) {
            Swal.fire(
                "Error movimiento",
                "No se logró hacer el movimiento",
                "error",
            );
        }
        for (let i = 0; i < lista.length; i++) {
            delete selecthashmap[lista[i].id];
        }

        algunos = false;
        todos = false;
        ninguno = true;
        selectcategoria = true;
        selectlote = false;
        selectrodeo = false;
        selecttratamiento = false;
        selectbaja = false;
        selecttransfer;
        nuevacategoria = "";
        nuevolote = "";
        nuevorodeo = "";
        fecha = "";
        tipotratamiento = "";
        fechabaja = "";
        motivo = "";
        codigo = "";
        habilitarboton = false;

        await getAnimales();
        filterUpdate();
    }
    function onChangeCollapse(seccion) {
        nuevacategoria = "";
        nuevolote = "";
        nuevorodeo = "";
        fecha = "";
        tipotratamiento = "";
        fechabaja = "";
        motivo = "";
        codigo = "";
        habilitarboton = false;
        if (seccion == "CATEGORIA") {
            selectcategoria = true;
            selectlote = false;
            selectrodeo = false;
            selecttratamiento = false;
            selectbaja = false;
            selecttransfer = false;
            textoboton = "Mover de categoria";
        }
        if (seccion == "RODEO") {
            selectcategoria = false;
            selectlote = false;
            selectrodeo = true;
            selecttratamiento = false;
            selectbaja = false;
            selecttransfer = false;
            textoboton = "Mover de rodeo";
        }
        if (seccion == "LOTE") {
            selectcategoria = false;
            selectlote = true;
            selectrodeo = false;
            selecttratamiento = false;
            selectbaja = false;
            selecttransfer = false;
            textoboton = "Mover de lote";
        }
        if (seccion == "TRATAMIENTO") {
            selectcategoria = false;
            selectlote = false;
            selectrodeo = false;
            selecttratamiento = true;
            selectbaja = false;
            selecttransfer = false;
            textoboton = "Crear tratamientos";
        }
        if (seccion == "BAJA") {
            selectcategoria = false;
            selectlote = false;
            selectrodeo = false;
            selecttratamiento = false;
            selectbaja = true;
            selecttransfer = false;
            textoboton = "Dar baja";
        }
        if (seccion == "TRANSFERIR") {
            selectcategoria = false;
            selectlote = false;
            selectrodeo = false;
            selecttratamiento = false;
            selectbaja = false;
            selecttransfer = true;
            textoboton = "Transferir";
        }
        seccionAbierta = seccion;
        saveDetalleMovmiento();
    }
    function validarBoton() {
        habilitarboton = true;
        if (selectcategoria) {
            if (nuevacategoria == "") {
                habilitarboton = false;
            }
        }
        if (selectlote) {
            if (nuevolote == "") {
                habilitarboton = false;
            }
        }
        if (selectrodeo) {
            if (nuevorodeo == "") {
                habilitarboton = false;
            }
        }
        if (selecttratamiento) {
            if (fecha == "" || tipotratamiento == "") {
                habilitarboton = false;
            }
        }
        if (selectbaja) {
            if (fechabaja == "" || motivo == "") {
                habilitarboton = false;
            }
        }
        if (selecttransfer) {
            if (codigo == "") {
                habilitarboton = false;
            }
        }
    }
    function oninput(campo) {
        validarBoton();
        if (selectcategoria && campo == "CATEGORIA") {
            if (nuevacategoria == "") {
                malcategoria = true;
            } else {
                malcategoria = false;
            }
        }
        if (selectlote && campo == "LOTE") {
            if (nuevolote == "") {
                mallote = true;
            } else {
                mallote = false;
            }
        }
        if (selectrodeo && campo == "RODEO") {
            if (nuevorodeo == "") {
                malrodeo = true;
            } else {
                malrodeo = false;
            }
        }
        if (selecttratamiento) {
            if (campo == "FECHA") {
                if (fecha == "") {
                    malfecha = true;
                } else {
                    malfecha = false;
                }
            }

            if (campo == "TIPO") {
                if (tipotratamiento == "") {
                    maltipo = true;
                } else {
                    maltipo = false;
                }
            }
        }
        if (selectbaja) {
            if (campo == "FECHABAJA") {
                if (fechabaja == "") {
                    malfechabaja = true;
                } else {
                    malfechabaja = false;
                }
            }
            if (campo == "MOTIVO") {
                if (motivo == "") {
                    malmotivo = true;
                } else {
                    malmotivo = false;
                }
            }
        }
    }
    function saveDetalleMovmiento() {
        detallemovimiento.categoria = nuevacategoria;
        detallemovimiento.lote = nuevolote;
        detallemovimiento.rodeo = nuevorodeo;
        detallemovimiento.fecha = fecha;
        detallemovimiento.motivo = motivo;
        detallemovimiento.fechabaja = fechabaja;
        detallemovimiento.codigo = codigo;
        detallemovimiento.listaanimales = listaanimales;
        detallemovimiento.selecthashmap = selecthashmap;
        detallemovimiento.lotes = lotes;
        detallemovimiento.rodeos = rodeos;
        detallemovimiento.categorias = categorias;
        detallemovimiento.seccion = seccionAbierta;
        detallemovimiento.versionjava = versionjava;
        proxyDetalleMovimiento.save(detallemovimiento);
    }
    function loadDetalleMovimiento() {
        detallemovimiento = proxyDetalleMovimiento.load();
        nuevacategoria = detallemovimiento.categoria;
        nuevolote = detallemovimiento.lote;
        nuevorodeo = detallemovimiento.rodeo;
        fecha = detallemovimiento.fecha;
        motivo = detallemovimiento.motivo;
        fechabaja = detallemovimiento.fechabaja;
        codigo = detallemovimiento.codigo;

        selecthashmap = detallemovimiento.selecthashmap;
        listaanimales = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                listaanimales.push(value);
            }
        }
        if (listaanimales.length == animalesrows.length) {
            todos = true;
            algunos = false;
            ninguno = false;
        } else if (listaanimales.length > 0) {
            todos = false;
            algunos = true;
            ninguno = false;
        } else {
            todos = false;
            algunos = false;
            ninguno = true;
        }
    }
    async function getData() {
        await getAnimales();
        await getRodeos();
        await getLotes();
        //await getTipos();
    }
    onMount(async () => {
        await getData();
        cargadosmovs = true;

        loadDetalleMovimiento();
    });
    function nuevo() {
        openNewModal();
    }
    function siguiente() {
        saveDetalleMovmiento();
        goto(pre + "/movimientos/detalle");
    }
    function verAnimal(id) {
        let a_idx = animales.findIndex((a) => a.id == id);

        if (a_idx != -1) {
            animal = animales[a_idx];
            veranimal.showModal();
        }
    }
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Navbar2>
    <div
        class="
            container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4
            "
    >
        <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3"
        >
            <div
                class={`
                            bg-transparent
                            px-2 py-1
                        `}
            >
                <h1
                    class={`
                            text-4xl font-semibold 
                            dark:text-[#24a579] text-[#115642]
                            
                        `}
                >
                    Nuevo movimientos
                </h1>
            </div>
        </div>
        {#if esdev}
            <Success
                texto={versionjava?"Cerrar java":"Ver java"}
                onclick={toggleJava}
            />
        {/if}
        <div class="grid grid-cols-1 max-h-screen gap-1 md:gap-2">
            <!--Lado izquierdo-->
            <div>
                <DetalleMovimiento
                    {lotes}
                    {rodeos}
                    {categorias}
                    {motivos}
                    bind:categoria={nuevacategoria}
                    bind:lote={nuevolote}
                    bind:rodeo={nuevorodeo}
                    bind:fecha
                    bind:motivo
                    bind:codigo
                    {oninput}
                    {onChangeCollapse}
                />
                <div class="hidden">
                    <AnimalesSeleccionados
                        {selecthashmap}
                        quitarAnimal={clickAnimal}
                    />
                </div>
            </div>
            <!--Lado derecho-->
            <div class="md:col-span-2">
                <Buscador
                    {animalesrows}
                    {selecthashmap}
                    bind:buscar
                    {rodeos}
                    bind:rodeoseleccion
                    bind:sexobuscar={sexo}
                    {sexos}
                    {lotes}
                    bind:categoriaseleccion
                    bind:raza
                    bind:color
                    bind:isOpenFilter
                    nuevo={irDetalle}
                    {filterUpdate}
                    {clickFilter}
                />
                {#if cargado}
                    <TablaMovimiento
                        bind:paginaActual
                        bind:pageSize
                        selecthash={selecthashmap}
                        {animalesrows}
                        clickFila={clickAnimal}
                        {clickTodos}
                        {todos}
                        {ninguno}
                        {algunos}
                        verFila={verAnimal}
                        {siguiente}
                    />
                    <div
                        class={`
                            hidden w-full 
                            mx-auto py-6 px-4 max-w-7xl
                        `}
                    >
                        <div
                            class={`
                                overflow-hidden rounded-xl
                            `}
                        >
                            <table class="table table-lg w-full">
                                <thead
                                    class="bg-emerald-600 text-white dark:bg-emerald-700"
                                >
                                    <tr>
                                        <th
                                            class="px-1 p-0 m-0 border-b border-emerald-700"
                                        >
                                            <button
                                                aria-label="Todos"
                                                onclick={clickTodos}
                                                class={`
                                                    text-white bg-transparent rounded-lg
                                                    px-3 py-3
                                                    ${estilos.secundario}
                                                `}
                                            >
                                                {#if todos}
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
                                                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                        />
                                                    </svg>
                                                {/if}
                                                {#if ninguno}
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
                                                            d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                        />
                                                    </svg>
                                                {/if}
                                                {#if algunos}
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
                                                            d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                        />
                                                    </svg>
                                                {/if}
                                            </button>
                                        </th>
                                        <th
                                            class="text-base mx-1 px-1 border-b border-emerald-700"
                                            >Caravana</th
                                        >
                                        <th
                                            class="text-base mx-1 px-1 border-b border-emerald-700"
                                            >Categoria</th
                                        >
                                        <th
                                            class="text-base mx-1 px-1 border-b border-emerald-700"
                                            >Rodeo</th
                                        >
                                        <th
                                            class="text-base mx-1 px-1 border-b border-emerald-700"
                                            >Lote</th
                                        >
                                        <th
                                            class="text-base mx-1 px-1 border-b border-emerald-700"
                                            >Sexo</th
                                        >
                                        <th
                                            class="text-base mx-1 px-1 border-b border-emerald-700"
                                        >
                                            <div
                                                class="flex flex-row justify-between"
                                            >
                                                Raza
                                            </div>
                                        </th>
                                        <th
                                            class="text-base mx-1 px-1 border-b border-emerald-700"
                                        >
                                            <div
                                                class="flex flex-row justify-between"
                                            >
                                                Color
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each animalesrows as a}
                                        <tr>
                                            <td class="px-1 p-0 m-0">
                                                <button
                                                    aria-label="fila"
                                                    onclick={() =>
                                                        clickAnimal(a.id)}
                                                    class={`
                                    font-medium bg-transparent rounded-lg
                                    px-3 py-3 text-base
                                    ${selecthashmap[a.id] ? estilos.danger : estilos.primario}
                                `}
                                                >
                                                    {#if selecthashmap[a.id]}
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
                                                                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                            />
                                                        </svg>
                                                    {:else}
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
                                                                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                            />
                                                        </svg>
                                                    {/if}
                                                </button>
                                            </td>
                                            <td class="text-base mx-1 px-0"
                                                >{a.caravana}</td
                                            >
                                            <td class="text-base mx-1 px-0"
                                                >{capitalize(a.categoria)}</td
                                            >
                                            <td class="text-base mx-1 px-0"
                                                >{a.expand?.rodeo?.nombre ||
                                                    ""}</td
                                            >
                                            <td class="text-base mx-1 px-0"
                                                >{a.expand?.lote?.nombre ||
                                                    ""}</td
                                            >
                                            <td class="text-base mx-1 px-0"
                                                >{a.sexo}</td
                                            >
                                            <td>
                                                {a.raza}
                                            </td>
                                            <td>
                                                {a.color}
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="block md:hidden justify-items-center mx-1">
                        <div class="w-full flex justify-start">
                            <button
                                aria-label="Todos"
                                onclick={clickTodos}
                                class={`
                                    text-base bg-transparent rounded-lg
                                    p-1 text-base flex flex-row
                                    ${estilos.secundario}
                                `}
                            >
                                {#if todos}
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
                                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                        />
                                    </svg>
                                {/if}
                                {#if ninguno}
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
                                            d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                        />
                                    </svg>
                                {/if}
                                {#if algunos}
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
                                            d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                        />
                                    </svg>
                                {/if}

                                <span class="mt-1"> Seleccionar todos </span>
                            </button>
                        </div>

                        {#each animalesrows as a}
                            <div
                                class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
                            >
                                <div class="block p-4">
                                    <div
                                        class="flex justify-between items-start mb-2"
                                    >
                                        <h3 class="font-medium">
                                            <button
                                                aria-label="fila"
                                                onclick={() =>
                                                    clickAnimal(a.id)}
                                                class={`
                                font-medium bg-transparent rounded-lg
                                px-3 py-3 text-base
                                ${selecthashmap[a.id] ? estilos.danger : estilos.primario}
                            `}
                                            >
                                                {#if selecthashmap[a.id]}
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
                                                            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                        />
                                                    </svg>
                                                {:else}
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
                                                            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                        />
                                                    </svg>
                                                {/if}
                                            </button>
                                            {a.caravana}
                                        </h3>
                                        {#if a.sexo == "H" && a.prenada != 1}
                                            <div
                                                class={`badge badge-outline badge-${getEstadoColor(a.prenada)}`}
                                            >
                                                {getEstadoNombre(a.prenada)}
                                            </div>
                                        {/if}
                                    </div>
                                    <div class="grid grid-cols-2 gap-y-2">
                                        <div class="flex items-start">
                                            <span class="font-semibold"
                                                >{getSexoNombre(a.sexo)}</span
                                            >
                                        </div>
                                        <div class="flex items-start">
                                            <span>Categoría:</span>
                                            <span class="font-semibold">
                                                {capitalize(a.categoria)}
                                            </span>
                                        </div>
                                        <div class="flex items-start">
                                            <span>Lote:</span>
                                            <span class="font-semibold">
                                                {a.expand
                                                    ? a.expand.lote
                                                        ? a.expand.lote.nombre
                                                        : ""
                                                    : ""}
                                            </span>
                                        </div>
                                        <div class="flex items-start">
                                            <span>Rodeo:</span>
                                            <span class="font-semibold">
                                                {a.expand
                                                    ? a.expand.rodeo
                                                        ? a.expand.rodeo.nombre
                                                        : ""
                                                    : ""}
                                            </span>
                                        </div>
                                        <div class="flex items-start">
                                            <span>Raza:</span>
                                            <span class="font-semibold">
                                                {a.raza}
                                            </span>
                                        </div>
                                        <div class="flex items-start">
                                            <span>Color:</span>
                                            <span class="font-semibold">
                                                {a.color}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
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
        <h3 class="text-lg font-bold">Movimiento</h3>
        <div class="gap-1">
            <p>
                Se van a modificar {Object.entries(selecthashmap).length} animales
            </p>
        </div>

        <div class="hidden form-control gap-1">
            <div class="collapse">
                <input
                    type="radio"
                    name="my-accordion-1"
                    checked="checked"
                    onchange={() => onChangeCollapse("CATEGORIA")}
                />
                <div class="collapse-title text-xl font-medium">
                    Cambiar categoria
                </div>
                <div class="collapse-content">
                    <label for="rodeos" class="label">
                        <span class="label-text text-base"
                            >Seleccione nueva categoria</span
                        >
                    </label>
                    <label class="input-group">
                        <select
                            class={`
                                select select-bordered w-full
                                rounded-md
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                            bind:value={nuevacategoria}
                            onchange={() => {
                                oninput("CATEGORIA");
                            }}
                        >
                            {#each categorias as r}
                                <option value={r.id}>{r.nombre}</option>
                            {/each}
                        </select>
                    </label>
                </div>
            </div>
            <div class="collapse">
                <input
                    type="radio"
                    name="my-accordion-1"
                    onchange={() => onChangeCollapse("LOTE")}
                />
                <div class="collapse-title text-xl font-medium">
                    Cambiar lote
                </div>
                <div class="collapse-content">
                    <label for="rodeos" class="label">
                        <span class="label-text text-base"
                            >Seleccione nuevo lote</span
                        >
                    </label>
                    <label class="input-group">
                        <select
                            class={`
                                select select-bordered w-full
                                rounded-md
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                            bind:value={nuevolote}
                            onchange={() => oninput("LOTE")}
                        >
                            {#each lotes as r}
                                <option value={r.id}>{r.nombre}</option>
                            {/each}
                        </select>
                    </label>
                </div>
            </div>
            <div class="collapse">
                <input
                    type="radio"
                    name="my-accordion-1"
                    onchange={() => onChangeCollapse("RODEO")}
                />
                <div class="collapse-title text-xl font-medium">
                    Cambiar rodeo
                </div>
                <div class="collapse-content">
                    <label for="rodeos" class="label">
                        <span class="label-text text-base">Rodeos</span>
                    </label>
                    <label class="input-group">
                        <select
                            class={`
                                select select-bordered w-full
                                rounded-md
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `}
                            bind:value={nuevorodeo}
                            onchange={() => oninput("RODEO")}
                        >
                            {#each rodeos as r}
                                <option value={r.id}>{r.nombre}</option>
                            {/each}
                        </select>
                    </label>
                </div>
            </div>
            <div class="collapse hidden">
                <input
                    type="radio"
                    name="my-accordion-1"
                    onchange={() => onChangeCollapse("TRATAMIENTO")}
                />
                <div class="collapse-title text-xl font-medium">
                    Agregar tratamientos
                </div>
                <div class="collapse-content">
                    <div class="grid grid-cols-2 gap-1">
                        <div>
                            <label for="tipo" class="label">
                                <span class="label-text text-base"
                                    >Tipo tratamiento</span
                                >
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
                                    bind:value={tipotratamiento}
                                    onchange={() => oninput("TIPO")}
                                >
                                    {#each tipos as t}
                                        <option value={t.id}>{t.nombre}</option>
                                    {/each}
                                </select>
                            </label>
                        </div>
                        <div>
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
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="collapse">
                <input
                    type="radio"
                    name="my-accordion-1"
                    onchange={() => onChangeCollapse("BAJA")}
                />
                <div class="collapse-title text-xl font-medium">
                    Dar de baja
                </div>
                <div class="collapse-content">
                    <div class="grid grid-cols-2 gap-1">
                        <div>
                            <label for="fecha" class="label">
                                <span class="label-text text-base">Motivo</span>
                            </label>
                            <input
                                id="caravana"
                                type="text"
                                class={`input input-bordered w-full ${estilos.bgdark2}`}
                                bind:value={motivo}
                                oninput={() => oninput("MOTIVO")}
                            />
                        </div>
                        <div>
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
                                    bind:value={fechabaja}
                                    onchange={() => oninput("FECHABAJA")}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="collapse">
                <input
                    type="radio"
                    name="my-accordion-1"
                    onchange={() => onChangeCollapse("TRANSFER")}
                />
                <div class="collapse-title text-xl font-medium">Transferir</div>
                <div class="collapse-content">
                    <div class="grid grid-cols-1 gap-1">
                        <div>
                            <label for="codigo" class="label">
                                <span class="label-text text-base">RENSPA</span>
                            </label>
                            <input
                                id="codigo"
                                type="text"
                                class={`input input-bordered w-full ${estilos.bgdark2}`}
                                bind:value={codigo}
                                oninput={() => oninput("CODIGO")}
                            />
                            {#if malcodigo}
                                <div class="label">
                                    <span class="label-text-alt text-red-500"
                                        >No existe un establecimiento con ese
                                        codigo</span
                                    >
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <CustomModalMove
            bind:nuevacategoria
            bind:nuevolote
            bind:nuevorodeo
            bind:tipotratamiento
            bind:fecha
            bind:motivo
            bind:fechabaja
            bind:codigo
            bind:malcodigo
            {listaanimales}
            {categorias}
            {lotes}
            {rodeos}
            {tipos}
            {HOY}
            {oninput}
            {onChangeCollapse}
        />
        <div class="modal-action justify-start">
            <form method="dialog">
                <button
                    class="btn btn-success text-white"
                    disabled={!habilitarboton}
                    onclick={mover}>{textoboton}</button
                >
                <button class="btn btn-error text-white">Cancelar</button>
            </form>
        </div>
    </div>
</dialog>
<dialog id="veranimal" class="modal modal-middle rounded-xl">
    <div
        class="
            modal-box w-11/12 max-w-6xl
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
        <h3 class="text-xl font-bold">Ver animal</h3>
        <InfoAnimal {animal} forcedOpen={true} />
    </div>
</dialog>
