import render from "./renderer"

const initGameState = () => {
	return ({
		ball: { x: 400, y: 300, width: 10, height: 10 },
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
		gameStatus: 'connecting', // 'waiting', 'ready', 'playing', 'scored', 'gameover'
		lastUpdateTime: 0
		// index (later be set)
	})
}

let animationFrameId
let cleanUpInput

export const initGame = (gameStateRef, canvas) => {
	const ctx = canvas.getContext('2d')
	
	gameStateRef.current = initGameState()

	const gameLoop = (timestamp) => {
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