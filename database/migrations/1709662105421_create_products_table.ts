import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('category_id').unsigned().references('id').inTable('categories')
      table.string('name').notNullable
      table.text('description').notNullable
      table.string('img_url').notNullable
      table.integer('available_quantity').notNullable
      table.integer('reserved_quantity').defaultTo(0)
      table.integer('total_quantity').notNullable
      table.float('price').notNullable

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}