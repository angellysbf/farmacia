import type { HttpContext } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const {token} = ctx.request.body()
    
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.rol_id != 2 && decoded.rol_id != 1) throw new Exception('Aborting request')
    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}