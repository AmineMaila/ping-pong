import { setupInputHandlers } from "./input"

let cleanUpInput

const connect = (canvas, gameStateRef, clientRef) => {
	clientRef.current = new WebSocket('ws://localhost:3001/game/queue')

	clientRef.current.addEventListener('open', async () => {
		console.log('Connected to server')
		cleanUpInput = setupInputHandlers(canvas, gameStateRef.current, clientRef.current)
	})

	clientRef.current.addEventListener('message', async (message) => {
		const data = JSON.parse(message.data)
		console.log('Received Data => ', data)
		switch (data.type) {
			case 'waiting':
				gameStateRef.current.gameStatus = 'waiting'
				break
			case 'ready':
				gameStateRef.current.gameStatus = 'ready'
				gameStateRef.current.index = data.i
				console.log(gameStateRef.current)
				break
			case 'start':
				gameStateRef.current.gameStatus = 'playing'
				break
			case 'paddle':
				gameStateRef.current.serverPlayerY = data.p
				break
			case 'correction':
				gameStateRef.current.ball.serverX = data.b.x
				gameStateRef.current.ball.serverY = data.b.y
				gameStateRef.current.ball.serverDx = data.b.dx
				gameStateRef.current.ball.serverDy = data.b.dy
				gameStateRef.current.ball.lastServerSync = performance.now()
				break
			case 'collision':
				gameStateRef.current.ball.x = data.b.x
				gameStateRef.current.ball.y = data.b.y
				gameStateRef.current.ball.dx = data.b.dx
				gameStateRef.current.ball.dy = data.b.dy

				gameStateRef.current.ball.serverX = data.b.x
				gameStateRef.current.ball.serverY = data.b.y
				gameStateRef.current.ball.serverDx = data.b.dx
				gameStateRef.current.ball.serverDy = data.b.dy
				gameStateRef.current.ball.lastServerSync = performance.now()
				break
			case 'score':
				gameStateRef.current.ball.x = data.b.x
				gameStateRef.current.ball.y = data.b.y
				gameStateRef.current.ball.dx = data.b.dx
				gameStateRef.current.ball.dy = data.b.dy
				gameStateRef.current.players[0].score = data.s[0]
				gameStateRef.current.players[1].score = data.s[1]

				gameStateRef.current.ball.serverX = data.b.x
				gameStateRef.current.ball.serverY = data.b.y
				gameStateRef.current.ball.serverDx = data.b.dx
				gameStateRef.current.ball.serverDy = data.b.dy
				gameStateRef.current.ball.lastServerSync = performance.now()
				break
		}


		// switch (data.type) {
		// 	case 'waiting':
		// 		gameStateRef.current.gameStatus = 'waiting'
		// 		break;
		// 	case 'ready':
		// 		gameStateRef.current.gameStatus = 'ready'
		// 		gameStateRef.current.index = data.i
		// 		break;
		// 	case 'start':
		// 		gameStateRef.current.gameStatus = 'playing'
		// 		break;
		// 	case 'state':
		// 		if (data.bv) {
		// 			console.log('test: ', data.bv)
		// 			gameStateRef.current.ballVelocity = data.bv
		// 		}

		// 		if (data.b) {
		// 			gameStateRef.current.ball = { ...data.b, width: 10, height: 10 }
		// 		}
		// 		// gameStateRef.current.serverBall = data.b
		// 		gameStateRef.current.serverPlayerY = data.p[gameStateRef.current.index ^ 1]
		// 		// gameStateRef.current.players[gameStateRef.current.index ^ 1].rect.y = data.p
		// 		gameStateRef.current.players[0].score = data.s[0]
		// 		gameStateRef.current.players[1].score = data.s[1]
		// 		break;
		// }
	})
	
	clientRef.current.addEventListener('error', (err) => {
		// handle error by reconnecting
		console.error('Error occured: ', err)
	})
	
	clientRef.current.addEventListener('close', () => {
		console.log('Disconnected from the server')
		if (cleanUpInput)
			cleanUpInput()
	})
	return (() => { clientRef.current.close() })
}

export default connect
