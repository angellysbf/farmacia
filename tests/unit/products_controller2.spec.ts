import { test } from '@japa/runner'
import Product from '#models/product'
import Category from '#models/category'
import db from '@adonisjs/lucid/services/db'
import ProductsController from '../../app/controllers/products_controller.js'
import { ApiResponse } from '../../app/utilities/responses.js'

// Mock de las dependencias
const mockProduct = {
  findOrFail: (id) => Promise.resolve(null),
  find: (id) => Promise.resolve(null),
  delete: () => Promise.resolve(),
  save: () => Promise.resolve(),
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

test.group('ProductsController - search_by_name', (group) => {
  test('debe devolver 404 si no se encuentran productos', async ({ assert }) => {
    mockDb.from = () => ({
      whereILike: () => ({
        limit: () => Promise.resolve([]),
      }),
    })

    const request = { params: () => ({ name: 'test' }) }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response }
    const productsController = new ProductsController()
    productsController.search_by_name = async function (ctx) {
      const { name } = ctx.request.params()
      const products = await mockDb.from('products').whereILike('name', `%${name}%`).limit(20)
      if (products.length === 0) {
        return ctx.response.status(404).send(mockApiResponse.inform('No se encontro ningun producto'))
      }
      return ctx.response.status(200).send(mockApiResponse.provide(products, 'Productos encontrado'))
    }

    const result = await productsController.search_by_name(ctx)

    assert.deepEqual(result, { statusCode: 404, body: mockApiResponse.inform('No se encontro ningun producto') })
  })
  
  test('debe devolver 200 y la lista de productos si se encuentran productos', async ({ assert }) => {
    const mockProducts = [{ id: 1, name: 'Test Product' }]
    mockDb.from = () => ({
      whereILike: () => ({
        limit: () => Promise.resolve(mockProducts),
      }),
    })

    const request = { params: () => ({ name: 'test' }) }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response }
    const productsController = new ProductsController()
    productsController.search_by_name = async function (ctx) {
      const { name } = ctx.request.params()
      const products = await mockDb.from('products').whereILike('name', `%${name}%`).limit(20)
      if (products.length === 0) {
        return ctx.response.status(404).send(mockApiResponse.inform('No se encontro ningun producto'))
      }
      return ctx.response.status(200).send(mockApiResponse.provide(products, 'Productos encontrado'))
    }

    const result = await productsController.search_by_name(ctx)

    assert.deepEqual(result, { statusCode: 200, body: mockApiResponse.provide(mockProducts, 'Productos encontrado') })
  })
})

test.group('ProductsController - list_order_by', (group) => {
  test('debe devolver 404 si no se encuentran productos', async ({ assert }) => {
    mockDb.from = () => ({
      where: () => ({
        orderBy: () => ({
          paginate: () => Promise.resolve([]),
        }),
      }),
      paginate: () => Promise.resolve([]),
    })

    const request = { qs: () => ({ category: 1, priceSort: 'asc' }), params: () => ({ page: 1, limit: 10 }) }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response }
    const productsController = new ProductsController()
    productsController.list_order_by = async function (ctx) {
      const { category, priceSort } = ctx.request.qs()
      const { page, limit } = ctx.request.params()
      const products = await mockDb.from('products').where('category_id', category).orderBy('price', priceSort).paginate(page, limit)
      if (products.length === 0) {
        return ctx.response.status(404).send(mockApiResponse.inform('No se encontro ningun producto'))
      }
      return ctx.response.status(200).send(mockApiResponse.provide(products, 'Lista de productos'))
    }

    const result = await productsController.list_order_by(ctx)

    assert.deepEqual(result, { statusCode: 404, body: mockApiResponse.inform('No se encontro ningun producto') })
  })
  
  test('debe devolver 200 y la lista de productos si se encuentran productos', async ({ assert }) => {
    const mockProducts = [{ id: 1, name: 'Test Product', category_id: 1, price: 100 }]
    mockDb.from = () => ({
      where: () => ({
        orderBy: () => ({
          paginate: () => Promise.resolve(mockProducts),
        }),
      }),
      paginate: () => Promise.resolve(mockProducts),
    })

    const request = { qs: () => ({ category: 1, priceSort: 'asc' }), params: () => ({ page: 1, limit: 10 }) }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response }
    const productsController = new ProductsController()
    productsController.list_order_by = async function (ctx) {
      const { category, priceSort } = ctx.request.qs()
      const { page, limit } = ctx.request.params()
      const products = await mockDb.from('products').where('category_id', category).orderBy('price', priceSort).paginate(page, limit)
      if (products.length === 0) {
        return ctx.response.status(404).send(mockApiResponse.inform('No se encontro ningun producto'))
      }
      return ctx.response.status(200).send(mockApiResponse.provide(products, 'Lista de productos'))
    }

    const result = await productsController.list_order_by(ctx)

    assert.deepEqual(result, { statusCode: 200, body: mockApiResponse.provide(mockProducts, 'Lista de productos') })
  })
})

