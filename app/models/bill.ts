import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Bill extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare products: JSON

  @column()
  declare user_id: number

  @column()
  declare transference_id: string

  @column()
  declare total: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}