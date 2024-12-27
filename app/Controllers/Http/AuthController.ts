import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthValidator from 'App/Validators/AuthValidator'

export default class AuthController {

    public async login({request, response, auth}:HttpContextContract){

        let payload = await request.validate(AuthValidator)

        try {
            const token = await auth.use('api').attempt(payload.email, payload.password)
            return token
        } catch {
            return response.unauthorized('Invalid credentials')
        }
        

    }

    public async logout({ request, response, auth }){
        await auth.use('api').revoke()
        return {
            revoked: true
        }

    }
}
