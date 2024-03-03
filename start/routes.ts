/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AdminPaymentsController from '#controllers/admin_payments_controller'

router.get('payment', '')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
