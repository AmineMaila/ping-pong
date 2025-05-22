export const setupInputHandlers = (canvas, gameState, socket) => {
	const handleMouseMove = (event) => {
		if (gameState.index === undefined) return
		const rect = canvas.getBoundingClientRect()
		const mouseY = event.clientY - rect.top
		
		socket.send(JSON.stringify({ type: 'paddle', pid: gameState.index, y: mouseY }))
		gameState.players[gameState.index].rect.y = mouseY
	}

	canvas.addEventListener('mousemove', handleMouseMove)

	return (() => {
		canvas.removeEventListener('mousemove', handleMouseMove)
	})
}