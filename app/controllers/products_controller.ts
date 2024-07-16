import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import Category from '#models/category'
import db from '@adonisjs/lucid/services/db'
import { ApiResponse } from '../utilities/responses.js'
const res = new ApiResponse()

export default class ProductsController {
    async list({ request, response } : HttpContext){
        try {
            const { page, limit } = request.params()     
            const {priceSort} = request.qs()   
            let products
            
            if (!page || !limit) return response.status(400).send(res.inform('Se necesita establecer el número de pagina y el rango de items')) 

            if (priceSort) {
                if (priceSort != 'asc' || priceSort != 'desc') {
                    return response.status(400).send(res.inform('Se necesita asc o desc para ordenar los productos'))    
                }
                products = await db.from('products').orderBy('price', priceSort).paginate(page, limit)

            } else {
                products = await db.from('products').paginate(page, limit)
            }
            
            if (products.length === 0) 
                return response.status(404).send(res.inform('No hay productos'))         

            return response.status(200).send(res.provide(products, 'Lista de productos'))    
        
        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }
    }

    async find_by_id({ request, response }: HttpContext){
        try {
            const {id} = request.params()
            const product = await Product.findOrFail(id)
    
            if (!product) return response.status(200).send(res.inform('No existe este producto')) 
                
            return response.status(200).send(res.provide(product, 'Producto encontrado'))
        } catch (error) {
            console.log(error);
            if (error.code == 'E_ROW_NOT_FOUND') return response.status(404).send(res.inform('No existe este producto'))
            return response.status(500).send(res.unexpected())
        }
    }

    async search_by_name({ request, response }: HttpContext){
        try {
            const {name} = request.params()
            const product = await db.from('products').whereILike('name', `%${name}%`).limit(20)
    
            if (product.length == 0) return response.status(404).send(res.inform('No se encontro ningun producto')) 
            
            return response.status(200).send(res.provide(product, 'Productos encontrado'))
        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }

    }

    async list_order_by({ request, response }: HttpContext){
        try {
            const { category, priceSort } = request.qs();
            const {page, limit} = request.params()
            var products

            if (category && priceSort){
                products = await db.from('products').where('category_id', category).orderBy('price', priceSort).paginate(page, limit)
            } else {
                if (category){
                    products = await db.from('products').where('category_id', category).paginate(page, limit)
                }
                if (priceSort){
                    products = await db.from('products').orderBy('price', priceSort).paginate(page, limit)
                }
            }
            
            if (!category && !priceSort){
                products = await db.from('products').paginate(page, limit)
            }
            
            if (!products) return response.status(404).send(res.inform('No se encontro ningun producto'))

            return response.status(200).send(res.provide(products, 'Lista de productos'))    
        
        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }

    }


    async create({ request, response }: HttpContext){
        try {
            const {
                name,
                description,
                category_id,
                available_quantity,
                price,
                img_url
            } = request.body()
            
            if (!name ||
                !category_id ||
                !available_quantity ||
                !price ||
                !img_url) {
                return response.status(400).send(res.inform('Los datos nombre, categoria, quantity, price, imgURL son requeridas')) 
            }
            
            const category = await Category.find(category_id)
            if (!category) {
                return response.status(400).send(res.inform(`La categoria de id:${category_id} no fue encontrada`))
            }

            const saved = await db
            .table('products')
            .returning(['id', 'name'])
            .insert({
                name: name,
                description: description,
                category_id: category.id,
                available_quantity: available_quantity,
                total_quantity: available_quantity,
                price: price,
                img_url
            })
            
            return response.status(200).send(res.provide(saved, `El producto ${saved[0].name} fue guardado correctamente bajo el id ${saved[0].id}`))    
            
        } catch (error) {
            response.status(500).send(res.unexpected())
            console.log(error);
        }
    }

    async delete({ request, response }: HttpContext){
        try {
            const { id } = request.params()        
            if (!id) return response.status(500).send(res.inform('El id es necesario')) 
            
            const product = await Product.findOrFail(id)
            await product.delete()

            return response.status(200).send(res.provide(null, `El producto ${product.name} ha sido borrado exitosamente`))    
        
        } catch (error) {
            console.log(error);
            if (error.code == 'E_ROW_NOT_FOUND') return response.status(404).send(res.inform('No existe este producto'))
            return response.status(500).send(res.unexpected())
        }

    }

    async update({ request, response }: HttpContext){
        try {
            const { id } = request.params()
            const { name, category_id, price, imgURL, description, available_quantity} = request.body()               
            
            if (!name && !category_id && !price && !imgURL && !description && !available_quantity) return response.status(400).send(res.inform('No hay informacion para actualizar')) 
            
            const product = await Product.findOrFail(id)
            if (name) product.name = name
            if (price) product.price = price 
            if (category_id) {
                const category = await Category.find(category_id)
                if (!category) return response.status(404).send(res.inform('No existe dicha categoria')) 
                product.category_id = category.id
            }
            if (description) product.description = description 
            if (available_quantity) product.available_quantity = available_quantity 
            if (imgURL) product.img_url = imgURL
            await product.save()

            return response.status(200).send(res.provide(null, `El producto ${product.name} ha sido actualizado exitosamente`))    

        } catch (error) {
            console.log(error);
            if (error.code == 'E_ROW_NOT_FOUND') return response.status(404).send(res.inform('No existe este producto'))
            return response.status(500).send(res.unexpected())
        }
    }
}