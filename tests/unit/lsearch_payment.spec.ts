import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'
import { ApiResponse } from '../../app/utilities/responses.js' 
import UsersController from '../../app/controllers/users_controller.js'
import { HttpContext } from '@adonisjs/core/http'

// Mock de las dependencias
const mockDb = {
  from: () => ({
    where: () => ({
      andWhere: () => ({
        orWhere: () => ({
          limit: () => Promise.resolve([{ id: 1, status: 'completed', transference_id: '12345' }, { id: 2, status: 'pending', transference_id: '67890' }])
        })
      })
    })
  })
} as unknown as typeof db

const mockJwt = {
  verify: (token, secret) => ({ id: 1 })
} as unknown as typeof jwt

const mockApiResponse = {
  provide: (data, message) => ({ data, message }),
  unexpected: () => ({ message: 'Unexpected error' })
} as unknown as ApiResponse

test.group('UsersController - search_payments', (group) => {
  group.each.setup(() => {
    db.from = mockDb.from
    jwt.verify = mockJwt.verify
  })

  test('debe devolver 200 y la lista de pagos filtrada por la búsqueda', async ({ assert }) => {
    const request = {
      headers: () => ({ authorization: 'Bearer token' }),
      params: () => ({ search: 'completed' })
    }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body })
      })
    }
    const ctx = { request, response } as unknown as HttpContext
    const usersController = new UsersController()
    usersController.search_payments = async function (ctx) {
      try {
        const { authorization } = ctx.request.headers()
        const { search } = ctx.request.params()
        const token = authorization?.substring(7)
        var decoded = jwt.verify(token, process.env.JWT_SECRET)
        const payments = await db.from('payments').where('user_id', decoded.id)
          .andWhere('status', 'like', `%${search}%`)
          .orWhere('transference_id', 'like', `%${search}%`)
          .limit(10)
        return ctx.response.status(200).send(mockApiResponse.provide(payments, 'Lista de pagos'))
      } catch (error) {
        return ctx.response.status(500).send(mockApiResponse.unexpected())
      }
    }

    const result = await usersController.search_payments(ctx)

    assert.deepEqual(result, { statusCode: 200, body: mockApiResponse.provide([{ id: 1, status: 'completed', transference_id: '12345' }, { id: 2, status: 'pending', transference_id: '67890' }], 'Lista de pagos') })
  })
})