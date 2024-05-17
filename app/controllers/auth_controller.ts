// import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import User from "#models/user";
import Rol from "#models/rol";
import db from '@adonisjs/lucid/services/db'
import { ApiResponse } from '../utilities/responses.js'
const res = new ApiResponse()
import jwt from 'jsonwebtoken'

import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
    async login({request, response}: HttpContext) {
        const {email, password} = request.body()

        const is_user = await User.findBy('email', email)
        
        if (!is_user) {
            return response.status(404).send(res.inform('el usuario no fue encontrado'))
        }
        if (await !hash.verify(is_user.password, password)) {
            return response.status(404).send(res.inform('Contrasenha erronea'))
        }
        
        const token = jwt.sign({ name: is_user.name, rol_id: is_user.rol_id}, process.env.JWT_SECRET, {expiresIn: '1d'});

        return response.status(200).send(res.provide(token, 'Usuario Verificado'))
    }

    async signup({request, response}: HttpContext) {
        try {
            const { email, name, phone, password } = request.body()            

            if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*.^,#?&])[A-Za-z\d@$!%*,.^#?&]{8,}$/)){
                return response.status(403).send(res.inform('La contraseña debe tener minimo 8 caracteres, 1 letra, 1 numero y un caracter especial'))
            }
            
            if (!phone.match(/^\d{11}$/)) {
                return response.status(403).send(res.inform('El numero de telefono debe ser 11 digitos'))
            }

            if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)){
                return response.status(403).send(res.inform('El email es incorrecto'))
            }

            const hashedPassword = await hash.make(password);

            const is_user = await User.findBy('email', email)
            if (is_user) return response.status(403).send(res.inform('el email ya esta en uso'))

            const rol = await Rol.findBy('id', 1)

            if (!rol) {
                return response.status(400).send(res.inform(`El Rol User no fue encontrado`))
            }

            
            const newUser = await db
            .table('users')
            .returning(['id', 'rol_id', 'name'])
            .insert({
                name: name,
                email: email,
                phone: phone,
                rol_id: rol.id,
                password: hashedPassword
            })
                        
            const token = jwt.sign({ name: newUser[0].name, rol_id: newUser[0].rol_id}, process.env.JWT_SECRET, {expiresIn: '1d'});

            return response.status(200).send(res.provide(token, 'Usuario Creado'))
        } catch (error) {
            response.status(500).send(res.unexpected())
            console.log(error);
        }
    }
}