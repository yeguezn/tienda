import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import SaleValidator from 'App/Validators/SaleValidator'
import Sale from 'App/Models/Sale'
import { Exception } from '@adonisjs/core/build/standalone'

export default class SalesController {
  public async index({response}: HttpContextContract) {
    let sales = await Sale.query().preload('bankAccount')
    .preload('customer').preload('employee')
    .preload('products').withAggregate('products', (query) => {

      query.sum('subtotal').as('total')

    })

    let salesJSON = sales.map(sale => sale.serialize(
      {
        fields:{

          pick:['id', 'created_at']

        },
        relations:{
          employee:{
            fields:['id', 'first_name']
          },
          customer:{
            fields:['id', 'first_name', 'last_name', 'identification_number']
          },
          bankAccount:{
            fields:['id', 'name']
          }
        }
      })
    )

    return response.status(200).send(salesJSON)
  }


  public async store({ request, response, auth }: HttpContextContract) {

    let payload = await request.validate(SaleValidator)
    let subtotal:number
    const trx = await Database.transaction()
    let product
    let bankAccount

    try {
      bankAccount = await Database.from('bank_accounts')
      .where('id', payload.bankAccount).useTransaction(trx).forUpdate().firstOrFail()

      let sale = new Sale()

      sale.customerId = payload.customer
      sale.bankAccountId = payload.bankAccount
      sale.employeeId = auth.user?.id

      sale.useTransaction(trx)
      
      await sale.save()

      for (const productDetail of payload.products) {

        product = await Database.from('products').where('id', productDetail.id)
        .useTransaction(trx).forUpdate().firstOrFail()

        if (product.stock === 0) {

          response.status(400).send(`We ran out of ${product.name}`)

          throw new Exception('ProductSoldOut', 400)
          
        }

        if (productDetail.quantity > product.stock) {

          response.status(400).send(`We dont have enough units of ${product.name}`)

          throw new Exception('NotEnoughUnits', 400)
          
        }
  
        subtotal = product.price * productDetail.quantity
      
        await sale.related('products').attach({
          [product.id]:{
            quantity:productDetail.quantity,
            subtotal:subtotal
          }
        })
  
        await Database.from('products')
        .where('id', product.id)
        .useTransaction(trx)
        .decrement('stock', productDetail.quantity)
  
        await Database.from('bank_accounts')
        .where('id', bankAccount.id)
        .useTransaction(trx)
        .increment('balance', subtotal)
        
      }

      await sale.load('products')

      response.status(200).send(sale)

      await trx.commit()
      
    } catch (error) {

      await trx.rollback()
      
    }

  }

  public async show({request, response}: HttpContextContract) {

    const sale = await Sale
    .query()
    .preload('customer')
    .preload('employee')
    .preload('bankAccount')
    .preload('products').withAggregate('products', (query) => {

      query.sum('subtotal').as('total')

    }).where('id', request.param('id')).first()
    

    if (!sale) {

      return response.status(404).send("It wasn't possible to find the resource")
      
    }

    return sale.serialize({
      fields:{

        pick:['id', 'created_at']

      },
      relations:{
        employee:{
          fields:['id', 'first_name']
        },
        customer:{
          fields:['id', 'first_name', 'last_name', 'identification_number']
        },
        bankAccount:{
          fields:['id', 'name']
        }
      }
    })
  }

  public async destroy({ request, response }: HttpContextContract) {
    const trx = await Database.transaction()
   
    try {

      const sale = await Sale
      .query()
      .preload('bankAccount')
      .preload('products').withAggregate('products', (query) => {

        query.sum('subtotal').as('total')

      }).where('id', request.param('id')).firstOrFail()

      await Database.from('bank_accounts').where('id', sale.bankAccount.id)
      .useTransaction(trx).forUpdate().first()

      await Database.from('bank_accounts').where('id', sale.bankAccount.id)
      .useTransaction(trx).decrement('balance', sale.$extras.total)


      for (const product of sale.products) {
        
        await Database.from('products').where('id', product.id)
        .useTransaction(trx).forUpdate().first()

        await Database.from('products').where('id', product.id)
        .useTransaction(trx).increment('stock', product.$extras.pivot_quantity)
        
      }

      await Database.from('sales').where('id', sale.id)
      .useTransaction(trx).delete()

      response.status(200).send('The sale was deleted succesfully')

      await trx.commit()
      
    } catch (error) {

      response.status(404).send('The sale you are looking for doesnt exist')

      await trx.rollback()
      
    }
  }
}
