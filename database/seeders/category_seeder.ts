import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Category from '#models/category'

export default class extends BaseSeeder {
  async run() {
    await Category.createMany([
      {
        name: 'Medicinas',
      },
      {
        name: 'Material quirúrgico',
      },
      {
        name: 'Belleza',
      },
      {
        name: 'Cuidado personal',
      },
    ])
  }
}