const { Worker, isMainThread, parentPort } = require("worker_threads")

function runLottery() {
	const ticketPrice = 2.5
	const rowsPerWeek = 2
	const weeksPerYear = 52

	let totalCost = 0

	let jackpotWon = false
	let jackpotWinningRow = 0

	let rowsPlayed = 0

	/* 
    
    Based on Tulokset perjantai 23. kesäkuuta 2023
    Voittonumerot 50. Eurojackpot-arvonnalle 2023, joka suoritettiin perjantai 23. kesäkuuta klo 21:00 Keski-Euroopan kesäaikaa (CEST) (20:00 GMT):
    
    */

	let prizeTable = [
		{ numbers: 2, stars: 1, prize: 9.2, hit: 0 },
		{ numbers: 1, stars: 2, prize: 11.2, hit: 0 },
		{ numbers: 3, stars: 0, prize: 16.1, hit: 0 },
		{ numbers: 3, stars: 1, prize: 18.5, hit: 0 },
		{ numbers: 2, stars: 2, prize: 22, hit: 0 },
		{ numbers: 3, stars: 2, prize: 104, hit: 0 },
		{ numbers: 4, stars: 0, prize: 138, hit: 0 },
		{ numbers: 4, stars: 1, prize: 288, hit: 0 },
		{ numbers: 4, stars: 2, prize: 4043, hit: 0 },
		{ numbers: 5, stars: 0, prize: 213920, hit: 0 },
		{ numbers: 5, stars: 1, prize: 2275342, hit: 0 },
		{ numbers: 5, stars: 2, prize: 120000000, hit: 0 },
	]

	// generation code
	const randomStars = () => {
		let stars = []
		while (stars.length < 2) {
			let star = Math.floor(Math.random() * 12) + 1
			if (stars.indexOf(star) === -1) {
				stars.push(star)
			}
		}
		return stars
	}

	const randomNumbers = () => {
		let numbers = []
		while (numbers.length < 5) {
			let number = Math.floor(Math.random() * 50) + 1
			if (numbers.indexOf(number) === -1) {
				numbers.push(number)
			}
		}
		return numbers
	}

	const generateNewRow = () => {
		return {
			numbers: randomNumbers(),
			stars: randomStars(),
		}
	}

	const myRow = generateNewRow()

	while (!jackpotWon) {
		totalCost += ticketPrice
		rowsPlayed++

		// generate lottery numbers
		const row = generateNewRow()

		// check how many winning numbeers and stars we have
		let numbersHit = 0
		let starsHit = 0

		for (let i = 0; i < row.numbers.length; i++) {
			// check if the number is in myNumbers
			if (myRow.numbers.indexOf(row.numbers[i]) !== -1) {
				numbersHit++
			}
		}

		for (let i = 0; i < row.stars.length; i++) {
			// check if the number is in myNumbers
			if (myRow.stars.indexOf(row.stars[i]) !== -1) {
				starsHit++
			}
		}

		// check if we have a prize
		for (let i = 0; i < prizeTable.length; i++) {
			if (
				prizeTable[i].numbers === numbersHit &&
				prizeTable[i].stars === starsHit
			) {
				prizeTable[i].hit++
			}
		}

		// determine if we have a jackpot
		if (numbersHit === 5 && starsHit === 2) {
			jackpotWon = true
			jackpotWinningRow = rowsPlayed
		}

		// if we have a jackpot, print out the winning row
		if (jackpotWon) {
			// years played
			let yearsPlayed = Math.floor(
				jackpotWinningRow / (rowsPerWeek * weeksPerYear)
			)

			// how much money won from other prizes
			let moneyWon = 0

			for (let i = 0; i < prizeTable.length; i++) {
				moneyWon += prizeTable[i].hit * prizeTable[i].prize
			}

			// how much money won in total
			let totalMoneyWon = moneyWon

			// how much money lost
			let moneyLost = totalCost - totalMoneyWon

			// how much money lost per year
			let moneyLostPerYear = moneyLost / yearsPlayed

			// format the numbers
			totalCost = totalCost.toLocaleString()
			moneyWon = moneyWon.toLocaleString()
			moneyLost = moneyLost.toLocaleString()
			moneyLostPerYear = moneyLostPerYear.toLocaleString()

			// Instead of using `console.log`, send the results back to the main script
			parentPort.postMessage({
				myRow,
				totalCost,
				moneyWon,
				moneyLost,
				moneyLostPerYear,
				yearsPlayed,
				prizeTable,
			})

			// end the loop
			break
		}
	}
}

if (!isMainThread) {
	// This block will be executed in the worker thread
	runLottery()
}
