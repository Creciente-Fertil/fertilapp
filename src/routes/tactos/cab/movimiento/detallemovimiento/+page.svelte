<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import PocketBase from "pocketbase";
    import Swal from "sweetalert2";
    import ListaAnimales from "$lib/components/tactos/ListaAnimales.svelte";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import { onMount } from "svelte";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosList } from "$lib/permisosutil/lib";
    import { guardarHistorial } from "$lib/historial/lib";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { getPermisosCabUser } from "$lib/permisosutil/lib";
    import { createUserer } from "$lib/stores/user.svelte";
    import { goto } from "$app/navigation";
    import { isEmpty, addDays } from "$lib/stringutil/lib";
    import estilos from "$lib/stores/estilos";
    import tipostacto from "$lib/stores/tipostacto";
    import DetalleMovimiento from "$lib/components/tactos/DetalleMovimiento.svelte";
    import InfoAnimal from "$lib/components/InfoAnimal.svelte";
    import DetallesAnimalesMovimiento from "$lib/components/tactos/DetallesAnimalesMovimiento.svelte";

    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
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
    let listaanimales = $state([]);
    let selecthashmap = $state({});
    

    //valores
    //movimiento
    let animal = $state({})
    let tipotactoselect = $state("");
    let fecha = $state("");
    let observaciongeneral = $state("");
    let prenada = $state(0)
    //validacion
    let malfecha = $state(false);
    let botonhabilitado = $state(false);
    let defaultmovimiento = {
        selecthashmap: {},
        fecha:"",
        observaciongeneral:"",
        tipotactoselect:"",
        prenada:0
    };
    let detallemovimiento = $state({
        ...defaultmovimiento,
    });
    let proxy = createStorageProxy("detallemovimientotacto", defaultmovimiento);
    function quitarAnimal(id) {
        if (selecthashmap[id]) {
            delete selecthashmap[id];
            setDetalle();
            listaanimales = [];
            for (const [key, value] of Object.entries(selecthashmap)) {
                if (value != null) {
                    listaanimales.push({
                        ...value,
                        estadonuevo: 0,
                        tipotacto: "tacto",
                        observacion: "",
                    });
                }
            }
        }
    }
    function setDetalle() {
        detallemovimiento.selecthashmap = selecthashmap;
        proxy.save(detallemovimiento);
    }
    function loadDetalle() {
        detallemovimiento = proxy.load();

        selecthashmap = detallemovimiento.selecthashmap;
        fecha = detallemovimiento.fecha
        tipotactoselect = detallemovimiento.tipotactoselect
        prenada = detallemovimiento.prenada
        observaciongeneral = detallemovimiento.observaciongeneral
        
        listaanimales = [];
        for (const [key, value] of Object.entries(selecthashmap)) {
            if (value != null) {
                listaanimales.push({
                    ...value,
                    estadonuevo: 0,
                    tipotacto: "tacto",
                    observacion: "",
                });
            }
        }
    }
    function volver() {
        goto(pre + "/tactos/cab/movimiento");
    }
    function onchangeTipoTacto() {
        for (let i = 0; i < listaanimales.length; i++) {
            listaanimales[i].tipotacto = tipotactoselect;
        }
    }
    function inputObsGeneral() {
        for (let i = 0; i < listaanimales.length; i++) {
            listaanimales[i].observacion = observaciongeneral;
        }
    }
    async function mover() {
        if (fecha == "") {
            Swal.fire("Error tactos", "Debe seleccionar una fecha", "error");
            return;
        }
        let bulktactos = [];
        let bulkcambios = [];
        let bulkhistoriales = [];
        for (let i = 0; i < listaanimales.length; i++) {
            let tactoanimal = listaanimales[i];

            let ft = tactoanimal.fechatacto;
            let fi = tactoanimal.fechains;
            let fs = tactoanimal.fechaser;
            let maximafecha = null;
            const valor1 = ft || "";
            const valor2 = fi || "";
            const valor3 = fs || "";

            // Comparar los strings
            if (valor1 >= valor2 && valor1 >= valor3) {
                maximafecha = ft;
            } else if (valor2 >= valor1 && valor2 >= valor3) {
                maximafecha = fi;
            } else {
                maximafecha = fs;
            }

            if (maximafecha == null || fecha > maximafecha) {
                let dataupdate = {
                    prenada: tactoanimal.estadonuevo,
                    id: tactoanimal.id,
                };
                bulkcambios.push(dataupdate);
                let datahistorial = {
                    animal: tactoanimal.id,
                    caravana: tactoanimal.caravana,
                    user: tactoanimal.user,
                    active: true,
                    delete: false,
                    fechanacimiento: tactoanimal.fechanacimiento,
                    sexo: tactoanimal.sexo,
                    peso: tactoanimal.peso,
                    lote: tactoanimal.lote,
                    rodeo: tactoanimal.rodeo,
                    categoria: tactoanimal.categoria,
                    prenada: tactoanimal.prenada,
                };
                bulkhistoriales.push(datahistorial);
            }

            let datatacto = {
                fecha: fecha + " 03:00:00",
                observacion: tactoanimal.observacion,
                animal: tactoanimal.id,
                categoria: tactoanimal.categoria,
                prenada: tactoanimal.estadonuevo,
                tipo: tactoanimal.tipotacto,
                nombreveterinario: "",
                cab: cab.id,
                active: true,
            };
            bulktactos.push(datatacto);
        }
        try {
            const batch = pb.createBatch();
            for (let i = 0; i < bulktactos.length; i++) {
                let bt = bulktactos[i];
                batch.collection("tactos").create(bt);
            }
            for (let i = 0; i < bulkcambios.length; i++) {
                let bc = bulkcambios[i];
                batch
                    .collection("animales")
                    .update(bc.id, { prenada: bc.prenada });
            }
            for (let i = 0; i < bulkhistoriales.length; i++) {
                let bh = bulkhistoriales[i];
                batch.collection("historialanimales").create(bh);
            }

            const result = await batch.send();
            Swal.fire(
                "Éxito guardar",
                "Se pudieron guardar los tactos",
                "success",
            );
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error guardar",
                "No se pudieron guardar los tactos",
                "error",
            );
        }
        volver();
    }

    onMount(async () => {
        
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

        per.setPer(respermisos.permisos, usuarioid);
        userpermisos = getPermisosList(per.per.permisos);
        loadDetalle();
        console.log(listaanimales)
    });
    function verAnimal(id) {
        let a_idx = listaanimales.findIndex((a) => a.id == id);

        if (a_idx != -1) {
            animal = listaanimales[a_idx];
            veranimal.showModal();
        }
    }
    let classbuscador = "container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4";
    let classmove = "container mx-auto py-3 px-4 max-w-6xl w-full";
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Navbar2>
    <div class={classmove}>
        <DetalleMovimiento
            {fecha}
            tipo={tipotactoselect}
            {prenada}
            {observaciongeneral}
        />
        <DetallesAnimalesMovimiento
        bind:selectanimales={listaanimales}
        {quitarAnimal}

            {verAnimal}
            cambiar={setDetalle}
            abierta={false}


        
        />
        <div
            class="mt-6 flex space-x-3 justify-start md:justify-end border-t dark:border-gray-800"
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
                Volver
            </button>
            <!-- Botón Guardar -->
            <button
                class="
                    mt-2 px-10 py-2 bg-[#115642] text-white
                    font-medium rounded-full
                    shadow-sm hover:bg-green-700
                    transition-colors text-base
                    "
                onclick={mover}
            >
                Crear {listaanimales.length > 1 ? "tactos" : "tacto"}
            </button>
        </div>
    </div>
    
</Navbar2>

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