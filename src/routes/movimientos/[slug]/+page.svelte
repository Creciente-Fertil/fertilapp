<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import CardMovimiento from "$lib/components/servicios/CardMovimiento.svelte";

    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import estilos from "$lib/stores/estilos";
    import Swal from "sweetalert2";
    import { createStorageProxy } from "$lib/filtros/filtros";
    import { eliminarMove } from "$lib/java/movimientos/movimientosback";
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    let versionjava = $state(import.meta.env.VITE_JAVA == "si");
    let defaultmovimiento = {
        id: "",
        animal: "",

        fecha: "",
        tipo: "",
        tiponombre: "",
        fromLotId: "",
        toLotId: "",
        fromHerdId: "",
        toHerdId: "",
        fromEstablishmentId: "",
        toEstablishmentId: "",
        observaciones: "",
        edit: false,
    };

    let detallemovimento = $state({ ...defaultmovimiento });
    let storage = createStorageProxy("detallemovimento", defaultmovimiento);
    //Movimiento
    let id = $state("");
    let animal = $state("");
    let fecha = $state("");
    let tipo = $state("");
    let tiponombre = $state("");
    let fromLotId = $state("");
    let toLotId = $state("");
    let fromHerdId = $state("");
    let toHerdId = $state("");
    let fromEstablishmentId = $state("");
    let toEstablishmentId = $state("");
    let observaciones = $state("");
    let edit = $state(false);
    let cab = $state({id:"",exist:false,nombre:""})

    async function eliminar() {
        Swal.fire({
            title: "Eliminar observación",
            text: "¿Seguro que deseas eliminar la observacion?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.value) {
                try {
                    await eliminarMove(id);
                    await Swal.fire(
                        "Movimiento eliminado!",
                        "Se eliminó el movimiento correctamente.",
                        "success",
                    );
                } catch (err) {
                    Swal.fire(
                        "Acción cancelada",
                        "No se pudo eliminar el movimiento",
                        "error",
                    );
                    console.error(err);
                }
                volver();
            }
        });
    }

    async function guardarNuevoAnimal() {}
    function volver() {
        goto(pre + "/movimientos/lista");
    }
    function getData() {
        detallemovimento = storage.load();
        id = detallemovimento.id;
        animal = detallemovimento.animal;
        fecha = detallemovimento.fecha;
        tipo = detallemovimento.tipo;
        fromLotId = detallemovimento.fromLotId;
        toLotId = detallemovimento.toLotId;
        fromHerdId = detallemovimento.fromHerdId;
        toHerdId = detallemovimento.toHerdId;
        fromEstablishmentId = detallemovimento.fromEstablishmentId;
        toEstablishmentId = detallemovimento.toEstablishmentId;
        observaciones = detallemovimento.observaciones;
    }
    onMount(() => {
        getData();
    });
</script>

<Navbar2>
    <CardMovimiento cardsize="max-w-7xl" {edit}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-1 p-2 pt-0">
            <div class="col-span-1 md:col-span-2">
                <label for="general" class="label pt-1">
                    <span
                        class={`label-text font-medium text-lg ${estilos.subtitle}`}
                        >Datos generales</span
                    >
                </label>
            </div>
            <div class="col-span-1">
                <label for="caravana" class="label py-0 my-0">
                    <span class="label-text text-sm font-normal">Caravana</span>
                </label>
                <label for="caravana" class="label py-0 my-0">
                    <span class={`text-lg ${estilos.labelcolor} py-0 my-0 px-3`}
                        >{animal}</span
                    >
                </label>
            </div>
            <div>
                <label for="fecha" class="label pb-0 mb-0">
                    <span class="label-text text-base">Fecha</span>
                </label>
                <span class={`text-lg ${estilos.labelcolor} py-0 my-0 px-3`}
                    >{new Date(fecha).toLocaleDateString()}</span
                >
            </div>
            <div>
                <label for="tipo" class="label pb-0 mb-0">
                    <span class="label-text text-base">Tipo </span>
                </label>
                <label
                    for="categoria"
                    class={`text-lg tracking-wide ${estilos.labelcolor} py-0 my-0 px-3`}
                >
                    {tiponombre}
                </label>
            </div>
            <div class="col-span-1 md:col-span-2 border-t dark:border-gray-800">
                <div class="label">
                    <span
                        class={`label-text font-medium text-lg ${estilos.subtitle}`}
                        >Observacion</span
                    >
                </div>
                <div class="pl-2">
                    <p class={`text-lg ${estilos.labelcolor} py-0 my-0 px-1`}>
                        {observaciones}
                    </p>
                </div>
            </div>
        </div>
        <div
            class="mt-6 flex space-x-3 justify-end border-t dark:border-gray-800"
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
            <button
                class="mt-2 px-10 py-2 bg-[#A94442] text-white font-medium rounded-full shadow-sm hover:bg-red-800 transition-colors text-base"
                onclick={eliminar}
            >
                Eliminar
            </button>
        </div>
    </CardMovimiento>
</Navbar2>
