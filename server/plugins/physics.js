const maxBounceAngle = 0.785398 // RAD / 45 degrees
const BALL_RADIUS = 5
const PADDLE_RADIUS = 5

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

const resetBall = (ball) => {
	ball.rect.x = 400
	ball.rect.y = 300
	ball.angle = 4.16332
	ball.speed = 12
	ball.velocity = getVelocity(4.16332, 12)
	ball.dir = 'left'
}

const updateBall = (ball) => {
	 // hardcode deltaTime since server is only for generating data
	return ({
		...ball,
		rect: {
			x: ball.rect.x + ball.velocity.dx * 16.6667,
			y: ball.rect.y + ball.velocity.dy * 16.6667,
		}
	})
}

const updateState = (gameState, broadcast) => {
	const newBall = updateBall(gameState.ball)

	// check bounce off left paddle
	if (newBall.rect.x < 100 && paddleCollision(newBall.rect, gameState.players[0].rect)) {
		gameState.ball.rect.x = gameState.players[0].rect.x + PADDLE_RADIUS
		bounceBall(gameState.ball, gameState.players[0].rect)
		return broadcast({
			type: 'collision',
			b: {
				x: gameState.ball.rect.x,
				y: gameState.ball.rect.y,
				dx: gameState.ball.velocity.dx,
				dy: gameState.ball.velocity.dy
			}
		})
	}
	
	// check bounce off right paddle
	if (newBall.rect.x > 700 && paddleCollision(newBall.rect, gameState.players[1].rect)) {
		gameState.ball.rect.x = gameState.players[1].rect.x - PADDLE_RADIUS
		bounceBall(gameState.ball, gameState.players[1].rect)
		return broadcast({
			type: 'collision',
			b: {
				x: gameState.ball.rect.x,
				y: gameState.ball.rect.y,
				dx: gameState.ball.velocity.dx,
				dy: gameState.ball.velocity.dy
			}
		})
	}
	
	// top wall bounce
	if (newBall.y - BALL_RADIUS < 0) {
		newBall.y = BALL_RADIUS
		gameState.ball.angle *= -1
		gameState.ball.velocity.dy *= -1
		// gameState.ball.velocity = getVelocity(gameState.ball.angle, gameState.ball.speed)
		// gameState.ball.velocity.dx += newBall.dir === 'left' ? 2 : -2
		gameState.ball.rect = newBall
		return
	}

	// bottom wall bounce
	if (newBall.y + BALL_RADIUS > 600) {
		newBall.y = 600 - BALL_RADIUS
		gameState.ball.angle *= -1
		gameState.ball.velocity *= -1
		// gameState.ball.velocity = getVelocity(gameState.ball.angle, gameState.ball.speed)
		// gameState.ball.velocity.dx += newBall.dir === 'left' ? 2 : -2
		gameState.ball.rect = newBall
		return
	}

	// right player scored
	if (newBall.rect.x < 0) {
		gameState.players[1].score++
		console.log('x < 0 | NewBall: ', newBall)
		resetBall(gameState.ball)
		console.log('resetBall: ', gameState.ball)
		broadcast({
			type: 'score',
			b: {
				x: gameState.ball.rect.x,
				y: gameState.ball.rect.y,
				dx: gameState.ball.velocity.dx,
				dy: gameState.ball.velocity.dy
			},
			s: [gameState.players[0].score, gameState.players[1].score]
		})
		return
	}
	
	// left player scored
	if (newBall.rect.x > 800) {
		gameState.players[0].score++
		console.log('x > 800 | NewBall: ', newBall)
		resetBall(gameState.ball)
		console.log('resetBall: ', gameState.ball)
		broadcast({
			type: 'score',
			b: {
				x: gameState.ball.rect.x,
				y: gameState.ball.rect.y,
				dx: gameState.ball.velocity.dx,
				dy: gameState.ball.velocity.dy
			},
			s: [gameState.players[0].score, gameState.players[1].score]
		})
		return
	}

	gameState.ball.rect = newBall
}

module.exports = { getVelocity, updateState }