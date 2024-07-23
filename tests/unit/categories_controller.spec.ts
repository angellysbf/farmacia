import { test } from '@japa/runner'
import Category from '#models/category'
import { ApiResponse } from '../../app/utilities/responses.js' 
import CategoriesController from '../../app/controllers/categories_controller.js' 
import { HttpContext } from '@adonisjs/core/http'

// Mock de las dependencias
const res = new ApiResponse()
const categoriesController = new CategoriesController()

// Reemplazar los métodos de Category manualmente
const originalAll = Category.all

test.group('CategoriesController - list', (group) => {
  group.each.setup(() => {
    // Restaurar los métodos originales antes de cada prueba
    Category.all = originalAll
  })

  test('debe devolver 200 y una lista de categorías disponibles', async ({ assert }) => {
    // Mock para devolver una lista de categorías
    Category.all = async () => [{ id: 1, name: 'Electronics' }, { id: 2, name: 'Books' }]

    const response = {
      status: (code: number) => ({ send: (body: any) => ({ statusCode: code, body }) }),
    }

    const ctx = { response } as unknown as HttpContext

    const result = await categoriesController.list(ctx)

    assert.deepEqual(result, {
      statusCode: 200,
      body: res.provide([{ id: 1, name: 'Electronics' }, { id: 2, name: 'Books' }], 'Lista de categorias disponibles'),
    })
  })

  test('debe devolver 200 y un mensaje si no hay categorías disponibles', async ({ assert }) => {
    // Mock para devolver una lista vacía
    Category.all = async () => []

    const response = {
      status: (code: number) => ({ send: (body: any) => ({ statusCode: code, body }) }),
    }

    const ctx = { response } as unknown as HttpContext

    const result = await categoriesController.list(ctx)

    assert.deepEqual(result, {
      statusCode: 200,
      body: res.inform('No hay categorias disponibles'),
    })
  })

})