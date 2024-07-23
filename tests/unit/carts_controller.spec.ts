import { test } from '@japa/runner'
import Cart from '#models/cart'
import Product from '#models/product'
import { ApiResponse } from '../../app/utilities/responses.js' 
import CartsController from '../../app/controllers/carts_controller.js' // Ajusta la ruta si es necesario
import { HttpContext } from '@adonisjs/core/http'

// Mock de las dependencias
const res = new ApiResponse()
const cartsController = new CartsController()

// Reemplazar los métodos de Cart y Product manualmente
const originalFindBy = Cart.findBy
const originalFind = Product.find
const originalCreate = Cart.create
const originalSave = Cart.prototype.save

test.group('CartsController - handle_cart', (group) => {
  group.each.setup(() => {
    // Restaurar los métodos originales antes de cada prueba
    Cart.findBy = originalFindBy
    Product.find = originalFind
    Cart.create = originalCreate
    Cart.prototype.save = originalSave
  })

  test('debe devolver 500 si falta el id del carrito', async ({ assert }) => {
    const request = { body: () => ({ products: [], user_id: 1 }) }
    const response = {
      status: (code: number) => ({ send: (body: any) => ({ statusCode: code, body }) }),
    }

    const ctx = { request, response } as unknown as HttpContext

    const result = await cartsController.handle_cart(ctx)

    assert.deepEqual(result, { statusCode: 500, body: res.inform('Es necesario el id del carrito') })
  })

  test('debe devolver 500 si no hay productos', async ({ assert }) => {
    const request = { body: () => ({ id: 1, products: [], user_id: 1 }) }
    const response = {
      status: (code: number) => ({ send: (body: any) => ({ statusCode: code, body }) }),
    }

    const ctx = { request, response } as unknown as HttpContext

    const result = await cartsController.handle_cart(ctx)

    assert.deepEqual(result, { statusCode: 500, body: res.inform('Es necesario al menos un producto') })
  })

  test('debe devolver 500 si el producto no existe', async ({ assert }) => {
    const request = { body: () => ({ id: 1, products: [{ id: 1, quantity: 1 }], user_id: 1 }) }
    const response = {
      status: (code: number) => ({ send: (body: any) => ({ statusCode: code, body }) }),
    }

    Cart.findBy = async () => null // Simular que no se encontró el carrito
    Product.find = async () => null // Simular que el producto no existe

    const ctx = { request, response } as unknown as HttpContext

    const result = await cartsController.handle_cart(ctx)

    assert.deepEqual(result, { statusCode: 500, body: res.inform('Este producto 1 no existe') })
  })

  test('debe devolver 500 si la cantidad de producto excede la disponible', async ({ assert }) => {
    const request = { body: () => ({ id: 1, products: [{ id: 1, quantity: 10 }], user_id: 1 }) }
    const response = {
      status: (code: number) => ({ send: (body: any) => ({ statusCode: code, body }) }),
    }

    Cart.findBy = async () => null // Simular que no se encontró el carrito
    Product.find = async () => ({ available_quantity: 5 }) // Simular cantidad disponible menor a la pedida

    const ctx = { request, response } as unknown as HttpContext

    const result = await cartsController.handle_cart(ctx)

    assert.deepEqual(result, { statusCode: 500, body: res.inform('La cantidad pedida del producto 1 excede los productos disponibles') })
  })

  test('debe devolver 200 y el carrito si el carrito existe y se actualiza correctamente', async ({ assert }) => {
    const request = { body: () => ({ id: 1, products: [{ id: 1, quantity: 1 }], user_id: 1 }) }
    const response = {
      status: (code: number) => ({ send: (body: any) => ({ statusCode: code, body }) }),
    }

    // Simular que el carrito existe y que save devuelve un objeto con el carrito actualizado
    Cart.findBy = async () => ({ id: 1, products: [], save: async () => ({ id: 1, products: [{ id: 1, quantity: 1 }] }) })
    Product.find = async () => ({ available_quantity: 10 }) // Simular producto disponible

    const ctx = { request, response } as unknown as HttpContext

    const result = await cartsController.handle_cart(ctx)

    assert.deepEqual(result, { statusCode: 200, body: res.provide({ id: 1, products: [{ id: 1, quantity: 1 }] }, 'El carrito fue operado correctamente') })
  })

  test('debe devolver 200 y el carrito si el carrito no existe y se crea correctamente', async ({ assert }) => {
    const request = { body: () => ({ id: 1, products: [{ id: 1, quantity: 1 }], user_id: 1 }) }
    const response = {
      status: (code: number) => ({ send: (body: any) => ({ statusCode: code, body }) }),
    }

    // Simular carrito no encontrado y que create devuelve el nuevo carrito
    Cart.findBy = async () => null // Simular carrito no encontrado
    Product.find = async () => ({ available_quantity: 10 }) // Simular producto disponible
    Cart.create = async () => ({ id: 1, products: [{ id: 1, quantity: 1 }], user_id: 1 }) // Simular creación de carrito

    const ctx = { request, response } as unknown as HttpContext

    const result = await cartsController.handle_cart(ctx)

    assert.deepEqual(result, { statusCode: 200, body: res.provide({ id: 1, products: [{ id: 1, quantity: 1 }], user_id: 1 }, 'El carrito fue operado correctamente') })
  })
})
