import { render, update } from "./renderer"

const initGameState = () => {
	return ({
		ball: {
			x: 400, y: 300,
			dx: 0, dy: 0,
			
			
			serverX: 400, serverY: 300,
			serverDx: 0, serverDy: 0,
			lastServerSync: 0,
			
			width: 10,
			height: 10
		},
		players:[
			{
				rect: { x: 35, y: 300, width: 10, height: 60 },
				score: 0
			},
			{
				rect: { x: 765, y: 300, width: 10, height: 60 },
				score: 0
			}
		],
		serverPlayerY: 300,
		gameStatus: 'connecting', // 'waiting', 'ready', 'playing', 'scored', 'gameover'
		lastUpdateTime: 0
		// index (later set)
	})
}

let animationFrameId
let cleanUpInput

export const initGame = (gameStateRef, canvas) => {
	const ctx = canvas.getContext('2d')
	
	gameStateRef.current = initGameState()

	let lastFrameTime = performance.now()

	const gameLoop = (timestamp) => {
		const now = performance.now()
		const deltaTime = (now - lastFrameTime) / 1000
		lastFrameTime = now;
	
		update(gameStateRef.current, deltaTime)
		render(ctx, gameStateRef.current)
		gameStateRef.current.lastUpdateTime = timestamp
		animationFrameId = requestAnimationFrame(gameLoop)
	}
	animationFrameId = requestAnimationFrame(gameLoop)

	return () => {
		cancelAnimationFrame(animationFrameId)
		cleanUpInput()
	}
}