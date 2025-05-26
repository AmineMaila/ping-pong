import render from "./renderer"

const initGameState = () => {
	return ({
		serverPlayerY: 300,
		serverBall: { x: 400, y: 300, width: 10, height: 10 },
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

const lerp = (delayed, current, factor) => {
	return ((current - delayed) * factor)
}

const update = (gameState) => {
	gameState.ball.x += lerp(gameState.ball.x, gameState.serverBall.x, 0.5)
	gameState.ball.y += lerp(gameState.ball.y, gameState.serverBall.y, 0.5)

	gameState.players[gameState.index ^ 1].rect.y += lerp(
		gameState.players[gameState.index ^ 1].rect.y,
		gameState.serverPlayerY,
		0.4
	)
}

export const initGame = (gameStateRef, canvas) => {
	const ctx = canvas.getContext('2d')
	
	gameStateRef.current = initGameState()

	// setInterval(() => {
	// 	update(gameStateRef.current)
	// 	render(ctx, gameStateRef.current)
	// }, 1000 / 120)

	const gameLoop = (timestamp) => {
		update(gameStateRef.current)
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