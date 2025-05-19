
let inputState = {
	clientPaddlePosition: null,
	client2PaddlePosition: null
}

export const setupInputHandlers = (canvas) => {
	
	const handleMouseMove = (event) => {
		const rect = canvas.getBoundingClientRect()
		const mouseY = event.clientY - rect.top
		
		inputState.clientPaddlePosition = mouseY
		inputState.client2PaddlePosition = mouseY
	}

	canvas.addEventListener('mousemove', handleMouseMove)

	return (() => {
		canvas.removeEventListener('mousemove', handleMouseMove)
	})
}

export const getInputState = () => inputState