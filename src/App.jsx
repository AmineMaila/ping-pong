import { useRef, useEffect } from "react"
import connect from "./game/client";
import { initGame } from "./game/gameloop";
import './index.css'

const App = () => {
  const canvasRef = useRef(null);
	const gameStateRef = useRef(null)
	const socketRef = useRef(null)

	useEffect(() => {
		const disconnect = connect(canvasRef.current, gameStateRef, socketRef)
		const stopGame = initGame(gameStateRef, canvasRef.current)

		return () => {
			disconnect()
			stopGame()
		}
	}, []);

	return (
		<div className="game-container">
			<canvas className='gameCanvas' ref={canvasRef} width={800} height={600} />
		</div>
	)
}

export default App
