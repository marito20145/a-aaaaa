// Configuración general. Lo que cambia de un cliente a otro va aquí.
// Los datos secretos (RUC, claves de facturación) van en el archivo .env (ver .env.example).
const path = require('path');
const crypto = require('crypto');

process.env.DOTENV_CONFIG_QUIET = 'true';
require('dotenv').config({ quiet: true });

module.exports = {
  // Servidor: solo esta PC puede entrar (127.0.0.1)
  puerto: Number(process.env.PUERTO) || 3000,
  host: '127.0.0.1',
  // Si no se define en .env se genera una al arrancar (al reiniciar hay que volver a ingresar).
  claveSesion: process.env.SESION_SECRETO || crypto.randomBytes(32).toString('hex'),

  // Datos del negocio (aparecen en tickets, comprobantes y en el inicio de sesión)
  negocio: {
    nombre: process.env.NEGOCIO_NOMBRE || 'Mi Minimarket',
    ruc: process.env.NEGOCIO_RUC || '',
    direccion: process.env.NEGOCIO_DIRECCION || '',
    telefono: process.env.NEGOCIO_TELEFONO || '',
  },

  // Los precios de los productos YA INCLUYEN IGV.
  igv: {
    tasa: 18, // porcentaje
  },

  comprobantes: {
    serieBoleta: 'B001',
    serieFactura: 'F001',
    // Ventas menores a este monto pueden ir sin comprobante (salvo que el cliente lo pida).
    montoMinimoBoletaCentimos: 500,
    // Desde este monto la boleta debe identificar al cliente (DNI u otro documento).
    montoBoletaIdentificadaCentimos: 70000,
  },

  inventario: {
    // true: permite vender aunque el sistema marque stock 0 (el stock queda negativo
    // y se corrige con un ajuste). false: bloquea la venta.
    permitirStockNegativo: true,
  },

  // Medios de pago. Para activar uno, cambie habilitado a true.
  // exigeReferencia: pide el nº de operación o los últimos 4 dígitos.
  mediosPago: {
    EFECTIVO:      { etiqueta: 'Efectivo',      habilitado: true,  exigeReferencia: false },
    YAPE:          { etiqueta: 'Yape',          habilitado: true,  exigeReferencia: false },
    PLIN:          { etiqueta: 'Plin',          habilitado: true,  exigeReferencia: false },
    TARJETA:       { etiqueta: 'Tarjeta',       habilitado: false, exigeReferencia: true  },
    TRANSFERENCIA: { etiqueta: 'Transferencia', habilitado: false, exigeReferencia: true  },
  },

  // Archivos
  rutaRespaldos: path.join(__dirname, 'respaldos'),
  rutaTickets: path.join(__dirname, 'tickets'),

  respaldos: {
    conservar: 30,       // cuántas copias guardar en la carpeta respaldos/
    copiaExterna: '',    // carpeta extra (USB o Google Drive), ej: 'G:\\Mi unidad\\respaldos-caja'
  },

  // Balanza: en modo simulado se escribe el peso a mano en la pantalla de caja
  balanza: {
    simulada: true,
    pesoSimulado: 1000,  // gramos por defecto en modo simulado
    puerto: process.env.BALANZA_PUERTO || 'COM3',
    baudios: 9600,
    comando: '',         // algunas balanzas necesitan que se les pida el peso (ver manual)
    intervaloMs: 300,
  },

  // Impresora térmica: en modo simulado los tickets se guardan en la carpeta tickets/
  impresora: {
    simulada: true,
    tipo: 'epson',                   // epson o star
    interfaz: process.env.IMPRESORA_INTERFAZ || 'tcp://192.168.1.100',
    ancho: 42,                       // caracteres por línea (80 mm ≈ 42-48, 58 mm ≈ 32)
    abrirCajon: true,
  },

  // Facturación electrónica (OSE/PSE). Se completa cuando se contrate el servicio.
  facturacion: {
    activa: false,
    proveedor: process.env.FACTURACION_PROVEEDOR || '',
    url: process.env.FACTURACION_URL || '',
    usuario: process.env.FACTURACION_USUARIO || '',
    clave: process.env.FACTURACION_CLAVE || '',
  },
};
