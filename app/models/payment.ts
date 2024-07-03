import PaymentPlatform from './payment_platform.js'
import Bill from './bill.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'


export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @hasOne(() => PaymentPlatform)
  declare payment_platform_id: HasOne<typeof PaymentPlatform>

  @column()
  declare products: Array<JSON>

  @column()
  declare user_id: number

  @column()
  declare transference_id: number
  
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