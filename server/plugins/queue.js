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

	const initialState = () => {
		return ({
			ball: {
				rect: { x: 400, y: 300, width: 10, height: 10 },
				speed: 12,
				angle: 4.16332,
				dir: 'left',
				 // precalculated values
				velocity: getVelocity(4.16332, 12)
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
			],
			status: '',
			pause: true
		})
	}

	const initialPacket = () => {
		return ({
			b: { x: 400, y: 300 }, // ball
			p: { y: 300 }, // opponent pos
			s: [0, 0]
		})
	}

	const updatePacket = (gameState, index) => {
		return ({
			b: { x: gameState.ball.rect.x, y: gameState.ball.rect.y},
			p: gameState.players[index ^ 1].rect.y,
			s: [gameState.players[0].score, gameState.players[1].score]
		})
	}

	const closeRoom = (timeoutId, intervalId, roomId, players) => {
		// test this if players already closed sockets
		players[0].socket.close()
		players[1].socket.close()
		clearInterval(intervalId)
		clearTimeout(timeoutId)
		rooms.delete(roomId)
	}

	const setupRoom = (roomId) => {
		let timeoutId
		let intervalId
		const room = rooms.get(roomId)

		fastify.json(room.players[0].socket, { type: 'ready', index: 0 })
		fastify.json(room.players[1].socket, { type: 'ready', index: 1 })

		room.players.forEach((player, index) => {

			player.socket.on('message', (message) => {
				try {
					const data = JSON.parse(message.toString())
					room.state.players[data.pid].rect.y = data.y
				} 
				catch (e) {
					console.log(`JSON parse error: `, e.message)
					return
				}
			})

			player.socket.on('close', () => {
				const otherPlayer = room.players[index ^ 1].socket
				if (otherPlayer.readyState === WebSocket.OPEN) { // checks if otherPlayer didn't close too
					fastify.json(otherPlayer, { type: 'gameover', result: 'w' })
				}
				closeRoom(timeoutId, intervalId, roomId, room.players)
				return
			})
		})
		timeoutId = setTimeout(() => {
			fastify.json(room.players[0].socket, { type: 'start' })
			fastify.json(room.players[1].socket, { type: 'start' })
			room.state.pause = false
		}, 3000)

			intervalId = setInterval(()=> {
				if (!room.state.pause)
					updateState(room.state)

				room.players.forEach((player, index) => {
					player.packet = updatePacket(room.state, index)

					const payload = { type: 'state', state: player.packet }
					if (player.socket.readyState === WebSocket.OPEN)
						fastify.json(player.socket, payload)
				})
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
					{
						socket: player1,
						packet: initialPacket()
					},
					{
						socket: player2,
						packet: initialPacket()
					}
				],
				state: initialState(),
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

module.exports = game