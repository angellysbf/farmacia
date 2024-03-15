export class ApiResponse{
    unexpected() {
        return {body: null, message:'Ha ocurrido un error inesperado'}
    }

    inform(infoMessage: string) {
        return {body: null, message: infoMessage}
    }

    provide(body: any | null, message: string) {
        return {body: body, message: message}
    }

    
}