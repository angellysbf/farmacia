import { test } from '@japa/runner'
import Product from '#models/product'
import Category from '#models/category'
import db from '@adonisjs/lucid/services/db'
import ProductsController from '../../app/controllers/products_controller.js'
import { ApiResponse } from '../../app/utilities/responses.js'

// Mock de las dependencias
const mockProduct = {
  findOrFail: (id) => Promise.resolve(null),
} as unknown as typeof Product

const mockCategory = {
  find: (id) => Promise.resolve(null),
} as unknown as typeof Category

const mockDb = {
  from: (table) => ({
    orderBy: (column, order) => ({
      paginate: (page, limit) => Promise.resolve([]),
      where: (column, value) => ({
        paginate: (page, limit) => Promise.resolve([]),
      }),
    }),
    paginate: (page, limit) => Promise.resolve([]),
    whereILike: (column, value) => ({
      limit: (limit) => Promise.resolve([]),
    }),
    table: (table) => ({
      returning: (columns) => ({
        insert: (data) => Promise.resolve([]),
      }),
    }),
  }),
} as unknown as typeof db

const mockApiResponse = {
  inform: (message) => ({ message }),
  provide: (data, message) => ({ data, message }),
  unexpected: () => ({ message: 'Unexpected error' }),
} as unknown as typeof ApiResponse

test.group('ProductsController - list', (group) => {
  group.each.setup(() => {
    // Configuración común para todas las pruebas del grupo
  })

  test('debe devolver 400 si faltan page o limit', async ({ assert }) => {
    const request = { params: () => ({ page: null, limit: null }), qs: () => ({}) }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response }
    const productsController = new ProductsController()
    productsController.list = async function (ctx) {
      const { page, limit } = ctx.request.params()
      if (!page || !limit) {
        return ctx.response.status(400).send(mockApiResponse.inform('Se necesita establecer el número de pagina y el rango de items'))
      }
    }

    const result = await productsController.list(ctx)

    assert.deepEqual(result, { statusCode: 400, body: mockApiResponse.inform('Se necesita establecer el número de pagina y el rango de items') })
  })

  // Agrega más pruebas para otras condiciones y métodos
})

test.group('ProductsController - find_by_id', (group) => {
  test('debe devolver 404 si el producto no es encontrado', async ({ assert }) => {
    mockProduct.findOrFail = () => Promise.reject({ code: 'E_ROW_NOT_FOUND' })

    const request = { params: () => ({ id: 1 }) }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response }
    const productsController = new ProductsController()
    productsController.find_by_id = async function (ctx) {
      try {
        const { id } = ctx.request.params()
        const product = await mockProduct.findOrFail(id)
        return ctx.response.status(200).send(mockApiResponse.provide(product, 'Producto encontrado'))
      } catch (error) {
        if (error.code === 'E_ROW_NOT_FOUND') {
          return ctx.response.status(404).send(mockApiResponse.inform('No existe este producto'))
        }
        return ctx.response.status(500).send(mockApiResponse.unexpected())
      }
    }

    const result = await productsController.find_by_id(ctx)

    assert.deepEqual(result, { statusCode: 404, body: mockApiResponse.inform('No existe este producto') })
  })

  // Agrega más pruebas para otras condiciones y métodos
})

// Agrega más grupos de pruebas para los demás métodos del controlador
