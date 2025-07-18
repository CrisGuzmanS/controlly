import { Mail } from "meily";

/**
 * Middleware function that wraps a given controller function in a transaction,
 * handles errors, and sends error notification emails in production environments.
 *
 * @param {Function} controller - The controller function to execute.
 * @returns {Function} - An asynchronous function to handle the request, response, and next middleware.
 *
 * The function attempts to execute the provided controller function. If an error occurs,
 * it rolls back the transaction if it hasn't been completed, logs the error details,
 * and if the application environment is set to production, sends an email notification
 * with the error details. Finally, it sends a 500 status response with the error message
 * to the client.
 * 
 * @example
 * ```javascript
 * import { controller } from 'controlly';
 * const router = express.Router();
 * router.get('/api/users', controller(listUsersController));
 * ```
 */
export const controller = (controller) => {
    return async (req, response, next) => {

        try {
            // Ejecuta el controlador que se pasó como argumento y lo envuelve en una transacción
            await controller(req, response, next);
        } catch (error) {
            if (req?.transaction?.finished === false) {
                await req.transaction.rollback();
            }

            // Muestra los mensajes en consola
            console.error(error.message);
            console.error(error.stack);

            // Obtiene los entornos en donde si se podría mandar correo, por defecto son entornos de producción
            let environments = [];
            if (process.env.MAIL_EXCEPTION_ENVIRONMENTS) {
                environments = process.env.MAIL_EXCEPTION_ENVIRONMENTS
                    .split(',')
                    .map(e => e.trim().toLowerCase());
            } else {
                environments = ['prod', 'prd', 'production'];
            }

            // Solo para entornos de producción envía un correo
            if (environments.includes(process.env.APP_ENVIRONMENT)) {
                try {
                    Mail.from(process.env.MAIL_FROM)
                        .to(process.env.MAIL_TO)
                        .content(`
                            <div style="margin-bottom: 20px">
                                <b>ERROR:</b><br>
                                ${error.message} <br><br>
                                ${error.stack}
                            </div>
                            <div style="margin-bottom: 20px">
                                <b>ENDPOINT:</b><br>
                                ${req.protocol + '://' + req.get('host') + req.originalUrl}
                            </div>
                            <div style="margin-bottom: 20px">
                                <b>BODY:</b><br>
                                <pre style="background: #f6f6f6; padding: 10px; border: 1px solid #ccc;">${JSON.stringify(req.body, null, 2)}</pre>
                            </div>
                            <div style="margin-bottom: 20px">
                                <b>DATE:</b><br>
                                ${new Date().toLocaleString('en-CA', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true
                                }).replace(',', '')}
                            </div>
                            <div style="margin-bottom: 20px">
                                <b>ENVIRONMENT:</b><br>
                                ${process.env.APP_ENVIRONMENT}
                            </div>
                        `)
                        .subject('Error en la plataforma')
                        .send()
                } catch (mailError) {
                    console.log(mailError);
                }
            }

            // Se retorna una respuesta al cliente (frontend)
            response.status(500).json({
                message: error.message,
                replyText: error.message,
                replyCode: 500
            });

            return response
        }
    };
};