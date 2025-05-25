/*
	Keys :
		t => type Values :	w => waiting
												s => start
												o => gameover
		r => result Values :	w => winner
													l => loser
*/
const { updateState, getVelocity } = require('./physics')

let waitingPlayer = null
const rooms = new Map() // Map<roomid, {[ws, ws], state}>

const game = async (fastify, options) => {
	fastify.decorate('json', (socket, obj) => {
		socket.send(JSON.stringify(obj))
	})

	const closeRoom = (timeoutId, intervalId, roomId, players) => {
		// test this if players already closed sockets
		players[0].close()
		players[1].close()
		clearInterval(intervalId)
		clearTimeout(timeoutId)
		rooms.delete(roomId)
	}

	const setupRoom = (roomId) => {
		let timeoutId
		let intervalId
		const room = rooms.get(roomId)

		const broadcast = (packet) => {
			room.players.forEach(player => {
				if (player.readyState === WebSocket.OPEN)
					fastify.json(player, packet)
			})
		}
	
		room.players.forEach((player, index) => {
			fastify.json(player, { type: 'ready', i: index})
		})

		room.players.forEach((player, index) => {

			player.on('message', (message) => {
				try {
					const data = JSON.parse(message.toString())
					room.state.players[data.pid].rect.y = data.y
				} 
				catch (e) {
					console.log(`JSON parse error: `, e.message)
					return
				}
			})

			player.on('close', () => {
				const otherPlayer = room.players[index ^ 1]
				if (otherPlayer.readyState === WebSocket.OPEN) { // checks if otherPlayer didn't close too
					fastify.json(otherPlayer, { type: 'gameover', result: 'w' })
				}
				closeRoom(timeoutId, intervalId, roomId, room.players)
				return
			})
		})
		timeoutId = setTimeout(() => {
			room.players.forEach((player) => {
				fastify.json(player, { type: 'start' })
			})
		}, 3000)


		let frameCount = 0
		intervalId = setInterval(()=> {
			updateState(room.state, broadcast)
			frameCount++

			room.players.forEach((player, index) => {
				fastify.json(player, {
					type: 'paddle',
					p: room.state.players[index ^ 1].rect.y
				})
			})

			if (frameCount % 12 === 0) { // every 12 frames send a correction packet
				broadcast({
					type: 'correction',
					b: {
						x: room.state.ball.rect.x,
						y: room.state.ball.rect.y,
						dx: room.state.ball.velocity.dx,
						dy: room.state.ball.velocity.dy
					}
				})
			}

		}, 16.67)

	}

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
				players: [
						player1,
						player2
				],
				state: {
					ball: {
						rect: { x: 400, y: 300, width: 10, height: 10 },
						speed: 12,
						angle: 4.16332,
						velocity: getVelocity(4.16332, 12),
						dir: 'left'
					},
					players: [
						{
							rect: { x: 30, y: 300, width: 10, height: 60 },
							score: 0
						},
						{
							rect: { x: 770, y: 300, width: 10, height: 60 },
							score: 0
						}
					]
				},
			})

			setupRoom(roomId)
		}

		socket.on('close', () => {
			if (waitingPlayer)
				waitingPlayer.close()
			waitingPlayer = null
		})
	})
}

module.exports = {
	game
}