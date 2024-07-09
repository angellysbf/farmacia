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


  router.post('/create', [ProductsController, 'create']).use([middleware.token(), middleware.admin()])

  router.delete('/delete/:id', [ProductsController, 'delete']).use([middleware.token(), middleware.admin()])

  router.put('/update/:id', [ProductsController, 'update']).use([middleware.token(), middleware.admin()])
  })
.prefix('/products')


router.group(() => {
  const CategoriesController = () => import('#controllers/categories_controller')
  router.get('/', [CategoriesController, 'list'])
  router.get('/:category', [CategoriesController, 'search'])

  router.post('/', [CategoriesController, 'add']).use([middleware.token(), middleware.admin()])

  router.delete('/', [CategoriesController, 'delete']).use([middleware.token(), middleware.admin()])
})
.prefix('/categories')


router.group(() => {
  const PaymentsController = () => import('#controllers/payments_controller')
  router.get('/', [PaymentsController, 'see_payments']).use([middleware.token(), middleware.vendor()])
  router.get('/see-payment-platforms', [PaymentsController, 'see_payment_platforms']).use([middleware.token(), middleware.vendor()])
  router.get('/:search', [PaymentsController, 'search_payments']).use([middleware.token(), middleware.vendor()])

  router.post('/make-payment', [PaymentsController, 'make_payment'])
  router.post('/make-payment-platform', [PaymentsController, 'create_payment_platform']).use([middleware.token(), middleware.vendor()])

  router.put('/payment-paid/:id', [PaymentsController, 'payment_is_paid']).use([middleware.token(), middleware.vendor()])
  router.put('/payment-closed/:id', [PaymentsController, 'payment_is_closed']).use([middleware.token(), middleware.vendor()])

  router.delete('/delete-payment/:id', [PaymentsController, 'delete_payment']).use([middleware.token(), middleware.vendor()])
  router.delete('/delete-payment-platform/:id', [PaymentsController, 'delete_payment_platform']).use([middleware.token(), middleware.vendor()])
})
.prefix('/payments')

router.group(() => {
  const CartsController = () => import('#controllers/carts_controller')
  router.post('/handle-cart', [CartsController, 'handle_cart'])

  router.put('/add-product', [CartsController, 'add_product'])
  router.put('/delete-product', [CartsController, 'delete_product'])
  router.put('/update-product', [CartsController, 'update_product'])

})
.prefix('/cart')

router.group(() => {
  const AuthController = () => import('#controllers/auth_controller')
  router.post('/sign-up', [AuthController, 'signup'])
  router.post('/log-in', [AuthController, 'login'])
  router.post('/password-recover', [AuthController, 'send_password_recover'])
  router.put('/change-password', [AuthController, 'change_password'])

})
.prefix('/auth')

router.group(() => {
  const UserController = () => import('#controllers/users_controller')
  router.get('/', [UserController, 'find_by_token'])
  router.get('/payments', [UserController, 'payments'])
  router.get('/payments/:search', [UserController, 'search_payments'])
  router.put('/', [UserController, 'update'])
  router.get('/is-admin', [UserController, 'is_admin'])
})
.prefix('/user').use(middleware.token())

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
