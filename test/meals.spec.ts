import { it, beforeAll, afterAll, beforeEach, describe, expect } from 'vitest'
import { execSync } from 'child_process'
import supertest, { Response } from 'supertest'

import { app } from '../src/app'

describe('Meals routes', () => {
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

    function getCookies(response: Response) {
        const cookies = response.get('Set-Cookie')

        if (!cookies) throw new Error('Unauthorized. No Cookies!')

        return cookies
    }

    it('should be able to create a new meal for a user', async () => {
        const testUser = await supertest(app.server)
            .post('/users')
            .send({
                name: 'user test',
                email: 'user.test@email.com',
            })
            .expect(201)

        const cookies = getCookies(testUser)

        await supertest(app.server)
            .post('/meals')
            .set('Cookie', cookies)
            .send({
                name: 'meal test',
                description: 'A delicious meal test',
                date: '2024-10-15',
                hour: '11:11',
                isOnDiet: true,
            })
            .expect(201)
    })

    it('should be able to list all meals from a user', async () => {
        const testUser = await supertest(app.server)
            .post('/users')
            .send({
                name: 'user test',
                email: 'user.test@email.com',
            })
            .expect(201)

        const cookies = getCookies(testUser)

        await supertest(app.server)
            .post('/meals')
            .set('Cookie', cookies)
            .send({
                name: 'meal test',
                description: 'A delicious meal test',
                date: '2024-10-15',
                hour: '11:11',
                isOnDiet: true,
            })
            .expect(201)

        const meals = await supertest(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200)

        expect(meals.body.meals).toHaveLength(1)
    })

    it('should be able to list a unique meal', async () => {
        const testUser = await supertest(app.server)
            .post('/users')
            .send({
                name: 'user test',
                email: 'user.test@email.com',
            })
            .expect(201)

        const cookies = getCookies(testUser)

        await supertest(app.server)
            .post('/meals')
            .set('Cookie', cookies)
            .send({
                name: 'meal test',
                description: 'A delicious meal test',
                date: '2024-10-15',
                hour: '11:11',
                isOnDiet: true,
            })
            .expect(201)

        const meal = await supertest(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200)

        const mealId = meal.body.meals[0].id

        await supertest(app.server)
            .get(`/meals/${mealId}`)
            .set('Cookie', cookies)
            .expect(200)
    })

    it('Should be able to delete a meal from a user', async () => {
        const testUser = await supertest(app.server)
            .post('/users')
            .send({
                name: 'user test',
                email: 'user.test@email.com',
            })
            .expect(201)

        const cookies = getCookies(testUser)

        await supertest(app.server)
            .post('/meals')
            .set('Cookie', cookies)
            .send({
                name: 'meal test',
                description: 'A delicious meal test',
                date: '2024-10-15',
                hour: '11:11',
                isOnDiet: true,
            })
            .expect(201)

        const meal = await supertest(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200)

        const mealId = meal.body.meals[0].id

        await supertest(app.server)
            .del(`/meals/${mealId}`)
            .set('Cookie', cookies)
            .expect(200)
    })

    it('Should be able to update a meal from a user', async () => {
        const testUser = await supertest(app.server)
            .post('/users')
            .send({
                name: 'user test',
                email: 'user.test@email.com',
            })
            .expect(201)

        const cookies = getCookies(testUser)

        await supertest(app.server)
            .post('/meals')
            .set('Cookie', cookies)
            .send({
                name: 'meal test',
                description: 'A delicious meal test',
                date: '2024-10-15',
                hour: '11:11',
                isOnDiet: true,
            })
            .expect(201)

        const meal = await supertest(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200)

        const mealId = meal.body.meals[0].id

        await supertest(app.server)
            .put(`/meals/${mealId}`)
            .set('Cookie', cookies)
            .send({
                name: 'update meal test',
                description: 'A delicious meal test updated',
                date: '2024-10-14',
                hour: '12:00',
                isOnDiet: true,
                updated_at: new Date().toISOString()
            })
            .expect(200)
    })

    it('Should be able to list all metrics for a user', async () => {
        const testUser = await supertest(app.server)
            .post('/users')
            .send({
                name: 'user test',
                email: 'user.test@email.com',
            })
            .expect(201)

        const cookies = getCookies(testUser)

        await supertest(app.server)
            .post('/meals')
            .set('Cookie', cookies)
            .send({
                name: 'meal test 1',
                description: 'A delicious meal test',
                date: '2024-10-15',
                hour: '11:11',
                isOnDiet: false,
            })
            .expect(201)

        await supertest(app.server)
            .post('/meals')
            .set('Cookie', cookies)
            .send({
                name: 'meal test 2',
                description: 'A delicious meal test',
                date: '2024-10-15',
                hour: '12:11',
                isOnDiet: true,
            })
            .expect(201)

        await supertest(app.server)
            .post('/meals')
            .set('Cookie', cookies)
            .send({
                name: 'meal test 3',
                description: 'A delicious meal test',
                date: '2024-10-15',
                hour: '13:11',
                isOnDiet: true,
            })
            .expect(201)

        const metrics = await supertest(app.server)
            .get('/meals/metrics')
            .set('Cookie', cookies)
            .expect(200)

        expect(metrics.text)
            .toBe(
                JSON.stringify({
                    metrics: {
                        totalMeals: 3,
                        totalOnDiet: 2,
                        totalOutsideDiet: 1,
                        betterDietStreak: 2,
                    }
                })
            )
    })
})