import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PaymentPlatform from '#models/payment_platform'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await PaymentPlatform.createMany([
      {
        name: 'Banco Transferencia',
        account: '54654654651515152 Angie 24555462',
      },
      {
        name: 'Pago Movil',
        account: '04555214552 Angie',
      },
    ])
  }
}