<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import PocketBase from "pocketbase";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import estilos from "$lib/stores/estilos";
    import Swal from "sweetalert2";
    import CardServicio from "$lib/components/servicios/CardServicio.svelte";
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

    import ServicioDetalle from "$lib/components/servicios/ServicioDetalle.svelte";
    import InseminacionDetalle from "$lib/components/servicios/InseminacionDetalle.svelte";
    import tiposanimal from "$lib/stores/tiposanimal";

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
    let titulo = $derived(natural ? "servicio" : "inseminación");
    //servicio
    let defaultServicio = {
        id: "",
        natural: true,
        fechaparto: "",
        observacion: "",
        //servicio
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

    let toros = $state([]);
    let listapadres = $state([]);
    let id = $state("");
    let natural = $state(true);
    let fechaparto = $state("");
    let observacion = $state("");
    //servicio
    let caravanamadre = $state("");
    let madre = $state("");
    let fechadesde = $state("");
    let fechahasta = $state("");
    let padreslist = $state([]);
    //inseminacion
    let animal = $state("");
    let fechainseminacion = $state("");
    let padre = $state("");
    let pajuela = $state("");
    let categoria = $state("");
    function loadServicio() {
        detalleServicio = proxyServicio.load();

        id = detalleServicio.id;
        natural = detalleServicio.natural;
        fechaparto = detalleServicio.fechaparto;
        observacion = detalleServicio.observacion;
        madre = detalleServicio.madre;
        caravanamadre = detalleServicio.caravanamadre;
        fechadesde = detalleServicio.fechadesde;
        fechahasta = detalleServicio.fechahasta;
        padreslist = detalleServicio.padreslist;
        animal = detalleServicio.animal;
        fechainseminacion = detalleServicio.fechainseminacion;
        padre = detalleServicio.padre;
        pajuela = detalleServicio.pajuela;
        categoria = detalleServicio.categoria;
    }
    async function getToros() {
        let recordsa = await pb.collection("animales").getFullList({
            filter: `cab='${cab.id}' && sexo = 'M'`,
        });
        recordsa = recordsa.sort((a, b) =>
            a.caravana.toLocaleLowerCase() < b.caravana.toLocaleLowerCase()
                ? -1
                : 1,
        );
        toros = recordsa.filter((a) => a.active);
        listapadres = toros.map((item) => {
            return {
                id: item.id,
                nombre: item.caravana,
            };
        });
    }
    //Detalles
    onMount(async () => {
        slug = $page.params.slug;
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;

        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);
        per.setPer(respermisos.permisos, usuarioid);

        userpermisos = getPermisosList(per.per.permisos);
        loadServicio();
        await getToros();
        cargado = true;
    });
    async function editar() {
        if (natural) {
            try {
                let dataser = {
                    fechadesde: fechadesde + " 03:00:00",
                    fechaparto: fechaparto + " 03:00:00",
                    observacion: observacion,
                    madre: madre,
                    padres: padreslist.join(),
                };
                if (fechahasta != "") {
                    dataser.fechahasta = fechahasta + " 03:00:00";
                }
                await pb.collection("servicios").update(id, dataser);
                Swal.fire(
                    "Éxito editar",
                    "Se pudo editar el servicio con exito",
                    "success",
                );
                volver()
                
                
            } catch (err) {
                
                console.error(err);
            }
        }
        else {
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
                    .update(id, data);
                
                Swal.fire(
                    "Éxito editar",
                    "Se pudo editar la inseminación con exito",
                    "success",
                );
                volver()
                
            } catch (err) {
                console.error(err);
                
                Swal.fire(
                    "Error editar",
                    "Hubo un error para editar la inseminación",
                    "error",
                );
            }
        }
    }
    async function eliminar() {
        if (natural) {
            try {
                await pb.collection("servicios").update(id, { active: false });
                
                Swal.fire(
                    "Éxito eliminar",
                    "Se eliminó con éxito el servicio",
                    "success",
                );
                volver()
            } catch (err) {
                console.error(err);
            }
        } else {
            try {
                await pb
                    .collection("inseminacion")
                    .update(id, { active: false });
                
                filterUpdate();
                Swal.fire(
                    "Éxito eliminar",
                    "Se eliminó con éxito la inseminación",
                    "success",
                );
                volver()
            } catch (err) {
                console.error(err);
            }
        }
    }
    function volver(){
        goto(pre+"/servicios")
    }
</script>

<Navbar2>
    <CardServicio cardsize="max-w-7xl" {titulo}>
        {#if natural}
            <ServicioDetalle
                {cargado}
                {caravanamadre}
                bind:fechadesde
                bind:fechahasta
                bind:padreslist
                bind:observacion
                bind:fechaparto
                {toros}
            />
        {:else}
            <InseminacionDetalle
                {cargado}
                {caravanamadre}
                bind:fechainseminacion
                bind:fechaparto
                bind:observacion
                bind:padre
                bind:pajuela
                {listapadres}
                {tiposanimal}
            />
        {/if}
        <!-- Botones alineados a la izquierda, más bajos, en la parte inferior -->
        <div class="mt-6 flex space-x-3">
            <!-- Botón Eliminar -->
            <button
                class="px-4 py-1.5 bg-red-700 text-white font-medium rounded-full shadow-sm hover:bg-red-800 transition-colors text-sm"
                onclick={eliminar}
            >
                Eliminar
            </button>

            <!-- Botón Cancelar -->
            <button
                class="px-4 py-1.5 bg-white text-gray-800 font-medium rounded-full shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                onclick={volver}
            >
                Cancelar
            </button>

            <!-- Botón Editar -->
            <button
                class="px-4 py-1.5 bg-green-800 text-white font-medium rounded-full shadow-sm hover:bg-green-900 transition-colors text-sm"
                onclick={editar}
            >
                Editar
            </button>
        </div>
    </CardServicio>
</Navbar2>
