import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BankAccount from 'App/Models/BankAccount'
import UpdateBankAccountValidator from 'App/Validators/UpdateBankAccountValidator'
import BankAccountValidator from 'App/Validators/BankAccountValidator'


export default class BankAccountsController {
  
  public async index({ response }: HttpContextContract) {
    let bankAccounts = await BankAccount.all()
    
    return response.status(200).send(bankAccounts)
    
  }
    
  public async store({request, response}: HttpContextContract) {
    let payload = await request.validate(BankAccountValidator)
    
    
    let newBankAccount = await BankAccount.create({
      name:payload.name,
      accountNumber:payload.accountNumber,
      balance:payload.balance
    })
    
    response.status(201).send(newBankAccount)
  }
    
  public async show({ request, response}: HttpContextContract) {
    
    let bankAccount = await BankAccount.find(request.param('id'))
    
    if (bankAccount) {
    
      return response.status(200).send(bankAccount)
          
    }
    
    return response.status(404).send("It wasn't possible to access this resource")
    
  }
    
  public async update({request, response}: HttpContextContract) {
    
    let payload = await request.validate(UpdateBankAccountValidator)
    
    const { params, ...body } = payload
    
    let bankAccount = await BankAccount.find(params.id)
    
    await bankAccount?.merge(body).save()
    
    response.status(200).send(bankAccount)
  }
    
  public async destroy({ request, response }: HttpContextContract) {
    
    let bankAccount = await BankAccount.find(request.param('id'))
    
    if (bankAccount) {
    
      await bankAccount.delete()
      return response.status(200).send(bankAccount)
          
    }
    
    return response.status(404).send("It wasn't possible to delete this resource")
    
  }
}
