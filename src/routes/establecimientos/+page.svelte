<script>
    import Navbar2 from "$lib/components/Navbar2.svelte";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import HorizontalTab from "$lib/components/establecimiento/HorizontalTab.svelte";
    import Success from "$lib/components/botones/Success.svelte";
    import Plus from "$lib/svgs/plus.svelte";
    import ListaEstablecimientos from "$lib/components/establecimientos/ListaEstablecimientos.svelte";
    import { deleteEstablishment } from "$lib/java/establecimientos/establecimientosback";
    import {
        loadStorageEstablecimiento,
        saveStorageEstablecimiento,
    } from "$lib/java/establecimientos/establecimientostorage";
    import { getUser, setUser } from "$lib/userstorage/usersotrage";
    import { switchEstablishment } from "$lib/java/usuarios/usuariosback";

    let pre = import.meta.env.VITE_PRE;

    // Lista de establishments del usuario (la guarda el login en
    // usertoken.establishments) separada por rol en dos arrays para
    // alimentar las dos tabs.
    let establecimientos = $state([]);     // ADM → "Tus establecimientos"
    let establecimientoscolab = $state([]); // ENC/OPE → "Asociados"
    // Cab actual (scoped en el JWT). Lo usamos para resaltar cual estoy
    // viendo y decidir si muestro el boton de eliminar.
    let cab = $state(loadStorageEstablecimiento());
    // ListaEstablecimientos espera un array `totales` paralelo. Por
    // ahora todos en 0; cuando haya endpoint Java de "total animales por
    // establishment" se llena.
    let totales = $state([]);
    let totalescolab = $state([]);

    let pestañas = $state([
        { id: "propios", nombre: "Tus establecimiento" },
        { id: "ajenos", nombre: "Establecimientos asociados" },
    ]);
    let tab = $state("propios");

    function reloadLists() {
        const u = getUser();
        const list = u.establishments || [];
        const tus = [];
        const ajenos = [];
        for (const e of list) {
            const item = {
                id: e.establishmentId,
                nombre: e.establishmentName,
                role: e.role,
                active: true,
            };
            if (e.role === "ADM") tus.push(item);
            else ajenos.push(item);
        }
        establecimientos = tus;
        establecimientoscolab = ajenos;
        totales = tus.map(() => 0);
        totalescolab = ajenos.map(() => 0);
    }

    // Cambia el establishment activo: pide JWT nuevo scoped y actualiza
    // localStorage (token + establecimiento) antes de navegar.
    async function switchTo(id) {
        try {
            //<3
            const data = await switchEstablishment(id);
            const u = getUser();
            setUser({ ...u, token: data.token });
            saveStorageEstablecimiento({
                exist: true,
                id: data.establishmentId,
                nombre: data.establishmentName,
            });
            goto(pre + "/inicio");
        } catch (err) {
            console.error("switchTo", err);
            Swal.fire(
                "Error",
                "No se pudo cambiar de establecimiento",
                "error",
            );
        }
    }

    function crearEstablecimiento() {
        goto(pre + "/establecimientos/nuevo");
    }

    async function eliminar(id) {
        const result = await Swal.fire({
            title: "Eliminar establecimiento",
            text: "¿Seguro que deseas eliminar el establecimiento?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No",
        });
        if (!result.value) return;
        try {
            await deleteEstablishment(id);
            // Saco el item del array local. La lista canonica vive en
            // usertoken.establishments, que recien se refresca al
            // re-loguear o al hacer un switch (que emite establishments
            // actualizados? — no, el switch solo trae el nuevo cab). Si
            // el usuario re-loguea queda limpio.
            establecimientos = establecimientos.filter((e) => e.id !== id);
            totales = establecimientos.map(() => 0);
            Swal.fire(
                "Éxito",
                "Se pudo eliminar el establecimiento",
                "success",
            );
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error eliminar",
                "No se pudo eliminar el establecimiento",
                "error",
            );
        }
    }

    onMount(() => {
        reloadLists();
    });
</script>

<Navbar2>
    <div class="container mx-auto py-1 px-4 max-w-7xl w-full xl:w-3/4">
        <HorizontalTab bind:pestañas bind:tab />

        {#if tab == "propios"}
            <!--Header-->
            <div
                class={`
                    rounded-xl p-1 shadow-2xl mb-0
                    dark:bg-slate-900 bg-white
                    px-2
                    my-2
                `}
            >
                <div
                    class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 mb-2"
                >
                    <div
                        class={`
                            bg-transparent
                            py-2
                        `}
                    >
                        <h1
                            class={`
                                text-3xl font-semibold 
                                dark:text-white text-gray-900
                            `}
                        >
                            Tus establecimientos
                        </h1>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <Success onclick={crearEstablecimiento} conhijo={true}>
                            <Plus size="size-4" margenes="" />
                            Nuevo
                        </Success>
                    </div>
                </div>
            </div>
            <div
                class={`
                    w-full grid grid-cols-1
                    mx-auto py-4 px-0 max-w-7xl
                `}
            >
                <ListaEstablecimientos
                    {establecimientos}
                    {eliminar}
                    irEstablecimiento={switchTo}
                    {cab}
                    {totales}
                />
            </div>
        {:else}
            {#if establecimientoscolab.length != 0}
                <!--Header-->
                <div
                    class={`
                    rounded-xl p-1 shadow-2xl mb-0
                    dark:bg-slate-900 bg-white
                    px-2
                    my-2
                `}
                >
                    <div
                        class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 mb-2"
                    >
                        <div
                            class={`
                            bg-transparent
                            py-2
                        `}
                        >
                            <h1
                                class={`
                                text-3xl font-semibold 
                                dark:text-white text-gray-900
                            `}
                            >
                                Establecimientos asociados
                            </h1>
                        </div>
                    </div>
                </div>
            {/if}
            <div
                class={`
                    w-full grid grid-cols-1
                    mx-auto py-4 px-0 max-w-7xl
                `}
            >
                <ListaEstablecimientos
                    esColab={false}
                    establecimientos={establecimientoscolab}
                    irEstablecimiento={switchTo}
                    {cab}
                    totales={totalescolab}
                />
            </div>
        {/if}
    </div>
</Navbar2>
