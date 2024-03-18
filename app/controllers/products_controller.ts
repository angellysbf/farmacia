import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import Category from '#models/category'
import db from '@adonisjs/lucid/services/db'
import { ApiResponse } from '../utilities/responses.js'
const res = new ApiResponse()

export default class ProductsController {
    async list({ response } : HttpContext){
        try {
            const product = await Product.all()
            if (product.length === 0) 
                return response.status(200).send(res.inform('No hay productos'))         

            return response.status(200).send(res.provide(product, 'Lista de productos'))    
        
        } catch (error) {
            response.status(500).send(res.unexpected())
            console.log(error);
        }
    }

    async find_by_id({ request, response }: HttpContext){

    }

    async search_by_name({ request, response }: HttpContext){

    }


    async add({ request, response }: HttpContext){
        try {
            const to_add = request.body()
            console.log(to_add);
            
            const category = await Category.find(to_add.category_id)
            if (!category) {
                return response.status(400).send(res.inform(`La categoria ${to_add.category_id} no fue encontrada`))
            }

            const saved = await db
            .table('products')
            .returning(['id', 'name'])
            .insert({
                name: to_add.name,
                category_id: category.id,
                available_quantity: to_add.available_quantity,
                total_quantity: to_add.available_quantity,
                price: to_add.price
            })
            
            return response.status(200).send(res.provide(saved, `El producto ${saved.name} fue guardado correctamente bajo el id ${saved.id}`))    
            
        } catch (error) {
            response.status(500).send(res.unexpected())
            console.log(error);
        }
    }

    async delete(ctx: HttpContext){

    }

    async update(ctx: HttpContext){

    }
}