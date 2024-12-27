import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Customer from 'App/Models/Customer'
import CustomerValidator from 'App/Validators/CustomerValidator'
import UpdateCustomerValidator from 'App/Validators/UpdateCustomerValidator'

export default class CustomersController {
  public async index({ response }: HttpContextContract) {
    let customers = await Customer.all()
    
    return response.status(200).send(customers)
    
  }
    
  public async store({request, response}: HttpContextContract) {
    let payload = await request.validate(CustomerValidator)
    
    let newCustomer = await Customer.create(payload)
    
    response.status(201).send(newCustomer)
  }
    
  public async show({ request, response}: HttpContextContract) {
    
    let customer = await Customer.find(request.param('id'))
    
    if (customer) {
    
      return response.status(200).send(customer)
          
    }
    
    return response.status(404).send("It wasn't possible to access this resource")
    
  }
    
  public async update({request, response}: HttpContextContract) {
    
    let payload = await request.validate(UpdateCustomerValidator)
    
    const { params, ...body } = payload
    
    let customer = await Customer.find(params.id)
    
    await customer?.merge(body).save()
    
    response.status(200).send(customer)
  }
    
  public async destroy({ request, response }: HttpContextContract) {
    
    let customer = await Customer.find(request.param('id'))
    
    if (customer) {
    
      await customer.delete()
      return response.status(200).send(customer)
          
    }
    
    return response.status(404).send("It wasn't possible to delete this resource")
    
  }
}
