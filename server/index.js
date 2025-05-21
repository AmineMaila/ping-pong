const Fastify = require('fastify')
const game = require('./plugins/queue')
const fastify = Fastify({
	logger: {
		level: 'info',
		transport: {
			target: 'pino-pretty',
			options: {
				ignore: 'pid,hostname',
				colorize: true
			}
		}
	}
})

fastify.register(require('@fastify/websocket'))
fastify.register(game, { prefix: '/game'})




fastify.listen({ port: 3001 }, (err) => {
	if (err) {
		console.log(err)
		process.exit(1)
	}
})

// // Client → Server:
// { type: "join" }
// { type: "paddle", pid: 0, y: 120 }

// // Server → Client:
// { type: "start", index: 0 or 1 }
// { type: "state", state: { ball: ..., paddles: [...] } }
// { type: "waiting" }