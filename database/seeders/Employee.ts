import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Employee from 'App/Models/Employee'

export default class extends BaseSeeder {
  public async run () {
    await Employee.create({
      identificationNumber:'12345678',
      firstName:'admin',
      lastName:'user',
      address:'SJM',
      email:'admin@gmail.com',
      password:'12345678'
    })
  }
}
