<script>
    import estilos from "$lib/stores/estilos";
    import sexos from "$lib/stores/sexos";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { createUserer } from "$lib/stores/user.svelte";
    import { goto } from "$app/navigation";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
    import categorias from "$lib/stores/categorias";
    import estados from "$lib/stores/estados";
    import RadioButton from "$lib/components/RadioButton.svelte";
    //PERMISOS
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosMessage, getPermisosList } from "$lib/permisosutil/lib";

    import { guardarHistorial } from "$lib/historial/lib";
    import PredictSelect from "../PredictSelect.svelte";
    import { shorterWord, capitalize } from "$lib/stringutil/lib";
    import InfoAnimal from "../InfoAnimal.svelte";
    import NacimientoPerfil from "./NacimientoPerfil.svelte";
    import { getAll, saveAnimal } from "$lib/java/animales/animalesback";
    let {
        caravana = $bindable(""),
        rodeo = $bindable(""),
        lote = $bindable(""),
        connacimiento = $bindable(false),
        peso = $bindable(""),
        sexo = $bindable(""),
        nacimiento = $bindable({}),
        padreobj = $bindable({}),
        madreobj = $bindable({}),
        fechanacimiento = $bindable(""),
        categoria = $bindable(""),
        prenada = $bindable(0),
        rp = $bindable(""),
        raza = $bindable(""),
        color = $bindable(""),
        modohistoria = $bindable(),
        irPadre,
        userpermisos = $bindable([]),
        calcularTabs,
        esCelu,
        //Eliminar
        openEliminarModal = () => {},
        add = false,
        versionjava = false,
    } = $props();
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    let caber = createCaber();
    let userer = createUserer();
    let cab = caber.cab;

    let userid = userer.userid;
    let id = $state("");
    let nombrerodeo = $state("");
    let nombrelote = $state("");
    let modoedicion = $state(false);
    let modoedicionnacimiento = $derived(modoedicion);
    let cargadoanimales = $state(false);
    //Datos edicion
    let pesoviejo = $state("");
    let sexoviejo = $state("");
    let caravanavieja = $state("");
    let rodeovieja = $state("");
    let loteviejo = $state("");
    let categoriavieja = $state("");
    let prenadaviejo = $state(false);
    let rpviejo = $state("");

    //Nacimiento
    let fechaviejo = $state("");
    let nombremadreviejo = $state("");
    let nombrepadreviejo = $state("");
    let padreviejo = $state("");
    let madreviejo = $state("");
    let observacionviejo = $state("");

    //Datos nacimiento
    let idnacimiento = $state("");
    let padre = $state("");
    let madre = $state("");
    let nombremadre = $state("");
    let nombrepadre = $state("");
    let fecha = $state("");
    let madres = $state([]);
    let padres = $state([]);
    let listamadres = $state([]);
    let listapadres = $state([]);
    let tipomadre = $state("");

    let observacion = $state("");
    let rodeos = $state([]);
    let lotes = $state([]);

    function onwrite() {}
    function onelegir() {}
    //rodeos
    async function getRodeos() {
        const records = await pb.collection("rodeos").getFullList({
            filter: `active = true && cab ='${cab.id}'`,
            sort: "-nombre",
        });
        rodeos = records;
        if (rodeo != "") {
            nombrerodeo = rodeos.filter((t) => t.id == rodeo)[0].nombre;
        } else {
            nombrerodeo = "";
        }
    }
    //Lotes
    async function getLotes() {
        const records = await pb.collection("lotes").getFullList({
            filter: `active = true && cab ='${cab.id}'`,
            sort: "-nombre",
        });
        lotes = records;
        if (lote != "") {
            nombrelote = lotes.filter((l) => l.id == lote)[0].nombre;
        } else {
            nombrelote = "";
        }
    }
    //Animales
    async function getAnimales() {
        let recordsa = await pb.collection("animales").getFullList({
            filter: `active=true && cab='${cab.id}' `,
            expand: "nacimiento",
        });
        recordsa = recordsa.sort((a, b) =>
            a.caravana.toLocaleLowerCase() < b.caravana.toLocaleLowerCase()
                ? -1
                : 1,
        );
        madres = recordsa.filter((a) => a.sexo == "H" && a.delete == false);
        padres = recordsa.filter((a) => a.sexo == "M" && a.delete == false);
        listamadres = madres.map((item) => {
            return {
                id: item.id,
                nombre: item.caravana,
            };
        });
        listapadres = padres.map((item) => {
            return {
                id: item.id,
                nombre: item.caravana,
            };
        });
        cargadoanimales = true;
    }
    function getSexo(sex) {
        let obj = sexos.filter((s) => s.id == sex)[0];
        if (obj) {
            return obj.nombre;
        } else {
            return "";
        }
    }
    function getEstadoNombre(estado) {
        let obj = estados.filter((s) => s.id == estado)[0];
        if (obj) {
            return obj.nombre;
        } else {
            return "";
        }
    }

    function openEditar() {
        if (userpermisos[5]) {
            modoedicion = true;
            pesoviejo = peso;
            sexoviejo = sexo;
            loteviejo = lote;
            rodeovieja = rodeo;
            caravanavieja = caravana;
            categoriavieja = categoria;
            prenadaviejo = prenada;
            rpviejo = rp;
            fechaviejo = fecha;
            if (connacimiento) {
                nombremadreviejo = nombremadre;
                nombrepadreviejo = nombrepadre;
                madreviejo = madre;
                padreviejo = padre;
                observacionviejo = observacion;
            }
        } else {
            Swal.fire(
                "Sin permisos",
                "No tienes permisos para administrar animales",
                "error",
            );
        }
    }
    function cancelarEditar() {
        modoedicion = false;
        peso = pesoviejo;
        sexo = sexoviejo;
        caravana = caravanavieja;
        rodeo = rodeovieja;
        lote = loteviejo;
        categoria = categoriavieja;
        prenada = prenadaviejo;
        rp = rpviejo;
        if (connacimiento) {
            fecha = fechaviejo;
            nombremadre = nombremadreviejo;
            nombrepadre = nombrepadreviejo;
            madre = madreviejo;
            padre = padreviejo;
            observacion = observacionviejo;
        }
        if (rodeo != "") {
            nombrerodeo = rodeos.filter((t) => t.id == rodeo)[0].nombre;
        } else {
            nombrerodeo = "";
        }
        if (lote != "") {
            nombrelote = lotes.filter((l) => l.id == lote)[0].nombre;
        } else {
            nombrelote = "";
        }
    }

    function openNewModal() {
        if (userpermisos[5]) {
            fecha = fechanacimiento;
            nacimientoModal.showModal();
        } else {
            Swal.fire(
                "Sin permisos",
                "No tienes permisos para administrar animales",
                "error",
            );
        }
    }
    function openEditModal() {
        if (userpermisos[5]) {
            fechaviejo = fecha;
            nombremadreviejo = nombremadre;
            nombrepadreviejo = nombrepadre;
            madreviejo = madre;
            padreviejo = padre;
            observacionviejo = observacion;

            nacimientoModal.showModal();
        } else {
            Swal.fire(
                "Sin permisos",
                "No tienes permisos para administrar animales",
                "error",
            );
        }
    }
    async function guardarNacimiento() {
        if (!userpermisos[4]) {
            Swal.fire("Error permisos", getPermisosMessage(4), "error");
        }
        try {
            let dataparicion = {
                madre,
                padre,
                fecha: fecha + " 03:00:00",
                nombremadre,
                nombrepadre,
                observacion,
                cab: cab.id,
            };
            const recordparicion = await pb
                .collection("nacimientos")
                .create(dataparicion);
            if (padre != "") {
                padreobj = { id: padre, caravana: nombrepadre };
            } else {
                padreobj = { id: -1 };
            }
            if (madre != "") {
                madreobj = { id: madre, caravana: nombremadre };
            } else {
                madreobj = { id: -1 };
            }
            let datanimal = {
                nacimiento: recordparicion.id,
                fechanacimiento: fecha + " 03:00:00",
            };
            let datahistorial = {
                prenada,
                sexo,
                peso,
                caravana,
                active: true,
                delete: false,
                fechanacimiento: fechaviejo + " 03:00:00",
                lote,
                rodeo,
                user: userid,
                categoria,
                animal: id,
            };
            const record = await pb
                .collection("animales")
                .update(id, datanimal);
            //NO va porque tengo que evaluar las fechas
            await pb.collection("historialanimales").create(datahistorial);
            await guardarHistorial(pb, madre);
            let datamadre = {
                prenada: 0,
            };
            if (tipomadre == "vaquillona") {
                datamadre.categoria = "vaca";
            }

            await pb.collection("animales").update(madre, datamadre);
            Swal.fire(
                "Éxito guardar",
                "Se pudo guardar el nacimiento",
                "success",
            );
            connacimiento = true;
            nacimiento = recordparicion;
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error guardar",
                "No se pudo guardar el nacimiento",
                "error",
            );
        }
    }
    async function editarNacimiento() {
        if (!userpermisos[4]) {
            Swal.fire("Error permisos", getPermisosMessage(4), "error");
        }
        let data = {
            madre,
            padre,
            fecha: fecha + " 03:00:00",
            nombremadre,
            nombrepadre,
            observacion,
        };
        let datahistorial = {
            prenada,
            sexo,
            peso,
            caravana,
            active: true,
            delete: false,
            fechanacimiento: fechaviejo + " 03:00:00",
            lote,
            rodeo,
            user: userid,
            categoria,
            animal: id,
        };
        try {
            const recordparicion = await pb
                .collection("nacimientos")
                .update(idnacimiento, data);
            if (padre != "") {
                padreobj = { id: padre, caravana: nombrepadre };
            } else {
                padreobj = { id: -1 };
            }
            if (madre != "") {
                madreobj = { id: madre, caravana: nombremadre };
            } else {
                madreobj = { id: -1 };
            }
            await pb.collection("historialanimales").create(datahistorial);
        } catch (err) {
            console.error(err);
        }
    }
    function getNombreMadre() {
        let m = madres.filter((item) => item.id == madre)[0];
        nombremadre = m.caravana;

        tipomadre = m.categoria;
    }
    function getNombrePadre() {
        let p = padres.filter((item) => item.id == padre)[0];
        nombrepadre = p.caravana;
    }
    async function editarAnimal() {
        let data = {
            peso,
            sexo,
            caravana,
            rodeo,
            lote,
            prenada,
            categoria,
            raza,
            color,
            rp,
        };
        if (fechaviejo != fecha) {
            data.fechanacimiento = fecha.length > 0 ? fecha + " 03:00:00" : "";
        }

        try {
            //nueva fecha
            let connuevafecha = fechaviejo != fecha && fecha.length > 0;
            //nueva madre
            let connuevamadre = madreviejo != madre;
            //nuevo padre
            let connuevopadre = padreviejo != padre;

            let nuevonacimiento = connacimiento;
            //No tiene nacimiento
            if (!connacimiento) {
                //Tiene
                if (connuevamadre || connuevopadre) {
                    let dataparicion = {
                        madre,
                        padre,
                        fecha: fecha.length > 0 ? fecha + " 03:00:00" : "",
                        nombremadre,
                        nombrepadre,
                        observacion,
                        cab: cab.id,
                    };
                    const recordparicion = await pb
                        .collection("nacimientos")
                        .create(dataparicion);
                    idnacimiento = recordparicion.id;
                    nuevonacimiento = true;
                    if (padre != "") {
                        padreobj = { id: padre, caravana: nombrepadre };
                    } else {
                        padreobj = { id: -1 };
                    }
                    if (madre != "") {
                        madreobj = { id: madre, caravana: nombremadre };
                    } else {
                        madreobj = { id: -1 };
                    }
                }
            }
            //tiene nacimietno
            else {
                if (connuevamadre || connuevopadre || connuevafecha) {
                    const recordparicion = await pb
                        .collection("nacimientos")
                        .update(idnacimiento, data);
                    if (padre != "") {
                        padreobj = { id: padre, caravana: nombrepadre };
                    } else {
                        padreobj = { id: -1 };
                    }
                    if (madre != "") {
                        madreobj = { id: madre, caravana: nombremadre };
                    } else {
                        madreobj = { id: -1 };
                    }
                }
            }

            if (nuevonacimiento) {
                data.nacimiento = idnacimiento;
                connacimiento = true;
            }
            //Antes debi verificar el nacimiento
            const record = await pb.collection("animales").update(id, data);

            await guardarHistorial(pb, id);
            sexo = data.sexo;
            peso = data.peso;
            caravana = data.caravana;
            rodeo = data.rodeo;
            lote = data.lote;
            categoria = data.categoria;
            prenada = data.prenada;
            if (rodeo != "") {
                nombrerodeo = rodeos.filter((t) => t.id == rodeo)[0].nombre;
            } else {
                nombrerodeo = "";
            }
            if (lote != "") {
                nombrelote = lotes.filter((l) => l.id == lote)[0].nombre;
            } else {
                nombrelote = "";
            }

            Swal.fire("Éxito editar", "Se pudo editar el animal", "success");
            modoedicion = false;
        } catch (err) {
            console.error(err);
            Swal.fire("Error editar", "No se pudo editar el animal", "error");
        }
    }
    async function guardarAnimal() {
        
        if (!versionjava) {
            let data = {
                peso,
                sexo,
                caravana,
                rodeo,
                lote,
                prenada,
                categoria,
                raza,
                color,
                rp,
                active: true,
                cab: cab.id,
            };
            data.fechanacimiento = fecha.length > 0 ? fecha + " 03:00:00" : "";
            try {
                //nueva fecha
                let connuevafecha = fechaviejo != fecha && fecha.length > 0;
                //nueva madre
                let connuevamadre = madreviejo != madre;
                //nuevo padre
                let connuevopadre = padreviejo != padre;

                let nuevonacimiento = connacimiento;
                if (connuevamadre || connuevopadre) {
                    let dataparicion = {
                        madre,
                        padre,
                        fecha: fecha.length > 0 ? fecha + " 03:00:00" : "",
                        nombremadre,
                        nombrepadre,
                        observacion,
                        cab: cab.id,
                    };
                    const recordparicion = await pb
                        .collection("nacimientos")
                        .create(dataparicion);

                    idnacimiento = recordparicion.id;
                    nuevonacimiento = true;
                    if (padre != "") {
                        padreobj = { id: padre, caravana: nombrepadre };
                    } else {
                        padreobj = { id: -1 };
                    }
                    if (madre != "") {
                        madreobj = { id: madre, caravana: nombremadre };
                    } else {
                        madreobj = { id: -1 };
                    }
                }
                if (nuevonacimiento) {
                    data.nacimiento = idnacimiento;
                    connacimiento = true;
                }
                const record = await pb.collection("animales").create(data);
                sexo = data.sexo;
                peso = data.peso;
                caravana = data.caravana;
                rodeo = data.rodeo;
                lote = data.lote;
                categoria = data.categoria;
                prenada = data.prenada;
                if (rodeo != "") {
                    nombrerodeo = rodeos.filter((t) => t.id == rodeo)[0].nombre;
                } else {
                    nombrerodeo = "";
                }
                if (lote != "") {
                    nombrelote = lotes.filter((l) => l.id == lote)[0].nombre;
                } else {
                    nombrelote = "";
                }
                if (fecha.length > 0) {
                    let datapesaje = {
                        animal: record.id,
                        fecha: fecha + " 03:00:00",
                        pesoanterior: 0,
                        pesonuevo: peso,
                    };
                    let recordope = await pb
                        .collection("pesaje")
                        .create(datapesaje);
                }
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar el animal",
                    "success",
                );
                modoedicion = false;

                goto(pre + "/animales");
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar el animal",
                    "error",
                );
            }
        }
        else{
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
            let res =  await saveAnimal(data);
            Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar el animal",
                    "success",
                );
                modoedicion = false;

                goto(pre + "/animales");

        }
    }
    function cerrarModal() {
        fecha = "";
        nombremadre = "";
        nombrepadre = "";
        madre = "";
        padre = "";
        observacion = "";
        categoria = "";

        if (connacimiento) {
            fecha = fechaviejo;
            nombremadre = nombremadreviejo;
            nombrepadre = nombrepadreviejo;
            madre = madreviejo;
            padre = padreviejo;
            observacion = observacionviejo;
        }
        nacimientoModal.close();
    }

    onMount(async () => {
        id = $page.params.slug;

        await getAnimales();
        await getRodeos();
        await getLotes();
        if (connacimiento) {
            idnacimiento = nacimiento.id;
            fecha = nacimiento.fecha.split(" ")[0];
            nombremadre = nacimiento.nombremadre;
            nombrepadre = nacimiento.nombrepadre;
            padre = nacimiento.padre;
            madre = nacimiento.madre;

            observacion = nacimiento.observacion;
        } else {
            fecha = fechanacimiento;
        }
        if (add) {
            modoedicion = true;
        }
    });
    //cancelar class="btn btn-error text-white font-medium text-lg "
    //Editar animal class="btn text-lg px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    function volver() {
        goto(pre + "/animales");
    }
