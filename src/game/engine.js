import { getInputState, setupInputHandlers } from "./input"
import update, { getVelocity } from "./physics"
import render from "./render"

let gameState = {
	ball: {
		dir: 'left',
		rect: { x: 400, y: 300, width: 10, height: 10 },
		angle: 4.16332, // RAD / 45 degrees
		speed: 7,
		velocity: getVelocity(4.16332, 7)
	},
	paddles: {
		player1: {
			rect: { x: 30, y: 300, width: 10, height: 60 },
			score: 0
		},
		player2: {
			rect: { x: 770, y: 300, width: 10, height: 60 },
			score: 0
		}
	},
	gameStatus: 'waiting', // 'waiting', 'playing', 'scored', 'gameover'
	lastUpdateTime: 0
}

let animationFrameId
let cleanUpInput

export const initGame = (canvas, setScore) => {
	const ctx = canvas.getContext('2d')


	cleanUpInput = setupInputHandlers(canvas)

	const gameLoop = (timestamp) => {
		const deltaTime = Math.min(timestamp - gameState.lastUpdateTime, 50)

		const inputState = getInputState()

		update(gameState, deltaTime, inputState, setScore)
		render(ctx, gameState)
		gameState.lastUpdateTime = timestamp
		animationFrameId = requestAnimationFrame(gameLoop)
	}

	animationFrameId = requestAnimationFrame(gameLoop)

	return () => ({ ...gameState })
}

export const stopGame = () => {
	cancelAnimationFrame(animationFrameId)
	if (cleanUpInput)
		cleanUpInput()
}