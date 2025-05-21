const getVelocity = (angle, speed) => {
	return (
		{
			dx: Math.cos(angle) * speed,
			dy: Math.sin(angle) * speed
		}
	)
}

const initState = () => {
	return ({
		ball: {
			pos: { x: 400, y: 300 },
			speed: 10,
			angle: 4.16332,
			 // precalculated values
			velocity: { dx: -5.218932854607728, dy: -8.530107845689644 }
		},
		players: [
			{
				pos: { x: 30, y: 300 },
				score: 0
			},
			{
				pos: { x: 770, y: 300 },
				score: 0
			}
		]
	})
}

const updateState = (state) => {

}

module.exports = { initState }