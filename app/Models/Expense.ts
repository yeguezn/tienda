import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, ManyToMany, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'
import Employee from './Employee'
import BankAccount from './BankAccount'

export default class Expense extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  serializeExtras() {
    return {
      products: Array.isArray(this.products)
      ? this.products.map((product) => {
        return {
          ...product.serialize({
            fields:['code', 'name', 'price']
          }),
          details: {
            quantity: product.$extras.pivot_quantity,
            subtotal: product.$extras.pivot_subtotal
          },
        }
      })
      : null,

      total: this.$extras.total
    }
  }

  @column({ serializeAs:null })
  public employeeId: number

  @column({ serializeAs:null })
  public bankAccountId: number

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @belongsTo(() => BankAccount)
  public bankAccount: BelongsTo<typeof BankAccount>

  @manyToMany(() => Product, {
    pivotColumns:['quantity', 'subtotal'],
    localKey:'id',
    pivotForeignKey:'expense_id',
    relatedKey:'id',
    pivotRelatedForeignKey:'product_id',
    pivotTable:'expense_details',
  })
  public products: ManyToMany<typeof Product>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
