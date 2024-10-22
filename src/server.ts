import { env } from "./env";
import { app } from "./app";

const port = env.PORT
const host = env.HOST === 'render' ? '0.0.0.0' : env.HOST

app
    .listen({
        host,
        port,
    })
    .then(() => console.log('HTTP Server is running!'))