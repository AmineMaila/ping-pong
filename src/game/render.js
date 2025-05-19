const halfPaddle = 30
const halfBall = 5

export const render = (ctx, gameState) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) // clears the canvas
	ctx.fillStyle = 'white' // fill color
	ctx.strokeStyle = 'white' // stroke color
	

	// player 1 paddle
	ctx.fillRect(
		gameState.paddles.player1.rect.x,
		gameState.paddles.player1.rect.y - halfPaddle,
		gameState.paddles.player1.rect.width,
		gameState.paddles.player1.rect.height
	)

	// player 2 paddle
	ctx.fillRect(
		gameState.paddles.player2.rect.x, // pos x
		gameState.paddles.player2.rect.y - halfPaddle, // pos y
		gameState.paddles.player2.rect.width, // width
		gameState.paddles.player2.rect.height // height
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
	ctx.fillRect(
		gameState.ball.rect.x - halfBall,
		gameState.ball.rect.y - halfBall,
		gameState.ball.rect.width,
		gameState.ball.rect.height
	)
}

export default render