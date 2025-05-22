import { setupInputHandlers } from "./input"

let cleanUpInput

const connect = (canvas, gameStateRef, clientRef) => {
	clientRef.current = new WebSocket('ws://localhost:3001/game/queue')

	clientRef.current.addEventListener('open', async () => {
		console.log('Connected to server')
		cleanUpInput = setupInputHandlers(canvas, gameStateRef.current, clientRef.current)
	})

	clientRef.current.addEventListener('message', async (message) => {
		console.log('Recieved from server: ', message.data)
		const data = JSON.parse(message.data)

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
