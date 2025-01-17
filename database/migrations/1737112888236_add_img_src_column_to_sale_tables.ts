import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sales'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('img_src', 200)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
