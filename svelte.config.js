//import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		prerender:{
			entries:[
				"/",
				"/animales",
				"/animales/1",
				"/animales/estadisticas",
				"/animales/historial",
				"/animales/geneologia",
				"/inicio",
				"/inicio/cab",
				"/inicio/vet",
				"/login",
				"/nacimientos",
				"/nacimientos/1",
				"/nacimientos/reporte",
				"/rodeos",
				"/rodeos/1",
				"/rol",
				"/notfind",
				"/opciones",
				"/tactos/cab",
				"/tactos/cab/movimiento",
				"/tactos/cab/movimiento/detallemovimiento",
				"/tactos/cab/1",
				"/tactos/vet",
				"/user/config",
				"/inseminaciones",
				"/observaciones",
				"/observaciones/1",
				"/tareas",
				"/tratamientos",
				"/tratamientos/1",
				"/tratamientos/tipos",
				"/importar",
				"/lotes",
				"/lotes/1",
				"/movimientos",
				"/movimientos/detalle",
				"/user/new",
				"/reportes",
				"/pesajes",
				"/pesajes/detallemovimiento",
				"/establecimiento",
				"/pesajes/lista",
				"/colaboradores/asociar",
				"/colaboradores/1",
				"/establecimientos",
				"/establecimientos/nuevo",
				"/inseminaciones/movimiento",
				"/tratamientos/movimiento",
				"/tratamientos/movimiento/detallemovimiento",
				"/recover",
				"/recover/token",
				"/user/nivel",
				"/servicios",
				"/servicios/1",
				"/servicios/movimiento",
				"/servicios/movimiento/detallemovimento",
				"/pesajes/historial",
				"/manual",
				"/pagos/exito",
				"/pagos/fail",
				"/pagos/pending"

			]
		}
	}
};

export default config;

