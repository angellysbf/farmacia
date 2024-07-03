import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Rol from '#models/rol'

export default class extends BaseSeeder {
  async run() {
    await Rol.createMany([
      {
        name: 'admin',
      },
      {
        name: 'vendor',
      },
      {
        name: 'user',
      },
    ])
  }
}