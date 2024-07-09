import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { Exception } from '@adonisjs/core/exceptions'
import jwt from 'jsonwebtoken'
import { ApiResponse } from '../utilities/responses.js'
const res = new ApiResponse()

export default class TokenMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    try {
      const {authorization} = ctx.request.headers()

      const token = authorization?.substring(7)

      if (!token) throw new Exception('Falta el token de verificacion')
  
      jwt.verify(token, process.env.JWT_SECRET);
      
      const output = await next()
      return output
  
    } catch (error) {
      if (error.message == 'jwt expired') {
        return ctx.response.status(401).send(res.inform('token expired'))
      }
      if (error.message == 'invalid token') {
        return ctx.response.status(401).send(res.inform('Este token fue danhado'))
      }
      console.log(error);
      
      throw new Exception('Aborting Request token')
     
    }
  }
}