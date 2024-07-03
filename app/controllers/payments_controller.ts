// import type { HttpContext } from '@adonisjs/core/http'

import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '../utilities/responses.js'
import Product from '#models/product'
import User from '#models/user'
import PaymentPlatform from '#models/payment_platform'
import Payment from '#models/payment'
import db from '@adonisjs/lucid/services/db'

const res = new ApiResponse()

export default class PaymentsController {
    async make_payment({ request, response }: HttpContext){
        try {
            const {
                payment_platform_id, 
                products, 
                user_id, 
                transference_id,
                total,
                address
            } = request.body()
            
            if (!payment_platform_id || 
                !products || 
                !transference_id ||
                !total
            ) return response.status(400).send(res.inform('Falta algun dato importante para realizar el pago')) 
            
            const is_payment_platform = await PaymentPlatform.find(payment_platform_id)
            if (!is_payment_platform) {
                return response.status(404).send(res.inform(`La plataforma de id: ${payment_platform_id} no fue encontrada`))
            }

            var err
            for (const product of products) {
                console.log(product);
                
                const product_id = product.id
                const quantity = product.quantity

                const is_product = await Product.find(product_id)
                console.log(is_product);
                
                if (!is_product) {
                    err = `Este producto ${product_id} no existe`   
                    break                 
                }

                if (is_product.available_quantity < quantity) {
                    err =`La cantidad pedida del producto ${product_id} excede los productos disponibles`
                    break
                }

                is_product.available_quantity = is_product.available_quantity - quantity
                is_product.reserved_quantity = is_product.reserved_quantity + quantity
                is_product.save()
            };       
            if (err) return response.status(500).send(res.inform(err)) 
            
            var is_user
            if (user_id) {
                is_user = await User.find(user_id)
            }
            var send_address;

            if (address) {
                send_address = address
            } else {
                if (is_user) {
                    send_address = is_user.address
                } 
            } 

            if (typeof transference_id != 'string') return response.status(400).send(res.typeError('transference_id', 'string'))
            if (typeof total != 'number') return response.status(400).send(res.typeError('total', 'number'))
            if (address) {
                if (typeof address != 'string') return response.status(400).send(res.typeError('address', 'string'))
            }
            
            const saved = await db
            .table('payments')
            .returning(['id'])
            .insert({
                payment_platform_id: payment_platform_id,
                products: products,
                user_id: is_user ? user_id : null,
                transference_id: transference_id,
                total: total,
                status: 'reported',
                address: send_address ? send_address : 'store'
            })
            
            return response.status(200).send(res.provide(saved, `El pago fue enviado correctamente bajo el id ${saved[0].id}`))    

        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }
    }

    async see_payments({ request, response }: HttpContext){
        try {
            const {status} = request.qs()
            var payments

            if (status) {
                payments = await db.from('payments').where('status', status).orderBy('updated_at')
            } else {
                payments = await db.from('payments').orderBy('updated_at')
            }

            return response.status(200).send(res.provide(payments, `Lista de pagos`))    

        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }

    }

    async search_payments({ request, response }: HttpContext){
        try {
            const {search} = request.params()
                        
            const payments = await db.from('payments').orderBy('updated_at')
            .where('status', 'like', `%${search}%`)
            .orWhere('transference_id', 'like', `%${search}%`)
            .limit(20)
            
            return response.status(200).send(res.provide(payments, 'Lista de pagos'))
        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }
    }

    async payment_is_paid({ request, response }: HttpContext){
        try {
            const { id } = request.params()        
            if (!id) return response.status(500).send(res.inform('El id es necesario')) 
            
            const payment_platform = await PaymentPlatform.findOrFail(id)
            await payment_platform.delete()

            return response.status(200).send(res.provide(null, `La cuenta de pago ${payment_platform.name} ha sido borrada exitosamente`))    
        
        } catch (error) {
            console.log(error);
            if (error.code == 'E_ROW_NOT_FOUND') return response.status(404).send(res.inform('No existe esta cuenta de pago'))
            return response.status(500).send(res.unexpected())
        }
    }

    async delete_payment({ request, response }: HttpContext){
        try {
            const { id } = request.params()        
            if (!id) return response.status(500).send(res.inform('El id es necesario')) 
            
            const payment = await Payment.findOrFail(id)
            await payment.delete()

            return response.status(200).send(res.provide(null, `El pago ${payment.id} ha sido borrado exitosamente`))    
        
        } catch (error) {
            console.log(error);
            if (error.code == 'E_ROW_NOT_FOUND') return response.status(404).send(res.inform('No existe este pago'))
            return response.status(500).send(res.unexpected())
        }

    }

    async pause_payment({ request, response }: HttpContext){
        try {
            const { id } = request.params()        
            if (!id) return response.status(500).send(res.inform('El id es necesario')) 
            
            const payment_platform = await PaymentPlatform.findOrFail(id)
            await payment_platform.delete()

            return response.status(200).send(res.provide(null, `La cuenta de pago ${payment_platform.name} ha sido borrada exitosamente`))    
        
        } catch (error) {
            console.log(error);
            if (error.code == 'E_ROW_NOT_FOUND') return response.status(404).send(res.inform('No existe esta cuenta de pago'))
            return response.status(500).send(res.unexpected())
        }
    }

    async create_payment_platform({ request, response }: HttpContext){
        try {
            const {
                name, 
                account, 
                extra_data
            } = request.body()            
            
            if (!name || !account) return response.status(400).send(res.inform('Falta algun dato importante para crear la opcion de pago')) 
            
            if (typeof name != 'string') return response.status(400).send(res.typeError('name', 'string'))
            
            if (typeof account != 'string') return response.status(400).send(res.typeError('account', 'string'))
            
            if (typeof extra_data != 'string' && typeof extra_data != 'object') return response.status(400).send(res.typeError('extra_data', 'string'))

            const saved = await db
            .table('payment_platforms')
            .returning(['id'])
            .insert({
                name: name,
                account: account,
                extra_data: extra_data
            })

            return response.status(200).send(res.provide(saved, `La plataforma de pago fue creada correctamente bajo el id ${saved[0].id}`))    

        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }

    }
    
    async see_payment_platforms({ response }: HttpContext){
        try {

            const payment_platforms = await PaymentPlatform.all()

            return response.status(200).send(res.provide(payment_platforms, `Lista de plataformas de pago`))    

        } catch (error) {
            console.log(error);
            return response.status(500).send(res.unexpected())
        }

    }

    async delete_payment_platform({ request, response }: HttpContext){
        try {
            const { id } = request.params()        
            if (!id) return response.status(500).send(res.inform('El id es necesario')) 
            
            const payment_platform = await PaymentPlatform.findOrFail(id)
            await payment_platform.delete()

            return response.status(200).send(res.provide(null, `La cuenta de pago ${payment_platform.name} ha sido borrada exitosamente`))    
        
        } catch (error) {
            console.log(error);
            if (error.code == 'E_ROW_NOT_FOUND') return response.status(404).send(res.inform('No existe esta cuenta de pago'))
            return response.status(500).send(res.unexpected())
        }
    }
}