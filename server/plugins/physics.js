const maxBounceAngle = 0.785398 // RAD / 45 degrees
const PADDLE_WIDTH = 10
const PADDLE_HEIGHT = 60
const BALL_RADIUS = 5

const clamp = (value, min, max) => {
	return (Math.min(max, Math.max(min, value)))
}

const bounceBall = (ball, paddle) => {
	const relativeY = ball.y - paddle.y
	const normalized = relativeY / (PADDLE_HEIGHT / 2.0) // range -1.0, 1.0
	ball.angle = ball.dir === 'right'
		? Math.PI - (normalized * maxBounceAngle)
		: normalized * maxBounceAngle
	ball.speed = clamp(ball.speed * (Math.abs(normalized) * (0.7 - 0.3) + 0.7), 7, 11)
	ball.velocity = getVelocity(ball.angle, ball.speed)
	ball.dir = ball.dir === 'right' ? 'left' : 'right'
}

const getVelocity = (angle, speed) => {
	return ({
		dx: Math.cos(angle) * speed,
		dy: Math.sin(angle) * speed
	})
}

const paddleCollision = (ball, paddle) => {
	const dx = Math.abs(ball.x - paddle.x)
	const dy = Math.abs(ball.y - paddle.y)

	return(
		dx <= BALL_RADIUS + (PADDLE_WIDTH / 2) &&
		dy <= BALL_RADIUS + (PADDLE_HEIGHT / 2)
	)
}

const resetBall = () => {
	return ({
		x: 400,
		y: 300,
		speed: 8,
		angle: 4.16332,
		velocity: getVelocity(4.16332, 8)
	})
}

const updateBall = (ball) => {
	return ({
		x: ball.x + ball.velocity.dx,
		y: ball.y + ball.velocity.dy,
	})
}

const updateState = (gameState) => {
	const newBall = updateBall(gameState.ball)

	// check bounce off left paddle
	if (newBall.x < gameState.players[0].x + 5 && paddleCollision(newBall, gameState.players[0])) {
		gameState.ball.x = gameState.players[0].x + 5
		return bounceBall(gameState.ball, gameState.players[0])
	}
	
	// check bounce off right paddle
	if (newBall.x > gameState.players[1].x - 5 && paddleCollision(newBall, gameState.players[1])) {
		gameState.ball.x = gameState.players[1].x - 5
		return bounceBall(gameState.ball, gameState.players[1])
	}
	
	// top wall bounce
	if (newBall.y - BALL_RADIUS < 0) {
		gameState.ball.y = BALL_RADIUS
		gameState.ball.angle *= -1
		gameState.ball.velocity.dy *= -1
		return
	}

	// bottom wall bounce
	if (newBall.y + BALL_RADIUS > 600) {
		gameState.ball.y = 600 - BALL_RADIUS
		gameState.ball.angle *= -1
		gameState.ball.velocity.dy *= -1
		return
	}

	// right player scored
	if (newBall.x < 0) {
		gameState.score[1]++
		gameState.ball = resetBall()
		gameState.pause = true
		setTimeout(() => gameState.pause = false, 300)
		return
	}
	
	// left player scored
	if (newBall.x > 800) {
		gameState.score[0]++
		gameState.ball = resetBall()
		gameState.pause = true
		setTimeout(() => gameState.pause = false, 300)
		return
	}

	gameState.ball.x = newBall.x
	gameState.ball.y = newBall.y
}

module.exports = { getVelocity, updateState }