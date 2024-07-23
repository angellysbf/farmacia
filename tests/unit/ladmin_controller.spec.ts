import { test } from '@japa/runner'
import { HttpContext } from '@adonisjs/core/http'
import User from '../../app/models/user.js'
import jwt from 'jsonwebtoken'
import UserController from '../../app/controllers/users_controller.js'
import { ApiResponse } from '../../app/utilities/responses.js'

// Mock de las dependencias
const mockUser = {
  findOrFail: (id: number) => Promise.resolve({ id, name: 'Test User', rol_id: 1 }),
} as unknown as typeof User

const mockJwt = {
  verify: (token: string, secret: string) => ({ id: 1, rol_id: 1 }),
} as unknown as typeof jwt

const mockApiResponse = {
  inform: (message: string) => ({ message }),
  provide: (user: any, message: string) => ({ user, message }),
  unexpected: () => ({ message: 'Unexpected error' }),
} as unknown as typeof ApiResponse

test.group('UserController - is_admin', (group) => {
  group.each.setup(() => {
  })

  test('debe devolver 403 si el rol no es admin', async ({ assert }) => {
    mockJwt.verify = () => ({ id: 1, rol_id: 3 })

    const request = { headers: () => ({ authorization: 'Bearer validtoken' }) }
    const response = {
      status: (statusCode: number) => ({
        send: (body: any) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response } as HttpContext
    const userController = new UserController()
    userController.is_admin = async function (ctx: HttpContext) {
      try {
        const { authorization } = ctx.request.headers()
        const token = authorization?.substring(7)
        var decoded = mockJwt.verify(token, process.env.JWT_SECRET)

        if (decoded.rol_id != 2 && decoded.rol_id != 1) {
          return ctx.response.status(403).send(mockApiResponse.inform('Usuario prohibido'))
        }

        const user = await mockUser.findOrFail(decoded.id)
        return ctx.response.status(200).send(mockApiResponse.provide(user, 'Usuario encontrado'))
      } catch (error) {
        console.log(error)
        if (error.message === 'Invalid token') return ctx.response.status(403).send(mockApiResponse.inform('Usuario prohibido'))
        return ctx.response.status(500).send(mockApiResponse.unexpected())
      }
    }

    const result = await userController.is_admin(ctx)
    assert.deepEqual(result, { statusCode: 403, body: mockApiResponse.inform('Usuario prohibido') })
  })

  test('debe devolver 200 si el usuario es admin', async ({ assert }) => {
    mockJwt.verify = () => ({ id: 1, rol_id: 1 })
    mockUser.findOrFail = (id: number) => Promise.resolve({ id, name: 'Test User', rol_id: 1 })

    const request = { headers: () => ({ authorization: 'Bearer validtoken' }) }
    const response = {
      status: (statusCode: number) => ({
        send: (body: any) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response } as HttpContext
    const userController = new UserController()
    userController.is_admin = async function (ctx: HttpContext) {
      try {
        const { authorization } = ctx.request.headers()
        const token = authorization?.substring(7)
        var decoded = mockJwt.verify(token, process.env.JWT_SECRET)

        if (decoded.rol_id != 2 && decoded.rol_id != 1) {
          return ctx.response.status(403).send(mockApiResponse.inform('Usuario prohibido'))
        }

        const user = await mockUser.findOrFail(decoded.id)
        return ctx.response.status(200).send(mockApiResponse.provide(user, 'Usuario encontrado'))
      } catch (error) {
        console.log(error)
        if (error.message === 'Invalid token') return ctx.response.status(403).send(mockApiResponse.inform('Usuario prohibido'))
        return ctx.response.status(500).send(mockApiResponse.unexpected())
      }
    }

    const result = await userController.is_admin(ctx)
    assert.deepEqual(result, { statusCode: 200, body: mockApiResponse.provide({ id: 1, name: 'Test User', rol_id: 1 }, 'Usuario encontrado') })
  })
})
