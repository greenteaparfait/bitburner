/** @param {NS} ns **/
import {lookUpServer} from "helpfunc.js";

export async function main(ns) {
	ns.disableLog("ALL");
	const fees = 100000; // 100k commission
	const tradeFees = 2 * fees; // buy + sell transactions
	let overallValue = 0;
    var threads = 1000; // # of treads for manipulating a server
    var manipulate = (ns.args[0] || false );
	var server = "";  // name of a target server to manipulate

	function getStonks() {
		const stockSymbols = ns.stock.getSymbols();
		const stocks = [];
		for (const sym of stockSymbols) {
			const pos = ns.stock.getPosition(sym);
			const stock = {
				sym,
				longShares: pos[0],
				longPrice: pos[1],
				shortShares: pos[2],
				shortPrice: pos[3],
				forecast: ns.stock.getForecast(sym),
				volatility: ns.stock.getVolatility(sym),
				askPrice: ns.stock.getAskPrice(sym),
				bidPrice: ns.stock.getBidPrice(sym),
				maxShares: ns.stock.getMaxShares(sym)
			};
			const longProfit = stock.longShares * (stock.bidPrice - stock.longPrice) - tradeFees;
			const shortProfit = stock.shortShares * (stock.shortPrice - stock.askPrice) - tradeFees;
			stock.profit = longProfit + shortProfit;

			const longCost = stock.longShares * stock.longPrice;
			const shortCost = stock.shortShares * stock.shortPrice;
			stock.cost = longCost + shortCost;
			// 0.6 -> 0.1 (10% - LONG)
			// 0.4 -> 0.1 (10% - SHORT)
			const profitChance = Math.abs(stock.forecast - 0.5); // chance to make profit for either positions
			stock.profitPotential = stock.volatility * profitChance; // potential to get the price movement

			stock.summary = `${stock.sym}: ${stock.forecast.toFixed(3)} +/- ${stock.volatility.toFixed(3)}`;
			stocks.push(stock);
		}

		// Sort by profit potential
		return stocks.sort((a, b) => b.profitPotential - a.profitPotential);
	}

    // Function to determine to hold or to sell in the long position
	function takeLongTendies(stock) {

		if (stock.forecast > 0.5) {   // If a stock price is expected to rise,
			// HOLD
			const curValue = stock.cost + stock.profit
			const roi = ns.formatNumber(100 * (stock.profit / stock.cost), 3, 1000, false);
			ns.print(`INFO\t ${stock.summary} LONG ${ns.formatNumber(curValue, 3, 1000, false)} ${roi}%`);

			// grow a server with the holding stock
			if (manipulate == true) {
				// find a server with stock name
				ns.args[0] = stock.sym
				server = lookUpServer(ns)

				if (server != "") {
					// manipulate to grow
					if ( (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) && ns.hasRootAccess(server) ){
						ns.print("Grow holding target: " + server);
						ns.exec("manipulate-long-grow.js", "home", threads, server);	
						//ns.exec("manipulate-long-hack.js", "home", 30, server);	
						//ns.exec("manipulate-long-weaken.js", "home", 30, server);	
					}
				}
				
			}

			overallValue += curValue;
		} else {    // if the stock price is expected to fall
			// Sell
			const salePrice = ns.stock.sellStock(stock.sym, stock.longShares);
			const saleTotal = salePrice * stock.longShares;
			const saleCost = stock.longPrice * stock.longShares;
			const saleProfit = saleTotal - saleCost - tradeFees;
			stock.shares = 0;
			ns.print(`WARN\t${stock.summary} SOLD for ${ns.formatNumber(saleProfit, 3, 1000, false)} profit`);
		}
	}

    // Function to determine to hold or to sell in both postions
	function takeTendies(stocks) {
		for (const stock of stocks) {
			if (stock.longShares > 0) {
				takeLongTendies(stock);
			}
			// @TODO - Implement takeShortTendies when we have access (BN8)
		}
	}

    // Function to determine which one to buy
	function yolo(stocks) {
		const riskThresh = 20 * fees;

		for (const stock of stocks) {
			const money = ns.getPlayer().money;

			// In the long position
			if (stock.forecast > 0.55) {
				if (money > riskThresh) {
					const sharesWeCanBuy = Math.floor((money - fees) / stock.askPrice);
					const sharesToBuy = Math.min(stock.maxShares, sharesWeCanBuy);
					if (ns.stock.buyStock(stock.sym, sharesToBuy) > 0) {
						ns.print(`WARN\t${stock.summary}\t- LONG @ ${ns.formatNumber(sharesToBuy, 3, 1000, false)}`);

						// if we buy the stock, then manipulate to grow it.
						if (manipulate == true) {

							// find a server with stock name
							ns.args[0] = stock.sym
							server = lookUpServer(ns)

							if (server != "") {
								// manipulate to grow
								if ( (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) && ns.hasRootAccess(server) ){
									ns.print("Grow buying target: " + server);
									ns.exec("manipulate-long-grow.js", "home", threads, server);	
									//ns.exec("manipulate-long-hack.js", "home", 30, server);	
									//ns.exec("manipulate-long-weaken.js", "home", 30, server);	
								}
							}

						}		
					}
				}
			}
			// @TODO sell short when we have access (BN8)
		}
	}

	const tickDuration = 5 * 1000; // ~4s offline, ~6s online (5s compromise)

	while (true) {
		const stocks = getStonks();
		// Determine to hold or to sell
		takeTendies(stocks);
		// Determine which one to buy
		yolo(stocks);
		// Print ovarall value
		ns.print("Stock value: " + ns.formatNumber(overallValue, 3, 1000, false));
		ns.print("");
		overallValue = 0;

		await ns.sleep(tickDuration);
		ns.print("Tick...")
	}

}