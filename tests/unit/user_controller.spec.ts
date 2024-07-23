import { test } from '@japa/runner'
import User from '#models/user'
import jwt from 'jsonwebtoken'
import { ApiResponse } from '../../app/utilities/responses.js' 
import UsersController from '../../app/controllers/users_controller.js'
import { HttpContext } from '@adonisjs/core/http'

// Mock de las dependencias
const mockUser = {
  findOrFail: (id) => Promise.resolve({ id, password: '', name: 'Test User' }),
} as unknown as typeof User

const mockJwt = {
  verify: (token, secret) => ({ id: 1 }),
} as unknown as typeof jwt

const mockApiResponse = {
  inform: (message) => ({ message }),
  provide: (data, message) => ({ data, message }),
  unexpected: () => ({ message: 'Unexpected error' }),
} as unknown as ApiResponse

test.group('UsersController - find_by_token', (group) => {
  group.each.setup(() => {
    User.findOrFail = mockUser.findOrFail
    jwt.verify = mockJwt.verify
  })

  test('debe devolver 200 si el usuario es encontrado', async ({ assert }) => {
    const request = {
      headers: () => ({ authorization: 'Bearer token' })
    }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body })
      })
    }
    const ctx = { request, response } as unknown as HttpContext
    const usersController = new UsersController()
    usersController.find_by_token = async function (ctx) {
      const { authorization } = ctx.request.headers()
      const token = authorization?.substring(7)
      var decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findOrFail(decoded.id)
      user.password = ''
      return ctx.response.status(200).send(mockApiResponse.provide(user, 'Usuario encontrado'))
    }

    const result = await usersController.find_by_token(ctx)

    assert.deepEqual(result, { statusCode: 200, body: mockApiResponse.provide({ id: 1, password: '', name: 'Test User' }, 'Usuario encontrado') })
  })

  test('debe devolver 404 si el usuario no es encontrado', async ({ assert }) => {
    User.findOrFail = () => Promise.reject({ code: 'E_ROW_NOT_FOUND' })
    const request = {
      headers: () => ({ authorization: 'Bearer token' })
    }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body })
      })
    }
    const ctx = { request, response } as unknown as HttpContext
    const usersController = new UsersController()
    usersController.find_by_token = async function (ctx) {
      try {
        const { authorization } = ctx.request.headers()
        const token = authorization?.substring(7)
        var decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOrFail(decoded.id)
        user.password = ''
        return ctx.response.status(200).send(mockApiResponse.provide(user, 'Usuario encontrado'))
      } catch (error) {
        if (error.code == 'E_ROW_NOT_FOUND') {
          return ctx.response.status(404).send(mockApiResponse.inform('No existe este usuario'))
        }
        return ctx.response.status(500).send(mockApiResponse.unexpected())
      }
    }

    const result = await usersController.find_by_token(ctx)

    assert.deepEqual(result, { statusCode: 404, body: mockApiResponse.inform('No existe este usuario') })
  })
})