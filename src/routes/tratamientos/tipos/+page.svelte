<script>
    import estilos from "$lib/stores/estilos";
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Swal from "sweetalert2";
    import PocketBase from "pocketbase";
    import { onMount } from "svelte";

    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    let caber = createCaber();
    let userer = createUserer();
    let per = createPer();
    let cab = caber.cab;
    let userpermisos = $state([]);
    let usuarioid = $state("");
    let defaulttipos = {
        tipos: [],
    };

    let detallestipos = $state({
        ...defaulttipos,
    });
    let proxy = createStorageProxy("detallestipos", defaulttipos);
    //datos
    let tipotratamientos = $state([]);
    
    let idtipo = $state("");
    let nombretipo = $state("");

    //validaciones
    let addtipo = $state(false);
    let botontipo = $state(false);

    //Paginacion
    let rows = $state([])
    let pageSize = $state(15)
    let paginaActual = $state(1)

    function isEmpty(str) {
        return !str || str.length === 0;
    }
    function validarBotonTipo() {
        botontipo = true;
        if (isEmpty(nombretipo)) {
            botontipo = false;
        }
    }
    function openEditTipoModal(id) {
        idtipo = id;
        let idx_tipo = tipotratamientos.findIndex((tp) => tp.id == id);
        if (idx_tipo != -1) {
            let tipotratamiento = tipotratamientos[idx_tipo];
            nombretipo = tipotratamiento.nombre;
            addtipo = true;
        }
    }
    function nuevoTipo() {
        idtipo = "";

        nombretipo = "";
        addtipo = true;
    }
    async function guardarTipo() {
        if (idtipo == "") {
            try {
                let data = {
                    nombre: nombretipo,
                    active: true,
                    cab: cab.id,
                };
                const record = await pb
                    .collection("tipotratamientos")
                    .create(data);
                tipotratamientos.push(record);
                tipotratamientos.sort((tp1, tp2) =>
                    tp1.nombre.toLocaleLowerCase() >
                    tp2.nombre.toLocaleLowerCase()
                        ? 1
                        : -1,
                );
                Swal.fire(
                    "Exito guardar",
                    "Se logró guardar el tipo",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "No se logró guardar el tipo",
                    "error",
                );
            }
        } else {
            await editarTipo();
        }
    }
    async function editarTipo() {
        try {
            let data = {
                nombre: nombretipo,
            };
            const record = await pb
                .collection("tipotratamientos")
                .update(idtipo, data);
            let item = { ...data, id: idtipo };
            tipotratamientos = tipotratamientos.filter(
                (tp) => tp.id != idtipotratamiento,
            );
            tipotratamientos.push(item);
            tipotratamientos.sort((tp1, tp2) =>
                tp1.nombre.toLocaleLowerCase() > tp2.nombre.toLocaleLowerCase()
                    ? 1
                    : -11,
            );

            Swal.fire("Exito editar", "Se logró editar el tipo", "success");
        } catch (err) {
            console.error(err);
            Swal.fire("Error editar", "No se logró editar el tipo", "error");
        }
    }
    async function eliminarTipo(id) {
        idtipo = id;
        try {
            let data = {
                active: false,
            };
            const record = await pb
                .collection("tipotratamientos")
                .update(idtipotratamiento, data);
            tipotratamientos = tipotratamientos.filter(
                (tp) => tp.id != idtipotratamiento,
            );
            tipotratamientos.sort((tp1, tp2) =>
                tp1.nombre.toLocaleLowerCase() > tp2.nombre.toLocaleLowerCase()
                    ? 1
                    : -11,
            );
            Swal.fire("Exito eliminar", "Se logró eliminar el tipo", "success");
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error eliminar",
                "No se logró eliminar el tipo",
                "error",
            );
        }
    }
    function loadTipos() {
        detallestipos = proxy.load();
        tipotratamientos = detallestipos.tipos;
    }
    onMount(async () => {
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

        per.setPer(respermisos.permisos, usuarioid);
        userpermisos = getPermisosList(per.per.permisos);
        loadTipos();
    });
</script>
