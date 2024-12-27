import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string("identification_number", 8)
      table.string("first_name", 20)
      table.string("last_name", 20)
      table.string("phone_number", 20)
      table.string("address", 100)
      table.string("email", 200)
      table.string("password", 250)
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
