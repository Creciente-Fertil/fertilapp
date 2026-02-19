<!-- Badge.svelte -->
<script>
    let {
color = 'blue',
text = "",
font="font-normal",
textSize = "text-base"
    } = $props()
  
  // Mapa de colores → clases Tailwind
  const colorMap = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-300 '
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-800 dark:text-purple-300 '
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-300 '
    },
    creciente:{
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-[#115642BD] '
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-300 '
    },
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-300 '
    },
    gray: {
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-800 dark:text-gray-300 '
    }
  };

  let styles = $state(colorMap[color] || colorMap.gray);
</script>

<span class="inline-flex items-center px-3 py-1 rounded-full {textSize} {styles.bg} {styles.text} {font}">
  {text}
</span>