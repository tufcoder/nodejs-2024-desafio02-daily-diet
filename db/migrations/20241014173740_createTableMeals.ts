import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary().notNullable()
        table.text('name').notNullable()
        table.text('description').notNullable()
        table.text('date').notNullable()
        table.text('hour').notNullable()
        table.boolean('is_on_diet').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
        table.uuid('user_id').notNullable()

        table.unique(['name', 'date', 'hour', 'user_id'])

        table.foreign('user_id').references('users.id')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('users', (table) => {
        table.dropForeign('user_id')
    })

    await knex.schema.dropTable('meals')
}
