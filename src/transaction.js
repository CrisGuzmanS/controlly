/**
 * Middleware que inicia una transacción en la base de datos y se encarga de
 * committearla si la respuesta es exitosa o rollback si no.
 *
 * @param {Sequelize} sequelize La instancia de sequelize
 * @returns {Function} Un middleware que inicia la transacción
 * 
 * @example
 * ```javascript
 * import { transaction } from 'controlly';
 * app.use(transaction(yourSequelizeInstance));
 * ```
 */
export function transaction(sequelize) {
    if (!sequelize) {
        throw new Error("Sequelize instance is required");
    }

    return async (request, response, next) => {

        // Se inicia la transacción
        request.transaction = await sequelize.transaction();

        const originalSend = response.send;
        response.send = async function (body) {

            if (response.statusCode == 500) {
                await request.transaction.rollback();
                return originalSend.call(this, body);
            }

            if (!request.transaction) {
                return originalSend.call(this, body);
            }

            if (request.transaction.finished) {
                return originalSend.call(this, body);
            }

            await request.transaction.commit();

            return originalSend.call(this, body);
        }

        response.on('close', async () => {
            if (request.transaction && request.transaction?.finished == undefined) {
                await request.transaction.rollback();
            }
        });

        response.on('error', async () => {
            if (request.transaction && request.transaction?.finished == undefined) {
                await request.transaction.rollback();
            }
        });

        return next();
    }

}