<script>
    import estilos from "$lib/stores/estilos";

    import Arrowuptray from "$lib/svgs/arrowuptray.svelte";
    let {
        datahash,
        conhash,
        data,
        titulo,
        filtros,
        confiltros,
        prepararData,
        sheetname = "",
        establecimiento = "",
        py="py-1",
        px="px-3",
        rounded = "rounded-full"
    } = $props();
    import * as XLSX from "xlsx";
    
    
    
    function exportar() {
        let csvdata = [];
        if (conhash) {
            let filas = [];
            for (let key in datahash) {
                filas.push(datahash[key]);
            }
            csvdata = filas.map(prepararData);
        } else {
            csvdata = data.map(prepararData);
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([]);
        ws["A1"] = { t: "s", v: "Creciente fertil ", s: {} };
        ws["B1"] = { t: "s", v: establecimiento, s: {} };
        ws["C1"] = { t: "s", v: new Date().toLocaleDateString(), s: {} };
        ws["D1"] = { t: "s", v: sheetname, s: {} };
        //const range = XLSX.utils.decode_range('A1:K1');
        //ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
        XLSX.utils.sheet_add_json(ws, csvdata, { origin: "A3" });
        XLSX.utils.book_append_sheet(wb, ws, sheetname);
        if (confiltros) {
            const wsFilter = XLSX.utils.aoa_to_sheet(filtros);
            XLSX.utils.book_append_sheet(wb, wsFilter, "Filtros aplicados");
        }
        XLSX.writeFile(wb, `${titulo.replace(/\//g, "-")}.xlsx`, {
            cellStyles: true,
        });
    }
</script>

<button
    onclick={exportar}
    class={`
        border ${rounded} px-3 ${py} text-md flex items-center gap-1
        bg-white  border-gray-300  hover:bg-gray-300 dark:bg-transparent dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white
    `}
>
    <Arrowuptray size="size-4" />
    Exportar
</button>
