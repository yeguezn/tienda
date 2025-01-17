import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Customer from './Customer'
import Employee from './Employee'
import BankAccount from './BankAccount'
import Product from './Product'

export default class Sale extends BaseModel {
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

  @column()
  public imgSrc: string

  @column({ serializeAs:null })
  public customerId:number

  @column({ serializeAs:null })
  public employeeId: number

  @column({ serializeAs:null })
  public bankAccountId: number

  @belongsTo(() => Customer)
  public customer: BelongsTo<typeof Customer>

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @belongsTo(() => BankAccount)
  public bankAccount: BelongsTo<typeof BankAccount>

  @manyToMany(() => Product, {
    pivotColumns:['quantity', 'subtotal'],
    localKey:'id',
    pivotForeignKey:'sale_id',
    relatedKey:'id',
    pivotRelatedForeignKey:'product_id',
    pivotTable:'sale_details',
  })
  public products: ManyToMany<typeof Product>

  @column.dateTime({ autoCreate: true,   
    serialize: (value: DateTime | null) => {
      return value ? value.toFormat('dd LLL yyyy HH:mm:ss') : value
    },
  })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
