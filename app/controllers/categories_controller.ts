import type { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'
import { ApiResponse } from '../utilities/responses.js'
const res = new ApiResponse()

export default class CategoriesController {
    async list({response}: HttpContext){
        try {
            const categories = await Category.all()
            if (categories.length === 0) 
                return response.status(200).send(res.inform('No hay categorias disponibles'))         

            return response.status(200).send(res.provide(categories, 'Lista de categorias disponibles'))    
        
        } catch (error) {
            response.status(500).send(res.unexpected())
            console.log(error);
        }
    }

    async add({ request, response }: HttpContext){
        try {
            const body = request.body()
            const exist_category = await Category.findBy('name', body.name)
            
            if (exist_category) 
                return response.status(400).send(res.inform(`La categoria ${body.name} ya existe`))    
            
            const category = await Category.create({
                name: body.name
            })

            if (!category.$isPersisted) 
                return response.status(500).send(res.inform(`Hubo un error, no se ha podido guardar la categoria ${body.name}`))
    
            return response.status(201).send(res.provide(category, `Categoria ${category.name} agregada satisfactoriamente`))
       
        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }
    }

    async delete({ request, response }: HttpContext){
        try {
            const body = request.body()
            const category = await Category.find(body.id)
            
            if (!category)
                return response.status(404).send(res.inform(`La categoria ${body.id} no existe`))    
            
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