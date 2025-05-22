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
				break;
			case 'ready':
				gameStateRef.current.gameStatus = 'ready'
				gameStateRef.current.index = data.index
				break;
			case 'start':
				gameStateRef.current.gameStatus = 'playing'
				break;
			case 'state':
				gameStateRef.current.ball = { ...data.state.b, width: 10, height: 10 }
				gameStateRef.current.players[gameStateRef.current.index ^ 1].rect.y = data.state.p
				break;
		}
	})
	
	clientRef.current.addEventListener('error', () => {
		console.error('Error occured: ', err)
	})
	
	clientRef.current.addEventListener('close', () => {
		console.log('Disconnected from the server')
		cleanUpInput()
	})
	return (() => { clientRef.current.close() })
}

export default connect
