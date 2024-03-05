import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare payment_platform_id: number

  @column()
  declare bill_id: number

  @column()
  declare user_id: number

  @column()
  declare payment_id: number

  @column()
  declare total: number

  @column()
  declare status: string

  @column()
  declare address: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}