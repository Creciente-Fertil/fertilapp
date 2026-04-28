<script>
    //v2
    import { goto } from "$app/navigation";
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Exportar from "$lib/components/Exportar.svelte";
    import PocketBase from "pocketbase";
    import { slide } from "svelte/transition";
    import Swal from "sweetalert2";
    import sexos from "$lib/stores/sexos";
    import { onMount } from "svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { createUserer } from "$lib/stores/user.svelte";
    import tiposanimal from "$lib/stores/tiposanimal";
    import permisos from "$lib/stores/permisos";
    import estilos from "$lib/stores/estilos";
    import { guardarHistorial } from "$lib/historial/lib";
    import {
        isEmpty,
        getWholeWordButLastLetter,
        addDays,
    } from "$lib/stringutil/lib";
    import MultipleToros from "$lib/components/MultipleToros.svelte";
    import PredictSelect from "$lib/components/PredictSelect.svelte";
    import { shorterWord } from "$lib/stringutil/lib";
    //FILTROS
    import Buscador from "$lib/components/servicios/Buscador.svelte";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import Limpiar from "$lib/filtros/Limpiar.svelte";
    //tabla
    import TablaServicios from "$lib/components/servicios/TablaServicios.svelte";
    import ListaServicios from "$lib/components/servicios/ListaServicios.svelte";
    //java
    import {
        eliminarServicio,
        getAllServices,
    } from "$lib/java/servicios/serviciosback";
    import { getAll } from "$lib/java/animales/animalesback";
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let caber = createCaber();
    let userer = createUserer();
    let cab = caber.cab;
    let caravana = $state("");
    let cargado = $state(false);
    let cargadoservicios = $state(false);
    let esservicio = $state(false);
    let esinseminacion = $state(false);
    let filtroservicio = $state(0);
    let opcionservicio = [
        { id: 0, nombre: "Todos" },
        { id: 1, nombre: "Solo servicios" },
        { id: 2, nombre: "Solo inseminaciones" },
    ];

    //ver java
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");
    async function toggleJava() {
        versionjava = !versionjava;
        if (!versionjava) {
            await getServicios();
            await getInseminaciones();
            filterUpdate()
        } else {
            await getServicios();
            filterUpdate()
        }
    }

    let buscar = $state("");
    let isOpenFilter = $state(false);
    // Datos para mostrar
    let servicios = $state([]);
    let serviciosrow = $state([]);
    //seleccionados
    //Paginacion
    let pageSize = $state(15);
    let todos = $state(false);
    let algunos = $state(false);
    let ninguno = $state(true);
    let selectfilas = $state([]);
    let selecthash = $state({});
    //Cuando elegis todos, elegir servicios son los no seleccionados
    //Sino elegis todos, elegir servicios son los selecionados
    let elegirTodos = $state(true);
    let elegirServicios = $state({});
    let caravanamadre = $state("");

    let totalServicios = $state(0);
    // Datos para mostrar
    let inseminaciones = $state([]);
    let totalInseminacionesEncontradas = $state(0);
    //Datos inseminaciones
    let idins = $state("");
    let listapadres = $state([]);
    let padre = $state("");
    let pajuela = $state("");
    let categoria = $state("");
    let fechainseminacion = $state("");

    //Validaciones
    let malanimal = $state(false);
    let malpadre = $state(false);
    let malfechainseminacion = $state(false);
    let malfechaparto = $state(false);
    //SERVICIO
    //Datos servicios
    let idserv = $state("");
    let padreslist = $state([]);
    let padresserv = $state("");
    let pajuelasserv = $state("");
    //Seria la fecha del parto
    let fechaparto = $state("");
    let fechadesdeserv = $state("");
    let fechahastaserv = $state("");
    let madre = $state("");
    let observacion = $state("");
    //Filtro de serv
    //desde creciente fetil
    let fechaservhastafiltro = $state("");
    let fechaservdesdefiltro = $state("");
    let fechapartodesde = $state("");
    let fechapartohasta = $state("");
    let buscarpadre = $state("");
    let madres = $state([]);
    let padres = $state([]);
    let borrados = $state([]);
    let idanimal = $state("");

    let defaultfiltro = {
        buscar: "",
        fechaservhastafiltro: "",
        fechaservdesdefiltro: "",
        fechapartodesde: "",
        fechapartohasta: "",
        buscarpadre: "",
        filtroservicio: 0,
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("listaservicios", defaultfiltro);
    //Detalle para servicio e inseminacion
    let defaultServicio = {
        
        edit: false,
        id: "",
        natural: true,
        fechaparto: "",
        observacion: "",
        //servicio
        caravanamadre: "",
        madre: "",
        fechadesde: "",
        fechahasta: "",
        padreslist: [],
        //inseminacion
        animal: "",
        fechainseminacion: "",
        padre: "",
        pajuela: "",
        categoria: "",
    };
    let detalleServicio = $state({ ...defaultServicio });
    let proxyServicio = createStorageProxy("detalleServicio", defaultServicio);
    //detalle movimiento
    let defaultmovimiento = {
        esNatural: true,
        padres: [],
        selecthashmap: {},
        listapadres: [],
    };
    let detallemovimiento = $state({ ...defaultmovimiento });
    let proxyDetalleMovimiento = createStorageProxy(
        "detallemovimientoservicio",
        defaultmovimiento,
    );

    //Dado que puede haber eliminaciones involuntarias
    //Validaciones
    let botonhabilitado = $state(true);

    function clickFilter() {
        isOpenFilter = !isOpenFilter;
    }
    function openEditModal(id, edit = true) {
        esservicio = true;
        idserv = id;
        let ser = servicios.filter((s) => s.id == id)[0];

        if (ser) {
            caravanamadre = "";
            if (ser.expand && ser.expand.madre) {
                caravanamadre = ser.expand.madre.caravana;
            }
            madre = ser.madre;
            if (versionjava) {
                fechadesdeserv = ser.fechadesde;
                fechahastaserv = ser.fechahasta ? ser.fechahasta : "";
                fechaparto = ser.fechaparto;
            } else {
                fechadesdeserv = ser.fechadesde.split(" ")[0];
                fechahastaserv = ser.fechahasta.split(" ")[0];
                fechaparto = ser.fechaparto.split(" ")[0];
            }

            observacion = ser.observacion;
            padreslist = ser.padres.split(",");

            detalleServicio = {
                edit,
                id,
                natural: true,
                versionjava,
                //servicio
                caravanamadre,
                madre,
                fechadesde: fechadesdeserv,
                fechahasta: fechahastaserv,
                fechaparto,
                observacion,
                padreslist,
                //inseminacion
                animal: "",
                fechainseminacion: "",
                padre: "",
                pajuela: "",
                categoria: "",
            };
            proxyServicio.save(detalleServicio);
            goto(pre + "/servicios/" + id);
            //nuevoModal.showModal();
        }
    }
    function openEditModalIns(id, edit = true) {
        esinseminacion = true;
        idins = id;
        let ser = serviciosrow.filter((s) => s.id == id)[0];
        if (ser) {
            caravanamadre = "";
            if (ser.expand && ser.expand.animal) {
                caravanamadre = ser.expand.animal.caravana;
            }
            idanimal = ser.animal;
            fechainseminacion = ser.fechainseminacion.split(" ")[0];
            padre = ser.padre;
            
            pajuela = ser.pajuela;
            fechaparto = ser.fechaparto.split(" ")[0];
            observacion = ser.observacion;
            categoria = ser.categoria;
            detalleServicio = {
                edit,
                id,
                natural: false,
                versionjava,
                caravanamadre,
                //servicio

                madre: "",
                fechadesde: "",
                fechahasta: "",
                padreslist: [],
                //inseminacion
                animal: idanimal,
                fechainseminacion,
                padre,
                pajuela,
                fechaparto,
                observacion,
                categoria,
            };
            proxyServicio.save(detalleServicio);
            goto(pre + "/servicios/" + id);
            //nuevoModalIns.showModal();
        }
    }
    function openViewModal(id) {
        openEditModal(id, false);
    }
    function openViewModalIns(id) {
        openEditModalIns(id, false);
    }
    function openDelModal(id) {
        confirmDelete(id, false);
    }
    function openDelModalIns(id) {
        confirmDelete(id, true);
    }
    async function editar() {
        if (esservicio) {
            try {
                let dataser = {
                    fechadesde: fechadesdeserv + " 03:00:00",
                    fechaparto: fechaparto + " 03:00:00",
                    observacion: observacion,
                    madre: madre,
                    padres: padreslist.join(),
                };
                if (fechahastaserv != "") {
                    dataser.fechahasta = fechahastaserv + " 03:00:00";
                }
                await pb.collection("servicios").update(idserv, dataser);
                Swal.fire(
                    "Éxito editar",
                    "Se pudo editar el servicio con exito",
                    "success",
                );
                await getServicios();
                esservicio = false;

                filterUpdate();
            } catch (err) {
                esservicio = false;
                console.error(err);
            }
        }
        if (esinseminacion) {
            try {
                let data = {
                    fechaparto: fechaparto + " 03:00:00",
                    fechainseminacion: fechainseminacion + " 03:00:00",
                    padre,
                    pajuela,
                    observacion,
                    categoria,
                };
                const record = await pb
                    .collection("inseminacion")
                    .update(idins, data);
                await getInseminaciones();

                filterUpdate();
                Swal.fire(
                    "Éxito editar",
                    "Se pudo editar la inseminación con exito",
                    "success",
                );
                esinseminacion = false;
            } catch (err) {
                console.error(err);
                esinseminacion = false;
                Swal.fire(
                    "Error editar",
                    "Hubo un error para editar la inseminación",
                    "error",
                );
            }
        }
    }
    async function confirmDelete(id, esInseminacion) {
        Swal.fire({
            title: "Eliminar servicio",
            text: "¿Seguro que deseas eliminar el servicio?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                await eliminar(id, esInseminacion);
            }
        });
    }
    async function eliminar(id, esInseminacion) {
        if (!esInseminacion) {
            try {
                if (versionjava) {
                    await eliminarServicio(id);
                    await getServicios();
                } else {
                    await pb
                        .collection("servicios")
                        .update(id, { active: false });
                    await getServicios();
                    filterUpdate();
                }

                Swal.fire(
                    "Éxito eliminar",
                    "Se eliminó con éxito el servicio",
                    "success",
                );
            } catch (err) {
                console.error(err);
            }
        } else {
            try {
                if (versionjava) {
                    await eliminarServicio(id);
                    await getServicios();
                    filterUpdate();
                } else {
                    await pb
                        .collection("inseminacion")
                        .update(id, { active: false });
                    await getInseminaciones();
                    filterUpdate();
                }

                Swal.fire(
                    "Éxito eliminar",
                    "Se eliminó con éxito la inseminación",
                    "success",
                );
            } catch (err) {
                console.error(err);
            }
        }
    }
    function cerrarModal() {
        madre = "";
        fechadesdeserv = "";
        fechahastaserv = "";
        fechaparto = "";
        observacion = "";
        padreslist = [];
        nuevoModal.close();
    }
    async function getInseminaciones() {
        // you can also fetch all records at once via getFullList
        const records = await pb.collection("inseminacion").getFullList({
            sort: "fechainseminacion ",
            filter: `cab = '${cab.id}' && active = true`,
            expand: "animal",
        });
        inseminaciones = records.map((x) => ({ ...x, tipo: "INSEMINATION" }));

        //inseminacionesrow = inseminaciones
    }
    async function getServicios() {
        if (!versionjava) {
            const records = await pb.collection("servicios").getFullList({
                sort: "fechadesde ",
                filter: `cab = '${cab.id}' && active = true`,
                expand: "madre",
            });
            servicios = records.map((x) => ({ ...x, tipo: "NATURAL_SERVICE" }));
        } else {
            servicios = await getAllServices();
        }

        serviciosrow = servicios;
    }
    async function getAnimales() {
        let recordsa = [];
        if (versionjava) {
            recordsa = await getAll();
        } else {
            recordsa = await pb.collection("animales").getFullList({
                filter: `cab='${cab.id}'`,
            });
        }

        recordsa = recordsa.sort((a, b) =>
            a.caravana.toLocaleLowerCase() < b.caravana.toLocaleLowerCase()
                ? -1
                : 1,
        );
        borrados = recordsa;

        madres = recordsa.filter(
            (a) => (a.sexo == "H" || a.sexo == "F") && a.active,
        );
        padres = recordsa.filter((a) => a.sexo == "M" && a.active);
        
        listapadres = padres.map((item) => {
            return {
                id: item.id,
                nombre: item.caravana,
            };
        });
        cargado = true;
    }
    function validarBoton() {}
    function oninput(campo) {}
    function onelegir(id) {}
    function onwrite() {}
    function setFilters() {
        buscar = proxyfiltros.buscar;
        fechaservhastafiltro = proxyfiltros.fechaservhastafiltro;
        fechaservdesdefiltro = proxyfiltros.fechaservdesdefiltro;
        fechapartodesde = proxyfiltros.fechapartodesde;
        fechapartohasta = proxyfiltros.fechapartohasta;
        buscarpadre = proxyfiltros.buscarpadre;
        filtroservicio = proxyfiltros.filtroservicio;
    }

    function setProxyFilter() {
        proxyfiltros.buscar = buscar;
        proxyfiltros.fechaservhastafiltro = fechaservhastafiltro;
        proxyfiltros.fechaservdesdefiltro = fechaservdesdefiltro;
        proxyfiltros.fechapartodesde = fechapartodesde;
        proxyfiltros.fechapartohasta = fechapartohasta;
        proxyfiltros.buscarpadre = buscarpadre;
        proxyfiltros.filtroservicio = filtroservicio;
    }

    function limpiarFiltros() {
        proxyfiltros = { ...defaultfiltro };

        setFilters();
        filterUpdate();
    }
    function incluidoPadre(cadena, p_padres) {
        if (!cadena || !p_padres || p_padres.length === 0) {
            return false;
        }

        const lowerCadena = cadena.toLowerCase();

        for (const str of p_padres) {
            if (str.toLowerCase().includes(lowerCadena)) {
                return true;
            }
        }

        return false;
    }
    function filterUpdate() {
        setProxyFilter();
        proxy.save(proxyfiltros);
        serviciosrow = [];
        if (filtroservicio == 0) {
            serviciosrow = servicios;
            serviciosrow = serviciosrow.concat(inseminaciones);
        } else if (filtroservicio == 1) {
            serviciosrow = servicios;
        } else {
            serviciosrow = inseminaciones;
        }

        if (buscar != "") {
            serviciosrow = serviciosrow.filter((s) => {
                let madre = s.madre
                    ? s.expand.madre.caravana
                    : s.animal
                      ? s.expand.animal.caravana
                      : "";
                return madre
                    .toLocaleLowerCase()
                    .includes(buscar.toLocaleLowerCase());
            });
        }
        if (fechaservdesdefiltro != "") {
            serviciosrow = serviciosrow.filter((s) => {
                let f = s.fechadesde
                    ? s.fechadesde
                    : s.fechainseminacion
                      ? s.fechainseminacion
                      : "";
                return f >= fechaservdesdefiltro;
            });
        }
        if (fechaservhastafiltro != "") {
            serviciosrow = serviciosrow.filter((s) => {
                let f = s.fechadesde
                    ? s.fechadesde
                    : s.fechainseminacion
                      ? s.fechainseminacion
                      : "";
                return f <= fechaservhastafiltro;
            });
        }
        if (fechapartodesde != "") {
            serviciosrow = serviciosrow.filter((s) => {
                let f = s.fechaparto;
                return f >= fechapartodesde;
            });
        }
        if (fechapartohasta != "") {
            serviciosrow = serviciosrow.filter((s) => {
                let f = s.fechaparto;
                return f <= fechapartohasta;
            });
        }
        if (buscarpadre != "") {
            serviciosrow = serviciosrow.filter((s) => {
                let s_padres = s.fechadesde
                    ? getNombrePadres(s.padres).split(",")
                    : [s.pajuela];
                return incluidoPadre(buscarpadre, s_padres);
            });
        }

        ordenarServicios(forma);

        totalServicios = serviciosrow.length;
    }

    function prepararData(item) {
        return {
            FECHA: item.fechadesde
                ? new Date(item.fechadesde).toLocaleDateString()
                : item.fechainseminacion
                  ? new Date(item.fechainseminacion).toLocaleDateString()
                  : "",
            FECHA_HASTA: item.fechahasta
                ? new Date(item.fechahasta).toLocaleDateString()
                : "",
            MADRE: item.fechadesde
                ? item.expand.madre.caravana
                : item.expand.animal.caravana,
            PADRES: item.fechadesde
                ? getNombrePadres(item.padres)
                : item.pajuela,
            FECHA_PARTO: item.fechaparto
                ? new Date(item.fechaparto).toLocaleDateString()
                : "",
            OBSERVACION: item.observacion,
            TIPO:
                item.tipo == "INSEMINATION"
                    ? "Inseminación artificial"
                    : "Servicio Natural",
        };
    }
    function nombreAnimal(valor) {
        let ps = borrados.filter((p) => p.id == valor);

        if (ps.length > 0) {
            return shorterWord(ps[0].caravana) + " , ";
        } else {
            return "transferido" + " , ";
        }
    }
    function getNombrePadres(p_padres) {
        let ids = p_padres.split(",");
        let nombres = ids.reduce((acc, valor) => nombreAnimal(valor) + acc, "");

        return getWholeWordButLastLetter(nombres);
    }
    async function cargarDatos() {
        await getAnimales();
        if (versionjava) {
            await getServicios();
            filterUpdate()
        } else {
            await getServicios();
            await getInseminaciones();
            filterUpdate()
        }

        cargadoservicios = true;
    }
    onMount(async () => {
        proxyfiltros = proxy.load();
        setFilters();

        await cargarDatos();

        filterUpdate();
        //ordenarServicios("fecha")
        if (esCelu) {
            pageSize = 5;
        }
    });

    //Para el collapse de los ordenar
    let isOpenOrdenar = $state(false);
    function clickOrdenar() {
        isOpenOrdenar = !isOpenOrdenar;
    }
    //Para los ordenar
    let ascendente = $state(true);
    let forma = $state("fecha");
    let selectforma = $state("fecha");
    //Ordenar servicios
    function ordenarServiciosDescendente(p_forma) {
        let escalar = 1;
        if (!ascendente) {
            escalar = -1;
        }
        forma = p_forma;
        if (forma == "fecha") {
            serviciosrow.sort((a1, a2) => {
                let f1 = a1.fechadesde
                    ? a1.fechadesde
                    : a1.fechainseminacion
                      ? a1.fechainseminacion
                      : "";
                let f2 = a2.fechadesde
                    ? a2.fechadesde
                    : a2.fechainseminacion
                      ? a2.fechainseminacion
                      : "";
                return escalar * (new Date(f1) > new Date(f2) ? -1 : 1);
            });
        } else if (forma == "fechaparto") {
            serviciosrow.sort(
                (a1, a2) =>
                    escalar * a1.fechaparto.localeCompare(a2.fechaparto),
            );
        } else if (forma == "madre") {
            serviciosrow.sort((a1, a2) => {
                let m1 = a1.fechadesde
                    ? a1.expand.madre.caravana
                    : a1.expand.animal.caravana;
                let m2 = a2.fechadesde
                    ? a2.expand.madre.caravana
                    : a2.expand.animal.caravana;
                return escalar * m1.localeCompare(m2);
            });
        } else if (forma == "tipo") {
            serviciosrow.sort((a1, a2) => {
                let t1 = a1.fechadesde ? 1 : 0;
                let t2 = a2.fechadesde ? 1 : 0;
                return escalar * (t1 < t2 ? -1 : 1);
            });
        }
    }
    function ordenarServicios(p_forma, mantener = true) {
        if (!mantener) {
            if (p_forma == forma) {
                ascendente = !ascendente;
            } else {
                ascendente = true;
            }
        }

        ordenarServiciosDescendente(p_forma);
    }
    function verServicio(id) {
        goto(pre + "/servicios/" + id);
    }

    function nuevo() {
        detallemovimiento.esNatural = true;
        proxyDetalleMovimiento.save(detallemovimiento);
        goto(pre + "/servicios/movimiento");
    }
    function nuevoInseminacion() {
        detallemovimiento.esNatural = false;
        proxyDetalleMovimiento.save(detallemovimiento);
        goto(pre + "/servicios/movimiento/detallemovimento");
    }
    //Seleccionados
    function clickTodos() {
        if (todos) {
            todos = false;
            ninguno = true;
            algunos = false;
            selecthash = {};
        } else if (ninguno) {
            ninguno = false;
            todos = true;
            for (let i = 0; i < serviciosrow.length; i++) {
                let s = serviciosrow[i];
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
            let s_idx = serviciosrow.findIndex((s) => s.id == id);
            if (s_idx != -1) {
                let s = serviciosrow[s_idx];
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
        {selecthash}
        {serviciosrow}
        cabnombre={cab.nombre}
        {totalServicios}
        bind:isOpenFilter
        bind:fechaservdesdefiltro
        bind:fechaservhastafiltro
        bind:fechapartodesde
        bind:fechapartohasta
        bind:filtroservicio
        bind:buscar
        bind:buscarpadre
        {limpiarFiltros}
        {prepararData}
        {nuevo}
        {nuevoInseminacion}
        {filterUpdate}
        {clickFilter}
        {versionjava}
        {toggleJava}
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
                            onchange={() => ordenarServicios(selectforma)}
                        >
                            <option value="fecha" class="rounded">Fecha</option>
                            <option value="fechaparto" class="rounded"
                                >Fecha Parto</option
                            >
                            <option value="madre" class="rounded">Madre</option>
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
                                onclick={() => ordenarServicios(selectforma)}
                            />
                        </label>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    {#if cargadoservicios}
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
                <TablaServicios
                    bind:pageSize
                    {serviciosrow}
                    {ordenarServicios}
                    {openEditModal}
                    {openEditModalIns}
                    {openViewModal}
                    {openViewModalIns}
                    {openDelModal}
                    {openDelModalIns}
                    {shorterWord}
                    {getNombrePadres}
                    {forma}
                    {ascendente}
                    {selecthash}
                    {clickFila}
                    {clickTodos}
                    bind:todos
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
            <ListaServicios
                {pageSize}
                {serviciosrow}
                {ordenarServicios}
                {openEditModal}
                {openEditModalIns}
                {openViewModal}
                {openViewModalIns}
                {openDelModal}
                {openDelModalIns}
                {shorterWord}
                {getNombrePadres}
                {forma}
                {ascendente}
                {selecthash}
                {clickFila}
                {clickTodos}
                bind:todos
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
        <h3 class="text-lg font-bold">Ver servicio</h3>
        <div class="form-control">
            <label for="madre" class="label">
                <span class="label-text text-base">Madre</span>
            </label>
            <label for="madre" class="label">
                <span class="text-md">{caravanamadre}</span>
            </label>

            <label class="hidden input-group">
                <select
                    class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={madre}
                >
                    {#each madres as a}
                        <option value={a.id}>{a.caravana}</option>
                    {/each}
                </select>
            </label>
            <label for="fechadesde" class="label">
                <span class="label-text text-base">Fecha desde</span>
            </label>
            <label class="input-group">
                <input
                    id="fechadesde"
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
                    bind:value={fechadesdeserv}
                />
            </label>
            <label for="fecha" class="label">
                <span class="label-text text-base">Fecha hasta</span>
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
                    bind:value={fechahastaserv}
                />
            </label>
            <label for="nombre" class="label">
                <span class="label-text text-base">Fecha parto</span>
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
                    bind:value={fechaparto}
                />
            </label>
            <label for="nombre" class="label">
                <span class="label-text text-base">Padres</span>
            </label>
            <label class="input-group">
                {#if cargado}
                    <MultipleToros
                        toros={padres}
                        bind:valor={padresserv}
                        bind:listavalores={padreslist}
                    />
                {/if}
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
                <button
                    class="btn btn-success text-white"
                    disabled={!botonhabilitado}
                    onclick={editar}>Editar</button
                >
                <button
                    class="btn btn-error text-white"
                    onclick={() => eliminar(idserv, false)}>Eliminar</button
                >
                <button class="btn btn-neutral" onclick={cerrarModal}
                    >Cerrar</button
                >
            </form>
        </div>
    </div>
</dialog>
<dialog
    id="nuevoModalIns"
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
        <h3 class="text-lg font-bold">Ver inseminación</h3>
        <div class="form-control">
            <label for="nombre" class="label">
                <span class="label-text text-base">Caravana</span>
            </label>

            <label for="nombre" class="label">
                <span class="text-md">{caravanamadre}</span>
            </label>
            <label class="hidden input-group">
                <select
                    class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                    bind:value={idanimal}
                    onchange={() => oninput("ANIMAL")}
                >
                    <option value="agregar">Agregar</option>
                    {#each madres as m}
                        <option value={m.id}>{m.caravana}</option>
                    {/each}
                </select>
                {#if malanimal}
                    <div class="label">
                        <span class="label-text-alt text-red-500"
                            >Debe seleccionar el animal</span
                        >
                    </div>
                {/if}
            </label>
            <label for="tipo" class="label">
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
                    disabled
                    bind:value={categoria}
                >
                    {#each tiposanimal as t}
                        <option value={t.id}>{t.nombre}</option>
                    {/each}
                </select>
            </label>
            {#if cargado}
                <PredictSelect
                    {onwrite}
                    {onelegir}
                    bind:valor={padre}
                    etiqueta={"Padre"}
                    bind:cadena={pajuela}
                    lista={listapadres}
                    size="w-1/2"
                />
            {/if}
            <label for="fechainseminacion" class="label">
                <span class="label-text text-base">Fecha de inseminacion</span>
            </label>
            <label class="input-group">
                <input
                    id="fechainseminacion"
                    type="date"
                    class={`
                        input input-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                    bind:value={fechainseminacion}
                    onchange={() => oninput("FECHAINSEMINACION")}
                />
                {#if malfechainseminacion}
                    <div class="label">
                        <span class="label-text-alt text-red-500"
                            >Debe seleccionar la fecha de inseminacion</span
                        >
                    </div>
                {/if}
            </label>
            <label for="fechaparto" class="label">
                <span class="label-text text-base">Fecha estimada de parto</span
                >
            </label>
            <label class="input-group">
                <input
                    disabled
                    id="fechaparto"
                    type="date"
                    class={`
                        input input-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                    bind:value={fechaparto}
                    onchange={() => oninput("FECHAPARTO")}
                />
                {#if malfechaparto}
                    <div class="label">
                        <span class="label-text-alt text-red-500"
                            >Debe seleccionar la fecha aproximada de parto</span
                        >
                    </div>
                {/if}
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
                <button
                    class="btn btn-success text-white"
                    disabled={!botonhabilitado}
                    onclick={editar}>Editar</button
                >
                <button
                    class="btn btn-error text-white"
                    onclick={() => eliminar(idins, true)}>Eliminar</button
                >
                <button class="btn btn-neutral" onclick={cerrarModal}
                    >Cerrar</button
                >
            </form>
        </div>
    </div>
</dialog>
