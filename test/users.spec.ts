import { it, beforeAll, afterAll, beforeEach, expect, describe } from 'vitest'
import { execSync } from 'child_process'
import supertest from 'supertest'

import { app } from '../src/app'

describe('Users routes', () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(async () => {
        execSync('npm run knex -- migrate:rollback --all')
        execSync('npm run knex -- migrate:latest')
    })

    it('should be able to create a new user', async () => {
        const response = await supertest(app.server)
            .post('/users')
            .send({
                name: 'user test',
                email: 'user.test@email.com',
            })
            .expect(201)

        const cookies = response.get('Set-Cookie')

        expect(cookies).toString().includes('sessionId')
    })
})