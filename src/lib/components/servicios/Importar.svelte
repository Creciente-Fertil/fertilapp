<script>
    import {
        importarAnimales,
        importarInseminaciones,
        importarServicios,
    } from "$lib/java/establecimientos/establecimientosback";
    import estilos from "$lib/stores/estilos";
    import Swal from "sweetalert2";
    import * as XLSX from "xlsx";

    let { cabid = "", getServicios = async () => {} } = $props();
    let usuarioid = $state("");
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;

    let esServicio = $state(true);

    let filename = $state("");
    let selectedFile = $state({});
    let wkbk = $state(null);
    let loading = $state(false);

    function importarArchivo(event) {
        const file = event.target.files[0];
        if (file) {
            selectedFile = file;
            filename = file.name;
        }
    }
    async function procesarArchivo() {
        if (!cabid) return;
        loading = true;
        try {
            if (esServicio) {
                const resultado = await importarServicios(cabid, selectedFile);
            } else {
                const resultado = await importarInseminaciones(
                    cabid,
                    selectedFile,
                );
            }

            await getServicios();
            filename = "";

            Swal.fire(
                esServicio
                    ? "Éxito importar servicios"
                    : "Éxito importar inseminaciones",
                "Se logró importar con éxito",
                "success",
            );
        } catch (error) {
            Swal.fire(
                esServicio
                    ? "Error importar servicios"
                    : "Error import inseminaciones",
                "No se logró importar con éxito",
                "error",
            );
        } finally {
            loading = false;
        }
    }
</script>

<div class="space-y-4 grid grid-cols-1 flex justify-center">
    <div class="form-control max-w-sm">
        <label class="label cursor-pointer">
            <span class="label-text"
                >{esServicio ? "Servicios" : "Inseminaciones"}</span
            >
            <input type="checkbox" class="toggle" bind:checked={esServicio} />
        </label>
    </div>
    
    <a
        class={`
            w-full
            text-center
            ${estilos.basico} ${estilos.grande} ${estilos.secundario}
        `}
        href={`${pre}/${esServicio ? "Importar servicios" : "Importar inseminaciones"}.xlsx`}
        download={`Importar ${esServicio ? "servicios" : "inseminaciones"}.xlsx`}
    >
        Descargar Plantilla
    </a>
    {#key filename}
        <div
            class={`
                w-full  
            `}
        >
            <input
                type="file"
                accept=".xlsx, .xls"
                class="sr-only"
                id="file-upload"
                onchange={(e) => importarArchivo(e)}
            />

            <label
                for="file-upload"
                class={`
                w-full flex items-center justify-center px-4 py-4 
                border border-[#115642] text-gray-800  rounded-md shadow-sm text-lg
                font-medium dark:text-white bg-transparent hover:bg-green-50 
                dark:hover:bg-gray-500 cursor-pointer
              `}
            >
                {filename ? filename : "Seleccionar archivo"}
            </label>
        </div>
    {/key}
    {#key filename}
        {#if filename.length > 0}
            <div class="flex justify-start">
                <button
                    class={`
                border rounded-full px-3 py-1 text-md flex items-center gap-1
                bg-[#115642]  hover:bg-[#0f4537] border-[#115642] text-white
            `}
                    onclick={procesarArchivo}>Procesar</button
                >
            </div>
        {/if}
    {/key}
</div>
