import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  darkMode: 'class',
  //darkMode: ['selector','[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        seashell: {
          '50': '#f8f8f8',
          '100': '#f1f1f1',
          '200': '#dcdcdc',
          '300': '#bdbdbd',
          '400': '#989898',
          '500': '#7c7c7c',
          '600': '#656565',
          '700': '#525252',
          '800': '#464646',
          '900': '#3d3d3d',
          '950': '#292929',
        }
      }
    }
  },
  daisyui: {
    themes: ["light", "dark", "forest"]

  },
  plugins: [daisyui, typography]
};
