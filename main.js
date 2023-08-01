const { Worker } = require("worker_threads")

const numWorkers = 1 // Number of worker threads you want to create

function startLotteryWorker() {
	return new Promise((resolve) => {
		const worker = new Worker("./lottery_worker.js")
		worker.on("message", (result) => {
			resolve(result)
		})
	})
}

async function main() {
	const promises = []

	for (let i = 0; i < numWorkers; i++) {
		promises.push(startLotteryWorker())
	}

	const results = await Promise.all(promises)

	// Now you have the results for each lottery script
	for (let i = 0; i < results.length; i++) {
		const result = results[i]
		const {
			totalCost,
			moneyWon,
			moneyLost,
			moneyLostPerYear,
			yearsPlayed,
			prizeTable,
            myRow
		} = result

		console.log(`Lottery Script ${i + 1}:`)
		console.log(`Money spent: ${totalCost}€`)
		console.log(`Money won: ${moneyWon}€`)
		console.log(`Money lost: -${moneyLost}€`)
		console.log(`Money lost per year: -${moneyLostPerYear}€`)
        console.log(`Years played: ${yearsPlayed}`)
        console.log(`My row: ${myRow.numbers} ${myRow.stars}`)
        console.table(prizeTable)
		console.log("------------------------------------")
	}
}

main()
