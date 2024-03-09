/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");

	const prodBudget = ns.args[0]; // combined design and marketing budget

	if (!prodBudget) {
		throw new Error("Production budget not defined.");
	}

	const corp = eval("ns.corporation");

	const researchNames = {
		marketTA1: 'Market-TA.I',
		marketTA2: 'Market-TA.II',
		capacity1: 'uPgrade: Capacity.I',
		capacity2: 'uPgrade: Capacity.II'
	}

	const DEFAULT_MAX_PRODUCTS = 3;
	const DEFAULT_CITY = "Sector-12";

	const getMaxProducts = (divisionName) => {
		if (corp.hasResearched(divisionName, researchNames.capacity2)) {
			ns.print("Maximum number of product is 5");
			return 5;
		}
		if (corp.hasResearched(divisionName, researchNames.capacity1)) {
			ns.print("Maximum number of product is 4");
			return 4;
		}
		ns.print("Maximum number of product is 3");
		return DEFAULT_MAX_PRODUCTS;
	}

	const getProducts = (divisionName) => {
		const division = corp.getDivision(divisionName);
		ns.tprint("Division name: " + divisionName);
		ns.tprint("products: " + division.products);
		let productsArray = [];
		if (division.produtcs != null) {
			for (let prodId of division.products) {
				ns.tprint("product index = " + prodId);
				const rawProd = corp.getProduct(divisionName, prodId);
				productsArray.push(rawProd);
				/*
				return {
					competition: rawProd.cmp,
					developmentProgress: rawProd.developmentProgress,
					demand: rawProd.dmd,
					name: rawProd.name,
					prodCost: rawProd.pCost,
					sellCost: rawProd.sCost,
					cityData: Object.keys(rawProd.cityData).map(city => {
						const data = rawProd.cityData[city];
						return {
							city,
							inventory: data[0],
							amtProduced: data[1],
							amtSold: data[2]
						}
					})
				}
				*/
			};
		};
		return productsArray;
	}

	const isDevelopingProduct = (products) => {
		ns.print("This division is developing products");
		products.some(prod => Math.round(prod.developmentProgress) < 100);
	};

	const shouldDevelopProduct = (products, maxProducts) =>
		products.length < maxProducts ||
		products.some(prod => {
			const pDemand = prod.demand;
			const pComp = prod.competition;
			return pDemand < pComp;
		})

	const getProductToDiscontinue = (products) => {
		let highestDiff = 0;
		let prodToDiscontinue = undefined;

		for (const prod of products) {
			if (prod.demand > prod.competition) {
				continue; // still producing money
			}
			const diff = Math.abs(prod.demand - prod.competition);
			if (diff > highestDiff) {
				highestDiff = diff;
				prodToDiscontinue = prod;
			}
		}
		ns.print("Product to discontinue = " + prodToDiscontinue);
		return prodToDiscontinue;
	}

	const getMostProductiveCity = (product) => {
		let highestProd = 0;
		let bestCity = undefined;

		for (const city of product.cityData) {
			if (city.amtProduced > highestProd) {
				highestProd = city.amtProduced;
				bestCity = city;
			}
		}
		ns.print("Most productive city = " + bestCity);
		return bestCity?.city || DEFAULT_CITY;
	}

	const sellProduct = (divisionName, cityName, productName) => {
		ns.print("Inside sell product");
		corp.sellProduct(divisionName, cityName, productName, "MAX", "MP", true);

		if (corp.hasResearched(divisionName, researchNames.marketTA1)) {
			corp.setProductMarketTA1(divisionName, productName, true);
		}

		if (corp.hasResearched(divisionName, researchNames.marketTA2)) {
			corp.setProductMarketTA2(divisionName, productName, true);
		}
	}

	const refineProduct = (division, city, product, designBudget, marketBudget) => {
		ns.print("Inside refine product");
		const divisionName = division.name;
		const productName = product.name;

		corp.discontinueProduct(divisionName, productName);
		corp.makeProduct(divisionName, city, productName, designBudget, marketBudget);
		sellProduct(divisionName, city, productName);
	}

	const createProduct = (division, productName, designBudget, marketBudget) => {
		ns.print("Inside create product");
		const divisionName = division;
		corp.makeProduct(divisionName, DEFAULT_CITY, productName, designBudget, marketBudget);
		sellProduct(divisionName, DEFAULT_CITY, productName);
	}

	const developProduct = (division, products, maxProducts) => {
		const budget = prodBudget / 2;

		if (products.length === maxProducts) {
			const lamestProduct = getProductToDiscontinue(products);
			const bestCity = getMostProductiveCity(lamestProduct);
			ns.print(`WARN\t${division.name}: Refining ${lamestProduct.name} @ ${bestCity}`);
			refineProduct(division, bestCity, lamestProduct, budget, budget);
		} else {
			const productName = `prod-${Date.now()}`;
			ns.print(`INFO\t${division.name}: Developing ${productName} @ ${DEFAULT_CITY}`);
			createProduct(division, productName, budget, budget);
		}
	}

	const canDevelopProduct = (business) => business.funds * 0.5 > prodBudget;

	const interval = 5000; // 5s

	while (true) {
		const business = corp.getCorporation();
		ns.print(business.name + " ----------------------------------------");
		for (const div of business.divisions) {
			ns.tprint("***********");
			ns.tprint("Inside " + div);
			//ns.print("Can this division produce? " + div.makesProducts);
			if (div == "Tobacco") {
				ns.tprint(div + " can produce products");
				const products = getProducts(div);

				if ((products != null) && isDevelopingProduct(products)) {
					ns.tprint(`ERROR\t${div.name}: Currently developing a product`);
					continue;
				};

				const maxProducts = getMaxProducts(div);
				ns.tprint("max products = " + maxProducts);
				ns.tprint("product array = " + products);
				ns.tprint("current num of products = " + products.length);
				if (products.length < maxProducts) {
					if (canDevelopProduct(business) && shouldDevelopProduct(products, maxProducts)) {
						ns.tprint("can develop and should develop products");
						developProduct(div, products, maxProducts);
					};
				} else {
					ns.tprint("We have already max number of products");
				}

				ns.tprint(`SUCCESS\t${div.name}: All products are generating money`);
			} else {
				ns.tprint("This division does not produce any products");
			};
			ns.print("***********");
		}
		await ns.sleep(interval);
	}
}