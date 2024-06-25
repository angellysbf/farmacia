import Category from './category.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @hasOne(() => Category)
  declare category_id: HasOne<typeof Category>

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare imgURL: string 

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