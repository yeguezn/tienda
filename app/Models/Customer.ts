import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Sale from './Sale'

export default class Customer extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public identificationNumber: string

  @column()
  public firstName: string

  @column()
  public lastName: string

  @column()
  public phoneNumber: string

  @column()
  public address: string

  @hasMany(() => Sale, {
    foreignKey:'purchasedBy'
  })
  public sales: HasMany<typeof Sale>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
