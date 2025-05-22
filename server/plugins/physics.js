const maxBounceAngle = 0.785398 // RAD / 75 degrees

const clamp = (value, min, max) => {
	return (Math.min(max, Math.max(min, value)))
}

const bounceBall = (ball, paddle, bounceDir) => {
	const relativeY = ball.rect.y - paddle.y
	const normalized = relativeY / (paddle.height / 2.0) // range -1.0, 1.0
	ball.angle = bounceDir === 'left'
		? Math.PI - (normalized * maxBounceAngle)
		: normalized * maxBounceAngle
	ball.speed = clamp(ball.speed * (Math.abs(normalized) * (1.3 - 0.7) + 0.7), 10, 16)
	ball.velocity = getVelocity(ball.angle, ball.speed)
}

const getVelocity = (angle, speed) => {
	return ({
		dx: Math.cos(angle) * speed,
		dy: Math.sin(angle) * speed
	})
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

const resetBall = () => {
	return ({
		rect: { x: 400, y: 300, width: 10, heigh: 10 },
		speed: 10,
		angle: 4.16332,
		 // precalculated values
		velocity: { dx: -5.218932854607728, dy: -8.530107845689644 }
	})
}

const updateBall = (ball, deltaTime) => {
	ball.rect.x += ball.velocity.dx * deltaTime
	ball.rect.y += ball.velocity.dy * deltaTime
}

const updatePacket = (gameState, index) => {
	return ({
		b: { x: gameState.ball.rect.x, y: gameState.ball.rect.y},
		p: gameState.players[index ^ 1].rect.y
	})
}

const updateState = (gameState, deltaTime) => {
	updateBall(gameState.ball, deltaTime)
	if (gameState.ball.rect.x < 100 && paddleCollision(gameState.ball.rect, gameState.players[0].rect)) {
		bounceBall(gameState.ball, current, 'right')
	} else if (gameState.ball.rect.x > 700 && paddleCollision(gameState.ball.rect, gameState.players[1].rect)) {
		bounceBall(gameState.ball, current, 'left')
	}

	if (gameState.ball.rect.y < 0 || gameState.ball.rect.y + gameState.ball.rect.height > 600) {
		gameState.ball.angle *= -1
		gameState.ball.velocity = getVelocity(gameState.ball.angle, gameState.ball.speed)
		// gameState.ball.velocity.dx += 0.3
	} else if (gameState.ball.rect.x < 0) {
		gameState.players[1].score++
		gameState.ball = resetBall()
	} else if (gameState.ball.rect.x > 800) {
		gameState.players[0].score++
		gameState.ball = resetBall()
	}
}

module.exports = { updatePacket, updateState }