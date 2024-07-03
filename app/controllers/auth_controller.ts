// import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import User from "#models/user";
import Rol from "#models/rol";
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import { ApiResponse } from '../utilities/responses.js'
const res = new ApiResponse()
import jwt from 'jsonwebtoken'

import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
    async login({request, response}: HttpContext) {
        const {email, password} = request.body()
console.log('hola');

        if(!email || !password) return response.status(400).send(res.inform('Los datos son obligatorios'))

        const is_user = await User.findBy('email', email)
        
        if (!is_user) {
            return response.status(404).send(res.inform('el usuario no fue encontrado'))
        }
        if (await !hash.verify(is_user.password, password)) {
            return response.status(404).send(res.inform('Contrasenha erronea'))
        }
        
        const token = jwt.sign({ name: is_user.name, id: is_user.id, rol_id: is_user.rol_id}, process.env.JWT_SECRET, {expiresIn: '1d'});

        return response.status(200).send(res.provide(token, 'Usuario Verificado'))
    }

    async signup({request, response}: HttpContext) {
        try {
            const { email, name, phone, password } = request.body()
            
            if(!email || !name || !phone || !password) return response.status(400).send(res.inform('Los datos son obligatorios'))
            
            
            if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*.^,#?&])[A-Za-z\d@$!%*,.^#?&]{8,}$/)){
                return response.status(400).send(res.inform('La contraseña debe tener minimo 8 caracteres, 1 letra, 1 numero y un caracter especial'))
            }
            
            if (!phone.match(/^\d{11}$/)) {
                return response.status(400).send(res.inform('El numero de telefono debe ser 11 digitos'))
            }

            if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)){
                return response.status(400).send(res.inform('El email es incorrecto'))
            }
            
            const hashedPassword = await hash.make(password);

            const is_user = await User.findBy('email', email)
            if (is_user) return response.status(400).send(res.inform('el email ya esta en uso'))

            const rol = await Rol.findBy('id', 3)

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

            await mail.send((message) => {
                message
                  .to(email)
                  .subject('Verify your email address')
                  .text('holis bb')
              })
          
            const token = jwt.sign({ name: newUser[0].name, id: newUser[0].id, rol_id: newUser[0].rol_id}, process.env.JWT_SECRET, {expiresIn: '1d'});

            return response.status(200).send(res.provide(token, 'Usuario Creado'))
        } catch (error) {
            response.status(500).send(res.unexpected())
            console.log(error);
        }
    }

    async send_password_recover({request, response}: HttpContext) {
        const {email} = request.body()

        const is_user = await User.findBy('email', email)
        
        if (!is_user) {
            return response.status(404).send(res.inform('el usuario no fue encontrado'))
        }

        const token = jwt.sign({ user_id: is_user.id}, process.env.JWT_SECRET, {expiresIn: '1d'})

        const url_token = process.env.FRONT_URL + token
        
        await mail.send((message) => {
            message
              .to(email)
              .subject('Verify your email address')
              .text(url_token)
          })

        return response.status(200).send(res.provide(token, 'Link de recuperacion enviado'))
    }

    async recover_password({request, response}: HttpContext) {
        try {
            const {verify_token, newPassword} = request.body()

            var decoded = jwt.verify(verify_token, process.env.JWT_SECRET);
    
            const is_user = await User.find(decoded.user_id)
            
            if (!is_user) {
                return response.status(404).send(res.inform('el usuario no fue encontrado'))
            }
    
            if (!newPassword.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*.^,#?&])[A-Za-z\d@$!%*,.^#?&]{8,}$/)){
                return response.status(403).send(res.inform('La contraseña debe tener minimo 8 caracteres, 1 letra, 1 numero y un caracter especial'))
            }
    
            const hashedPassword = await hash.make(newPassword);
    
            is_user.password = hashedPassword
    
            is_user.save()
    
            const token = jwt.sign({ name: is_user.name, rol_id: is_user.rol_id}, process.env.JWT_SECRET, {expiresIn: '1d'});
    
            return response.status(200).send(res.provide(token, 'Contraseña actualizada exitosamente'))
    
        } catch (error) {
            if (error.message == 'invalid token') return response.status(401).send(res.inform('Hay un problema con el token'))
            if (error.message == 'jwt expired') return response.status(401).send(res.inform('token expired'))
            return response.status(500).send(res.unexpected())
    
        }
    }
}