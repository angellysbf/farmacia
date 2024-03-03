import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare category_id: number

  @column()
  declare name: string

  @column()
  declare available_quantity: number

  @column()
  declare reserved_quantity: number

  @column()
  declare total_quantity: number

  @column()
  declare price: number
  
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}