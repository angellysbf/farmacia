/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.group(() => {
  const ProductsController = () => import('#controllers/products_controller')
  router.get('find-product-by-id/:id', [ProductsController, 'find_by_id'])
  router.get('find-product-by-name/:name', [ProductsController, 'search_by_name'])
  router.get('order-products/:page/:limit', [ProductsController, 'list_order_by'])
  router.get('list-produtcs/:page/:limit', [ProductsController, 'list'])


  router.post('/create', [ProductsController, 'create'])

  router.delete('/delete/:id', [ProductsController, 'delete'])

  router.put('/update/:id', [ProductsController, 'update'])
  })
.prefix('/products')


router.group(() => {
  const CategoriesController = () => import('#controllers/categories_controller')
  router.get('/', [CategoriesController, 'list'])

  router.post('', [CategoriesController, 'add'])

  router.delete('', [CategoriesController, 'delete'])
})
.prefix('/categories')


router.group(() => {
  const PaymentsController = () => import('#controllers/payments_controller')
  router.get('', [PaymentsController, 'see_payments'])

  router.post('/make-payment', [PaymentsController, 'make_payment'])

  router.put('/paid', [PaymentsController, 'payment_is_paid'])

  router.delete('/delete-payment/:id', [PaymentsController, 'delete_payment'])


  router.get('/see-payment-platforms', [PaymentsController, 'see_payment_platforms'])

  router.post('/make-payment-platform', [PaymentsController, 'create_payment_platform'])
  
  router.delete('/delete-payment-platform/:id', [PaymentsController, 'delete_payment_platform'])

})
.prefix('/payments')

router.group(() => {
  const CartsController = () => import('#controllers/carts_controller')
  router.post('/create-cart', [CartsController, 'create_cart'])

  router.put('/add-product', [CartsController, 'add_product'])
  router.put('/delete-product', [CartsController, 'delete_product'])
  router.put('/update-product', [CartsController, 'update_product'])

})
.prefix('/cart')

router.group(() => {
  const AuthController = () => import('#controllers/auth_controller')
  router.post('/sign-up', [AuthController, 'signup'])
  router.post('/log-in', [AuthController, 'login']).use(middleware.admin())
})
.prefix('/auth')

// router.group(() => {
//   const PaymentsController = () => import('#controllers/bill_controller')
//   router.get('/bills', [PaymentsController, 'see_payments'])

//   router.post('/make-payment', [PaymentsController, 'make_payment'])

//   // router.delete('', [PaymentsController, 'delete'])

//   router.put('/paid', [PaymentsController, 'payment_is_paid'])
// })
// .prefix('/bills')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
