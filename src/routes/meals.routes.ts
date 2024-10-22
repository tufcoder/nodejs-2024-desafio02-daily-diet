import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { z } from 'zod'

import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/checkSessionIdExists";

export async function mealsRoutes(app: FastifyInstance) {
    app.post(
        '/',
        { preHandler: [checkSessionIdExists] },
        async (request, reply) => {
            const mealSchemaRequestBody = z.object({
                name: z.string().trim(),
                description: z.string().trim(),
                date: z.string().date("ISO date format (YYYY-MM-DD)"),
                hour: z.string().regex(
                    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/gm,
                    'Format must be HH:mm'
                ).trim(),
                isOnDiet: z.boolean(),
            })

            const {
                name,
                description,
                date,
                hour,
                isOnDiet,
            } = mealSchemaRequestBody.parse(request.body)

            await knex('meals').insert({
                id: randomUUID(),
                name,
                description,
                date,
                hour,
                is_on_diet: isOnDiet,
                user_id: request['user']?.id,
            })

            return reply.status(201).send()
        }
    )

    app.put(
        '/:id',
        { preHandler: [checkSessionIdExists] },
        async (request, reply) => {
            const mealSchemaRequestBody = z.object({
                name: z.string().trim(),
                description: z.string().trim(),
                date: z.string().date("ISO date format (YYYY-MM-DD)"),
                hour: z.string().regex(
                    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/gm,
                    'Format must be HH:mm'
                ).trim(),
                isOnDiet: z.boolean(),
            })

            const mealSchemaRequestParams = z.object({
                id: z.string().uuid(),
            })

            const {
                name,
                description,
                date,
                hour,
                isOnDiet,
            } = mealSchemaRequestBody.parse(request.body)

            const { id } = mealSchemaRequestParams.parse(request.params)

            const meal = await knex('meals')
                .where({
                    id,
                    user_id: request['user']?.id
                })
                .first()
                .select('*')

            if (!meal)
                return reply.status(204).send({ error: 'Meal not found.' })

            await knex('meals')
                .where({
                    id,
                    user_id: request['user']?.id
                })
                .update({
                    name,
                    description,
                    date,
                    hour,
                    is_on_diet: isOnDiet,
                    updated_at: new Date().toISOString()
                })

            return reply.status(200).send()
        })

    app.delete(
        '/:id',
        { preHandler: [checkSessionIdExists] },
        async (request, reply) => {
            const mealSchemaRequestParams = z.object({
                id: z.string().uuid(),
            })

            const { id } = mealSchemaRequestParams.parse(request.params)

            const affectedRows = await knex('meals')
                .where({
                    id,
                    user_id: request['user']?.id
                })
                .del()

            if (affectedRows === 0)
                return reply.status(204).send({ error: 'Meal not found.' })

            return reply.status(200).send()
        })

    app.get(
        '/',
        { preHandler: [checkSessionIdExists] },
        async (request, reply) => {
            const meals = await knex('meals')
                .where({ user_id: request['user']?.id })
                .orderBy(['date', 'hour'])
                .select('*')

            if (meals.length === 0)
                return reply.status(204).send()

            return { meals }
        }
    )

    app.get(
        '/:id',
        { preHandler: [checkSessionIdExists] },
        async (request, reply) => {
            const mealSchemaRequestParams = z.object({
                id: z.string().uuid(),
            })

            const { id } = mealSchemaRequestParams.parse(request.params)

            const meal = await knex('meals')
                .where({
                    id,
                    user_id: request['user']?.id
                })
                .first()
                .select('*')

            if (!meal)
                return reply.status(204).send({ error: 'Meal not found.' })

            return { meal }
        }
    )

    app.get(
        '/metrics',
        { preHandler: [checkSessionIdExists] },
        async (request, reply) => {
            const meals = await knex('meals')
                .where({ user_id: request['user']?.id })
                .select('*')

            if (meals.length === 0)
                return reply.status(204).send()

            const totalMeals = meals.length

            const totalOnDiet = meals.reduce((acc, value) => {
                if (value.is_on_diet)
                    acc++
                return acc
            }, 0)

            const totalOutsideDiet = meals.reduce((acc, value) => {
                if (!value.is_on_diet)
                    acc++
                return acc
            }, 0)

            const mealsByDateAndHour = await knex('meals')
                .where({ user_id: request['user']?.id, })
                .orderBy(['date', 'hour'])
                .select('*')

            const betterDietStreak = mealsByDateAndHour.reduce((acc, value) => {
                if (value.is_on_diet)
                    acc++
                else
                    acc = 0
                return acc
            }, 0)

            const metrics = {
                totalMeals,
                totalOnDiet,
                totalOutsideDiet,
                betterDietStreak,
            }

            return { metrics }
        }
    )
}