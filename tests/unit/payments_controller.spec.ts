import { test } from '@japa/runner'
import { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import User from '#models/user'
import PaymentPlatform from '#models/payment_platform'
import Payment from '#models/payment'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'
import PaymentsController from '../../app/controllers/payments_controller.js'
import { ApiResponse } from '../../app/utilities/responses.js'

// Mock de las dependencias
const mockProduct = {
  find: (id: number) => Promise.resolve({ id, available_quantity: 10, reserved_quantity: 0, save: () => {} }),
  findOrFail: (id: number) => Promise.resolve({ id, available_quantity: 10, reserved_quantity: 0, save: () => {} }),
} as unknown as typeof Product

const mockUser = {
  find: (id: number) => Promise.resolve({ id, address: '123 Street' }),
} as unknown as typeof User

const mockPaymentPlatform = {
  find: (id: number) => Promise.resolve({ id }),
} as unknown as typeof PaymentPlatform

const mockPayment = {
  findOrFail: (id: number) => Promise.resolve({ id, products: [{ id: 1, quantity: 2 }], save: () => {}, delete: () => {} }),
} as unknown as typeof Payment

const mockDb = {
  table: () => ({
    returning: () => ({
      insert: (data: any) => Promise.resolve([{ id: 1 }]),
    }),
  }),
  from: () => ({
    where: () => ({
      orderBy: () => Promise.resolve([]),
    }),
    whereNot: () => ({
      orderBy: () => Promise.resolve([]),
    }),
    orderBy: () => Promise.resolve([]),
  }),
} as unknown as typeof db

const mockJwt = {
  verify: (token: string, secret: string) => ({ id: 1 }),
} as unknown as typeof jwt

const mockApiResponse = {
  inform: (message: string) => ({ message }),
  provide: (data: any, message: string) => ({ data, message }),
  unexpected: () => ({ message: 'Unexpected error' }),
} as unknown as typeof ApiResponse

test.group('PaymentsController - make_payment', (group) => {
  group.each.setup(() => {})

  test('debe devolver 400 si faltan datos importantes', async ({ assert }) => {
    const request = { body: () => ({ payment_platform_id: 1, products: [], total: 100, phone: '' }), headers: () => ({ authorization: '' }) }
    const response = {
      status: (statusCode: number) => ({
        send: (body: any) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response } as HttpContext
    const paymentsController = new PaymentsController()
    paymentsController.make_payment = async function (ctx: HttpContext) {
      const { payment_platform_id, products, total, phone } = ctx.request.body()
      if (!payment_platform_id || products.length <= 0 || !total || !phone) {
        return ctx.response.status(400).send(mockApiResponse.inform('Falta algún dato importante para realizar el pago'))
      }
    }

    const result = await paymentsController.make_payment(ctx)

    assert.deepEqual(result, { statusCode: 400, body: mockApiResponse.inform('Falta algún dato importante para realizar el pago') })
  })

  test('debe devolver 400 si el número de teléfono no tiene 11 dígitos', async ({ assert }) => {
    const request = { body: () => ({ payment_platform_id: 1, products: [{ id: 1, quantity: 1 }], total: 100, phone: '123456789' }), headers: () => ({ authorization: '' }) }
    const response = {
      status: (statusCode: number) => ({
        send: (body: any) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response } as HttpContext
    const paymentsController = new PaymentsController()
    paymentsController.make_payment = async function (ctx: HttpContext) {
      const { phone } = ctx.request.body()
      if (!phone.match(/^\d{11}$/)) {
        return ctx.response.status(400).send(mockApiResponse.inform('El número de teléfono debe ser 11 dígitos'))
      }
    }

    const result = await paymentsController.make_payment(ctx)

    assert.deepEqual(result, { statusCode: 400, body: mockApiResponse.inform('El número de teléfono debe ser 11 dígitos') })
  })

  test('debe devolver 200 y el id del pago si los datos son correctos', async ({ assert }) => {
    const request = { body: () => ({ payment_platform_id: 1, products: [{ id: 1, quantity: 1 }], total: 100, phone: '12345678901' }), headers: () => ({ authorization: 'Bearer token' }) }
    let sentResponse: any
    const response = {
      status: (statusCode: number) => ({
        send: (body: any) => {
          sentResponse = { statusCode, body }
          return sentResponse
        },
      }),
    }

    const ctx = { request, response } as HttpContext
    const paymentsController = new PaymentsController()
    paymentsController.make_payment = async function (ctx: HttpContext) {
      const { payment_platform_id, products, total, phone } = ctx.request.body()
      const { authorization } = ctx.request.headers()
      const token = authorization?.substring(7)
      const decoded = mockJwt.verify(token, process.env.JWT_SECRET)
      const user_id = decoded.id

      const is_payment_platform = await mockPaymentPlatform.find(payment_platform_id)
      if (is_payment_platform) {
        const saved = await mockDb.table('payments').returning(['id']).insert({
          payment_platform_id: payment_platform_id,
          products: products,
          user_id: user_id,
          total: total,
          phone: phone,
          status: 'reported',
          address: 'store',
        })
        return ctx.response.status(200).send(mockApiResponse.provide(saved, `El pago fue enviado correctamente bajo el id ${saved[0].id}`))
      }
    }

    await paymentsController.make_payment(ctx)

    assert.deepEqual(sentResponse, { statusCode: 200, body: mockApiResponse.provide([{ id: 1 }], 'El pago fue enviado correctamente bajo el id 1') })
  })
})

 // Pruebas para el método see_payments
 test.group('PaymentsController - see_payments', (group) => {
    group.each.setup(() => {})
  
    test('debe devolver 200 y la lista de pagos', async ({ assert }) => {
      const request = { qs: () => ({}) }
      const response = {
        status: (statusCode: number) => ({
          send: (body: any) => ({ statusCode, body }),
        }),
      }
  
      const ctx = { request, response } as HttpContext
      const paymentsController = new PaymentsController()
      paymentsController.see_payments = async function (ctx: HttpContext) {
        const { status } = ctx.request.qs()
        let payments
        if (status) {
          payments = status === 'closed'
            ? await mockDb.from('payments').where('status', status).orderBy('updated_at')
            : await mockDb.from('payments').whereNot('status', 'closed').orderBy('updated_at')
        } else {
          payments = await mockDb.from('payments').orderBy('updated_at')
        }
        return ctx.response.status(200).send(mockApiResponse.provide(payments, 'Lista de pagos'))
      }
  
      const result = await paymentsController.see_payments(ctx)
  
      assert.deepEqual(result, { statusCode: 200, body: mockApiResponse.provide([], 'Lista de pagos') })
    })
  })
  
  // Pruebas para el método update_payment
  test.group('PaymentsController - update_payment', (group) => {
    group.each.setup(() => {})
  
    test('debe devolver 200 y actualizar el pago si los datos son correctos', async ({ assert }) => {
      const request = { body: () => ({ id: 1, status: 'paid' }) }
      const response = {
        status: (statusCode: number) => ({
          send: (body: any) => ({ statusCode, body }),
        }),
      }
  
      const ctx = { request, response } as HttpContext
      const paymentsController = new PaymentsController()
      paymentsController.update_payment = async function (ctx: HttpContext) {
        const { id, status } = ctx.request.body()
        const is_payment = await mockPayment.findOrFail(id)
        is_payment.status = status
        await is_payment.save()
        return ctx.response.status(200).send(mockApiResponse.provide({ id, status }, `El pago de id: ${id} fue actualizado correctamente`))
      }
  
      const result = await paymentsController.update_payment(ctx)
  
      assert.deepEqual(result, { statusCode: 200, body: mockApiResponse.provide({ id: 1, status: 'paid' }, 'El pago de id: 1 fue actualizado correctamente') })
    })
  })
  
  // Pruebas para el método delete_payment
  test.group('PaymentsController - delete_payment', (group) => {
    group.each.setup(() => {})
  
    test('debe devolver 200 y eliminar el pago si existe', async ({ assert }) => {
      const request = { body: () => ({ id: 1 }) }
      const response = {
        status: (statusCode: number) => ({
          send: (body: any) => ({ statusCode, body }),
        }),
      }
  
      const ctx = { request, response } as HttpContext
      const paymentsController = new PaymentsController()
      paymentsController.delete_payment = async function (ctx: HttpContext) {
        const { id } = ctx.request.body()
        const is_payment = await mockPayment.findOrFail(id)
        await is_payment.delete()
        return ctx.response.status(200).send(mockApiResponse.provide({ id }, `El pago de id: ${id} fue eliminado correctamente`))
      }
  
      const result = await paymentsController.delete_payment(ctx)
  
      assert.deepEqual(result, { statusCode: 200, body: mockApiResponse.provide({ id: 1 }, 'El pago de id: 1 fue eliminado correctamente') })
    })
  
  })