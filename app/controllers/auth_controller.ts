// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from "@adonisjs/core/build/modules/http/main";

export default class AuthController {
    async login(ctx: HttpContext) {
        return 0
    }

    async signin(ctx: HttpContext) {
        return 0
    }

    async google_login(ctx: HttpContext) {
        return 0
    }
}