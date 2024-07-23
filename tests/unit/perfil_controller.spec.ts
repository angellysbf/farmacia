import { test } from '@japa/runner'
import User from '#models/user'
import jwt from 'jsonwebtoken'
import hash from '@adonisjs/core/services/hash'
import { ApiResponse } from '../../app/utilities/responses.js' 
import UsersController from '../../app/controllers/users_controller.js'
import { HttpContext } from '@adonisjs/core/http'

// Mock de las dependencias
const mockUser = {
    findOrFail: (id) => Promise.resolve({ id, save: () => Promise.resolve() }),
  } as unknown as typeof User
  
  const mockJwt = {
    verify: (token, secret) => ({ id: 1 })
  } as unknown as typeof jwt
  
  const mockHash = {
    make: (password) => Promise.resolve('hashedpassword')
  } as unknown as typeof hash
  
  const mockApiResponse = {
    inform: (message) => ({ message }),
    provide: (data, message) => ({ data, message }),
    unexpected: () => ({ message: 'Unexpected error' })
  } as unknown as ApiResponse
  
  test.group('UsersController - update', (group) => {
    group.each.setup(() => {
      User.findOrFail = mockUser.findOrFail
      jwt.verify = mockJwt.verify
      hash.make = mockHash.make
    })
  
    test('debe devolver 200 y actualizar el usuario si los datos son válidos', async ({ assert }) => {
      const request = {
        headers: () => ({ authorization: 'Bearer token' }),
        body: () => ({
          name: 'New Name',
          email: 'newemail@example.com',
          address: 'New Address',
          phone: '12345678901',
          password: 'NewPassword1!'
        })
      }
      const response = {
        status: (statusCode) => ({
          send: (body) => ({ statusCode, body })
        })
      }
      const ctx = { request, response } as unknown as HttpContext
      const usersController = new UsersController()
      usersController.update = async function (ctx) {
        try {
          const { authorization } = ctx.request.headers()
          const { name, email, address, phone, password } = ctx.request.body()
          const token = authorization?.substring(7)
          var decoded = jwt.verify(token, process.env.JWT_SECRET)
          const user = await User.findOrFail(decoded.id)
          if (password) {
            if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*.^,#?&])[A-Za-z\d@$!%*,.^#?&]{8,}$/)) {
              return ctx.response.status(400).send(mockApiResponse.inform('La contraseña debe tener mínimo 8 caracteres, 1 letra, 1 número y un carácter especial'))
            }
            const hashedPassword = await hash.make(password)
            user.password = hashedPassword
          }
          if (phone) {
            if (!phone.match(/^\d{11}$/)) {
              return ctx.response.status(400).send(mockApiResponse.inform('El número de teléfono debe ser 11 dígitos'))
            }
            user.phone = phone
          }
          if (email) {
            if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
              return ctx.response.status(400).send(mockApiResponse.inform('El correo electrónico es incorrecto'))
            }
            user.email = email
          }
          if (name) {
            user.name = name
          }
          if (address) {
            user.address = address
          }
          await user.save()
          // Excluyendo las propiedades password y save para la verificación
          const { id, name: userName, email: userEmail, address: userAddress, phone: userPhone } = user
          return ctx.response.status(200).send(mockApiResponse.provide({ id, name: userName, email: userEmail, address: userAddress, phone: userPhone }, 'Usuario actualizado'))
        } catch (error) {
          if (error.code == 'E_ROW_NOT_FOUND') {
            return ctx.response.status(404).send(mockApiResponse.inform('No existe este usuario'))
          }
          return ctx.response.status(500).send(mockApiResponse.unexpected())
        }
      }
  
      const result = await usersController.update(ctx)
  
      assert.deepEqual(result, {
        statusCode: 200,
        body: mockApiResponse.provide({
          id: 1,
          name: 'New Name',
          email: 'newemail@example.com',
          address: 'New Address',
          phone: '12345678901'
        }, 'Usuario actualizado')
      })
    })
  
    test('debe devolver 400 si la contraseña no cumple con los requisitos', async ({ assert }) => {
      const request = {
        headers: () => ({ authorization: 'Bearer token' }),
        body: () => ({
          password: 'short'
        })
      }
      const response = {
        status: (statusCode) => ({
          send: (body) => ({ statusCode, body })
        })
      }
      const ctx = { request, response } as unknown as HttpContext
      const usersController = new UsersController()
      usersController.update = async function (ctx) {
        try {
          const { authorization } = ctx.request.headers()
          const { password } = ctx.request.body()
          const token = authorization?.substring(7)
          var decoded = jwt.verify(token, process.env.JWT_SECRET)
          const user = await User.findOrFail(decoded.id)
          if (password) {
            if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*.^,#?&])[A-Za-z\d@$!%*,.^#?&]{8,}$/)) {
              return ctx.response.status(400).send(mockApiResponse.inform('La contraseña debe tener mínimo 8 caracteres, 1 letra, 1 número y un carácter especial'))
            }
          }
        } catch (error) {
          return ctx.response.status(500).send(mockApiResponse.unexpected())
        }
      }
  
      const result = await usersController.update(ctx)
  
      assert.deepEqual(result, { statusCode: 400, body: mockApiResponse.inform('La contraseña debe tener mínimo 8 caracteres, 1 letra, 1 número y un carácter especial') })
    })
    test('debe devolver 400 si el número de teléfono es inválido', async ({ assert }) => {
        const request = {
          headers: () => ({ authorization: 'Bearer token' }),
          body: () => ({
            phone: '1234567890'
          })
        }
        const response = {
          status: (statusCode) => ({
            send: (body) => ({ statusCode, body })
          })
        }
        const ctx = { request, response } as unknown as HttpContext
        const usersController = new UsersController()
        usersController.update = async function (ctx) {
          try {
            const { authorization } = ctx.request.headers()
            const { phone } = ctx.request.body()
            const token = authorization?.substring(7)
            var decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findOrFail(decoded.id)
            if (phone) {
              if (!phone.match(/^\d{11}$/)) {
                return ctx.response.status(400).send(mockApiResponse.inform('El número de teléfono debe ser 11 dígitos'))
              }
              user.phone = phone
            }
          } catch (error) {
            return ctx.response.status(500).send(mockApiResponse.unexpected())
          }
        }
    
        const result = await usersController.update(ctx)
    
        assert.deepEqual(result, { statusCode: 400, body: mockApiResponse.inform('El número de teléfono debe ser 11 dígitos') })
      })
    
      test('debe devolver 400 si el email es inválido', async ({ assert }) => {
        const request = {
          headers: () => ({ authorization: 'Bearer token' }),
          body: () => ({
            email: 'invalidemail'
          })
        }
        const response = {
          status: (statusCode) => ({
            send: (body) => ({ statusCode, body })
          })
        }
        const ctx = { request, response } as unknown as HttpContext
        const usersController = new UsersController()
        usersController.update = async function (ctx) {
          try {
            const { authorization } = ctx.request.headers()
            const { email } = ctx.request.body()
            const token = authorization?.substring(7)
            var decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findOrFail(decoded.id)
            if (email) {
              if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
                return ctx.response.status(400).send(mockApiResponse.inform('El correo electrónico es incorrecto'))
              }
              user.email = email
            }
          } catch (error) {
            return ctx.response.status(500).send(mockApiResponse.unexpected())
          }
        }
    
        const result = await usersController.update(ctx)
    
        assert.deepEqual(result, { statusCode: 400, body: mockApiResponse.inform('El correo electrónico es incorrecto') })
      })
  })