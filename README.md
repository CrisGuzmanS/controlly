# controlly

Middleware para Express que facilita la gestión de transacciones con Sequelize y el manejo centralizado de errores, incluyendo notificaciones por correo en producción.

## Descripción
controlly ofrece dos middlewares para Express.js que te ayudarán a:

Manejar transacciones en bases de datos Sequelize automáticamente, haciendo commit o rollback según el resultado de la respuesta HTTP.

Ejecutar controladores envueltos en un middleware que captura errores, realiza rollback de la transacción si es necesario, y envía notificaciones de error por correo en entornos de producción.

## Instalación

```bash
npm install controlly
```

## Uso basico

1. Configurar en el archivo `.env` las variables de entorno:

| Variable                      | Descripción                                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| `APP_ENVIRONMENT`             | Define el entorno actual (`production`, `development`, `local`).                                          |
| `MAIL_HOST`                   | Servidor SMTP (por ejemplo: `smtp.gmail.com`).                                                            |
| `MAIL_PORT`                   | Puerto SMTP (generalmente `465` o `587`).                                                                 |
| `MAIL_PASSWORD`               | Contraseña o token de la cuenta emisora.                                                                  |
| `MAIL_FROM`                   | Dirección de correo remitente para enviar notificaciones.                                                 |
| `MAIL_TO`                     | Dirección de correo destino para recibir las notificaciones de error.                                     |
| `MAIL_EXCEPTION_ENVIRONMENTS` | Lista separada por comas con los entornos donde se enviarán correos (por defecto: `prod,prd,production`). |


1. Se debe instalar el middleware de transacciones con Sequelize:
```js
import { transaction } from 'controlly';
// ...
app.use(transaction(yourSequelizeInstance));
```

1. Se debe envolver el controlador con el middleware de control de errores:
```js
import { controller } from 'controlly';
//  ...
router.get('/your-endpoint', controller(yourController));
```