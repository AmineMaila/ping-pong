import { useEffect, useState, useRef } from "react"
import { initGame, stopGame } from './game/engine'

const App = () => {
	const canvasRef = useRef(null);
	const [score, setScore] = useState({ player1: 0, player2: 0 })
	const gameState = useRef(null)

	useEffect(() => {
		const canvas = canvasRef.current;

		gameState.current = initGame(canvas, setScore)

		return () => { stopGame() }
	}, []);

	return (
		<div className="game-container">
			<div className='score-container'>{score.player1}-{score.player2}</div>
			<canvas className='gameCanvas' ref={canvasRef} width={800} height={600} />
		</div>
	)
}

export default App
