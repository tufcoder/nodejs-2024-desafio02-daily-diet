import { FastifyReply, FastifyRequest } from "fastify"

import { knex } from "../database"

export const checkSessionIdExists = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const { sessionId } = request.cookies

    if (!sessionId) {
        return reply.status(401).send({
            error: 'Unauthorized. Session id is missing!'
        })
    }

    const user = await knex('users').where({ session_id: sessionId }).first()

    if (!user)
        return reply.status(401).send({ error: 'Unauthorized. User not found!' })

    request['user'] = user
}