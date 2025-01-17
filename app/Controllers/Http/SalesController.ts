import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import SaleValidator from 'App/Validators/SaleValidator'
import Sale from 'App/Models/Sale'
import { Exception } from '@adonisjs/core/build/standalone'
import Application from '@ioc:Adonis/Core/Application'

export default class SalesController {
  public async index({response}: HttpContextContract) {
    let sales = await Sale.query().preload('bankAccount')
    .preload('customer').preload('employee')
    .preload('products').withAggregate('products', (query) => {

      query.sum('subtotal').as('total')

    })

    let salesJSON = sales.map(sale => {

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
    })

    return response.status(200).send(salesJSON)
  }


  public async store({ request, response, auth, bouncer }: HttpContextContract) {

    if (await bouncer.denies('isSeller')) {
      return response.status(403).send('You are not allowed to perform this action')
    }

    let payload = await request.validate(SaleValidator)
    let subtotal:number
    let stock:number
    const trx = await Database.transaction()
    let product
    let expense
    let bankAccount

    try {
      bankAccount = await Database.from('bank_accounts')
      .where('id', payload.bankAccount).useTransaction(trx).forUpdate().firstOrFail()

      await payload.imgSrc.move(Application.publicPath(), {
        name:`${payload.customer}.${payload.imgSrc.extname}`
      })

      let sale = new Sale()

      sale.customerId = payload.customer
      sale.bankAccountId = payload.bankAccount
      sale.employeeId = auth.user?.id
      sale.imgSrc = payload.imgSrc.filePath

      sale.useTransaction(trx)
      
      await sale.save()

      for (const productDetail of payload.products) {

        product = await Database.from('products')
        .join('sale_details', 'sale_details.product_id', '=', 'products.id')
        .select('products.name', 'products.price')
        .where('products.id', productDetail.id)
        .useTransaction(trx).sum('quantity as quantity').firstOrFail()

        expense = await Database.from('expense_details').where('id', productDetail.id)
        .useTransaction(trx).sum('quantity as quantity').firstOrFail()

        if (productDetail.quantity > expense.quantity) {

          response.status(400).send(`We dont have enough units of ${product.name}`)

          throw new Exception('NotEnoughUnits', 400)
          
        }

        stock = expense.quantity - product.quantity

        if (stock === 0) {

          response.status(400).send(`We ran out of the product`)

          throw new Exception('ProductSoldOut', 400)
          
        }
  
        subtotal = product.price * productDetail.quantity
      
        await sale.related('products').attach({
          [product.id]:{
            quantity:productDetail.quantity,
            subtotal:subtotal
          }
        })
  
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

  public async show({request, response, bouncer}: HttpContextContract) {

    if (await bouncer.denies('isSeller')) {
      return response.status(403).send('You are not allowed to perform this action')
    }

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

  public async destroy({ request, response, bouncer }: HttpContextContract) {
    
    if (await bouncer.denies('isSeller')) {
      return response.status(403).send('You are not allowed to perform this action')
    }
    
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
