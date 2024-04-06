/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

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

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
