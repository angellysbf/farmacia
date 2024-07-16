import User from '#models/user'
import Payment from '#models/payment'
import db from '@adonisjs/lucid/services/db'

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
            
            var decoded = jwt.verify(token, process.env.JWT_SECRET);            
            
            const user = await User.findOrFail(decoded.id)
    
            if (!user) return response.status(404).send(res.inform('No existe este usuario')) 
            user.password = ''

            return response.status(200).send(res.provide(user, 'Usuario encontrado'))
        } catch (error) {
            console.log(error);
            if (error.code == 'E_ROW_NOT_FOUND') return response.status(404).send(res.inform('No existe este usuario'))
            return response.status(500).send(res.unexpected())
        }
    }

    async payments({ request, response }: HttpContext){
        try {
            const {authorization} = request.headers()
            const token = authorization?.substring(7)
            
            var decoded = jwt.verify(token, process.env.JWT_SECRET);            
            
            const payments = await db.from('payments').where('user_id', decoded.id).orderBy('id', 'desc')
            
            return response.status(200).send(res.provide(payments, 'Lista de pagos'))
        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }
    }

    async search_payments({ request, response }: HttpContext){
        try {
            const {authorization} = request.headers()
            const {search} = request.params()
            const token = authorization?.substring(7)
            
            var decoded = jwt.verify(token, process.env.JWT_SECRET);            
            
            const payments = await db.from('payments').where('user_id', decoded.id)
            .andWhere('status', 'like', `%${search}%`)
            .orWhere('transference_id', 'like', `%${search}%`)
            .limit(10)
            
            return response.status(200).send(res.provide(payments, 'Lista de pagos'))
        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }
    }

    async update({ request, response }: HttpContext){
        try {
            const {authorization} = request.headers()
            const { name, email, address, phone, password } = request.body()    

            const token = authorization?.substring(7)

            var decoded = jwt.verify(token, process.env.JWT_SECRET);            

            const user = await User.findOrFail(decoded.id)
    
            if (password) {
                if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*.^,#?&])[A-Za-z\d@$!%*,.^#?&]{8,}$/)){
                    return response.status(400).send(res.inform('La contraseña debe tener mínimo 8 caracteres, 1 letra, 1 número y un carácter especial'))
                }
                const hashedPassword = await hash.make(password);
                user.password = hashedPassword
            }      
            if (phone) {
                if (!phone.match(/^\d{11}$/)) {
                    return response.status(400).send(res.inform('El número de teléfono debe ser 11 dígitos'))
                }
                user.phone = phone
            }     
            if (email) {
                if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)){
                    return response.status(400).send(res.inform('El correo electrónico es incorrecto'))
                }
                user.email = email
            }    
            if (name){
                user.name = name
            }
            if (address){
                user.address = address
            }

            user.save()
            
            return response.status(200).send(res.provide(user, 'Usuario encontrado'))
        } catch (error) {
            console.log(error);
            if (error.code == 'E_ROW_NOT_FOUND') return response.status(404).send(res.inform('No existe este usuario'))
            return response.status(500).send(res.unexpected())
        }
    }
    async is_admin({ request, response }: HttpContext){
        try {
            const {authorization} = request.headers()

            const token = authorization?.substring(7)

            var decoded = jwt.verify(token, process.env.JWT_SECRET);            

            if (decoded.rol_id != 2 && decoded.rol_id != 1) {
                return response.status(403).send(res.inform('Usuario prohibido'))
            }
            
            const user = await User.findOrFail(decoded.id)
                
            return response.status(200).send(res.provide(user, 'Usuario encontrado'))
        } catch (error) {
            console.log(error);
            if (error.code == 'E_ROW_NOT_FOUND') return response.status(403).send(res.inform('Usuario prohibido'))
            return response.status(500).send(res.unexpected())
        }
    }
}