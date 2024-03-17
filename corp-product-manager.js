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
		ns.print("line 37, inside getProduct");
		const division = corp.getDivision(divisionName);
		ns.print("Division name: " + divisionName);
		ns.print("products: " + division.products);
/*
		for (let prodId of division.products) {
			const rawProd = corp.getProduct(divisionName, "Sector-12", prodId);
			ns.print("For " + prodId);
			ns.print("	actual sell amount = " + rawProd.actualSellAmount);
			ns.print("	advertising investment = " + rawProd.advertisingInvestment);
			ns.print("	competition = " + rawProd.competition);
			ns.print("	demand = " + rawProd.demand);
			ns.print("	design investment = " + rawProd.designInvestment);
			ns.print("	desired sell amount = " + rawProd.desiredSellAmount);
			ns.print("	desired sell price = " + rawProd.desiredSellPrice);
			ns.print("	development progress = " + rawProd.developmentProgress);
			ns.print("	effective rating = " + rawProd.effectiveRating);
			ns.print("	name = " + rawProd.name);
			ns.print("	production amount = " + rawProd.productionAmount);
			ns.print("	production cost = " + rawProd.productionCost);
			ns.print("	rating = " + rawProd.rating);
			ns.print("	size = " + rawProd.size);
			ns.print("	stats quality = " + rawProd.stats.quality);
			ns.print("	stats performance = " + rawProd.stats.performance);
			ns.print("	stats durability = " + rawProd.stats.durability);
			ns.print("	stats reliability = " + rawProd.stats.reliability);
			ns.print("	stats aesthetics = " + rawProd.stats.aesthetics);
			ns.print("	stats features = " + rawProd.stats.features);
			ns.print("	stored = " + rawProd.stored);
		};
*/
/*		
		let productsArray = [];
		ns.print("line 41,");
		if (division.products != null) {
			ns.print("line 43, inside if");
			for (let prodId of division.products) {
				ns.print("line 44, inside for loop");
				ns.print("product index = " + prodId);
				const rawProd = corp.getProduct(divisionName, "Sector-12", prodId);
				productsArray.push(rawProd);
				
				return {
					competition: rawProd.cmp,
					developmentProgress: rawProd.developmentProgress,
					demand: rawProd.dmd,
					name: rawProd.name,
					produnctionCost: rawProd.pCost,
					sellCost: rawProd.sCost
					/*
					cityData: Object.keys(rawProd.cityData).map(city => {
						const data = rawProd.cityData[city];
						return {
							city,
							inventory: data[0],
							amtProduced: data[1],
							amtSold: data[2]
						};
					})
				};
				
			};
		} else {
			ns.print("division.products is null");
		};
		return productsArray;
	*/
		return division.products;
	};

	function isDeveloping(element, index, array) 
	{  
	   return Math.round(element.developmentProgress) < 100; 
	}  

	const isDevelopingProduct = (products) => {
		return products.some(isDeveloping);
	};

	const shouldDevelopProduct = (products) => {
		products.some(prod => {
			const pDemand = prod.demand;
			const pComp = prod.competition;
			if (pDemand < pComp) {
				ns.print("should develop");
				return true;
			} else {
				ns.print("no need to develop");
				return false;
			};
			//return pDemand < pComp;
		})
	};

	const getProductToDiscontinue = (division, products) => {
		let highestDiff = 0;
		let prodToDiscontinue = undefined;
		let divisionName = corp.getDivision(division).name;

		for (const prod of products) {
			const rawProd = corp.getProduct(divisionName, "Sector-12", prod);
			if (rawProd.demand > rawProd.competition) {
				continue; // still producing money
			};
			const diff = Math.abs(rawProd.demand - rawProd.competition);
			if (diff > highestDiff) {
				highestDiff = diff;
				prodToDiscontinue = rawProd;
			};
		};
		ns.print("Product to discontinue = " + prodToDiscontinue.name);
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
		const divisionName = corp.getDivision(division).name;
		const productName = product.name;

		corp.discontinueProduct(divisionName, productName);
		corp.makeProduct(divisionName, city, productName, designBudget, marketBudget);
		sellProduct(divisionName, city, productName);
	}

	const createProduct = (division, productName, designBudget, marketBudget) => {
		ns.print("Inside create product");
		const divisionName = corp.getDivision(division).name;
		corp.makeProduct(divisionName, DEFAULT_CITY, productName, designBudget, marketBudget);
		sellProduct(divisionName, DEFAULT_CITY, productName);
	}

	const reviseProduct = (division, products) => {
		const budget = prodBudget / 2;
		const lamestProduct = getProductToDiscontinue(division, products);
		//const bestCity = getMostProductiveCity(lamestProduct);
		ns.print("WARN: Refining " + lamestProduct.name + " at Sector-12");
		refineProduct(division, "Sector-12", lamestProduct, budget, budget);
	};

	const canDevelopProduct = (business) => {
		if (business.funds * 0.5 > prodBudget) {
			ns.print("has enough fund for development");
			return true;
		} else {
			ns.print("has insufficient fund for development");
			return false;
		};
	};

	const interval = 5000; // 5s

	while (true) {
		const business = corp.getCorporation();
		ns.print(business.name + " ----------------------------------------");
		for (const div of business.divisions) {
			ns.print("***********");
			ns.print("Inside " + div);
			ns.print("Can this division produce? " + div.makesProducts);
			if (div == "Tobacco") {
				ns.print(div + " can produce products");
				const products = getProducts(div);
				const maxProducts = getMaxProducts(div);
				ns.print("max products = " + maxProducts);
				ns.print("product array = " + products.toString());
				ns.print("current num of products = " + products.length);
				//developProduct(div, products, maxProducts);
				
				if (products.length < maxProducts) {
					if (canDevelopProduct(business) && shouldDevelopProduct(products)) {
						ns.print("can develop and should develop products");
						const productName = `prod-${Date.now()}`;
						const budget = prodBudget / 2;
						ns.print("INFO: Developing " + productName + " at Sector-12");
						createProduct(division, productName, budget, budget);
					} else {
						ns.print("cannot develop or no need to develop");
					};
				} else {
					ns.print("We have already max number of products");
					if (!isDevelopingProduct) {
						ns.print("We have all products out of development");
						ns.print("Revising products...");
						reviseProduct(div, products);
					} else {
						ns.print("There is a product under development");
					};
				};
				
				ns.print(`SUCCESS\t${div}: All products are generating money`);
			} else {
				ns.print("This division does not produce any products");
			};
			ns.print("***********");
		}
		await ns.sleep(interval);
	}
}