</script>

<div class="grid grid-cols-2 lg:grid-cols-2">
    <button class="hidden" onclick={volver}>
        <h2 class="flex text-2xl mx-1 font-bold mb-2 text-left mt-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="md:hidden size-5 mt-1"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                />
            </svg>
            Caravana: {shorterWord(caravana)}
        </h2>
    </button>
</div>

<div class="grid grid-cols-2 gap-1 lg:gap-6 mx-1 mb-2">
    {#if modoedicion}
        <div class="mb-1 lg:mb-0 col-span-2 lg:col-span-1">
            <label for="caravana" class="label mb-0 pb-0">
                <span
                    class="
                        label-text tracking-wide
                        text-md uppercase
                        font-semibold dark:text-gray-400
                        text-gray-500
                        
                    ">Caravana</span
                >
            </label>
            <label class="input-group">
                <input
                    id="caravana"
                    type="text"
                    class={`input input-bordered w-full ${estilos.bgdark2}`}
                    bind:value={caravana}
                />
            </label>
        </div>
    {/if}
    <div class="mb-1 lg:mb-0 col-span-2 lg:col-span-1">
        <label for="rp" class="label mb-0 pb-0">
            <span
                class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
            >
                RP</span
            >
        </label>
        {#if modoedicion}
            <label class="input-group">
                <input
                    id="rp"
                    type="text"
                    class={`input input-bordered w-full ${estilos.bgdark2}`}
                    bind:value={rp}
                />
            </label>
        {:else}
            <label
                for="rp"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {shorterWord(rp)}
            </label>
        {/if}
    </div>
    <div class="mb-1 lg:mb-0">
        <label for="peso" class="label mb-0 pb-0">
            <span
                class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
            >
                Peso(KG)
            </span>
        </label>
        {#if modoedicion}
            <label class="input-group">
                <input
                    id="peso"
                    type="number"
                    class={`input input-bordered w-full ${estilos.bgdark2}`}
                    bind:value={peso}
                    oninput={() => (peso = Math.max(0, peso))}
                />
            </label>
        {:else}
            <label
                for="peso"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {peso}
            </label>
        {/if}
    </div>
    <div class="mb-1 lg:mb-0">
        <label for="sexo" class="label mb-0 pb-0">
            <span
                class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
            >
                Sexo</span
            >
        </label>
        {#if modoedicion}
            <label class="input-group">
                <select
                    class={`
                        select select-bordered
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={sexo}
                    onchange={calcularTabs}
                >
                    {#each sexos as s}
                        <option value={s.id}>{s.nombre}</option>
                    {/each}
                </select>
            </label>
        {:else}
            <label
                for="sexo"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {getSexo(sexo)}
            </label>
        {/if}
    </div>
    <div class="mb-1 lg:mb-0">
        <label for="rodeo" class="label mb-0 pb-0">
            <span
                class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
            >
                Rodeo</span
            >
        </label>
        {#if modoedicion}
            <label class="input-group">
                <select
                    class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={rodeo}
                >
                    {#each rodeos as t}
                        <option value={t.id}>{t.nombre}</option>
                    {/each}
                </select>
            </label>
        {:else}
            <label
                for="rodeo"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {nombrerodeo}
            </label>
        {/if}
    </div>
    <div class="mb-1 lg:mb-0">
        <label for="lote" class="label mb-0 pb-0">
            <span
                class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
            >
                Lote</span
            >
        </label>
        {#if modoedicion}
            <label class="input-group">
                <select
                    class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={lote}
                >
                    {#each lotes as l}
                        <option value={l.id}>{l.nombre}</option>
                    {/each}
                </select>
            </label>
        {:else}
            <label
                for="lote"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {nombrelote}
            </label>
        {/if}
    </div>
    <div class="mb-1 lg:mb-0">
        <label for="categoria" class="label mb-0 pb-0">
            <span
                class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
            >
                Categoria</span
            >
        </label>
        {#if modoedicion}
            <label class="input-group">
                <select
                    class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={categoria}
                >
                    {#each categorias.filter((c) => c.sexo == sexo) as l}
                        <option value={l.id}>{l.nombre}</option>
                    {/each}
                </select>
            </label>
        {:else}
            <label
                for="categoria"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {capitalize(categoria)}
            </label>
        {/if}
    </div>
    <div class="mb-1 lg:mb-0">
        <label for="raza" class="label mb-0 pb-0">
            <span
                class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
            >
                Raza</span
            >
        </label>
        {#if modoedicion}
            <label class="input-group">
                <input
                    id="raza"
                    type="text"
                    class={`input input-bordered w-full ${estilos.bgdark2}`}
                    bind:value={raza}
                />
            </label>
        {:else}
            <label
                for="raza"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {shorterWord(raza)}
            </label>
        {/if}
    </div>
    <div class="mb-1 lg:mb-0">
        <label for="peso" class="label mb-0 pb-0">
            <span
                class="
                    label-text tracking-wide
                    text-md uppercase
                    font-semibold dark:text-gray-400
                    text-gray-500
                "
            >
                Color</span
            >
        </label>
        {#if modoedicion}
            <label class="input-group">
                <input
                    id="color"
                    type="text"
                    class={`input input-bordered w-full ${estilos.bgdark2}`}
                    bind:value={color}
                />
            </label>
        {:else}
            <label
                for="color"
                class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
            >
                {shorterWord(color)}
            </label>
        {/if}
    </div>
    {#if sexo == "H"}
        <div class="mb-1 lg:mb-0 col-span-2 lg:w-1/2">
            <label for="prenada" class="label mb-0 pb-0">
                <span
                    class="
                        label-text tracking-wide
                        text-md uppercase
                        font-semibold dark:text-gray-400
                        text-gray-500
                    "
                >
                    Estado</span
                >
            </label>
            {#if modoedicion}
                <label class="input-group">
                    <select
                        class={`
                        select select-bordered
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                        bind:value={prenada}
                    >
                        {#each estados.filter(es=>es.id>-1) as s}
                            <option value={s.id}>{s.nombre}</option>
                        {/each}
                    </select>
                </label>
            {:else}
                <label
                    for="sexo"
                    class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
                >
                    {getEstadoNombre(prenada)}
                </label>
            {/if}
        </div>
    {/if}
</div>
{#if connacimiento}
    {#if modoedicionnacimiento}
        <NacimientoPerfil
            {connacimiento}
            bind:fecha
            bind:madre
            bind:nombremadre
            {onelegir}
            {onwrite}
            {listamadres}
            {cargadoanimales}
            bind:padre
            bind:nombrepadre
            {listapadres}
            bind:observacion
            {modoedicionnacimiento}
        />
    {:else}
        <div class="grid grid-cols-1 gap-1 lg:gap-6 mb-2">
            <div>
                <label for="fechanacimiento" class="label mb-0 pb-0">
                    <span
                        class="
                            label-text tracking-wide
                            text-md uppercase
                            font-semibold dark:text-gray-400
                            text-gray-500
                        "
                    >
                        Fecha nacimiento</span
                    >
                </label>
                <label
                    for="fechanacimiento"
                    class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
                >
                    {new Date(fecha + " 03:00:00").toLocaleDateString()}
                </label>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-1 lg:gap-6 mx-1 mb-2">
            <div>
                <label for="nombremadre" class="label">
                    <span class="label-text text-base">
                        <span
                            class="label-text tracking-wide text-md uppercase font-semibold dark:text-gray-400 text-gray-500"
                        >
                            Madre
                        </span>: {nombremadre}
                    </span>
                </label>

                {#if madreobj.id != -1}
                    <div class="flex justify-start mx-0 px-0">
                        <button
                            class={`${estilos.basico} ${estilos.chico} ${estilos.primario}`}
                            onclick={async () => await irPadre(madreobj.id)}
                            >Ver animal</button
                        >
                    </div>
                {/if}
            </div>

            <div>
                <label for="nombrepadre" class="label">
                    <span class="label-text text-base">
                        <span
                            class="label-text tracking-wide text-md uppercase font-semibold dark:text-gray-400 text-gray-500"
                        >
                            Padre
                        </span>
                        : {nombrepadre}
                    </span>
                </label>

                {#if padreobj.id != -1}
                    <div class="flex justify-start mx-0 px-0">
                        <button
                            class={`${estilos.basico} ${estilos.chico} ${estilos.primario}`}
                            onclick={async () => await irPadre(padreobj.id)}
                            >Ver animal</button
                        >
                    </div>
                {/if}
            </div>
        </div>
    {/if}
{:else}
    <div>
        {#if modoedicionnacimiento}
            <NacimientoPerfil
                {connacimiento}
                bind:fecha
                bind:madre
                bind:nombremadre
                {onelegir}
                {onwrite}
                {listamadres}
                {cargadoanimales}
                bind:padre
                bind:nombrepadre
                {listapadres}
                bind:observacion
                {modoedicionnacimiento}
            />
        {:else}
            {#if fecha.length > 0}
                <div class="grid grid-cols-1 gap-1 lg:gap-6 mb-2">
                    <div>
                        <label for="fechanacimiento" class="label">
                            <span class="label-text text-base"
                                >Fecha nacimiento</span
                            >
                        </label>
                        <label
                            for="fechanacimiento"
                            class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-2`}
                        >
                            {new Date(fecha + " 03:00:00").toLocaleDateString()}
                        </label>
                    </div>
                </div>
            {/if}
            <div class="grid grid-cols-1">
                <h3 class="text-xl mx-1 font-bold mb-1 text-left">
                    No tiene un nacimiento registrado
                </h3>
            </div>
        {/if}

        <div class="hidden mt-6 flex space-x-3 justify-end">
            <button
                onclick={guardarNacimiento}
                class={`
                    mt-2 px-5 py-1 md:py-2 md:px-10 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base
                    ${modoedicionnacimiento ? "" : "hidden"}
                `}
                aria-label="Editar"
            >
                Guardar
            </button>
        </div>
    </div>
{/if}
{#if modoedicion}
    <div class="mt-6 flex space-x-3 justify-end border-t dark:border-gray-800">
        <!-- Botón Cancelar -->
        {#if add}
            <!-- Botón Editar -->
            <button
                class="mt-2 px-5 py-1 md:py-2 md:px-10 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base"
                onclick={guardarAnimal}
            >
                Guardar
            </button>
        {:else}
            <button
                class="
                        
                mt-2 px-5 py-1 md:py-2 md:px-10
                dark:bg-transparent
                bg-white
                text-gray-800
                dark:text-white
                font-medium
                rounded-full shadow-sm border
                border-gray-300
                hover:bg-gray-200
                dark:hover:bg-gray-800
                transition-colors
                text-base"
                onclick={cancelarEditar}
            >
                Cancelar
            </button>
            <!-- Botón Editar -->
            <button
                class="mt-2 px-5 py-1 md:py-2 md:px-10 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base"
                onclick={editarAnimal}
            >
                Guardar cambios
            </button>
        {/if}
    </div>
{/if}
<div
    class={`mt-6 flex space-x-3 justify-end border-t dark:border-gray-800 ${modoedicion ? "hidden" : ""}`}
>
    <button
        onclick={openEliminarModal}
        class="mt-2 px-10 py-2 bg-[#A94442] text-white font-medium rounded-full shadow-sm hover:bg-red-800 transition-colors text-base"
    >
        Eliminar
    </button>
    <!-- Botón Volver -->
    <button
        class="
            hidden
            mt-2 px-10 py-2
            dark:bg-transparent
            bg-white
            text-gray-800
            dark:text-white
            font-medium
            rounded-full shadow-sm border
            border-gray-300
            hover:bg-gray-200
            dark:hover:bg-gray-800
            transition-colors
            text-base"
        onclick={volver}
    >
        Volver
    </button>
    <button
        class={`
            mt-2 px-5 py-1 md:py-2 md:px-10 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base
            
        `}
        onclick={openEditar}
    >
        Editar
    </button>
</div>
