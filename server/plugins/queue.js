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
				x: 400,
				y: 300,
				speed: 8,
				angle: 4.16332,
				dir: 'left',
				velocity: getVelocity(4.16332, 8)
			},
			players: [
				{
					x: 30,
					y: 300,
				},
				{ 
					x: 770,
					y: 300,
				}
			],
			score: [0, 0],
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


		room.players.forEach((player, index) => {
			fastify.json(player.socket, { type: 'ready', i: index })
		})

		room.players.forEach((player, index) => {

			player.socket.on('message', (message) => {
				try {
					const data = JSON.parse(message.toString())
					room.state.players[data.pid].y = data.y
				} 
				catch (e) {
					console.log(`JSON parse error: `, e.message)
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
			room.players.forEach(player => {
				fastify.json(player.socket, { type: 'start' })
			})
			room.state.pause = false
		}, 3000)

		intervalId = setInterval(()=> {
			if (!room.state.pause)
				updateState(room.state)

			room.players.forEach((player, index) => {
				if (player.socket.readyState === WebSocket.OPEN)
					fastify.json(player.socket, {
							type: 'state',
							state: {
								b: { x: room.state.ball.x, y: room.state.ball.y },
								p: room.state.players[index ^ 1].y,
								s: [ room.state.score[0], room.state.score[1] ]
							}
						})
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