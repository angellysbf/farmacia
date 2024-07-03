import User from '#models/user'
import Payment from '#models/payment'

import type { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'
import hash from '@adonisjs/core/services/hash'
import { ApiResponse } from '../utilities/responses.js'
const res = new ApiResponse()

export default class UsersController {
    async find_by_token({ request, response }: HttpContext){
        try {
            const {authorization} = request.headers()
            const token = authorization?.substring(7)

            if (!token) return response.status(400).send(res.inform('Debe ser enviado un token de autorizacion')) 

            var decoded = jwt.verify(token, process.env.JWT_SECRET);            

            const user = await User.findOrFail(decoded.id)
    
            if (!user) return response.status(404).send(res.inform('No existe este usuario')) 
            
            user.password = ''

            return response.status(200).send(res.provide(user, 'Usuario encontrado'))
        } catch (error) {
            console.log(error);
            if (error.code == 'E_ROW_NOT_FOUND') return response.status(404).send(res.inform('No existe este usuario'))
            if (error.message == 'invalid token') return response.status(404).send(res.inform('Hay un problema con el token'))
            return response.status(500).send(res.unexpected())
        }
    }

    async payments({ request, response }: HttpContext){
        try {
            const {authorization} = request.headers()
            const token = authorization?.substring(7)

            if (!token) return response.status(400).send(res.inform('Debe ser enviado un token de autorizacion')) 

            var decoded = jwt.verify(token, process.env.JWT_SECRET);            

            const payments = await Payment.findBy('user_id', decoded.id)
                
            return response.status(200).send(res.provide(payments, 'Lista de pagos'))
        } catch (error) {
            console.log(error);
            if (error.message == 'invalid token') return response.status(404).send(res.inform('Hay un problema con el token'))
            return response.status(500).send(res.unexpected())
        }
    }

    async update({ request, response }: HttpContext){
        try {
            const {authorization} = request.headers()
            const { name, email, phone, password } = request.body()    

            const token = authorization?.substring(7)

            if (!token) return response.status(400).send(res.inform('Debe ser enviado un token de autorizacion')) 

            var decoded = jwt.verify(token, process.env.JWT_SECRET);            

            const user = await User.findOrFail(decoded.id)
    
            if (password) {
                if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*.^,#?&])[A-Za-z\d@$!%*,.^#?&]{8,}$/)){
                    return response.status(400).send(res.inform('La contraseña debe tener minimo 8 caracteres, 1 letra, 1 numero y un caracter especial'))
                }
                const hashedPassword = await hash.make(password);
                user.password = hashedPassword
            }      
            if (phone) {
                if (!phone.match(/^\d{11}$/)) {
                    return response.status(400).send(res.inform('El numero de telefono debe ser 11 digitos'))
                }
                user.phone = phone
            }     
            if (email) {
                if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)){
                    return response.status(400).send(res.inform('El email es incorrecto'))
                }
                user.email = email
            }    
            if (name){
                user.name = name
            }
            user.save()
            
            return response.status(200).send(res.provide(user, 'Usuario encontrado'))
        } catch (error) {
            console.log(error);
            if (error.code == 'E_ROW_NOT_FOUND') return response.status(404).send(res.inform('No existe este usuario'))
            if (error.message == 'invalid token') return response.status(404).send(res.inform('Hay un problema con el token'))
            return response.status(500).send(res.unexpected())
        }
    }
}