/*
	Keys :
		t => type Values :	w => waiting
												s => start
												o => gameover
		r => result Values :	w => winner
													l => loser
*/
const { initState, updateState } = require('./engine')

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

	const closeRoom = (intervalId, roomId, sockets) => {
		if (sockets) {
			sockets[0].close()
			sockets[1].close()
		}
		clearInterval(intervalId)
		rooms.delete(roomId)
	}

	const setupRoom = (roomId) => {
		const room = rooms.get(roomId)

		fastify.json(room.sockets[0], { type: 'start', index: 0 })
		fastify.json(room.sockets[1], { type: 'start', index: 1 })

		room.sockets.forEach((player, index) => {

			player.on('message', (message) => {
				try {
					const data = JSON.parse(message.toString())
					room.state.p[data.pid].y = data.y
				} 
				catch (e) {
					console.log(`Room ${roomId} closed: `, e.message)
					closeRoom(id, roomId, room.sockets)
				}
			})

			player.on('close', () => {
				const otherPlayer = room.sockets[index ^ 1]
				if (otherPlayer.readyState === WebSocket.OPEN) { // checks if otherPlayer didn't close too
					fastify.json(otherPlayer, { type: 'gameover', result: 'w' })
				}
				closeRoom(id, roomId, room.sockets)
			})
		})

		const id = setInterval(()=> {
			room.sockets.forEach((player, index) => {
				// updateState(room.state)
				const payload = { type: 'state', state: room.packet }
				if (player.readyState === WebSocket.OPEN)
					fastify.json(player, payload)
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
				sockets: [player1, player2],
				state: initState(),
				packet: initialPacket()
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