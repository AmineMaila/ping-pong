const maxBounceAngle = 0.785398 // RAD / 45 degrees
const BALL_RADIUS = 5

const clamp = (value, min, max) => {
	return (Math.min(max, Math.max(min, value)))
}

const bounceBall = (ball, paddle) => {
	const relativeY = ball.rect.y - paddle.y
	const normalized = relativeY / (paddle.height / 2.0) // range -1.0, 1.0
	ball.angle = ball.dir === 'right'
		? Math.PI - (normalized * maxBounceAngle)
		: normalized * maxBounceAngle
	ball.speed = clamp(ball.speed * (Math.abs(normalized) * (0.7 - 0.3) + 0.7), 10, 16)
	ball.velocity = getVelocity(ball.angle, ball.speed)
	ball.dir = ball.dir === 'right' ? 'left' : 'right'
}

const getVelocity = (angle, speed) => {
	return ({
		dx: Math.cos(angle) * speed,
		dy: Math.sin(angle) * speed
	})
}

const paddleCollision = (a, b) => {
	return (
		a.x + a.width >= b.x &&
		a.y + a.height >= b.y &&
		a.x <= b.x + b.width &&
		a.y <= b.y + b.height
	)
}

const resetBall = () => {
	return ({
		rect: { x: 400, y: 300, width: 10, heigh: 10 },
		speed: 12,
		angle: 4.16332,
		 // precalculated values
		velocity: getVelocity(4.16332, 12)
	})
}

const updateBall = (ball) => {
	return ({
		x: ball.rect.x + ball.velocity.dx,
		y: ball.rect.y + ball.velocity.dy,
		width: 10,
		height: 10
	})
}

const updateState = (gameState) => {
	const newBall = updateBall(gameState.ball)

	// check bounce off left paddle
	if (newBall.x < 100 && paddleCollision(newBall, gameState.players[0].rect)) {
		return bounceBall(gameState.ball, gameState.players[0].rect)
	}
	
	// check bounce off right paddle
	if (newBall.x > 700 && paddleCollision(newBall, gameState.players[1].rect)) {
		return bounceBall(gameState.ball, gameState.players[1].rect)
	}
	
	// top wall bounce
	if (newBall.y - BALL_RADIUS < 0) {
		// snap back to edge
		newBall.y = BALL_RADIUS
		gameState.ball.angle *= -1
		gameState.ball.velocity = getVelocity(gameState.ball.angle, gameState.ball.speed)
		// gameState.ball.velocity.dx += newBall.dir === 'left' ? 2 : -2
		gameState.ball.rect = newBall
		return
	}

	// bottom wall bounce
	if (newBall.y + BALL_RADIUS > 600) {
		// snap back to edge
		newBall.y = 600 - BALL_RADIUS
		gameState.ball.angle *= -1
		gameState.ball.velocity = getVelocity(gameState.ball.angle, gameState.ball.speed)
		// gameState.ball.velocity.dx += newBall.dir === 'left' ? 2 : -2
		gameState.ball.rect = newBall
		return
	}

	// right player scored
	if (newBall.x < 0) {
		gameState.players[1].score++
		gameState.ball = resetBall()
		gameState.pause = true
		setTimeout(() => gameState.pause = false, 500)
		return
	}
	
	// left player scored
	if (newBall.x > 800) {
		gameState.players[0].score++
		gameState.ball = resetBall()
		gameState.pause = true
		setTimeout(() => gameState.pause = false, 500)
		return
	}

	gameState.ball.rect = newBall
}

module.exports = { getVelocity, updateState }