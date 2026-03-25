<script>
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
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    let caber = createCaber();
    let cab = caber.cab;
    let cargado = $state(false);
    let per = createPer();
    let userpermisos = $state([]);
    let slug = $state("");

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
    let malfecha = $state(false);

    //datos animal
    let idanimal = $state("");
    let caravana = $state("");
    let sexo = $state("");
    let categoria = $state("");
    let peso = $state("");

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
    function loadNacimiento() {
        detalleNacimiento = proxyNacimiento.load();
        edit = detalleNacimiento.edit;
        id = detalleNacimiento.id;
        madre = detalleNacimiento.madre;
        nombremadre = detalleNacimiento.nombremadre;
        padre = detalleNacimiento.padre;
        nombrepadre = detalleNacimiento.nombrepadre;
        observacion = detalleNacimiento.observacion;
        fecha = detalleNacimiento.fecha;
        setViejo();
    }
    onMount(async () => {
        slug = $page.params.slug;
        idnacimiento = slug;
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);
        per.setPer(respermisos.permisos, usuarioid);

        userpermisos = getPermisosList(per.per.permisos);
        loadNacimiento();
        await getAnimales();
        cargado = true;
    });
    async function editar() {
        if (!edit) {
            setViejo();
            edit = true;
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
                const record = await pb
                    .collection("nacimientos")
                    .update(idnacimiento, dataparicion);
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
            await pb.collection("nacimientos").delete(idnacimiento);
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
    function onchange() {}
    function onelegirMadre() {}
    function onwriteMadre() {}
    function onelegirPadre() {}
    function onwritePadre() {}
</script>

<CardNacimiento cardsize="max-w-7xl" {edit}>
    <DetalleNacimiento
        {edit}
        {cargado}
        caravananimal={caravana}
        bind:fecha
        bind:padre
        bind:madre
        bind:nombremadre
        bind:nombrepadre
        bind:observacion
        {malfecha}
        {listamadres}
        {listapadres}
        {onchange}
        {onelegirMadre}
        {onelegirPadre}
        {onwritePadre}
        {onwriteMadre}
    />
    <!-- Botones alineados a la derecha, más bajos, en la parte inferior -->
    {#if edit}
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
            <button
                class="mt-2 px-10 py-2 bg-[#115642] text-white font-medium rounded-full shadow-sm hover:bg-green-700 transition-colors text-base"
                onclick={editar}
            >
                Guardar cambios
            </button>
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
