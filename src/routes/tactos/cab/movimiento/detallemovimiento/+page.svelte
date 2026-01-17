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
    let tipotactoselect = $state("");
    let fecha = $state("");
    let observaciongeneral = $state("");
    //validacion
    let malfecha = $state(false);
    let botonhabilitado = $state(false);
    let defaultmovimiento = {
        selecthashmap: {},
    };
    let proxymovimiento = $state({
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
        proxymovimiento.selecthashmap = selecthashmap;
        proxy.save(proxymovimiento);
    }
    function loadDetalle() {
        proxymovimiento = proxy.load();

        selecthashmap = proxymovimiento.selecthashmap;
        
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
    });
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Navbar2>
    <div class="container mx-auto py-6 px-4 max-w-7xl">
        <!--Header-->
        <div
            class={`
                rounded-md p-4 shadow-xl mb-4
                dark:bg-slate-900 bg-white
            `}
        >
            <div
                class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
            >
                <div
                    class={`
                        bg-transparent        
                        px-4 py-4 
                    `}
                >
                    <button onclick={volver}>
                        <h1
                            class={`
                                flex text-left
                                text-2xl font-bold 
                                dark:text-white text-gray-900
                            `}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-5 mt-1"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M15.75 19.5 8.25 12l7.5-7.5"
                                />
                            </svg>
                            Tactos
                        </h1>
                    </button>
                </div>
                <button
                    class={`btn btn-primary rounded-lg ${estilos.btntext2}`}
                    data-theme="forest"
                    disabled={!botonhabilitado}
                    onclick={mover}
                >
                    {#if esCelu}
                        <span class="text-lg">Movimientos</span>
                    {:else}
                        <span class="text-lg">+ Crear movimientos</span>
                    {/if}
                </button>
            </div>
        </div>
    </div>
    <div class="container mx-auto py-6 px-4 max-w-7xl">
        <div
            class={`
                rounded-md p-4 shadow-xl mb-4
                dark:bg-slate-900 bg-white
            `}
        >
        

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-1">
                
                <div>
                    <label for="fechatacto" class="label">
                        <span class="label-text text-base">Fecha </span>
                    </label>
                    <label class="input-group">
                        <input
                            id="fechatacto"
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
                            onchange={() => {
                                if (fecha == "") {
                                    malfecha = true;
                                    botonhabilitado = false;
                                } else {
                                    malfecha = false;
                                    botonhabilitado = true;
                                }
                            }}
                        />
                        {#if malfecha}
                            <div class="label">
                                <span class="label-text-alt text-red-500"
                                    >Debe seleccionar la fecha del tacto</span
                                >
                            </div>
                        {/if}
                    </label>
                </div>
                <div>
                    <label for="tipotacto" class="tracking-wide label">
                        <span class="label-text text-base">Tipo</span>
                    </label>
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
                            bind:value={tipotactoselect}
                            onchange={onchangeTipoTacto}
                        >
                            {#each tipostacto as s}
                                <option value={s.id}>{s.nombre}</option>
                            {/each}
                        </select>
                    </label>
                </div>
                <div>
                    <label for="obs" class="label">
                        <span class="label-text text-base">Observación </span>
                    </label>
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
                        bind:value={observaciongeneral}
                        oninput={inputObsGeneral}
                    />
                </div>
            </div>
        </div>
    </div>
    <div class="container mx-auto py-6 px-4 max-w-7xl">
        <div
            class={`
                rounded-md p-4 shadow-xl mb-4
                dark:bg-slate-900 bg-white
            `}
        >
            <ListaAnimales bind:selectanimales={listaanimales} />
        </div>
    </div>
</Navbar2>
