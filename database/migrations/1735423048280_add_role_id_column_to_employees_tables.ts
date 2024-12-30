import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'add_role_id_column_to_employees_tables'

  public async up () {
    this.schema.alterTable('employees', (table) => {
      table.integer('role_id').unsigned().references('id')
      .inTable('roles').onDelete('CASCADE')
    })
  }

  public async down () {
    this.schema.alterTable('employees', (table) => {
      table.dropForeign('role_id')
    })
  }
}
