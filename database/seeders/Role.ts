import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'

export default class extends BaseSeeder {
  public async run () {
    const roles = await Role.findMany(['Management', 'Seller'])
    
    if (roles.length === 0) {

      Role.createMany([
        {name:'Management'},
        {name:'Seller'}
      ])
      
    }
  }
}
