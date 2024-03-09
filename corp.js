/** @param {NS} ns **/
export async function main(ns) {

	ns.disableLog("disableLog"); ns.disableLog("sleep");

	if (!ns.getPlayer().hasCorporation) {
		ns.corporation.createCorporation("MyCorp");
	}
	var corp = ns.corporation.getCorporation();

	if (corp.divisions.length < 1) {
		// initial Company setup
		
		ns.corporation.expandIndustry("Tobacco", "Tobacco");
		ns.print("line 18, Name of division[0] = " + corp.division[0]);
		//initialCorpUpgrade(ns);
		//initCities(ns, corp.divisions[0]);
	}
<<<<<<< HEAD

	// temporarily commnented
	//initCities(ns, corp.divisions[0]);
=======

	if(!ns.corporation.hasUnlock("Office API")) {
		ns.corporation.purchaseUnlock("Office API");
	};
	if(!ns.corporation.hasUnlock("Export")) {
		ns.corporation.purchaseUnlock("Export");
	};
	if(!ns.corporation.hasUnlock("Smart Supply")) {
		ns.corporation.purchaseUnlock("Smart Supply");
	};
	if(!ns.corporation.hasUnlock("Market Research - Demand")) {
		ns.corporation.purchaseUnlock("Market Research - Demand");
	};
	if(!ns.corporation.hasUnlock("Market Data - Competition")) {
		ns.corporation.purchaseUnlock("Market Data - Competition");
	};
	if(!ns.corporation.hasUnlock("VeChain")) {
		ns.corporation.purchaseUnlock("VeChain");
	};
	/*
	if(!ns.corporation.hasUnlock("Shady Accounting")) {
		ns.corporation.purchaseUnlock("Shady Accounting");
	};
	if(!ns.corporation.hasUnlock("Government Partnership")) {
		ns.corporation.purchaseUnlock("Government Partnership");
	};
	*/
	if(!ns.corporation.hasUnlock("Warehouse API")) {
		ns.corporation.purchaseUnlock("Warehouse API");
	};

	initCities(ns, corp.divisions[0]);

	while (true) {
		corp = ns.corporation.getCorporation();

		for (const division of corp.divisions.reverse()) {

			ns.tprint("line 24, Corp: Warehouse Upgrade");
            upgradeWarehouses(ns, division);
>>>>>>> 30e9d1ebaecaae912b23a8df56b72db9f28aac44

	while (true) {	
/*
		if(!ns.corporation.hasUnlock("Office API") && ns.corporation.getCorporation().funds() >= ns.corporation.getUpgradeLevelCost("Office API")) {
			ns.corporation.purchaseUnlock("Office API");
		};
	
		if(!ns.corporation.hasUnlock("Warehouse API") && ns.corporation.getCorporation().funds() >= ns.corporation.getUpgradeLevelCost("Warehouse API")) {
			ns.corporation.purchaseUnlock("Warehouse API");
		};
	
		if(!ns.corporation.hasUnlock("Export") && ns.corporation.getCorporation().funds() >= ns.corporation.getUpgradeLevelCost("Export")) {
			ns.corporation.purchaseUnlock("Export");
		};
		if(!ns.corporation.hasUnlock("Smart Supply") && ns.corporation.getCorporation().funds() >= ns.corporation.getUpgradeLevelCost("Smart Supply")) {
			ns.corporation.purchaseUnlock("Smart Supply");
		};
		if(!ns.corporation.hasUnlock("Market Research - Demand") && ns.corporation.getCorporation().funds() >= ns.corporation.getUpgradeLevelCost("Market Research - Demand")) {
			ns.corporation.purchaseUnlock("Market Research - Demand");
		};
		if(!ns.corporation.hasUnlock("Market Data - Competition") && ns.corporation.getCorporation().funds() >= ns.corporation.getUpgradeLevelCost("Market Data - Competition")) {
			ns.corporation.purchaseUnlock("Market Data - Competition");
		};
		if(!ns.corporation.hasUnlock("VeChain") && ns.corporation.getCorporation().funds() >= ns.corporation.getUpgradeLevelCost("VeChain")) {
			ns.corporation.purchaseUnlock("VeChain");
		};
		/*
		if(!ns.corporation.hasUnlock("Shady Accounting")) {
			ns.corporation.purchaseUnlock("Shady Accounting");
		};
		if(!ns.corporation.hasUnlock("Government Partnership")) {
			ns.corporation.purchaseUnlock("Government Partnership");
		};
		*/

		for (const division of corp.divisions.reverse()) {
			ns.print("line 60: division name = " + division)
			hireEmployees(ns, division);
			//newProduct(ns, division);
            upgradeWarehouses(ns, division);
			//upgradeCorp(ns);
			//doResearch(ns, division);
		}
		/*
		if (corp.divisions.length < 2 && corp.numShares == corp.totalShares) {
<<<<<<< HEAD
			if (corp.divisions[0].products != null) {
				if (Object.keys(corp.divisions[0].products).length > 2) {
					trickInvest(ns, corp.divisions[0]);
				}
=======
			if (corp.divisions[0].productNumbers.length > 2) {
				trickInvest(ns, corp.divisions[0]);
>>>>>>> 30e9d1ebaecaae912b23a8df56b72db9f28aac44
			}
		}
		*/
		ns.print("line 86, sleep for 5sec");
		ns.print("---------------------------------");
		await ns.sleep(5000);
	}
}

function hireEmployees(ns, division, productCity = "Sector-12") {
	//ns.print("line 91, Hire Employees");
	var employees = ns.corporation.getOffice(division, productCity).numEmployees;
	
	if (ns.corporation.getCorporation().funds > (cities.length * ns.corporation.getOfficeSizeUpgradeCost(division, productCity, 3))) {
		ns.print("line 93, corporation funds " + ns.corporation.getCorporation().funds);
		ns.print("line 94, office upgrade cost " + cities.length*ns.corporation.getOfficeSizeUpgradeCost(division, productCity, 3));
		// if fund is enough upgrade officesize and employ 3 employees
		for (const city of cities) {
			ns.print("line 89, upgrading offices of all cities")
			ns.corporation.upgradeOfficeSize(division, city, 3);
			for (var i = 0; i < 3; i++) {
				ns.print("line 91, in " + city + ", hiring new employee");
				ns.corporation.hireEmployee(division, city);
			}
		}

		// set jobs after hiring people just in case we hire lots of people at once and setting jobs is slow
		for (const city of cities) {
			employees = ns.corporation.getOffice(division, city).numEmployees;
			if (ns.corporation.hasResearched(division, "Market-TA.II")) {
				ns.print("line 109, ");
				// TODO: Simplify here. ProductCity config can always be used
				if (city == productCity) {
					ns.corporation.setAutoJobAssignment(division, city, "Operations", Math.ceil(employees / 5));
					ns.corporation.setAutoJobAssignment(division, city, "Engineer", Math.ceil(employees / 5));
					ns.corporation.setAutoJobAssignment(division, city, "Business", Math.ceil(employees / 5));
					ns.corporation.setAutoJobAssignment(division, city, "Management", Math.ceil(employees / 10));
					var remainingEmployees = employees - (3 * Math.ceil(employees / 5) + Math.ceil(employees / 10));
					ns.corporation.setAutoJobAssignment(division, city, "Training", Math.ceil(remainingEmployees));
				}
				else {
					ns.corporation.setAutoJobAssignment(division, city, "Operations", Math.floor(employees / 10));
					ns.corporation.setAutoJobAssignment(division, city, "Engineer", 1);
					ns.corporation.setAutoJobAssignment(division, city, "Business", Math.floor(employees / 5));
					ns.corporation.setAutoJobAssignment(division, city, "Management", Math.ceil(employees / 100));
					ns.corporation.setAutoJobAssignment(division, city, "Research & Development", Math.ceil(employees / 2));
					var remainingEmployees = employees - (Math.floor(employees / 5) + Math.floor(employees / 10) + 1 + Math.ceil(employees / 100) + Math.ceil(employees / 2));
					ns.corporation.setAutoJobAssignment(division, city, "Training", Math.floor(remainingEmployees));
				}
			}
			else {
				ns.print("line 130, assignment in product city");
				if (city == productCity) {
					ns.print("line 127");
					ns.corporation.setAutoJobAssignment(division, city, "Operations", Math.floor((employees - 2) / 2));
					ns.corporation.setAutoJobAssignment(division, city, "Engineer", Math.ceil((employees - 2) / 2));
					ns.corporation.setAutoJobAssignment(division, city, "Management", 2);
				}
				else {
					ns.print("line 138, assignment in other cities");
					ns.corporation.setAutoJobAssignment(division, city, "Operations", 1);
					ns.corporation.setAutoJobAssignment(division, city, "Engineer", 1);
					ns.corporation.setAutoJobAssignment(division, city, "Research & Development", (employees - 2));
				}
			}
		}

	}
	
}

function upgradeWarehouses(ns, division) {
	//ns.print("line 147, Warehouse Upgrade");
	for (const city of cities) {
		//ns.print("line152, in upgradeWarehouses: " + city)
		// check if warehouses are near max capacity and upgrade if needed

		if ( ns.corporation.hasWarehouse(division, city) == true) {
			//ns.print("line 156, In upgradeWarehouses: " + division);
			var cityWarehouse = ns.corporation.getWarehouse(division, city);
			if (cityWarehouse.sizeUsed > 0.9 * cityWarehouse.size) {
				if (ns.corporation.getCorporation().funds > ns.corporation.getUpgradeWarehouseCost(division, city)) {
					ns.print("line 160, " + division + " Upgrade warehouse in " + city);
					ns.corporation.upgradeWarehouse(division, city);
				}
			}
		}

	}
	if (ns.corporation.getUpgradeLevel("Wilson Analytics") > 20) {
		// Upgrade AdVert.Inc after a certain amount of Wilson Analytivs upgrades are available
		if (ns.corporation.getCorporation().funds > (4 * ns.corporation.getHireAdVertCost(division))) {
			ns.print("line 170, " + division + " Hire AdVert");
			ns.corporation.hireAdVert(division);
		}
	}
}

function upgradeCorp(ns) {
	ns.print("line 172, Upgrade Corp");
	for (const upgrade of upgradeList) {
		ns.print("line178, in upgradeCorp: " + upgrade.name)
		// purchase upgrades based on available funds and priority; see upgradeList
		if (ns.corporation.getCorporation().funds > (upgrade.prio * ns.corporation.getUpgradeLevelCost(upgrade.name))) {
			// those two upgrades ony make sense later once we can afford a bunch of them and already have some base marketing from DreamSense
			if ((upgrade.name != "ABC SalesBots" && upgrade.name != "Wilson Analytics") || (ns.corporation.getUpgradeLevel("DreamSense") > 20)) {
				ns.print("line 183, Upgrade " + upgrade.name + " to " + (ns.corporation.getUpgradeLevel(upgrade.name) + 1));
				ns.corporation.levelUpgrade(upgrade.name);
			}
		} else {
			ns.print("line 187, upgrade " + upgrade.name + " is too expensive")
		}
	}
	if (!ns.corporation.hasUnlock("Shady Accounting") && ns.corporation.getUnlockCost("Shady Accounting") * 2 < ns.corporation.getCorporation().funds) {
		ns.print("line 191, Unlock Shady Accounting")
		ns.corporation.unlockUpgrade("Shady Accounting");
	}
	else if (!ns.corporation.hasUnlock("Government Partnership") && ns.corporation.getUnlockCost("Government Partnership") * 2 < ns.corporation.getCorporation().funds) {
		ns.print("line 195, Unlock Government Partnership")
		ns.corporation.unlockUpgrade("Government Partnership");
	}
}

function trickInvest(ns, division, productCity = "Sector-12") {
	//ns.print("line 147, Prepare to trick investors")
	for (var product of division.products) {
		// stop selling products
		ns.corporation.sellProduct(division.name, productCity, product, "0", "MP", true);
	}

	for (const city of cities) {
		// put all employees into production to produce as fast as possible
		const employees = ns.corporation.getOffice(division.name, city).employees.length;

		ns.corporation.setAutoJobAssignment(division.name, city, "Engineer", 0);
		ns.corporation.setAutoJobAssignment(division.name, city, "Management", 0);
		ns.corporation.setAutoJobAssignment(division.name, city, "Research & Development", 0);
		ns.corporation.setAutoJobAssignment(division.name, city, "Operations", employees - 2); // workaround for bug
		ns.corporation.setAutoJobAssignment(division.name, city, "Operations", employees - 1); // workaround for bug
		ns.corporation.setAutoJobAssignment(division.name, city, "Operations", employees);
	}

	ns.print("line 219, Wait for warehouses to fill up")
	//ns.print("Warehouse usage: " + refWarehouse.sizeUsed + " of " + refWarehouse.size);
	let allWarehousesFull = false;
	while (!allWarehousesFull) {
		allWarehousesFull = true;
		for (const city of cities) {
			if (ns.corporation.getWarehouse(division.name, city).sizeUsed <= (0.98 * ns.corporation.getWarehouse(division.name, city).size)) {
				allWarehousesFull = false;
				break;
			}
		}
		ns.sleep(5000);
	}
	//ns.print("line 178, Warehouses are full, start selling");

	var initialInvestFunds = ns.corporation.getInvestmentOffer().funds;
	//ns.print("line 181, Initial investmant offer: " + ns.nFormat(initialInvestFunds, "0.0a"));
	for (const city of cities) {
		// put all employees into business to sell as much as possible
		const employees = ns.corporation.getOffice(division.name, city).employees.length;
		ns.corporation.setAutoJobAssignment(division.name, city, "Operations", 0);
		ns.corporation.setAutoJobAssignment(division.name, city, "Business", employees - 2); // workaround for bug
		ns.corporation.setAutoJobAssignment(division.name, city, "Business", employees - 1); // workaround for bug
		ns.corporation.setAutoJobAssignment(division.name, city, "Business", employees);
	}
	for (var product of division.products) {
		// sell products again
		ns.corporation.sellProduct(division.name, productCity, product, "MAX", "MP", true);
	}

	while (ns.corporation.getInvestmentOffer().funds < (4 * initialInvestFunds)) {
		// wait until the stored products are sold, which should lead to huge investment offers
		ns.sleep(200);
	}

	ns.print("line 254, Investment offer for 10% shares: " + ns.nFormat(ns.corporation.getInvestmentOffer().funds, "0.0a"));
	ns.print("line 255, Funds before public: " + ns.nFormat(ns.corporation.getCorporation().funds, "0.0a"));

	ns.corporation.goPublic(800e6);

	ns.print(" line 259, Funds after  public: " + ns.nFormat(ns.corporation.getCorporation().funds, "0.0a"));

	for (const city of cities) {
		// set employees back to normal operation
		const employees = ns.corporation.getOffice(division.name, city).employees.length;
		ns.corporation.setAutoJobAssignment(division.name, city, "Business", 0);
		if (city == productCity) {
			ns.corporation.setAutoJobAssignment(division.name, city, "Operations", 1);
			ns.corporation.setAutoJobAssignment(division.name, city, "Engineer", (employees - 2));
			ns.corporation.setAutoJobAssignment(division.name, city, "Management", 1);
		}
		else {
			ns.corporation.setAutoJobAssignment(division.name, city, "Operations", 1);
			ns.corporation.setAutoJobAssignment(division.name, city, "Research & Development", (employees - 1));
		}
	}

	// with gained money, expand to the most profitable division
	ns.corporation.expandIndustry("Healthcare", "Healthcare");
	initCities(ns, ns.corporation.getCorporation().divisions[1]);
}

function doResearch(ns, division) {
	ns.print("line 276, Research");
	const laboratory = "Hi-Tech R&D Laboratory"
	const marketTAI = "Market-TA.I";
	const marketTAII = "Market-TA.II";
	if (!ns.corporation.hasResearched(division, laboratory)) {
		// always research labaratory first
		if (division.research > ns.corporation.getResearchCost(division, laboratory)) {
			ns.print("line 288, " + division.name + " Research " + laboratory);
			ns.corporation.research(division.name, laboratory);
		}
	}
	else if (!ns.corporation.hasResearched(division, marketTAII)) {
		// always research Market-TA.I plus .II first and in one step
		var researchCost = ns.corporation.getResearchCost(division, marketTAI)
			+ ns.corporation.getResearchCost(division, marketTAII);

		if (division.research > researchCost * 1.1) {
			ns.print("line 298, " + division + " Research " + marketTAI);
			ns.corporation.research(division, marketTAI);
			ns.print("line 300, " + division + " Research " + marketTAII);
			ns.corporation.research(division, marketTAII);
			for (var product of division.products) {
				ns.corporation.setProductMarketTA1(division, product, true);
				ns.corporation.setProductMarketTA2(division, product, true);
			}
		}
		return;
	}
	else {
		for (const researchObject of researchList) {
			// research other upgrades based on available funds and priority; see researchList
			if (!ns.corporation.hasResearched(division, researchObject.name)) {
				if (division.research > (researchObject.prio * ns.corporation.getResearchCost(division, researchObject.name))) {
					ns.print("line 314, " + division + " Research " + researchObject.name);
					ns.corporation.research(division, researchObject.name);
				}
			}
		}
	}
}

function newProduct(ns, division) {
	ns.print("line 321, New Product");
	var maxNumProducts = 3;
	var productNumbers = [];
	var newProductNumber = 0;
	var productInvest = 1e6;

<<<<<<< HEAD
	// In case this script was run again while the coporation operates already,
	// If product-0, product-1, product-2 exist already but they are not generated through this script, renew division.products by makeProducts
	if (division.products == null) {
		if ( ns.corporation.getProduct(division, "Sector-12", "product-0") != null) {
			productNumbers.push("0")
		};
		if ( ns.corporation.getProduct(division, "Sector-12", "product-1") != null) {
			productNumbers.push("1")	
		};
		if ( ns.corporation.getProduct(division, "Sector-12", "product-2") != null) {
			productNumbers.push("2")		
		};
=======
	var productNumbers = division.productNumbers;
	var numProducts = 3;
	var newProductNumber = 0;

	if (Array.isArray(division.products)) {
		ns.tprint("line 273, Products: " + division.products);

		for (var product of division.products) {
			ns.tprint("line 276: product of division.products = " + product);
			// if a product is still under development, pass it
			if (ns.corporation.getProduct(division, product).developmentProgress < 100) {
				ns.tprint(division + " Product development progress: " + ns.corporation.getProduct(division, product).developmentProgress.toFixed(1) + "%");
				return false;
			}  // if a product development is done, sell the product
			else {
				productNumbers.push(product.charAt(product.length - 1));
				ns.tprint("line 283: productNumbers = " + productNumbers);
				ns.tprint("line 284: product = " + product);
				ns.tprint("line 285: product.length = " + product.length);
				ns.tprint("line 286: product.charAt(product.length -1) = " + product.charAt(product.length - 1));
				ns.tprint("line 287: product numbers = " + productNumbers);
				// initial sell value if nothing is defined yet is 0
				if (ns.corporation.getProduct(division, product).sCost == 0) {
					ns.tprint("line 290, " + division + " Start selling product " + product);
					ns.corporation.sellProduct(division, "Sector-12", product, "MAX", "MP", true);
					if (ns.corporation.hasResearched(division, "Market-TA.II")) {
						ns.corporation.setProductMarketTA1(division, product, true);
						ns.corporation.setProductMarketTA2(division, product, true);
					}
				}
			}
		}
>>>>>>> 30e9d1ebaecaae912b23a8df56b72db9f28aac44
	} else {
	};

	// amount of products which can be sold in parallel is 3; can be upgraded
	if (ns.corporation.hasResearched(division, "uPgrade: Capacity.I")) {
		maxNumProducts++;
		if (ns.corporation.hasResearched(division, "uPgrade: Capacity.II")) {
			maxNumProducts++;
		}
	}

<<<<<<< HEAD
	//* temperarily commented *//
	//discontinue the oldest product if over max amount of products
	//if (productNumbers.length >= maxNumProducts) {
	//	ns.print("line 348, " + division + " Discontinue product " + division.products.get("product-0"));
	//	ns.corporation.discontinueProduct(division, division.products.get("product-0"));
	//}

	// get the product number of the latest product and increase it by 1 for the mext product. Product names must be unique.
=======
	//discontinue the oldest product if over max amount of products
	if (productNumbers.length >= numProducts) {
		ns.tprint("line 314, " + division + " Discontinue product " + division.products[0]);
		ns.corporation.discontinueProduct(division, division.products[0]);
	}

	// get the product number of the latest product and increase it by 1 for the mext product. Product names must be unique.
	ns.tprint("line 320: division.products = " + division.products)
>>>>>>> 30e9d1ebaecaae912b23a8df56b72db9f28aac44
	if (productNumbers.length > 0) {
		ns.print("line 354: productNubmers = " + productNumbers);
		newProductNumber = parseInt(productNumbers[productNumbers.length - 1]) + 1;
		ns.print("line 356: newProductNumber = " + newProductNumber);
		// cap product numbers to one digit and restart at 0 if > 9.
		if (newProductNumber > 9) {
			newProductNumber = 0;
		}
	}

	const newProductName = "Product-" + newProductNumber.toString();
	ns.print("line 364: new product name = " + newProductName);
	if (ns.corporation.getCorporation().funds < (2 * productInvest)) {
		if (ns.corporation.getCorporation().funds <= 0) {
			ns.print("line 368, WARN negative funds, cannot start new product development " + ns.nFormat(ns.corporation.getCorporation().funds, "0.0a"));
			return;
			// productInvest = 0; // product development with 0 funds not possible if corp has negative funds
		}
		else {
			productInvest = Math.floor(ns.corporation.getCorporation().funds / 2);
		}
	}

<<<<<<< HEAD
	ns.print("line 394, " + productNumbers.length);
	if (productNumbers.length < maxNumProducts) {
		ns.print("line 378, Start new product development " + newProductName);
		ns.corporation.makeProduct(division, "Sector-12", newProductName, productInvest, productInvest);
	};

	for (var productNumber of productNumbers) {
		var product = ns.corporation.getProduct(division, "Sector-12", "product-" + productNumber.toString());
		ns.print("line 383, product-" + productNumber);
		// if a product is still under development, pass it
		if (product.developmentProgress < 100) {
			ns.print("line 386, " + division + " Product development progress: " + product.developmentProgress.toFixed(1) + "%");
			return false;
		}  // if a product development is done, sell the product
		else {
			//productNumbers.push(product.charAt(product.length - 1));
			// initial sell value if nothing is defined yet is 0
			if (product.sCost == 0) {
				ns.print("line 393, " + division + " Start selling product-" + productNumber.toString());
				ns.corporation.sellProduct(division, "Sector-12", product, "MAX", "MP", true);
				if (ns.corporation.hasResearched(division, "Market-TA.II")) {
					ns.corporation.setProductMarketTA1(division, product, true);
					ns.corporation.setProductMarketTA2(division, product, true);
				}
			}
		}
=======
	if (productNumbers.length < numProducts) {
		ns.tprint("line 345, " + productNumbers);
		ns.tprint("line 346, " + newProductName);
		if ( newProductNumber > productNumbers + 1 ) {
			ns.tprint("Start new product development " + newProductName);
			ns.corporation.makeProduct(division, "Sector-12", newProductName, productInvest, productInvest);
		};
>>>>>>> 30e9d1ebaecaae912b23a8df56b72db9f28aac44
	}
	

}

function initCities(ns, division, productCity = "Sector-12") {

	for (const city of cities) {
<<<<<<< HEAD
		if (city != "Sector-12") {

			ns.print("line 410, Expand " + division + " to City " + city);
			ns.corporation.expandCity(division, city);
			ns.corporation.purchaseWarehouse(division, city);
			ns.corporation.setSmartSupply(division, city, true); // does not work anymore, bug?
=======
		if (city == "Sector-12") {
			ns.tprint("line 358, Expand " + division + " to City " + city);
			
			//ns.corporation.expandCity(division, city);
			//ns.corporation.purchaseWarehouse(division, city);
			//ns.corporation.setSmartSupply(division.name, city, true); // does not work anymore, bug?
>>>>>>> 30e9d1ebaecaae912b23a8df56b72db9f28aac44
			
			var unhired_employees = ns.corporation.getOffice(division, city).remainingEmployees;

			if (city != productCity) {
				// setup employees
				for (let i = 0; i < 3; i++) {
					ns.corporation.hireEmployee(division, city);
				}
				if ( unhired_employees >= 3) {
					ns.corporation.setAutoJobAssignment(division, city, "Research & Development", 3);
				};
			}
			else {
				const warehouseUpgrades = 3;
				// get a bigger warehouse in the product city. we can produce and sell more here
				for (let i = 0; i < warehouseUpgrades; i++) {
					ns.corporation.upgradeWarehouse(division, city);
				}
				// get more employees in the main product development city
				const newEmployees = 9;
				ns.corporation.upgradeOfficeSize(division, productCity, newEmployees);
				for (let i = 0; i < newEmployees + 3; i++) {
					ns.corporation.hireEmployee(division, productCity);
				};
				if ( unhired_employees >= 4) {
					ns.corporation.setAutoJobAssignment(division, productCity, "Operations", 4);
				};
				if ( unhired_employees >= 6) {
					ns.corporation.setAutoJobAssignment(division, productCity, "Engineer", 6);
				};
				if ( unhired_employees >= 2) {
					ns.corporation.setAutoJobAssignment(division, productCity, "Management", 2);
				};
			}
			const warehouseUpgrades = 3;
			for (let i = 0; i < warehouseUpgrades; i++) {
				ns.corporation.upgradeWarehouse(division, city);
			}
		} else {

		}
	}
<<<<<<< HEAD
	//division.products = null;
=======
	division.productNumbers = [0];
>>>>>>> 30e9d1ebaecaae912b23a8df56b72db9f28aac44
}

async function initialCorpUpgrade(ns) {
	ns.print("line 460, unlock upgrades");
	ns.corporation.purchaseUnlock("Smart Supply");
	ns.corporation.levelUpgrade("Smart Storage");
	ns.corporation.levelUpgrade("Smart Storage");
	ns.corporation.levelUpgrade("Smart Storage");
	ns.corporation.levelUpgrade("Smart Storage");
	ns.corporation.levelUpgrade("DreamSense");
	// upgrade employee stats
	ns.corporation.levelUpgrade("Nuoptimal Nootropic Injector Implants");
	ns.corporation.levelUpgrade("Speech Processor Implants");
	ns.corporation.levelUpgrade("Neural Accelerators");
	ns.corporation.levelUpgrade("FocusWires");
}

const cities = ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"];

const upgradeList = [
	// lower priority value -> upgrade faster
	{ prio: 2, name: "Project Insight", },
	{ prio: 2, name: "DreamSense" },
	{ prio: 4, name: "ABC SalesBots" },
	{ prio: 4, name: "Smart Factories" },
	{ prio: 4, name: "Smart Storage" },
	{ prio: 8, name: "Neural Accelerators" },
	{ prio: 8, name: "Nuoptimal Nootropic Injector Implants" },
	{ prio: 8, name: "FocusWires" },
	{ prio: 8, name: "Speech Processor Implants" },
	{ prio: 8, name: "Wilson Analytics" },
];

const researchList = [
	// lower priority value -> upgrade faster
	{ prio: 10, name: "Overclock" },
	{ prio: 10, name: "uPgrade: Fulcrum" },
	{ prio: 3, name: "uPgrade: Capacity.I" },
	{ prio: 4, name: "uPgrade: Capacity.II" },
	{ prio: 10, name: "Self-Correcting Assemblers" },
	{ prio: 21, name: "Drones" },
	{ prio: 4, name: "Drones - Assembly" },
	{ prio: 10, name: "Drones - Transport" },
	{ prio: 26, name: "Automatic Drug Administration" },
	{ prio: 10, name: "CPH4 Injections" },
];
