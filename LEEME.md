# Caja POS

Sistema de ventas e inventario para un minimarket con una caja. Funciona sin internet,
en una sola PC, con la base de datos SQLite en `database/pos.db`.

## Instalar (una sola vez)

```
npm install
```

Cuando lleguen los equipos reales:

```
npm install serialport             (balanza)
npm install node-thermal-printer   (impresora de tickets)
```

## Usar

Abre PowerShell y entra a la carpeta del proyecto:

```
cd $HOME\Documents\caja-pos
npm start
```

Luego abre **http://localhost:3000** en el navegador. Para apagar el sistema: `Ctrl + C`.

- `npm test`: corre las pruebas automáticas.
- `npm run demo`: carga 8 productos de prueba (solo si no hay productos).
- `npm run verificar-db`: muestra las tablas y el estado de la base de datos.
- La primera vez (sin usuarios) el sistema pide crear el administrador.

## En la caja

- Escanea el código de barras o escribe el **código interno** (P0001) o el **PLU** y presiona Enter.
- `3*7750000000011` agrega 3 unidades.
- Productos por peso: escribe el PLU (con la balanza simulada, escribe el peso en kg al lado).
- **F2** cobrar · **F3** ticket anterior · **F4** buscar por nombre · **Esc** borrar código o cancelar venta.
- Los productos con PLU aparecen como botones rápidos.
- La venta en curso queda guardada aunque se cierre el navegador o se vaya la luz.

## Reglas que aplica el sistema

- Los precios incluyen IGV (18 %, en `config.js`). El IGV se separa al vender.
- Factura: solo con RUC válido (11 dígitos con dígito verificador).
- Boleta desde S/ 700: pide DNI o RUC del cliente.
- Ventas menores a S/ 5: pueden ir sin comprobante si el cliente no lo pide.
- Vuelto solo en efectivo. Tarjeta, Yape, Plin y transferencia no pueden pasar del total.
- Cada venta (venta, detalle, pagos, stock y número de comprobante) se guarda en una sola transacción:
  si algo falla no se guarda nada y no se pierde ningún número de boleta.
- Todo cambio de stock queda en el kardex (ventas, ingresos, mermas, ajustes, anulaciones).
- Al cerrar turno: arqueo (cuadra / sobra / falta) y respaldo automático en `respaldos/`.

## Configuración

- `config.js`: medios de pago (Tarjeta y Transferencia vienen desactivadas: cambia `habilitado` a `true`),
  balanza, impresora, respaldos, montos de boleta.
- `.env` (copia de `.env.example`): nombre, RUC y dirección del negocio, clave de sesión y datos
  del proveedor de facturación. No se comparte.

## Fotos del negocio y de productos (opcional)

| Foto | Archivo | Tamaño recomendado |
|------|---------|--------------------|
| Logo | `public/img/negocio/logo.png` | 256 × 256 px |
| Fachada | `public/img/negocio/fachada.jpg` | 1200 × 800 px |
| Producto | `public/img/productos/<código de barras o PLU>.jpg` | 200 × 200 px |

Aparecen solas en menos de 30 segundos. Sin fotos, el sistema usa sus ilustraciones.

## Base de datos

- Migraciones en `database/migraciones/` (001, 002…). Se aplican solas al arrancar, sin borrar datos.
- Vistas listas para reportes en DB Browser: `v_resumen_comprobantes_diario`, `v_comprobantes`,
  `v_ventas_por_medio_diario`, `v_inventario`, `v_movimientos_diario`.
- Dinero en céntimos (S/ 4.50 = 450) y cantidades en milésimas (1 unidad = 1000, 1 kg = 1000).

## Pendiente

- Envío de comprobantes a SUNAT con el proveedor OSE/PSE que elija el cliente
  (`src/externos/facturacion.js`). Mientras tanto quedan como "pendiente".
- Boleta resumen diaria de las ventas menores a S/ 5 sin comprobante.
- Notas de crédito para comprobantes ya enviados.
