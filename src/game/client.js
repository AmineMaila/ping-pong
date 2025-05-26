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
		switch (data.type) {
			case 'waiting':
				gameStateRef.current.gameStatus = 'waiting'
				break;
			case 'ready':
				gameStateRef.current.gameStatus = 'ready'
				gameStateRef.current.index = data.i
				break;
			case 'start':
				gameStateRef.current.gameStatus = 'playing'
				break;
			case 'state':
				gameStateRef.current.serverBall = data.state.b
				gameStateRef.current.serverPlayerY = data.state.p
				gameStateRef.current.players[0].score = data.state.s[0]
				gameStateRef.current.players[1].score = data.state.s[1]
				break;
		}
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
