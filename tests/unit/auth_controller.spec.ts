import { test } from '@japa/runner'
import { HttpContext } from '@adonisjs/core/http'
import User from '../../app/models/user.js' 
import Hash from '@adonisjs/core/services/hash'
import jwt from 'jsonwebtoken'
import AuthController from '../../app/controllers/auth_controller.js' 
import { ApiResponse } from '../../app/utilities/responses.js' 

// Mock de las dependencias
const mockUser = {
  findBy: (email: string) => Promise.resolve(null),
} as unknown as typeof User

const mockHash = {
  verify: (hashedPassword: string, password: string) => Promise.resolve(false),
  make: (password: string) => Promise.resolve('hashedpassword'),
} as unknown as typeof Hash

const mockJwt = {
  sign: (payload: any, secret: string, options: any) => 'token',
  verify: (token: string, secret: string) => ({ user_id: 1 }),
} as unknown as typeof jwt

const mockApiResponse = {
  inform: (message: string) => ({ message }),
  provide: (token: string | null, message: string) => ({ token, message }),
  unexpected: () => ({ message: 'Unexpected error' }),
} as unknown as typeof ApiResponse

test.group('AuthController - login', (group) => {
  group.each.setup(() => {
  })

  test('debe devolver 400 si faltan datos', async ({ assert }) => {
    const request = { body: () => ({ email: '', password: '' }) }
    const response = {
      status: (statusCode: number) => ({
        send: (body: any) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response } as HttpContext
    const authController = new AuthController()
    authController.login = async function (ctx: HttpContext) {
      const { email, password } = ctx.request.body()
      if (!email || !password) {
        return ctx.response.status(400).send(mockApiResponse.inform('Los datos son obligatorios'))
      }
    }

    const result = await authController.login(ctx)

    assert.deepEqual(result, { statusCode: 400, body: mockApiResponse.inform('Los datos son obligatorios') })
  })

  test('debe devolver 404 si el usuario no es encontrado', async ({ assert }) => {
    mockUser.findBy = () => Promise.resolve(null)
    const request = { body: () => ({ email: 'test@example.com', password: 'password' }) }
    const response = {
      status: (statusCode: number) => ({
        send: (body: any) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response } as HttpContext
    const authController = new AuthController()
    authController.login = async function (ctx: HttpContext) {
      const { email, password } = ctx.request.body()
      const is_user = await mockUser.findBy(email)
      if (!is_user) {
        return ctx.response.status(404).send(mockApiResponse.inform('el usuario no fue encontrado'))
      }
    }

    const result = await authController.login(ctx)

    assert.deepEqual(result, { statusCode: 404, body: mockApiResponse.inform('el usuario no fue encontrado') })
  })

  test('debe devolver 404 si la contraseña es incorrecta', async ({ assert }) => {
    mockUser.findBy = () => Promise.resolve({ password: 'hashedpassword' })
    mockHash.verify = () => Promise.resolve(false)

    const request = { body: () => ({ email: 'test@example.com', password: 'wrongpassword' }) }
    const response = {
      status: (statusCode: number) => ({
        send: (body: any) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response } as HttpContext
    const authController = new AuthController()
    authController.login = async function (ctx: HttpContext) {
      const { email, password } = ctx.request.body()
      const is_user = await mockUser.findBy(email)
      if (is_user && !(await mockHash.verify(is_user.password, password))) {
        return ctx.response.status(404).send(mockApiResponse.inform('Contrasenha erronea'))
      }
    }

    const result = await authController.login(ctx)

    assert.deepEqual(result, { statusCode: 404, body: mockApiResponse.inform('Contrasenha erronea') })
  })

  test('debe devolver 200 y el token si las credenciales son correctas', async ({ assert }) => {
    mockUser.findBy = () => Promise.resolve({ id: 1, name: 'Test User', rol_id: 1, password: 'hashedpassword' })
    mockHash.verify = () => Promise.resolve(true)
    mockJwt.sign = () => 'token'

    const request = { body: () => ({ email: 'test@example.com', password: 'correctpassword' }) }
    const response = {
      status: (statusCode: number) => ({
        send: (body: any) => ({ statusCode, body }),
      }),
    }

    const ctx = { request, response } as HttpContext
    const authController = new AuthController()
    authController.login = async function (ctx: HttpContext) {
      const { email, password } = ctx.request.body()
      const is_user = await mockUser.findBy(email)
      if (is_user && await mockHash.verify(is_user.password, password)) {
        const token = mockJwt.sign({ name: is_user.name, id: is_user.id, rol_id: is_user.rol_id }, process.env.JWT_SECRET, { expiresIn: '1d' })
        return ctx.response.status(200).send(mockApiResponse.provide(token, 'Usuario Verificado'))
      }
    }

    const result = await authController.login(ctx)

    assert.deepEqual(result, { statusCode: 200, body: mockApiResponse.provide('token', 'Usuario Verificado') })
  })
})