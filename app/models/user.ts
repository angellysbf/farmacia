import Rol from './rol.js'
import Payment from './payment.js'
import type { HasOne, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, hasMany  } from '@adonisjs/lucid/orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare name: string

  @column()
  declare phone: string

  @column()
  declare direction: string

  @column()
  declare password: string

  @hasOne(() => Rol)
  declare rol_id: HasOne<typeof Rol>

  @hasMany(() => Payment)
  declare payment: HasMany<typeof Payment>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}