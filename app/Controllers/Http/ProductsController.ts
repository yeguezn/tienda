import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ProductValidator from 'App/Validators/ProductValidator'
import Product from 'App/Models/Product'
import Application from '@ioc:Adonis/Core/Application'
import UpdateProductImageValidator from 'App/Validators/UpdateProductImageValidator'
import UpdateProductValidator from 'App/Validators/UpdateProductValidator'
const Fs = require('fs')

export default class ProductsController {
  public async index({ response }: HttpContextContract) {
    let products = await Product.all()

    return response.status(200).send(products)

  }

  public async store({request, response}: HttpContextContract) {
    let payload = await request.validate(ProductValidator)
    let filePath:string = ''

    if (payload.imgSrc) {

      await payload.imgSrc.move(Application.publicPath(), {
        name:`${payload.code}.${payload.imgSrc.extname}`
      })
      
      filePath = payload.imgSrc.filePath
    }

    let newProduct = await Product.create({
      code:payload.code,
      name:payload.name,
      price:payload.price,
      stock:payload.stock,
      imgSrc: filePath
    })

    response.status(201).send(newProduct)
  }

  public async show({ request, response}: HttpContextContract) {

    let product = await Product.find(request.param('id'))

    if (product) {

      return response.status(200).send(product)
      
    }

    return response.status(404).send("It wasn't possible to access this resource")


  }

  public async update({request, response}: HttpContextContract) {

    let payload = await request.validate(UpdateProductValidator)

    const { params, ...body } = payload

    let product = await Product.find(params.id)

    await product?.merge(body).save()

    response.status(200).send(product)
  }

  public async destroy({ request, response }: HttpContextContract) {

    let product = await Product.find(request.param('id'))

    if (product) {

      await Fs.promises.unlink(product.imgSrc)
      await product.delete()
      return response.status(200).send(product)
      
    }

    return response.status(404).send("It wasn't possible to delete this resource")

  }

  public async updateProductImage({ request, response }: HttpContextContract) {

    let payload = await request.validate(UpdateProductImageValidator)
    let product = await Product.find(payload.params.id)

    await payload.imgSrc.move(Application.publicPath(), {
      name:`${product?.code}.${payload.imgSrc.extname}`,
      overwrite:true
    })

    await product.merge({ imgSrc: payload.imgSrc.filePath }).save()
    
    response.status(200).send('Product image updated successfully')

  }


}
