// Punto de entrada: arranca el servidor y conecta todo. Solo escucha en 127.0.0.1 (esta PC).
const path = require('path');
const express = require('express');
const session = require('express-session');
const config = require('./config');
require('./src/db'); // abre la base y aplica las migraciones pendientes
const dinero = require('./src/utils/dinero');
const imagenes = require('./src/utils/imagenes');
const { ErrorNegocio } = require('./src/utils/errores');
const { cargarDatosVista, exigirConfiguracionInicial } = require('./src/middleware/sesion');
const { nombreMedio } = require('./src/servicios/pagos.servicio');
const balanza = require('./src/externos/balanza');
const envioComprobantes = require('./src/tareas/envio-comprobantes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');

// Funciones disponibles en todas las pantallas
Object.assign(app.locals, {
  config,
  soles: dinero.soles,
  kg: dinero.kg,
  fmtCantidad: dinero.fmtCantidad,
  fmtPrecio: dinero.fmtPrecio,
  aTextoSoles: dinero.aTextoSoles,
  aTextoKg: dinero.aTextoKg,
  aTextoCantidad: dinero.aTextoCantidad,
  nombreMedio,
  fotoNegocio: imagenes.fotoNegocio,
  imagenProducto: imagenes.imagenProducto,
  // Ícono del juego de views/parciales/iconos.ejs
  ico: (nombre) => `<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-${nombre}"></use></svg>`,
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: config.claveSesion,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'strict', maxAge: 12 * 60 * 60 * 1000 },
}));
app.use(cargarDatosVista);
app.use(exigirConfiguracionInicial);

app.get('/', (req, res) => res.redirect('/caja'));
app.use(require('./src/rutas/usuarios.rutas'));
app.use('/turno', require('./src/rutas/turnos.rutas'));
app.use('/caja', require('./src/rutas/caja.rutas'));
app.use('/productos', require('./src/rutas/productos.rutas'));
app.use('/inventario', require('./src/rutas/inventario.rutas'));
app.use('/clientes', require('./src/rutas/clientes.rutas'));
app.use('/comprobantes', require('./src/rutas/comprobantes.rutas'));
app.use('/reportes', require('./src/rutas/reportes.rutas'));

app.use((req, res) => {
  res.status(404).render('error', { detalle: 'Esta página no existe.' });
});

// Errores: los de negocio se muestran como mensaje; los demás, como página de error.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof ErrorNegocio) {
    if (req.method === 'GET') return res.status(400).render('error', { detalle: err.message });
    req.session.error = err.message;
    return res.redirect(req.get('Referer') || '/caja');
  }
  console.error(`[${new Date().toLocaleString('es-PE')}]`, err);
  res.status(500).render('error', { detalle: 'Ocurrió un error inesperado. Revisa la ventana de PowerShell.' });
});

balanza.iniciar();
envioComprobantes.iniciar();

app.listen(config.puerto, config.host, () => {
  console.log(`Caja lista. Abre en el navegador: http://localhost:${config.puerto}`);
  console.log('Para detener el sistema presiona Ctrl + C');
});
