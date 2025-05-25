const halfPaddle = 30
const halfBall = 5

const lerp = (delayed, current, factor) => {
	return (delayed + (current - delayed) * factor)
}

export const update = (gameState, deltaTime) => {
	gameState.ball.x += gameState.ball.dx * deltaTime
	gameState.ball.y += gameState.ball.dy * deltaTime

	if (gameState.ball.y - halfBall < 0) {
		gameState.ball.y = halfBall
		gameState.ball.dy *= -1
	} else if (gameState.ball.y + halfBall > 600) {
		gameState.ball.y = 600 - halfBall
		gameState.ball.dy *= -1
	}

	const timeSinceSync = performance.now() - gameState.ball.lastServerSync

	// correct if sync is recent
	if (timeSinceSync < 500) {
		const correctionFactor = Math.min(0.02, deltaTime * 2)
		gameState.ball.x = lerp(gameState.ball.x, gameState.ball.serverX, correctionFactor)
		gameState.ball.y = lerp(gameState.ball.y, gameState.ball.serverY, correctionFactor)
	}

	gameState.players[gameState.index ^ 1].rect.y = lerp(
		gameState.players[gameState.index ^ 1].rect.y,
		gameState.serverPlayerY,
		0.5
	)
}

export const render = (ctx, gameState) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) // clears the canvas
	ctx.fillStyle = 'white' // fill color
	ctx.strokeStyle = 'white' // stroke color
	
	ctx.font = '85px "AtariPongScore"';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(gameState.players[0].score, ctx.canvas.width * 0.3, 80)
	ctx.fillText(gameState.players[1].score, ctx.canvas.width * 0.7, 80)

	// player 1 paddle
	ctx.fillRect(
		gameState.players[0].rect.x - 5,
		gameState.players[0].rect.y - halfPaddle,
		gameState.players[0].rect.width,
		gameState.players[0].rect.height
	)

	// player 2 paddle
	ctx.fillRect(
		gameState.players[1].rect.x - 5, // pos x
		gameState.players[1].rect.y - halfPaddle, // pos y
		gameState.players[1].rect.width, // width
		gameState.players[1].rect.height // height
	)

	// dashed line
	ctx.setLineDash([10, 12]) // dash - gap
	ctx.lineWidth = 2
	ctx.beginPath() // resets the pen position
	ctx.moveTo(ctx.canvas.width / 2, 0) // moves the pen to a new position without drawing
	ctx.lineTo(ctx.canvas.width / 2, ctx.canvas.height) // draws line from prev pos to new pos and updates pos
	ctx.stroke() // sets the outline color to the previously set stroke color
	ctx.setLineDash([]) // resets the lineDash so that new drawn stuff doesn't draw line dash

	// ball
	// console.log('ball before render: ', gameState.ball)
	ctx.fillRect(
		gameState.ball.x - halfBall,
		gameState.ball.y - halfBall,
		gameState.ball.width,
		gameState.ball.height
	)

	ctx.font = '24px "Serious2b"';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	if (gameState.gameStatus === 'connecting') {
		ctx.fillText('Connecting...', ctx.canvas.width / 2, ctx.canvas.height / 2);
	} else if (gameState.gameStatus === 'waiting') {
		ctx.fillText('waiting for opponent...', ctx.canvas.width / 2, ctx.canvas.height / 2);
	} else if (gameState.gameStatus === 'ready') {
		ctx.fillText(
			'You',
			gameState.players[gameState.index].rect.x,
			gameState.players[gameState.index].rect.y - 80
		)
	}
}
