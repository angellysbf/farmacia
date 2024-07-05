import type { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'
import db from '@adonisjs/lucid/services/db'
import { ApiResponse } from '../utilities/responses.js'
const res = new ApiResponse()

export default class CategoriesController {
    async list({response}: HttpContext){
        try {
            const categories = await Category.all()

            if (categories.length === 0) return response.status(200).send(res.inform('No hay categorias disponibles'))         

            return response.status(200).send(res.provide(categories, 'Lista de categorias disponibles'))    
        
        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }
    }

    async search({request, response}: HttpContext){
        try {
            const {category} = request.params()

            const categories = await db.from('categories').whereILike('name', `%${category}%`).limit(20)

            return response.status(200).send(res.provide(categories, 'Lista de categorias disponibles'))
        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }
    }

    async add({ request, response }: HttpContext){
        try {
            const {name} = request.body()
            console.log('hola');
            
            const exist_category = await Category.findBy('name', name)
            
            if (exist_category) 
                return response.status(400).send(res.inform(`La categoria ${name} ya existe`))    
            
            const category = await Category.create({
                name: name
            })

            if (!category.$isPersisted) 
                return response.status(500).send(res.inform(`Hubo un error, no se ha podido guardar la categoria ${name}`))
    
            return response.status(201).send(res.provide(category, `Categoria ${category.name} agregada satisfactoriamente`))
       
        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }
    }

    async delete({ request, response }: HttpContext){
        try {
            const {id} = request.body()
            const category = await Category.find(id)
            
            if (!category)
                return response.status(404).send(res.inform(`La categoria ${id} no existe`))    
            
            await category.delete()
            console.log(category);
            if (!category.$isDeleted) 
                return response.status(500).send(res.inform(`Hubo un error, no se ha podido borrar la categoria ${category.name}`))

            return response.status(200).send(res.provide(category, `Categoria ${category.name} borrada satisfactoriamente`)) 
        
        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }
    }

}