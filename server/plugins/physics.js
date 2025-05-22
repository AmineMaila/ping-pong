const maxBounceAngle = 0.785398 // RAD / 75 degrees

const clamp = (value, min, max) => {
	return (Math.min(max, Math.max(min, value)))
}

const bounceBall = (ball, paddle) => {
	const relativeY = ball.rect.y - paddle.y
	const normalized = relativeY / (paddle.height / 2.0) // range -1.0, 1.0
	ball.angle = ball.dir === 'right' ? Math.PI - (normalized * maxBounceAngle) : normalized * maxBounceAngle
	ball.speed = clamp(ball.speed * (Math.abs(normalized) * (1.3 - 0.7) + 0.7), 6, 15)
	ball.velocity = getVelocity(ball.angle, ball.speed)
	ball.dir = ball.dir === 'right' ? 'left' : 'right'
}

export const getVelocity = (angle, speed) => {
	return (
		{
			dx: Math.cos(angle) * speed,
			dy: Math.sin(angle) * speed
		}
	)
}

const paddleCollision = (a, b) => {
	// console.log('test ', a, b)
	return (
		a.x + a.width >= b.x &&
		a.y + a.height >= b.y &&
		a.x <= b.x + b.width &&
		a.y <= b.y + b.height
	)
}

// const paddleCollisionRange = (ball, paddle) => {
// 	return (
		
// 	)
// }

const updateBall = (ball, deltaTime) => {
	ball.rect.x += ball.velocity.dx * (deltaTime / 16.67)
	ball.rect.y += ball.velocity.dy * (deltaTime / 16.67)
}

const update = (gameState, deltaTime, inputState, setScore) => {
	gameState.paddles.player1.rect.y = inputState.clientPaddlePosition
	gameState.paddles.player2.rect.y = inputState.clientPaddlePosition
	const current = gameState.ball.dir === 'left' ? gameState.paddles.player1.rect : gameState.paddles.player2.rect
	const { x: oldBallX, y: oldBallY} = gameState.ball.rect

	updateBall(gameState.ball, deltaTime)
	if (paddleCollision(gameState.ball.rect, current)) {
		bounceBall(gameState.ball, current)
	}

	if (gameState.ball.rect.y < 0 || gameState.ball.rect.y + gameState.ball.rect.height > 600) {
		gameState.ball.angle = -gameState.ball.angle
		gameState.ball.velocity = getVelocity(gameState.ball.angle, gameState.ball.speed)
	} else if (gameState.ball.rect.x < 0) {
		setScore(gameState.paddle.player2.score + 1)
		gameState.paddles.player2.score++
		// resetBall()
	} else if (gameState.ball.rect.x > 800) {
		setScore(gameState.paddle.player1.score + 1)
		gameState.paddles.player1.score++
	}
}

export default update