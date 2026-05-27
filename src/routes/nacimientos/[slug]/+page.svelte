<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import PocketBase from "pocketbase";
    import { getAbortSignal, onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import estilos from "$lib/stores/estilos";
    import Swal from "sweetalert2";
    import CardNacimiento from "$lib/components/nacimientos/CardNacimiento.svelte";
    //permisos
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosMessage, getPermisosList } from "$lib/permisosutil/lib";
    import {
        getPermisosCabUser,
        getPermisosEstXColab,
    } from "$lib/permisosutil/lib";
    //localstorage
    import { createCaber } from "$lib/stores/cab.svelte";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import DetalleNacimiento from "$lib/components/nacimientos/DetalleNacimiento.svelte";
    import PredictSelect from "$lib/components/PredictSelect.svelte";
    import {
        editNacimiento,
        eliminarNacimiento,
        saveBirth,
    } from "$lib/java/nacimientos/nacimientosback";
    import { getAll, saveAnimal } from "$lib/java/animales/animalesback";
    import { getUser } from "$lib/userstorage/usersotrage";
    import { savePeso } from "$lib/java/pesajes/pesajesback";
    import { loadStorageEstablecimiento } from "$lib/java/establecimientos/establecimientostorage";
    import Success from "$lib/components/botones/Success.svelte";
    import Nacimiento from "$lib/svgs/nacimiento.svelte";

    let versionjava = $state(import.meta.env.VITE_JAVA == "si");

    async function toggleJava() {
        versionjava = !versionjava;
        await getData();
    }
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    let caber = createCaber();
    let cab = $state(caber.cab);
    let cargado = $state(false);
    let per = createPer();
    let userpermisos = $state([]);
    let slug = $state("");
    let add = $state(false);
    let cargadoanimales = $state(false);
    let agregaranimal = $state(false);

    let usuarioid = $state("");
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
    //datos generales
    let edit = $state(false);

    let madres = $state([]);
    let padres = $state([]);
    let listamadres = $state([]);
    let listapadres = $state([]);
    let cadenamadre = $state("");
    let cadenapadre = $state("");

    //datos animal
    let idanimal = $state("");
    let caravana = $state("");
    let sexo = $state("");
    let categoria = $state("");
    let peso = $state("");
    //validacion
    let malcaravana = $state(false);

    //Datos nacimiento
    let id = $state("");
    let idnacimiento = $state("");
    let nacimiento = $state(null);

    let padre = $state("");
    let madre = $state("");
    let nombremadre = $state("");
    let nombrepadre = $state("");
    let fecha = $state("");
    let observacion = $state("");
    // validacion
    let malfecha = $state(false);

    let padreviejo = $state("");
    let madreviejo = $state("");
    let nombremadreviejo = $state("");
    let nombrepadreviejo = $state("");
    let fechaviejo = $state("");
    let observacionviejo = $state("");

    function setViejo() {
        padreviejo = padre;
        madreviejo = madre;
        nombremadreviejo = nombremadre;
        nombrepadreviejo = nombrepadre;
        fechaviejo = fecha;
        observacionviejo = observacion;
    }
    function fromViejo() {
        padre = padreviejo;
        madre = madreviejo;
        nombremadre = nombremadreviejo;
        nombrepadre = nombrepadreviejo;
        fecha = fechaviejo;
        observacion = observacionviejo;
    }
    function volver() {
        if (edit) {
            edit = false;
            fromViejo();
            return;
        }
        goto(pre + "/servicios");
    }
    async function getAnimales() {
        let recordsa = [];
        if (!versionjava) {
            recordsa = await pb.collection("animales").getFullList({
                filter: `active=true && cab='${cab.id}' && delete = false`,
                expand: "nacimiento",
            });
        } else {
            let data_animales = await getAll(cab.id);
            recordsa = data_animales;
            if(add){
                recordsa = recordsa.filter(animal => !animal.delete)
            }
        }
        recordsa = recordsa.sort((a, b) =>
            a.caravana.toLocaleLowerCase() < b.caravana.toLocaleLowerCase()
                ? -1
                : 1,
        );
        madres = recordsa.filter((a) => a.sexo == "H" || a.sexo == "F");
        padres = recordsa.filter((a) => a.sexo == "M");

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
    function onInputAnimal() {
        if (caravana.trim().length > 0) {
            malcaravana = false;
        } else {
            malcaravana = true;
        }
    }
    function onInputNacimiento() {
        if (fecha.length > 0) {
            malfecha = false;
        } else {
            malfecha = true;
        }
    }
    function loadNacimiento() {
        detalleNacimiento = proxyNacimiento.load();
        edit = detalleNacimiento.edit;
        id = detalleNacimiento.id;
        idanimal = detalleNacimiento.idanimal;
        madre = detalleNacimiento.madre;
        caravana = detalleNacimiento.caravana;

        nombremadre = detalleNacimiento.nombremadre;
        padre = detalleNacimiento.padre;
        nombrepadre = detalleNacimiento.nombrepadre;
        observacion = detalleNacimiento.observacion;
        fecha = detalleNacimiento.fecha;
        setViejo();
    }
    async function getData() {
        if (versionjava) {
            let user_data = getUser();
            usuarioid = user_data.id;
            cab = loadStorageEstablecimiento();
            userpermisos = [];
        } else {
            let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
            usuarioid = pb_json.record.id;
            let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);
            per.setPer(respermisos.permisos, usuarioid);

            userpermisos = getPermisosList(per.per.permisos);
            cab = caber.cab;
        }
    }
    onMount(async () => {
        malfecha = false
        slug = $page.params.slug;
        idnacimiento = slug;
        await getData();
        if (slug == "0") {
            add = true;
            edit = true;
            idanimal = "";
            madre = "";
            caravana = "";
            nombremadre = "";
            padre = "";
            nombrepadre = "";
            observacion = "";
            fecha = "";
        } else {
            agregaranimal = false
            loadNacimiento();
        }

        await getAnimales();
        cargado = true;
    });
    async function guardar() {
        if (!versionjava) {
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
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar el nacimiento con exito",
                    "success",
                );
                goto(pre + "/nacimientos");
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "Hubo un error para guardar el nacimiento",
                    "error",
                );
            }
        } else {
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
            let dataparicion = {
                madre: m.id,
                padre,
                fecha: fecha + " 03:00:00",
                nombremadre: m.nombremadre,
                nombrepadre,
                observacion,
                cab: cab.id,
            };
            try {
                let res = await saveBirth(dataparicion);
                if (agregaranimal) {
                    let data = {
                        caravana,
                        fechanacimiento: fecha + " 03:00:00",
                        sexo,
                        cab: cab.id,
                        peso,
                        lote: m.lote,
                        rodeo: m.rodeo,
                        nacimiento: res.birthId,
                    };
                    let res_animal = await saveAnimal(data);
                    if (peso) {
                        let data_peso = {
                            animal: res_animal.id,
                            fecha: new Date().toISOString().split("T")[0],
                            pesonuevo: peso,
                        };
                        await savePeso(data_peso);
                    }
                }
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar el nacimiento con exito",
                    "success",
                );
                goto(pre + "/nacimientos");
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "Hubo un error para guardar el nacimiento",
                    "error",
                );
            }
        }
    }
    async function editar() {
        if (!edit) {
            setViejo();
            edit = true;
            malfecha = false
        } else {
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
                if (versionjava) {
                    let data_java = {
                        date: fecha,
                        motherId: m.id,
                        fatherId: padre,
                        notes: observacion,
                        establishmentId: cab.id,
                    };

                    await editNacimiento(idnacimiento, data_java);
                } else {
                    const record = await pb
                        .collection("nacimientos")
                        .update(idnacimiento, dataparicion);
                }

                Swal.fire(
                    "Éxito editar",
                    "Se pudo editar el nacimiento con exito",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error editar",
                    "Hubo un error para editar el nacimiento",
                    "error",
                );
            }
            goto(pre + "/nacimientos");
        }
    }
    async function eliminar() {
        try {
            if (versionjava) {
                await eliminarNacimiento(idnacimiento);
            } else {
                await pb.collection("nacimientos").delete(idnacimiento);
            }

            goto(pre + "/nacimientos");

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
    }
    async function confirmDelete() {
        Swal.fire({
            title: "Eliminar nacimiento",
            text: "¿Seguro que deseas eliminar el nacimiento?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                await eliminar();
            }
        });
    }
    function switchAgregarAnimal(){
        onInputAnimal()
    }
    function onchange() {
        onInputNacimiento();
    }
    function onelegirMadre() {}
    function onwriteMadre() {}
    function onelegirPadre() {}
    function onwritePadre() {}
