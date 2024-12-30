import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Sale from './Sale'
import Expense from './Expense'

export default class BankAccount extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public accountNumber: string

  @column()
  public balance: number

  @hasMany(() => Sale, {
    foreignKey:'saleId'
  })
  public sales: HasMany<typeof Sale>

  @hasMany(() => Expense, {
    foreignKey:'expenseId'
  })
  public expenses: HasMany<typeof Expense>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
