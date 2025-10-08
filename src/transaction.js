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
        request.transaction = await sequelize.transaction();
        response.on('finish', async () => {

            // Si la respuesta es exitosa, se hace el commit, si no se deshacen los cambios de la base de datos
            if (response.statusCode >= 200 && response.statusCode < 400 && request?.transaction && request?.transaction?.finished == undefined) {
                await request.transaction.commit();
            } else {
                if (request.transaction && !request.transaction.finished == undefined) {
                    await request.transaction.rollback();
                }
            }

        });

        // Si la respuesta se cierra, se deshacen los cambios
        response.on('close', async () => {
            if (!response.finished && !request.transaction.finished == undefined) {
                await request.transaction.rollback();
            }
        });
        next();
    }

}