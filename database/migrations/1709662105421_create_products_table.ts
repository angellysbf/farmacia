import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('category_id').unsigned().references('categories.id')
      table.string('name')
      table.integer('available_quantity')
      table.integer('reserved_quantity')
      table.integer('total_quantity')
      table.float('price')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}