/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import Sale from 'App/Models/Sale'
import Product from 'App/Models/Product'

Route.group(() => {
    Route.get('/customers', 'CustomersController.index')
    Route.post('/customers', 'CustomersController.store')
    Route.get('/customers/:id', 'CustomersController.show')
    Route.put('/customers/:id', 'CustomersController.update')
    Route.delete('/customers/:id', 'CustomersController.destroy')

}).middleware('auth')

Route.group(() => {
    Route.get('/bank-accounts', 'BankAccountsController.index')
    Route.post('/bank-accounts', 'BankAccountsController.store')
    Route.get('/bank-accounts/:id', 'BankAccountsController.show')
    Route.put('/bank-accounts/:id', 'BankAccountsController.update')
    Route.delete('/bank-accounts/:id', 'BankAccountsController.destroy')

}).middleware('auth')

Route.group(() => {
    Route.get('/employees', 'EmployeesController.index')
    Route.post('/employees', 'EmployeesController.store')
    Route.get('/employees/:id', 'EmployeesController.show')
    Route.put('/employees/:id', 'EmployeesController.update')
    Route.delete('/employees/:id', 'EmployeesController.destroy')

}).middleware('auth')

Route.group(() => {
    Route.get('/products', 'ProductsController.index')
    Route.post('/products', 'ProductsController.store')
    Route.get('/products/:id', 'ProductsController.show')
    Route.put('/products/:id', 'ProductsController.update')
    Route.delete('/products/:id', 'ProductsController.destroy')
    Route.put('/update-product-image/:id', 'ProductsController.updateProductImage')

}).middleware('auth')

Route.group(() => {
    Route.get('/sales', 'SalesController.index')
    Route.post('/sales', 'SalesController.store')
    Route.get('/sales/:id', 'SalesController.show')
    Route.put('/sales/:id', 'SalesController.update')
    Route.delete('/sales/:id', 'SalesController.destroy')

}).middleware('auth')

Route.group(() => {
    Route.get('/expenses', 'ExpensesController.index')
    Route.post('/expenses', 'ExpensesController.store')
    Route.get('/expenses/:id', 'ExpensesController.show')
    Route.put('/expenses/:id', 'ExpensesController.update')
    Route.delete('/expenses/:id', 'ExpensesController.destroy')

}).middleware('auth')


Route.group(() => {

    Route.post("/login", "AuthController.login")
    Route.post("/logout", "AuthController.logout")

})

Route.get('/test', async () => {
    return await Database.from('products')
    .join('sale_details', 'sale_details.product_id', '=', 'products.id')
    .where('products.id', 2)
    .select('products.price', 'products.name')
    .sum('sale_details.quantity as quantity').firstOrFail()
})

Route.get('/test2', async () => {
    let obj = {code:1234, name:'Laptop', stock:10, imgSrc:'laptop.jpg', price:999.99}

    const { code, stock, ...body } = obj

    return body

})