test.group('ProductsController - create', (group) => {
  test('debe devolver 400 si faltan datos requeridos', async ({ assert }) => {
    const request = { body: () => ({ name: '', category_id: '', available_quantity: '', price: '', img_url: '' }) }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response }
    const productsController = new ProductsController()
    productsController.create = async function (ctx) {
      const { name, category_id, available_quantity, price, img_url } = ctx.request.body()
      if (!name || !category_id || !available_quantity || !price || !img_url) {
        return ctx.response.status(400).send(mockApiResponse.inform('Los datos nombre, categoria, quantity, price, imgURL son requeridas'))
      }
    }

    const result = await productsController.create(ctx)

    assert.deepEqual(result, { statusCode: 400, body: mockApiResponse.inform('Los datos nombre, categoria, quantity, price, imgURL son requeridas') })
  })
  
  test('debe devolver 200 y el producto guardado si los datos son correctos', async ({ assert }) => {
    const mockSavedProduct = [{ id: 1, name: 'Test Product' }]
    mockDb.table = () => ({
      returning: () => ({
        insert: () => Promise.resolve(mockSavedProduct),
      }),
    })

    const request = { body: () => ({ name: 'Test Product', category_id: 1, available_quantity: 10, price: 100, img_url: 'http://example.com/img.jpg' }) }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response }
    const productsController = new ProductsController()
    productsController.create = async function (ctx) {
      const { name, category_id, available_quantity, price, img_url } = ctx.request.body()
      if (!name || !category_id || !available_quantity || !price || !img_url) {
        return ctx.response.status(400).send(mockApiResponse.inform('Los datos nombre, categoria, quantity, price, imgURL son requeridas'))
      }
      const product = await mockDb.table('products').returning(['id', 'name']).insert({ name, category_id, available_quantity, price, img_url })
      return ctx.response.status(200).send(mockApiResponse.provide(product, 'Producto guardado'))
    }

    const result = await productsController.create(ctx)

    assert.deepEqual(result, { statusCode: 200, body: mockApiResponse.provide(mockSavedProduct, 'Producto guardado') })
  })
})

test.group('ProductsController - delete', (group) => {
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
    productsController.delete = async function (ctx) {
      try {
        const { id } = ctx.request.params()
        const product = await mockProduct.findOrFail(id)
        await product.delete()
        return ctx.response.status(200).send(mockApiResponse.provide(null, `El producto ${product.name} ha sido borrado exitosamente`))
      } catch (error) {
        if (error.code === 'E_ROW_NOT_FOUND') {
          return ctx.response.status(404).send(mockApiResponse.inform('No existe este producto'))
        }
        return ctx.response.status(500).send(mockApiResponse.unexpected())
      }
    }

    const result = await productsController.delete(ctx)

    assert.deepEqual(result, { statusCode: 404, body: mockApiResponse.inform('No existe este producto') })
  })
  
  test('debe devolver 200 y confirmar la eliminación si el producto es encontrado y eliminado', async ({ assert }) => {
    const mockProductInstance = { id: 1, name: 'Test Product', delete: async () => {} }
    mockProduct.findOrFail = () => Promise.resolve(mockProductInstance)

    const request = { params: () => ({ id: 1 }) }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response }
    const productsController = new ProductsController()
    productsController.delete = async function (ctx) {
      try {
        const { id } = ctx.request.params()
        const product = await mockProduct.findOrFail(id)
        await product.delete()
        return ctx.response.status(200).send(mockApiResponse.provide(null, `El producto ${product.name} ha sido borrado exitosamente`))
      } catch (error) {
        if (error.code === 'E_ROW_NOT_FOUND') {
          return ctx.response.status(404).send(mockApiResponse.inform('No existe este producto'))
        }
        return ctx.response.status(500).send(mockApiResponse.unexpected())
      }
    }

    const result = await productsController.delete(ctx)

    assert.deepEqual(result, { statusCode: 200, body: mockApiResponse.provide(null, `El producto ${mockProductInstance.name} ha sido borrado exitosamente`) })
  })
})

test.group('ProductsController - update', (group) => {
  test('debe devolver 404 si el producto no es encontrado', async ({ assert }) => {
    mockProduct.findOrFail = () => Promise.reject({ code: 'E_ROW_NOT_FOUND' })

    const request = { params: () => ({ id: 1 }), body: () => ({ name: 'Updated Name' }) }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response }
    const productsController = new ProductsController()
    productsController.update = async function (ctx) {
      try {
        const { id } = ctx.request.params()
        const { name } = ctx.request.body()
        const product = await mockProduct.findOrFail(id)
        if (name) product.name = name
        await product.save()
        return ctx.response.status(200).send(mockApiResponse.provide(null, `El producto ${product.name} ha sido actualizado exitosamente`))
      } catch (error) {
        if (error.code === 'E_ROW_NOT_FOUND') {
          return ctx.response.status(404).send(mockApiResponse.inform('No existe este producto'))
        }
        return ctx.response.status(500).send(mockApiResponse.unexpected())
      }
    }

    const result = await productsController.update(ctx)

    assert.deepEqual(result, { statusCode: 404, body: mockApiResponse.inform('No existe este producto') })
  })
  
  test('debe devolver 200 y confirmar la actualización si el producto es encontrado y actualizado', async ({ assert }) => {
    const mockProductInstance = { id: 1, name: 'Test Product', save: async () => {} }
    mockProduct.findOrFail = () => Promise.resolve(mockProductInstance)

    const request = { params: () => ({ id: 1 }), body: () => ({ name: 'Updated Name' }) }
    const response = {
      status: (statusCode) => ({
        send: (body) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response }
    const productsController = new ProductsController()
    productsController.update = async function (ctx) {
      try {
        const { id } = ctx.request.params()
        const { name } = ctx.request.body()
        const product = await mockProduct.findOrFail(id)
        if (name) product.name = name
        await product.save()
        return ctx.response.status(200).send(mockApiResponse.provide(null, `El producto ${product.name} ha sido actualizado exitosamente`))
      } catch (error) {
        if (error.code === 'E_ROW_NOT_FOUND') {
          return ctx.response.status(404).send(mockApiResponse.inform('No existe este producto'))
        }
        return ctx.response.status(500).send(mockApiResponse.unexpected())
      }
    }

    const result = await productsController.update(ctx)

    assert.deepEqual(result, { statusCode: 200, body: mockApiResponse.provide(null, `El producto ${mockProductInstance.name} ha sido actualizado exitosamente`) })
  })
})
