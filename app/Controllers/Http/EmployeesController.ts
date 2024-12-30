import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Employee from 'App/Models/Employee'
import Role from 'App/Models/Role'
import EmployeeValidator from 'App/Validators/EmployeeValidator'
import UpdateEmployeeValidator from 'App/Validators/UpdateEmployeeValidator'

export default class EmployeesController {
  public async index({ response }: HttpContextContract) {
    let customers = await Employee.all()
    
    return response.status(200).send(customers)
    
  }
    
  public async store({request, response, bouncer, auth}: HttpContextContract) {

    if (await bouncer.denies('isManager')) {
      return response.status(403).send('You are not allowed to perform this action')
    }

    let payload = await request.validate(EmployeeValidator)
    const role = await Role.find(payload.role)

    try {
      
      let newEmployee = await Employee.create(payload)
      newEmployee.related('role').associate(role)
      const token = await auth.use('api').attempt(newEmployee.email, payload.password)
      return token

    } catch(error) {
      return response.unauthorized('Invalid credentials')
    }
    
  }
    
  public async show({ request, response}: HttpContextContract) {
    
    let employee = await Employee.find(request.param('id'))
    
    if (employee) {
    
      return response.status(200).send(employee)
          
    }
    
    return response.status(404).send("It wasn't possible to access this resource")
    
  }
    
  public async update({request, response}: HttpContextContract) {
    
    let payload = await request.validate(UpdateEmployeeValidator)
    
    const { params, ...body } = payload
    
    let employee = await Employee.find(params.id)
    
    await employee?.merge(body).save()
    
    response.status(200).send(employee)
  }
    
  public async destroy({ request, response, bouncer }: HttpContextContract) {

    await bouncer.authorize('isManager')
    
    let employee = await Employee.find(request.param('id'))
    
    if (employee) {
    
      await employee.delete()
      return response.status(200).send(employee)
          
    }
    
    return response.status(404).send("It wasn't possible to delete this resource")
    
  }
}
