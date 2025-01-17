import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Expense from 'App/Models/Expense'
import Database from '@ioc:Adonis/Lucid/Database'
import { Exception } from '@adonisjs/core/build/standalone'
import ExpenseValidator from 'App/Validators/ExpenseValidator'
import Product from 'App/Models/Product'

export default class ExpensesController {

  public async index({response, bouncer}: HttpContextContract) {
        
    if (await bouncer.denies('isManager')) {
      return response.status(403).send('You are not allowed to perform this action')
    }

    let sales = await Expense.query().preload('bankAccount')
    .preload('employee')
    .preload('products').withAggregate('products', (query) => {
    
      query.sum('subtotal').as('total')
    
    })
    
    let salesJSON = sales.map(expense => {
    
      return expense.serialize({
        fields:{
      
          pick:['id', 'created_at']
      
        },
            
        relations:{
          employee:{
            fields:['id', 'first_name']
          },

          bankAccount:{
            fields:['id', 'name']
          }
        }
      })
    })
    
    return response.status(200).send(salesJSON)
  }
    
    
  public async store({ request, response, auth, bouncer }: HttpContextContract) {
    
    if (await bouncer.denies('isManager')) {
      return response.status(403).send('You are not allowed to perform this action')
    }
    
    let payload = await request.validate(ExpenseValidator)
    let subtotal:number
    const trx = await Database.transaction()
    let product
    let bankAccount
    
    try {
      bankAccount = await Database.from('bank_accounts')
      .where('id', payload.bankAccount).useTransaction(trx).forUpdate().firstOrFail()
    
      let expense = new Expense()
    
      expense.bankAccountId = payload.bankAccount
      expense.employeeId = auth.user?.id
      expense.useTransaction(trx)
      await expense.save()
    
      for (const productDetail of payload.products) {

        const { code, stock, ...body } = productDetail
    
        product = await Product.updateOrCreate({code:code}, body)
    
        subtotal = product.price * stock
          
        await expense.related('products').attach({
          [product.id]:{
            quantity:stock,
            subtotal:subtotal
          }
        })

        if (bankAccount.balance === 0 || subtotal > bankAccount.balance) {

          response.status(400).send("You don't have enough founds to perform this purchase")
  
          throw new Exception('NotEnoughFounds', 400)
              
        }
      
        await Database.from('bank_accounts')
        .where('id', bankAccount.id)
        .useTransaction(trx)
        .decrement('balance', subtotal)
            
      }
    
      await expense.load('products')
    
      response.status(200).send(expense)
    
      await trx.commit()
          
    } catch (error) {
    
      await trx.rollback()
          
    }
    
  }
    
  public async show({request, response, bouncer}: HttpContextContract) {

    if (await bouncer.denies('isManager')) {
      return response.status(403).send('You are not allowed to perform this action')
    }
    
    const expense = await Expense
    .query()
    .preload('employee')
    .preload('bankAccount')
    .preload('products').withAggregate('products', (query) => {
    
      query.sum('subtotal').as('total')
    
    }).where('id', request.param('id')).first()
        
    
    if (!expense) {
    
      return response.status(404).send("It wasn't possible to find the resource")
          
    }
    
    
    return expense.serialize({
      fields:{
    
        pick:['id', 'created_at']
    
      },
      
      relations:{
        employee:{
          fields:['id', 'first_name']
        },

        bankAccount:{
          fields:['id', 'name']
        }
      }
    })
  }
    
  public async destroy({ request, response, bouncer }: HttpContextContract) {
        
    if (await bouncer.denies('isManager')) {
      return response.status(403).send('You are not allowed to perform this action')
    }
        
    const trx = await Database.transaction()
       
    try {
    
      const expense = await Expense
      .query()
      .preload('bankAccount')
      .preload('products').withAggregate('products', (query) => {
    
        query.sum('subtotal').as('total')
    
      }).where('id', request.param('id')).firstOrFail()
    
      await Database.from('bank_accounts').where('id', expense.bankAccount.id)
      .useTransaction(trx).forUpdate().first()
    
      await Database.from('bank_accounts').where('id', expense.bankAccount.id)
      .useTransaction(trx).increment('balance', expense.$extras.total)
    
    
      await Database.from('expenses').where('id', expense.id)
      .useTransaction(trx).delete()
    
      response.status(200).send('The expense was deleted succesfully')
    
      await trx.commit()
          
    } catch (error) {
    
      response.status(404).send('The expense you are looking for doesnt exist')
      await trx.rollback()
          
    }
  }
}
