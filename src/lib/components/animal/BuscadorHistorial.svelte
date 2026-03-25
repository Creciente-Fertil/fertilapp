<script>
    import estilos from "$lib/stores/estilos";
    import CustomCheck from "../CustomCheck.svelte";
    import ExportarSmall from "../ExportarSmall.svelte";
    import Arrowdown from "$lib/svgs/arrowdown.svelte";
    import * as XLSX from "xlsx";
    import Secondary from "../botones/Secondary.svelte";
    let pre = import.meta.env.VITE_PRE;
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let esCelu = $derived(innerWidth <= 1100);
    function prepararData(item) {
        return {
            FECHA: item.fecha ? new Date(item.fecha).toLocaleDateString() : "",
            CARAVANA: caravana,
            EVENTO: item.nombre,
            INFO: item.info,
        };
    }
    function exportar() {
        let sheetname = "Historia Clínica";
        let csvdata = data.map(prepararData);
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([]);
        ws["A1"] = { t: "s", v: "Creciente fertil ", s: {} };
        ws["C1"] = { t: "s", v: new Date().toLocaleDateString(), s: {} };
        ws["D1"] = { t: "s", v: sheetname, s: {} };
        //const range = XLSX.utils.decode_range('A1:K1');
        //ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
        XLSX.utils.sheet_add_json(ws, csvdata, { origin: "A3" });
        XLSX.utils.book_append_sheet(wb, ws, sheetname);

        XLSX.writeFile(wb, `${sheetname.replace(/\//g, "-")}.xlsx`, {
            cellStyles: true,
        });
    }
    let {
        data = [],
        caravana = "",
        fechadesde = $bindable(""),
        fechahasta = $bindable(""),
        contodos = $bindable(true),
        contactos = $bindable(true),
        coninse = $bindable(true),
        conser = $bindable(true),
        conobser = $bindable(true),
        contrata = $bindable(true),
        conpari = $bindable(true),
        filterUpdate = () => {},
        changeCampo = () => {},
        onclick = (e) => {},
    } = $props();
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div class=" py-1 px-4 w-full">
    <!--Header-->
    <div
        class={``}
    >
        <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 mb-2 border-b dark:border-gray-800"
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
                    Historia clínica
                </h1>
            </div>
            <Secondary onclick={exportar} conhijo={true}>
                <Arrowdown size="size-4" margenes="" />
                Exportar Historial
            </Secondary>
        </div>
        <div class="grid grid-cols-1 w-full p-1 md:p-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-1">
                <div>
                    <label
                        class="block tracking-wide text-base font-medium mb-2"
                        for="grid-first-name"
                    >
                        Fecha desde
                    </label>
                    <input
                        id="fechainseminaciondesde"
                        type="date"
                        class={`
                                w-full 
                                input input-bordered
                                ${estilos.bgdark2}
                            `}
                        bind:value={fechadesde}
                        onchange={filterUpdate}
                    />
                </div>
                <div>
                    <label
                        class="block tracking-wide text-base font-medium mb-2"
                        for="grid-first-name"
                    >
                        Fecha hasta
                    </label>
                    <input
                        id="fechainseminaciondesde"
                        type="date"
                        class={`
                                w-full 
                                input input-bordered
                                ${estilos.bgdark2}
                            `}
                        bind:value={fechahasta}
                        onchange={filterUpdate}
                    />
                </div>
            </div>

            <div class="flex flex-wrap gap-2 my-2">
                <CustomCheck
                    onclick = {()=>onclick("todos")}
                    bind:activo={contodos}
                    etiqueta="Todos"
                    onchange={changeCampo}
                />
                <CustomCheck
                    {onclick}
                    bind:activo={coninse}
                    etiqueta="Inseminación"
                    onchange={changeCampo}
                />
                <CustomCheck
                    {onclick}
                    bind:activo={conser}
                    etiqueta="Servicio"
                    onchange={changeCampo}
                />
                <CustomCheck
                    {onclick}
                    bind:activo={conpari}
                    etiqueta="Parición"
                    onchange={changeCampo}
                />
                <CustomCheck
                    {onclick}
                    bind:activo={conobser}
                    etiqueta="Observación"
                    onchange={changeCampo}
                />
                <CustomCheck
                    {onclick}
                    bind:activo={contactos}
                    etiqueta="Tacto"
                    onchange={changeCampo}
                />
                <CustomCheck
                    {onclick}
                    bind:activo={contrata}
                    etiqueta="Tratamiento"
                    onchange={changeCampo}
                />
            </div>
        </div>
    </div>
</div>
