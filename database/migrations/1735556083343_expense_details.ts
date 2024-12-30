import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'expense_details'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer("expense_id").unsigned().references("id")
      .inTable("expenses").onDelete('CASCADE')
      table.integer("product_id").unsigned().references("id")
      .inTable("products").onDelete('CASCADE')
      table.integer("quantity")
      table.float("subtotal", 9, 2)
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
