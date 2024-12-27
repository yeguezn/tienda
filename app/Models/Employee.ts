import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import Sale from './Sale'

export default class Employee extends BaseModel {
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

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @hasMany(() => Sale, {
    foreignKey:'registeredBy'
  })
  public sales: HasMany<typeof Sale>

  @beforeSave()
  public static async hashPassword (user: Employee) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
