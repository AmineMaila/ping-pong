/*
	Keys :
		t => type Values :	w => waiting
												s => start
												o => gameover
		r => result Values :	w => winner
													l => loser
*/
const { initState } = require('./engine')

let waitingPlayer = null
const rooms = new Map() // Map<roomid, {[ws, ws], state}>

const game = async (fastify, options) => {
	fastify.decorate('json', (socket, obj) => {
		socket.send(JSON.stringify(obj))
	})

	const initialPacket = () => {
		return ({
			b: { x: 400, y: 300 }, // ball
			p: [{ y: 300 }, { y: 300 }] // players
		})
	}

	fastify.get('/:id', (request, reply) => {
		const room = rooms.get(request.params.id)

		room.sockets.forEach((player, index) => {

			player.on('message', (message) => {
				const data = JSON.parse(message)
				room.state.p[data.pid].y = data.y
			})

			player.on('close', () => {
				const otherPlayer = room.sockets[index ^ 1]
				if (otherPlayer.readyState === WebSocket.OPEN) { // checks if otherPlayer didn't close too
					fastify.json(otherPlayer, { type: 'gameover', result: 'w' })
				}
				rooms.delete(roomId)
				clearInterval(id)
			})
		})

		const id = setInterval(()=> {
			room.sockets.forEach((player, index) => {
				// updateState(room.state)
				const payload = { type: 'state', state: room.state }
				if (player.readyState === WebSocket.OPEN)
					fastify.json(player, payload)
			})
		}, 16.67)
	})

	fastify.get('/queue' , { websocket: true }, (socket, req) => {
		if (!waitingPlayer) {
			waitingPlayer = socket
			fastify.json(waitingPlayer, { type: 'waiting' })
		} else {
			const player1 = waitingPlayer
			const player2 = socket
			waitingPlayer = null
			const roomId = Date.now().toString()
			rooms.set(roomId, {
				sockets: [player1, player2],
				state: initState(),
				packet: initialPacket()
			})
			fastify.json(player1, { type: 'start', index: 0 })
			fastify.json(player2, { type: 'start', index: 1 })
		}

		socket.on('close', () => {
			waitingPlayer = null
		})
	})
}

module.exports = game