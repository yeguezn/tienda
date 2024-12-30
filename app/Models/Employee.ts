import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave, hasMany, HasMany, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import Sale from './Sale'
import Role from './Role'
import Expense from './Expense'

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
    foreignKey:'employeeId'
  })
  public sales: HasMany<typeof Sale>

  @hasMany(() => Expense, {
    foreignKey:'expenseId'
  })
  public expenses: HasMany<typeof Expense>

  @belongsTo(() => Role)
  public role: BelongsTo<typeof Role>

  @column()
  public roleId: number

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
