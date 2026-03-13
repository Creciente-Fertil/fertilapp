<script>
    import estilos from "$lib/stores/estilos";
    import Paginacion from "../paginacion.svelte";
    import Eye from "$lib/svgs/eye.svelte";
    import Trash from "$lib/svgs/trash.svelte";
    import Pencil from "$lib/svgs/pencil.svelte";
    import Badge from "../Badge.svelte";
    let {
        pageSize = $bindable(10),
        selecthash,
        serviciosrow,
        ordenarServicios = (campo, mantener) => {},
        openViewModal = (_p) => {},
        openViewModalIns = (_p) => {},
        openEditModal = (_p) => {},
        openEditModalIns = (_p) => {},
        openDelModal = (_p) => {},
        openDelModalIns = (_p) => {},
        shorterWord = (s) => {},
        getNombrePadres = (p) => {},
        clickTodos = () => {},
        clickFila = (id) => {},
        todos = $bindable(false),
        ascendente,
        forma,
    } = $props();

    
</script>

<div class="max-h-[600px] overflow-y-auto custom-scrollbar pb-16 bg-white dark:bg-slate-900">
    {#each serviciosrow as s}
        <div
            class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
        >
            <button
                onclick={() =>
                    s.fechadesde ? openEditModal(s.id) : openEditModalIns(s.id)}
            >
                <div class="block p-4">
                    <div class="grid grid-cols-2 gap-y-2">
                        <div class="flex items-start">
                            <span>Tipo:</span>
                            <span class="mx-1 font-semibold">
                                {s.fechadesde ? "Natural" : "Artificial"}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span>Fecha parto:</span>
                            <span class="mx-1 font-semibold">
                                {s.fechaparto
                                    ? new Date(
                                          s.fechaparto,
                                      ).toLocaleDateString()
                                    : ""}
                            </span>
                        </div>
                        <div
                            class={`flex items-start ${s.fechadesde ? "" : "col-span-2"}`}
                        >
                            <span>
                                Fecha {s.fechadesde
                                    ? "desde"
                                    : "de inseminación"}:
                            </span>
                            <span class="mx-1 font-semibold">
                                {s.fechadesde
                                    ? new Date(
                                          s.fechadesde,
                                      ).toLocaleDateString()
                                    : s.fechainseminacion
                                      ? new Date(
                                            s.fechainseminacion,
                                        ).toLocaleDateString()
                                      : ""}
                            </span>
                        </div>
                        {#if s.fechadesde}
                            <div class="flex items-start">
                                <span>Fecha hasta:</span>
                                <span class="mx-1 font-semibold">
                                    {s.fechadesde
                                        ? new Date(
                                              s.fechadesde,
                                          ).toLocaleDateString()
                                        : s.fechainseminacion
                                          ? new Date(
                                                s.fechainseminacion,
                                            ).toLocaleDateString()
                                          : ""}
                                </span>
                            </div>
                        {/if}
                        <div class="flex items-start">
                            <span>Madre:</span>
                            <span class="mx-1 font-semibold">
                                {"caravana"}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span>
                                {s.fechadesde ? "Padres" : "Padre"}
                            </span>
                            <span class="mx-1 font-semibold">
                                {s.fechadesde
                                    ? getNombrePadres(s.padres)
                                    : s.pajuela}
                            </span>
                        </div>
                        <div class="col-span-2 flex items-start">
                            <span>{`${s.observacion}`}</span>
                        </div>
                    </div>
                </div>
            </button>
        </div>
    {/each}
</div>
