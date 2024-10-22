import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { z } from 'zod'

import { knex } from "../database";

export async function usersRoutes(app: FastifyInstance) {
    app.post('/', async (request, reply) => {
        const userParamSchema = z.object({
            name: z.string().trim(),
            email: z.string().email(),
        })

        const { name, email } = userParamSchema.parse(request.body)

        const user = await knex('users').where({ email }).first()

        if (user) {
            return reply.status(400).send({
                error: `Email '${email}' already exists.`
            })
        }

        const sessionId = randomUUID()

        reply.setCookie('sessionId', sessionId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        await knex('users').insert({
            id: randomUUID(),
            name,
            email,
            session_id: sessionId,
        })

        return reply.status(201).send()
    })
}