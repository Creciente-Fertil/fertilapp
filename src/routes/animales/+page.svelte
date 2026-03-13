<script>
    //En esta pagina solo se van a crear y ver animales
    //Se pueden crear nuevos animales con un nacimientos
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import NavegacionBottom from "$lib/components/NavegacionBottom.svelte";
    import Exportar from "$lib/components/Exportar.svelte";
    import PocketBase from "pocketbase";
    import { slide } from "svelte/transition";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import sexos from "$lib/stores/sexos";
    import estilos from "$lib/stores/estilos";
    import estados from "$lib/stores/estados";
    import categorias from "$lib/stores/categorias";
    import { goto } from "$app/navigation";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { createUserer } from "$lib/stores/user.svelte";
    import NuevoAnimal from "$lib/components/animales/NuevoAnimal.svelte";

    //filtros
    import { createStorageProxy } from "$lib/filtros/filtros";

    //permisos
    import {
        getPermisosCabUser,
        getPermisosEstXColab,
    } from "$lib/permisosutil/lib";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosList } from "$lib/permisosutil/lib";
    import RadioButton from "$lib/components/RadioButton.svelte";
    import {
        getEstadoNombre,
        getEstadoColor,
    } from "$lib/components/estadosutils/lib";
    import MultiSelect from "$lib/components/MultiSelect.svelte";
    import cuentas from "$lib/stores/cuentas";
    import {
        getSexoNombre,
        capitalize,
        shorterWord,
    } from "$lib/stringutil/lib";
    import { verificarNivel } from "$lib/permisosutil/lib";
    import Buscador from "$lib/components/animales/Buscador.svelte";
    import TablaAnimales from "$lib/components/animales/TablaAnimales.svelte";
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    let caber = createCaber();
    let userer = createUserer();
    let per = createPer();
    let cab = caber.cab;
    let userpermisos = $state([]);

    let usuarioid = $state("");
    let filtros = false;
    let defaultfiltro = {
        buscar: "",
        rodeobuscar: "",
        rodeoseleccion: [],
        loteseleccion: [],
        categoriaseleccion: [],
        sexobuscar: "",
        lotebuscar: "",
        estadobuscar: -1,
        categoriabuscar: "",
        activosbuscar: "activos",
        raza: "",
        color: "",
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("listaanimales", defaultfiltro);
    //Datos para mostrar
    let animales = $state([]);
    let animalesrows = $state([]);
    let selecthash = $state({});
    let rodeos = $state([]);
    let lotes = $state([]);
    let activos = [
        { id: "todos", nombre: "Todos" },
        { id: "activos", nombre: "Solo activos" },
        { id: "inactivos", nombre: "Solo inactivos" },
    ];
    let madres = $state([]);
    let padres = $state([]);
    let buscar = $state("");
    let rodeobuscar = $state("");
    let rodeoseleccion = $state([]);
    let loteseleccion = $state([]);
    let categoriaseleccion = $state([]);
    let sexobuscar = $state("");
    let lotebuscar = $state("");
    let estadobuscar = $state("");
    let raza = $state("");
    let color = $state("");
    let categoriabuscar = $state("");
    let activosbuscar = $state("activos");
    let totalAnimalesEncontrados = $state(0);

    //Datos animal
    let animal = $state(null);
    let idanimal = $state("");
    let caravana = $state("");
    let rp = $state("");
    let prenada = $state(0);
    let fechanacimiento = $state("");
    let nacimiento = $state("");
    let sexo = $state("H");
    let conparicion = $state(false);
    let peso = $state("");
    let rodeo = $state("");
    let lote = $state("");
    let categoria = $state("");
    //Datos paricion
    let madre = $state("");
    let padre = $state("");
    let nombremadre = $state("");
    let nombrepadre = $state("");
    let observacion = $state("");

    //Validaciones
    let malcaravana = $state(false);
    let malfechanacimiento = $state(false);
    let malpeso = $state(false);
    let botonhabilitado = $state(false);
    function calcularEdad(fechaNacimiento, fechaReferencia = new Date()) {
        const edadnacimiento = new Date(fechaNacimiento);
        const referencia = new Date(fechaReferencia);

        let años = referencia.getFullYear() - edadnacimiento.getFullYear();
        let meses = referencia.getMonth() - edadnacimiento.getMonth();
        let dias = referencia.getDate() - edadnacimiento.getDate();

        if (dias < 0) {
            // Restar un mes y calcular días exactos
            meses -= 1;
            const ultimoMes = new Date(
                referencia.getFullYear(),
                referencia.getMonth(),
                0,
            );
            dias += ultimoMes.getDate();
        }

        if (meses < 0) {
            años -= 1;
            meses += 12;
        }

        return `${años} A ${meses} M ${dias} D`;
    }
    function cambiarFiltros() {
        filtros != filtros;
    }
    function ordenarNombre(lista) {
        if (lista.length == 0) {
            return [];
        }
        lista.sort((r1, r2) =>
            r1.nombre.toLocaleLowerCase() > r2.nombre.toLocaleLowerCase()
                ? 1
                : -1,
        );
    }
    function isEmpty(str) {
        return !str || str.length === 0;
    }
    function limpiarFiltros() {
        proxyfiltros = { ...defaultfiltro };

        setFilters();
        filterUpdate();
    }
    async function getRodeos() {
        const records = await pb.collection("rodeos").getFullList({
            filter: `active = true && cab = '${cab.id}'`,
            sort: "nombre",
        });
        rodeos = records;
        ordenarNombre(rodeos);
    }
    async function getLotes() {
        const records = await pb.collection("lotes").getFullList({
            filter: `active = true && cab = '${cab.id}'`,
            sort: "nombre",
        });
        lotes = records;
        ordenarNombre(lotes);
    }
    async function getAnimales() {
        //Estaria joya que el animal venga con todos los chiches

        const recordsa = await pb.collection("animales").getFullList({
            filter: `delete=false && cab='${cab.id}'`,
            expand: "nacimiento,lote,rodeo",
        });

        animales = recordsa;
        animales.sort((a1, a2) => (a1.caravana > a2.caravana ? 1 : -1));

        animalesrows = animales;
        madres = animales.filter((a) => a.sexo == "H");
        padres = animales.filter((a) => a.sexo == "M");
    }

    function openNewModal() {
        if (userpermisos[5]) {
            idanimal = "";
            botonhabilitado = false;
            caravana = "";
            conparicion = false;
            peso = "";
            sexo = "H";
            fechanacimiento = "";
            nombremadre = "";
            nombrepadre = "";
            padre = "";
            madre = "";
            animal = null;
            observacion = "";
            rp = "";
            nuevoModal.showModal();
        } else {
            Swal.fire(
                "Sin permisos",
                "No tienes permisos para administrar animales",
                "error",
            );
        }
    }

    function getDetail(id) {
        idanimal = id;
        animal = animales.filter((a) => a.id == idanimal)[0];
        caravana = animal.caravana;
        fechanacimiento = animal.fechanacimiento.split(" ")[0];
        sexo = animal.sexo;
        if (sexo == "H") {
            prenada = animal.prenada;
        }
        conparicion = animal.nacimiento != "";
        peso = animal.peso;
        botonhabilitado = true;
        nacimiento = animal.nacimiento;
        lote = animal.lote;
        rodeo = animal.rodeo;
        rp = animal.rp;
        nuevoModal.showModal();
    }
    function gotoniveles() {
        goto(pre + "/user/nivel");
    }
    //Se puede guardar un animal con su nacimiento
    async function guardar() {
        let verificar = await verificarNivel(cab.id);
        if (!verificar) {
            //Swal.fire(
            //    "Error guardar",
            //    `No tienes el nivel de la cuenta para tener más animales`,
            //    "error",
            //);
            Swal.fire({
                title: "Error al guardar",
                text: "No tienes el nivel de la cuenta para tener más animales.",
                icon: "error",
                showCancelButton: true,
                confirmButtonText: "Actualizar plan",
                cancelButtonText: "Ok",
                reverseButtons: true, // Pone "Ok" a la izquierda, estilo más natural
                background: "#1f2937", // Fondo oscuro (modo dark opcional)
                color: "#f3f4f6", // Texto claro
                confirmButtonColor: "#16a34a", // Verde
                cancelButtonColor: "#6b7280", // Gris
            }).then((result) => {
                if (result.isConfirmed) {
                    // Acción al presionar "Actualizar plan"
                    goto("/user/nivel"); // Ejemplo si usás SvelteKit
                    // o window.location.href = "/user/nivel";
                }
                // Si presiona "Ok" simplemente se cierra
            });
            return;
        }
        try {
            let recordparicion = null;
            if (conparicion) {
                let dataparicion = {
                    madre,
                    padre,
                    fecha: fechanacimiento + " 03:00:00",
                    nombremadre,
                    nombrepadre,
                    observacion,

                    cab: cab.id,
                };
                recordparicion = await pb
                    .collection("nacimientos")
                    .create(dataparicion);
            }
            let data = {
                caravana,
                active: true,
                delete: false,
                prenada,
                fechanacimiento: fechanacimiento + " 03:00:00",
                sexo,
                peso,
                lote,
                rodeo,
                rp,
                categoria: categoria ? "" : sexo == "M" ? "ternero" : "ternera",
                cab: cab.id,
            };
            if (conparicion) {
                data.nacimiento = recordparicion.id;
            }
            let recorda = await pb.collection("animales").create(data);
            if (conparicion) {
                recorda.expand = {
                    nacimiento: recordparicion,
                };
            }
            if (fechanacimiento) {
                let datapesaje = {
                    animal: recorda.id,
                    fecha: fechanacimiento + " 03:00:00",
                    pesoanterior: 0,
                    pesonuevo: peso,
                };
                await pb.collection("pesaje").create(datapesaje);
            }

            animales.push(recorda);
            animales.sort((a1, a2) => (a1.caravana > a2.caravana ? 1 : -1));

            madres = animales.filter((a) => a.sexo == "H");
            padres = animales.filter((a) => a.sexo == "M");
            filterUpdate();
            Swal.fire(
                "Éxito guardar",
                "Se pudo guardar el animal con exito",
                "success",
            );
            caravana = "";
            nacimiento = "";
            fechanacimiento = "";
            sexo = "H";
        } catch (e) {
            console.error(e);
            Swal.fire(
                "Error guardar",
                "Hubo un error para guardar el animal",
                "error",
            );
        }
    }
    function setFilters() {
        buscar = proxyfiltros.buscar;
        raza = proxyfiltros.raza;
        color = proxyfiltros.color;
        rodeobuscar = proxyfiltros.rodeobuscar;
        rodeoseleccion = proxyfiltros.rodeoseleccion;
        loteseleccion = proxyfiltros.loteseleccion;
        categoriaseleccion = proxyfiltros.categoriaseleccion;
        sexobuscar = proxyfiltros.sexobuscar;
        lotebuscar = proxyfiltros.lotebuscar;
        estadobuscar = proxyfiltros.estadobuscar;
        categoriabuscar = proxyfiltros.categoriabuscar;
        activosbuscar = proxyfiltros.activosbuscar;
    }
    function setProxyFilter() {
        proxyfiltros.buscar = buscar;
        proxyfiltros.raza = raza;
        proxyfiltros.color = color;
        proxyfiltros.rodeobuscar = rodeobuscar;
        proxyfiltros.rodeoseleccion = rodeoseleccion;
        proxyfiltros.loteseleccion = loteseleccion;
        proxyfiltros.categoriaseleccion = categoriaseleccion;
        proxyfiltros.sexobuscar = sexobuscar;
        proxyfiltros.lotebuscar = lotebuscar;
        proxyfiltros.estadobuscar = estadobuscar;
        proxyfiltros.categoriabuscar = categoriabuscar;
        proxyfiltros.activosbuscar = activosbuscar;
    }
    function filterUpdate() {
        setProxyFilter();
        proxy.save(proxyfiltros);
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
        if (sexobuscar != "") {
            animalesrows = animalesrows.filter((a) => a.sexo == sexobuscar);
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

        if (estadobuscar != -1) {
            animalesrows = animalesrows.filter(
                (a) => a.prenada == estadobuscar && a.sexo == "H",
            );
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
        if (activosbuscar == "activos") {
            animalesrows = animalesrows.filter((a) => a.active == true);
        }
        if (activosbuscar == "inactivos") {
            animalesrows = animalesrows.filter((a) => a.active == false);
        }
        ordenarAnimales("caravana", true);
        totalAnimalesEncontrados = animalesrows.length;
    }

    function onSelectPadre(sex) {
        if (sex == "H") {
            let m = madres.filter((a) => a.id == madre)[0];
            nombremadre = m.caravana;
        } else {
            let p = padres.filter((a) => a.id == padre)[0];
            nombrepadre = p.caravana;
        }
    }
    function oninput(inputName) {
        validarBoton();
        if (inputName == "NOMBRE") {
            if (isEmpty(caravana)) {
                malcaravana = true;
            } else {
                malcaravana = false;
            }
        }
    }

    function validarBoton() {
        botonhabilitado = true;
        if (isEmpty(caravana)) {
            botonhabilitado = false;
        }
    }
    onMount(async () => {
        proxyfiltros = proxy.load();
        setFilters();

        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

        per.setPer(respermisos.permisos, usuarioid);
        userpermisos = getPermisosList(per.per.permisos);
        await getAnimales();
        await getRodeos();
        await getLotes();
        filterUpdate();
    });
    function cerrarModal() {
        idanimal = "";
        botonhabilitado = false;
        caravana = "";
        conparicion = false;
        peso = "";
        sexo = "H";
        fechanacimiento = "";
        nombremadre = "";
        nombrepadre = "";
        padre = "";
        madre = "";
        animal = null;
        rp = "";
        observacion = "";
        lote = "";
        rodeo = "";
        nuevoModal.close();
    }
    function prepararData(item) {
        return {
            CARAVANA: item.caravana,
            RP: item.pr,
            NACIMIENTO: item.fechanacimiento
                ? new Date(item.fechanacimiento).toLocaleDateString()
                : "",
            PADRE: item.expand
                ? item.expand.nacimiento
                    ? item.expand.nacimiento.nombrepadre
                    : ""
                : "",
            MADRE: item.expand
                ? item.expand.nacimiento
                    ? item.expand.nacimiento.nombremadre
                    : ""
                : "",
            SEXO: item.sexo == "M" ? "Macho" : "Hembra",
            PESO: item.peso,
            RAZA: item.raza,
            COLOR: item.color,
            RODEO: item.expand
                ? item.expand.rodeo
                    ? item.expand.rodeo.nombre
                    : ""
                : "",
            LOTE: item.expand
                ? item.expand.lote
                    ? item.expand.lote.nombre
                    : ""
                : "",
            CATEGORIA: capitalize(item.categoria),
            ESTADO: item.sexo == "M" ? "-" : getEstadoNombre(item.prenada),
            FALLECIMIENTO: item.fechafallecimiento
                ? new Date(item.fechafallecimiento).toLocaleDateString()
                : "",
        };
    }
    let pageSize = $state(15);
    //Para el collapse de los filtros
    let isOpenFilter = $state(false);
    function clickFilter() {
        isOpenFilter = !isOpenFilter;
    }
    //Para el collapse de los ordenar
    let isOpenOrdenar = $state(false);
    function clickOrdenar() {
        isOpenOrdenar = !isOpenOrdenar;
    }
    //Para los ordenar
    let ascendente = $state(true);
    let forma = $state("caravana");
    let selectforma = $state("caravana");
    //Ordenar animales
    function ordenarAnimalesDescendente(p_forma) {
        let escalar = 1;
        if (!ascendente) {
            escalar = -1;
        }
        forma = p_forma;
        if (forma == "caravana") {
            animalesrows.sort(
                (a1, a2) => escalar * a1.caravana.localeCompare(a2.caravana),
            );
        } else if (forma == "sexo") {
            animalesrows.sort(
                (a1, a2) => escalar * a1.sexo.localeCompare(a2.sexo),
            );
        } else if (forma == "categoria") {
            animalesrows.sort(
                (a1, a2) => escalar * a1.categoria.localeCompare(a2.categoria),
            );
        } else if (forma == "estado") {
            animalesrows.sort((a1, a2) =>
                a1.prenada > a2.prenada ? escalar : -1 * escalar,
            );
        } else if (forma == "lote") {
            animalesrows.sort((a1, a2) => {
                let l1 = a1.expand
                    ? a1.expand.lote
                        ? a1.expand.lote.nombre
                        : ""
                    : "";
                let l2 = a2.expand
                    ? a2.expand.lote
                        ? a2.expand.lote.nombre
                        : ""
                    : "";
                return escalar * l1.localeCompare(l2);
            });
        } else if (forma == "rodeo") {
            animalesrows.sort((a1, a2) => {
                let r1 = a1.expand
                    ? a1.expand.rodeo
                        ? a1.expand.rodeo.nombre
                        : ""
                    : "";
                let r2 = a2.expand
                    ? a2.expand.rodeo
                        ? a2.expand.rodeo.nombre
                        : ""
                    : "";
                return escalar * r1.localeCompare(r2);
            });
        }
    }
    function ordenarAnimales(p_forma, mantener = false) {
        if (!mantener) {
            if (p_forma == forma) {
                ascendente = !ascendente;
            } else {
                ascendente = true;
            }
        }

        let escalar = 1;
        if (!ascendente) {
            escalar = -1;
        }
        forma = p_forma;
        if (forma == "caravana") {
            animalesrows.sort(
                (a1, a2) => escalar * a1.caravana.localeCompare(a2.caravana),
            );
        } else if (forma == "sexo") {
            animalesrows.sort(
                (a1, a2) => escalar * a1.sexo.localeCompare(a2.sexo),
            );
        } else if (forma == "categoria") {
            animalesrows.sort(
                (a1, a2) => escalar * a1.categoria.localeCompare(a2.categoria),
            );
        } else if (forma == "estado") {
            animalesrows.sort((a1, a2) =>
                a1.prenada > a2.prenada ? escalar : -1 * escalar,
            );
        } else if (forma == "lote") {
            animalesrows.sort((a1, a2) => {
                let l1 = a1.expand
                    ? a1.expand.lote
                        ? a1.expand.lote.nombre
                        : ""
                    : "";
                let l2 = a2.expand
                    ? a2.expand.lote
                        ? a2.expand.lote.nombre
                        : ""
                    : "";
                return escalar * l1.localeCompare(l2);
            });
        } else if (forma == "rodeo") {
            animalesrows.sort((a1, a2) => {
                let r1 = a1.expand
                    ? a1.expand.rodeo
                        ? a1.expand.rodeo.nombre
                        : ""
                    : "";
                let r2 = a2.expand
                    ? a2.expand.rodeo
                        ? a2.expand.rodeo.nombre
                        : ""
                    : "";
                return escalar * r1.localeCompare(r2);
            });
        }
    }
    function nuevo() {
        openNewModal();
    }
    function estadisticas() {
        goto(pre + "/animales/estadisticas");
    }
    //Seleccionados
    let todos = $state(false);
    let ninguno = $state(true);
    let algunos = $state(false);
    function clickTodos() {
        if (todos) {
            todos = false;
            ninguno = true;
            algunos = false;
            selecthash = {};
        } else if (ninguno) {
            ninguno = false;
            todos = true;
            
            for (let i = 0; i < animalesrows.length; i++) {
                let s = animalesrows[i];
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
            let s_idx = animalesrows.findIndex((s) => s.id == id);
            if (s_idx != -1) {
                let s = animalesrows[s_idx];
                selecthash[s.id] = {
                    ...s,
                };
            }
        }
    }
</script>

<Navbar2>
    {#if esdev}
        premisos {JSON.stringify(userpermisos, null, 2)}
    {/if}
    <Buscador
        bind:pageSize
        {selecthash}
        {animalesrows}
        cabnombre={cab.nombre}
        bind:isOpenFilter
        bind:buscar
        {rodeos}
        bind:rodeoseleccion
        bind:sexobuscar
        {sexos}
        {lotes}
        bind:loteseleccion
        {categorias}
        bind:categoriaseleccion
        bind:raza
        bind:color
        bind:estadobuscar
        {estados}
        bind:activosbuscar
        {activos}
        {limpiarFiltros}
        {prepararData}
        {nuevo}
        {estadisticas}
        {filterUpdate}
        {clickFilter}
    />

    <!--Ordenar-->
    <div
        class="block md:hidden w-11/12 m-1 mb-2 lg:mx-10 rounded-lg bg-transparent"
    >
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
                            onchange={() => ordenarAnimales(selectforma)}
                        >
                            <option value="caravana" class="rounded"
                                >Caravana</option
                            >
                            <option value="sexo" class="rounded">Sexo</option>
                            <option value="categoria" class="rounded"
                                >Categoria</option
                            >
                            <option value="lote" class="rounded">Lote</option>
                            <option value="rodeo" class="rounded">Rodeo</option>
                            <option value="estado" class="rounded"
                                >Estado</option
                            >
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
                                onclick={() => ordenarAnimales(selectforma)}
                            />
                        </label>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    <div
        class={`
            hidden w-full xl:w-3/4 md:grid
            mx-auto py-1 px-4 max-w-7xl
        `}
    >
        <div
            class={`
                overflow-hidden rounded-xl
            `}
        >
            <TablaAnimales
                {pageSize}
                {selecthash}
                {animalesrows}
                {ordenarAnimales}
                {clickTodos}
                {clickFila}
                {todos}
                {ascendente}
                {forma}
                {shorterWord}
                {capitalize}
                {getEstadoNombre}
                {calcularEdad}
                
            />
        </div>
    </div>
    

    <div class="block md:hidden justify-items-center mx-1">
        {#each animalesrows as a}
            <div
                class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
            >
                <button onclick={() => goto(`${pre}/animales/${a.id}`)}>
                    <div class="block p-4">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-medium">
                                {shorterWord(a.caravana)}
                            </h3>
                            {#if a.sexo == "H" && a.prenada != 1}
                                <div
                                    class={`badge badge-outline badge-${getEstadoColor(a.prenada)}`}
                                >
                                    {getEstadoNombre(a.prenada)}
                                </div>
                            {/if}
                        </div>
                        <div class="flex items-start">
                            <span>Edad:</span>
                            <span class="font-semibold">
                                {a.fechanacimiento != ""
                                    ? calcularEdad(a.fechanacimiento)
                                    : ""}
                            </span>
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
                </button>
            </div>
        {/each}
    </div>
</Navbar2>
<dialog
    id="nuevoModal"
    class="
            modal modal-top mt-10 ml-5
            lg:items-start
            rounded-xl
            lg:modal-middle
        "
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
        {#if idanimal == ""}
            <h3 class="text-lg font-bold">Nuevo Animal</h3>
        {:else}
            <h3 class="text-lg font-bold">Ver Animal</h3>
        {/if}
        <div class="form-control">
            <NuevoAnimal
                {lotes}
                {rodeos}
                {oninput}
                {onSelectPadre}
                cabid={cab.id}
                bind:madres
                bind:padres
                bind:caravana
                bind:malcaravana
                bind:rp
                bind:sexo
                bind:peso
                bind:prenada
                bind:categoria
                bind:rodeo
                bind:lote
                bind:fechanacimiento
                bind:idanimal
                bind:conparicion
                bind:nombremadre
                bind:madre
                bind:nombrepadre
                bind:padre
                bind:observacion
                bind:nacimiento
            ></NuevoAnimal>
        </div>

        <div class="modal-action justify-end">
            <form method="dialog">
                <!-- if there is a button, it will close the modal -->
                <button class="btn btn-error text-white" onclick={cerrarModal}
                    >Cancelar</button
                >
                {#if idanimal == ""}
                    <button
                        class="btn btn-success text-white"
                        disabled={!botonhabilitado}
                        onclick={guardar}>Guardar</button
                    >
                {/if}
            </form>
        </div>
    </div>
</dialog>
