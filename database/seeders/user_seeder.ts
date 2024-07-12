import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class extends BaseSeeder {
  async run() {
    const hashAdmin = await hash.make('Admin1234$');
    const hashVendor = await hash.make('Vendor1234$');
    const hashUser = await hash.make('User1234$');

    await User.createMany([
      {
        name: 'admin',
        email: 'admin@barreto.com',
        password: hashAdmin,
        phone: '04222153251',
        rol_id: 1
      },
      {
        name: 'vendor',
        email: 'vendor@barreto.com',
        password: hashVendor,
        phone: '04222153251',
        rol_id: 2
      },
      {
        name: 'user',
        email: 'user@barreto.com',
        password: hashUser,
        phone: '04222153251',
        rol_id: 3
      },
    ])
  }
}