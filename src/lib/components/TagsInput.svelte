<script>
  // Props del componente
  let {
    tags = $bindable([]), // Ahora es un array de objetos: [{ id: '1', nombre: 'Hijo 2' }]

    campo = "nombre",
    eliminarTag = (idAnim) => {
      tags = tags.filter((tag) => tag.id !== idAnim);
    },
  } = $props();
</script>

{#each tags as tag (tag.id)}
  <span
    class="
        inline-flex items-center gap-1.5 px-3 py-1.5
        text-sm font-medium text-slate-700 dark:text-slate-200
        bg-slate-100 dark:bg-slate-700
        border border-slate-200 dark:border-slate-600
        rounded-md shadow-sm
      "
  >
    <!-- Aquí mostramos solo el NOMBRE -->
    {tag[campo]}

    <button
      type="button"
      onclick={(e) => {
        e.stopPropagation();
        eliminarTag(tag.id);
      }}
      class="
          flex items-center justify-center
          w-4 h-4 rounded-full
          text-slate-500 dark:text-slate-400
          hover:text-red-600 dark:hover:text-red-400
          hover:bg-red-100 dark:hover:bg-red-900/30
          transition-colors duration-150
        "
      aria-label="Eliminar {tag.nombre}"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke="currentColor"
        class="w-3 h-3"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </span>
{/each}
