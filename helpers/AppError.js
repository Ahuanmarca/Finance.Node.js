// POR AHORA NO SE ESTÁ USANDO
// LOS ERRORES TÍPICOS SE ESTÁN MANEJANDO CON APOLOGY

class AppError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
}

module.exports = AppError;