</script>
<svelte:head>
    <title>Nacimientos · Fertilapp</title>
</svelte:head>
<Navbar2>
    <CardNacimiento cardsize="max-w-7xl" {edit} {add}>
        <DetalleNacimiento
            {edit}
            {add}
            {cargado}
            caravananimal={caravana}
            bind:fecha
            bind:padre
            bind:madre
            bind:nombremadre
            bind:nombrepadre
            bind:observacion
            bind:agregaranimal
            bind:idanimal
            bind:caravana
            bind:sexo
            bind:categoria
            bind:peso
            {malfecha}
            {listamadres}
            {listapadres}
            {onchange}
            {onelegirMadre}
            {onelegirPadre}
            {onwritePadre}
            {onwriteMadre}
            {toggleJava}
            {versionjava}
            {onInputAnimal}
            {onInputNacimiento}
            {switchAgregarAnimal}
        />
        <!-- Botones alineados a la derecha, más bajos, en la parte inferior -->

        {#if add}
            <div
                class=" mt-6 flex space-x-3 justify-end border-t dark:border-gray-800"
            >
                <Success
                    disabled={fecha.length==0 || malfecha || (agregaranimal && malcaravana)}
                    onclick={guardar}
                    texto="Guardar nuevo"
                />
            </div>
        {:else if edit}
            <div
                class=" mt-6 flex space-x-3 justify-end border-t dark:border-gray-800"
            >
                <!-- Botón Cancelar -->
                <button
                    class="
                        hidden md:block
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
                    Cancelar
                </button>

                <!-- Botón Editar -->
                <Success
                    disabled={fecha.length==0 || malfecha || (agregaranimal && malcaravana)}
                    onclick={editar}
                    texto="Guardar cambios"
                />
            </div>
        {:else}
            <div
                class="mt-6 flex space-x-3 justify-end border-t dark:border-gray-800"
            >
                <button
                    class="mt-2 px-10 py-2 bg-[#A94442] text-white font-medium rounded-full shadow-sm hover:bg-red-800 transition-colors text-base"
                    onclick={confirmDelete}
                >
                    Eliminar
                </button>

                <!-- Botón Editar -->
                <button
                    class="mt-2 px-10 py-2 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base"
                    onclick={editar}
                >
                    Editar
                </button>
            </div>
        {/if}
    </CardNacimiento>
</Navbar2>
