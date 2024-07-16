import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('payment_platform_id').unsigned().references('id').inTable('payment_platforms')
      table.specificType('products', 'json[]').notNullable
      table.integer('user_id')
      table.string('transference_id').unique()
      table.float('total').notNullable
      table.string('status').defaultTo('unpaid')
      table.string('address').notNullable
      table.string('phone').notNullable

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}