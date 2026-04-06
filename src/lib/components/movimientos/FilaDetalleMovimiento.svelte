<script>
    import estilos from "$lib/stores/estilos";
    import { shorterWord } from "$lib/stringutil/lib";
    import estados from "$lib/stores/estados";

    let {
        selectanimales = $bindable([]),
        

        animal = null,
        id = "",
        quitarAnimal = (id) => {},
        verAnimal = (id) => {},
        cambiar = () => {},
        i,
    } = $props();
    // Toggle estado de expansión
    function toggleEstado(id) {
        animal.estado = !animal.estado ? true : false;
    }
</script>

<!-- Fila principal (visible siempre) -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
    <!-- Caravana -->
    <div class="md:col-span-3">
        <div class="font-bold text-slate-800 dark:text-slate-200 mx-4 px-4">
            {animal.caravana}
        </div>
    </div>
    
</div>

