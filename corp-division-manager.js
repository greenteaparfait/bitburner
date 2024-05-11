const MIN_FUNDS = 1e6; // keep at least $1m in business funds (can change)
const DEFAULT_WH_CAPACITY = 2000; // warehouse capacity
const ALL_CITIES = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];
const DEFAULT_MAX_PRODUCTS = 3
const MIN_WH_UPGRADES = 5;
var researchFlag = {sector12Flag: false, aevumFlag: false, chongqingFlag: false, newtokyoFlag: false, ishimaFlag: false, volhavenFlag: false};
var recruitFlag = {sector12Flag: false, aevumFlag: false, chongqingFlag: false, newtokyoFlag: false, ishimaFlag: false, volhavenFlag: false};

const INDUSTRIES = [
	"Agriculture",
	"Chemical",
	"Computer Hardware",
	"Fishing",
	"Healthcare",
	"Mining",
	"Pharmaceutical",
	"Real Estate",
	"Refinery",
	"Restaurant",
	"Robotics",
	"Software",
	"Spring Water",
	"Tobacco",
	"Water Utilities"
]

const INDUSTRIES_PRODUCT = [
	"Tobacco",
	"Restaurant"
]

const INDUSTRIES_NO_PRODUCT = [
	"Agriculture",
	"Chemical",
	"Fishing"
]

const MATERIALS_TOBACCO = [
	"Plants",
	"Hardware",
	"Robots",
	"AI Cores",
	"Real Estate"
]

const MATERIALS_FISHING = [
	"Food",
	"Plants",
	"Hardware",
	"Robots",
	"AI Cores",
	"Real Estate"
]

const MATERIALS_AGRICULTURE = [
	"Water",
	"Plants",
	"Food",
	"Chemicals",
	"Hardware",
	"Robots",
	"AI Cores",
	"Real Estate"
]

const MATERIALS_CHEMICAL = [
	"Water",
	"Plants",
	"Hardware",
	"Chemicals",
	"Robots",
	"AI Cores",
	"Real Estate"
]

const MATERIALS_RESTAURANT = [
	"Water",
	"Food",
	"Hardware",
	"Robots",
	"AI Cores",
	"Real Estate"
]

const JOB_TYPE = {
	operations: "Operations",
	engineer: "Engineer",
	business: "Business",
	management: "Management",
	development: "Research & Development"
}

const researchNames = {
	lab: 'Hi-Tech R&D Laboratory',
	marketTA1: 'Market-TA.I',
	marketTA2: 'Market-TA.II',
	fulcrum: 'uPgrade: Fulcrum',
	capacity1: 'uPgrade: Capacity.I',
	capacity2: 'uPgrade: Capacity.II'
}

const corpScripts = {
	recruiter: 'corp-recruiter.js',
	researcher: 'corp-researcher.js',
	marketer: 'corp-marketer.js',
	productManager: 'corp-product-manager.js'
}

/** @param {NS} ns */
export async function main(ns) {
	const industry = (ns.args[0] || "Tobacco");
	const divisionName = (ns.args[1] || "Tobacco");
	const reqEmployees = (ns.args[2] || 10);
	const prodBudget = (ns.args[3] || MIN_FUNDS);
	const minWarehouseCapacity = ns.args[4] || DEFAULT_WH_CAPACITY;
	var buyRatio = 1;  // default value for material buy
	var manpower = reqEmployees; // default office size

	if (!industry || !divisionName || !reqEmployees || !prodBudget) {
		ns.print("ERROR Insufficient arguments\nUsage: run corp-division-manager.js <industry> <divisionName> <reqEmployees> <prodBudget> [<minWarehouseCapacity>]");
		return;
	}

	const corp = eval("ns.corporation");

	const waitForFunds = async (amount) => {
		while (true) {
			const funds = corp.getCorporation().funds - MIN_FUNDS;
			if (funds > amount) {
				return;
			}
			await ns.sleep(2000); // wait 2s
		}
	}

	const hasDivision = (divisionName) => {
		try {
			corp.getDivision(divisionName);
			return true;
		} catch (e) {
			return false;
		}
	};

	const createDivision = async (industry, divisionName) => {
		const industryCost = corp.getIndustryData(industry);
		await waitForFunds(industryCost);
		corp.expandIndustry(industry, divisionName);
	}

	const hasInsufficientEmployees = (office) => {
		return office.size < reqEmployees;
	}

	const hasMarketTAButNoOps = (divisionName, office) => {
		return corp.hasResearched(divisionName, researchNames.marketTA1)
			&& office.employeeJobs[JOB_TYPE.operations] === 0;
	}

	const hasMarketTAButNoWarehouse = (divisionName, cityName) => {
		return corp.hasResearched(divisionName, researchNames.marketTA1) &&
			!corp.hasWarehouse(divisionName, cityName);
	}

	const hasMarketTAButLessWarehouseCapacity = (divisionName, cityName) => {
		return corp.hasResearched(divisionName, researchNames.marketTA1) &&
			corp.getWarehouse(divisionName, cityName).size < minWarehouseCapacity;
	}

	const shouldUpgradeCity = (divisionName, cityName) => {
		const office = corp.getOffice(divisionName, cityName);
		return hasInsufficientEmployees(office)
			|| hasMarketTAButNoOps(divisionName, office)
			|| hasMarketTAButNoWarehouse(divisionName, cityName)
			|| hasMarketTAButLessWarehouseCapacity(divisionName, cityName);
	}

	const hireEmployees = (divisionName, cityName) => {
		const recruiterArgs = [
			divisionName,
			cityName,
			reqEmployees
		]
		if (!corp.hasResearched(divisionName, researchNames.marketTA1)) {
			recruiterArgs.push('--research'); // assign all to R&D
		}
		return ns.run(corpScripts.recruiter, 1, ...recruiterArgs);
	}

	const upgradeCity = async (divisionName, cityName) => {
		ns.print("Inside upgrade city");
		const office = corp.getOffice(divisionName, cityName);
		/**
		 *  If office size is smaller than requested number of employee, recruit more employees
		 */
		if (hasInsufficientEmployees(office)) {
			hireEmployees(divisionName, cityName);
		}
		/**
		 *  If there is no operator, hire more operators
		 */
		if (hasMarketTAButNoOps(divisionName, office)) {
			ns.print("has marketTA but no Operations");
			if (cityName == "Sector-12" && recruitFlag.sector12Flag == false) {
				recruitFlag.sector12Flag = true;
				ns.run(corpScripts.recruiter, 1, divisionName, cityName);
			};
			if (cityName == "Aevum" && recruitFlag.aevumFlag == false) {
				recruitFlag.aevumFlag = true;
				ns.run(corpScripts.recruiter, 1, divisionName, cityName);
			};
			if (cityName == "Chongqing" && recruitFlag.chongqingFlag == false) {
				recruitFlag.chongqingFlag = true;
				ns.run(corpScripts.recruiter, 1, divisionName, cityName);
			};
			if (cityName == "Volhaven" && recruitFlag.volhavenFlag == false) {
				recruitFlag.volhavenFlag = true;
				ns.run(corpScripts.recruiter, 1, divisionName, cityName);
			};
			if (cityName == "Ishima" && recruitFlag.ishimaFlag == false) {
				recruitFlag.ishimaFlag = true;
				ns.run(corpScripts.recruiter, 1, divisionName, cityName);
			};
			if (cityName == "New Tokyo" && recruitFlag.newtokyoFlag == false) {
				recruitFlag.newtokyoFlag = true;
				ns.run(corpScripts.recruiter, 1, divisionName, cityName);
			};
		}
		/**
		 *  If there is no warehouse, get a warehouse
		 */
		if (hasMarketTAButNoWarehouse(divisionName, cityName)) {
			ns.print("has marketTA but no warehouse");
			const cost = corp.getPurchaseWarehouseCost();
			await waitForFunds(cost);
			corp.purchaseWarehouse(divisionName, cityName);
		};

		/**
		 *  If warehouse size is smaller than the requested minimum warehouse size, upgrade warehouse
		 */
		//if (hasMarketTAButLessWarehouseCapacity(divisionName, cityName)) {
		//	ns.print("has marketTA but less warehouse capacity");
		//	const cost = corp.getUpgradeWarehouseCost(divisionName, cityName, MIN_WH_UPGRADES);
		//	await waitForFunds(cost);
		//	corp.upgradeWarehouse(divisionName, cityName, MIN_WH_UPGRADES);
		//};
	}

	const enableSmartSupply = (divisionName, cityName) => {
		if (corp.hasUnlock("Smart Supply") && corp.hasWarehouse(divisionName, cityName)) {
			corp.setSmartSupply(divisionName, cityName, true);
			if (divisionName == "Tobacco"){
				for (const material of MATERIALS_TOBACCO) {
					corp.setSmartSupplyOption(divisionName, cityName, material, "leftovers");
				};
			} else if (divisionName == "Agriculture") {
				for (const material of MATERIALS_AGRICULTURE) {
					corp.setSmartSupplyOption(divisionName, cityName, material, "leftovers");
				};
			} else if (divisionName == "Chemical") {
				for (const material of MATERIALS_CHEMICAL) {
					corp.setSmartSupplyOption(divisionName, cityName, material, "leftovers");
				};
			} else if (divisionName == "Fishing") {
				for (const material of MATERIALS_FISHING) {
					corp.setSmartSupplyOption(divisionName, cityName, material, "leftovers");
				};
			} else if (divisionName == "Restaurant") {
				for (const material of MATERIALS_RESTAURANT) {
					corp.setSmartSupplyOption(divisionName, cityName, material, "leftovers");
				};
			};

		}
	}

	const buyMaterials = (divisionName, cityName) => {
		const division = corp.getDivision(divisionName);
		const warehouse = corp.getWarehouse(divisionName, cityName)
		const warehouseSize = warehouse.size;
		const buyMinLimit = Math.round(warehouseSize*0.1);  // 10% of warehouse size
		const buyMaxLimit = Math.round(warehouseSize*0.9);  // 10% of warehouse size
		const oneMorePosition = 1; 
		const upgradeCost = corp.getOfficeSizeUpgradeCost(divisionName, cityName, oneMorePosition);
		ns.print("Inside buy material: ");
		/**
		 *  If all the produced products are sold, then recruit one more employee in operations position and buy materials to increase production 
		 */
		if (divisionName == "Tobacco") {
			ns.print("-------------------------------------");
			ns.print("Inside buy Materials of  " + cityName + " in " + divisionName);
			for (let prodId of division.products) {
				ns.print("For " + prodId);
				const rawProd = corp.getProduct(divisionName, cityName, prodId);
				if ( (rawProd.actualSellAmount >= rawProd.productionAmount) &&
						(rawProd.productionAmount > 0) &&
						(warehouse.sizeUsed < 0.9*warehouseSize)
				) {
					ns.print("Need to hire more:")
					manpower++;
					if (corp.getCorporation().funds > upgradeCost) {
						ns.print("INFO Hiring one more operator in " + cityName + " of division, " + divisionName);
						corp.upgradeOfficeSize(divisionName, cityName, oneMorePosition);
						corp.hireEmployee(divisionName, cityName, "Operations");
					} else {
						ns.print("Need to hire more, but insufficient fund");
					};
				} else {
					ns.print("No need to hire more:")
				};

				// If warehouse is near full, stop buying materials
				if (warehouse.sizeUsed > 0.9*warehouseSize) 
				{
					ns.print("WARNING Stop buying more materials in " + cityName + " of division, " + divisionName);
					corp.buyMaterial(divisionName, cityName, "Hardware", 0);
					corp.buyMaterial(divisionName, cityName, "Robots", 0);
					corp.buyMaterial(divisionName, cityName, "AI Cores", 0);
					corp.buyMaterial(divisionName, cityName, "Real Estate", 0);
				} else {
					ns.print("INFO Buying more materials in " + cityName + " of division, " + divisionName);
					corp.buyMaterial(divisionName, cityName, "Hardware", 10);
					corp.buyMaterial(divisionName, cityName, "Robots", 10);
					corp.buyMaterial(divisionName, cityName, "AI Cores", 10);
					corp.buyMaterial(divisionName, cityName, "Real Estate", 10);
				};
			};
			ns.print("-------------------------------------");
		};
		

		/**
		 *  Adjust the amount of purchases depending on industries and situations
		 */
		if (corp.hasWarehouse(divisionName, cityName)) {
			if (divisionName == "Tobacco") {
				for (const material of MATERIALS_TOBACCO) {
					if (material == "Plants") {
						if (warehouse.sizeUsed < buyMinLimit) {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP')
						} else if (warehouse.sizeUsed > buyMaxLimit){
							corp.setSmartSupply(divisionName, cityName, false);
							corp.buyMaterial(divisionName, cityName, material, 0, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 1, 'MP')
						} else {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP');
						};
					} else {
						if (warehouse.sizeUsed < buyMinLimit) {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP')
						} else if (warehouse.sizeUsed > buyMinLimit) { 
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 0, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP')
						};
					};
				};
			} else if (divisionName == "Agriculture") {
				for (const material of MATERIALS_AGRICULTURE) {
					if (material == "Water" || material == "Chemicals") {
						if (warehouse.sizeUsed < buyMinLimit) {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP');
						} else if (warehouse.sizeUsed > buyMaxLimit) { 
							corp.setSmartSupply(divisionName, cityName, false);
							corp.buyMaterial(divisionName, cityName, material, 0, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 1, 'MP');
						} else {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP');
						};
					} else if (material == "Food" || material == "Plants" ) {
						corp.buyMaterial(divisionName, cityName, material, 0, 'MP');
						corp.sellMaterial(divisionName, cityName, material, 'MAX', 'MP');
					} else {
						if (warehouse.sizeUsed < buyMinLimit) {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP')
						} else if (warehouse.sizeUsed > buyMinLimit) { 
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 0, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP')
						};
					};
				};
			} else if (divisionName == "Chemical") {
				for (const material of MATERIALS_CHEMICAL) {
					if (material == "Water" || material == "Plants") {
						if (warehouse.sizeUsed < buyMinLimit) {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP');
						} else if (warehouse.sizeUsed > buyMaxLimit) { 
							corp.setSmartSupply(divisionName, cityName, false);
							corp.buyMaterial(divisionName, cityName, material, 0, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 1, 'MP');
						} else {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP');
						};
					} else if (material == "Chemicals" ) {
						corp.buyMaterial(divisionName, cityName, material, 0, 'MP');
						corp.sellMaterial(divisionName, cityName, material, 'MAX', 'MP');
					} else {
						if (warehouse.sizeUsed < buyMinLimit) {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP')
						} else if (warehouse.sizeUsed > buyMinLimit) { 
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 0, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP')
						};
					};
				};
			} else if (divisionName == "Fishing") {
				for (const material of MATERIALS_FISHING) {
					if (material == "Plants") {
						if (warehouse.sizeUsed < buyMinLimit) {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP');
						} else if (warehouse.sizeUsed > buyMaxLimit) { 
							corp.setSmartSupply(divisionName, cityName, false);
							corp.buyMaterial(divisionName, cityName, material, 0, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 1, 'MP');
						} else {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP');
						};
					} else if (material == "Food" ) {
						corp.buyMaterial(divisionName, cityName, material, 0, 'MP');
						corp.sellMaterial(divisionName, cityName, material, 'MAX', 'MP');
					} else {
						if (warehouse.sizeUsed < buyMinLimit) {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP')
						} else if (warehouse.sizeUsed > buyMinLimit) {
							corp.setSmartSupply(divisionName, cityName, true); 
							corp.buyMaterial(divisionName, cityName, material, 0, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP')
						};
					};
				};
			} else if (divisionName == "Restaurant") {
				for (const material of MATERIALS_RESTAURANT) {
					if (material == "Food" || material == "Water") {
						if (warehouse.sizeUsed < buyMinLimit) {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP')
						} else if (warehouse.sizeUsed > buyMaxLimit){
							corp.setSmartSupply(divisionName, cityName, false);
							corp.buyMaterial(divisionName, cityName, material, 0, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 1, 'MP')
						} else {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP');
						};
					} else {
						if (warehouse.sizeUsed < buyMinLimit) {
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 1, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP')
						} else if (warehouse.sizeUsed > buyMinLimit) { 
							corp.setSmartSupply(divisionName, cityName, true);
							corp.buyMaterial(divisionName, cityName, material, 0, 'MP');
							corp.sellMaterial(divisionName, cityName, material, 0, 'MP')
						};
					};
				};
			};
		};
	};

	const ensureMarketTAEnabled = (divisionName, cityName) => {
		const division = corp.getDivision(divisionName);
/*
		if (corp.hasWarehouse(divisionName, cityName)) {
			// Make sure that we're selling all materials so we don't fill warehouse
			for (const material of MATERIALS) {
				corp.sellMaterial(divisionName, cityName, material, 'MAX', 'MP');
			}
		}
*/
		if (divisionName == "Tobacco") {
			if (corp.hasResearched(divisionName, researchNames.marketTA1)) {
				for (const material of MATERIALS_TOBACCO) {
					corp.setMaterialMarketTA1(divisionName, cityName, material, true);
				}
				for (const product of division.products) {
					corp.setProductMarketTA1(divisionName, product, true);
				}
			};

			if (corp.hasResearched(divisionName, researchNames.marketTA2)) {
				for (const material of MATERIALS_TOBACCO) {
					corp.setMaterialMarketTA2(divisionName, cityName, material, true);
				}
				for (const product of division.products) {
					corp.setProductMarketTA2(divisionName, product, true);
				}
			};
		};

		if (divisionName == "Agriculture") {
			if (corp.hasResearched(divisionName, researchNames.marketTA1)) {
				for (const material of MATERIALS_AGRICULTURE) {
					corp.setMaterialMarketTA1(divisionName, cityName, material, true);
				}
			};
			
			if (corp.hasResearched(divisionName, researchNames.marketTA2)) {
				for (const material of MATERIALS_AGRICULTURE) {
					corp.setMaterialMarketTA2(divisionName, cityName, material, true);
				}
			};
		};

		if (divisionName == "Chemical") {
			if (corp.hasResearched(divisionName, researchNames.marketTA1)) {
				for (const material of MATERIALS_CHEMICAL) {
					corp.setMaterialMarketTA1(divisionName, cityName, material, true);
				}
			};
			
			if (corp.hasResearched(divisionName, researchNames.marketTA2)) {
				for (const material of MATERIALS_CHEMICAL) {
					corp.setMaterialMarketTA2(divisionName, cityName, material, true);
				}
			};
		};

		if (divisionName == "Fishing") {
			if (corp.hasResearched(divisionName, researchNames.marketTA1)) {
				for (const material of MATERIALS_FISHING) {
					corp.setMaterialMarketTA1(divisionName, cityName, material, true);
				}
			};
			
			if (corp.hasResearched(divisionName, researchNames.marketTA2)) {
				for (const material of MATERIALS_FISHING) {
					corp.setMaterialMarketTA2(divisionName, cityName, material, true);
				}
			};
		};

		if (divisionName == "Restaurant") {
			if (corp.hasResearched(divisionName, researchNames.marketTA1)) {
				for (const material of MATERIALS_RESTAURANT) {
					corp.setMaterialMarketTA1(divisionName, cityName, material, true);
				}
			};
			
			if (corp.hasResearched(divisionName, researchNames.marketTA2)) {
				for (const material of MATERIALS_RESTAURANT) {
					corp.setMaterialMarketTA2(divisionName, cityName, material, true);
				}
			};
		};


	}

	const getUnownedCities = (division) => {
		const ownedCities = division.cities.reduce((acc, city) => {
			acc[city] = city;
			return acc;
		}, {});
		return ALL_CITIES.filter(city => !ownedCities[city]);
	}

	const getMaxProducts = (divisionName) => {
		if (corp.hasResearched(divisionName, researchNames.capacity2)) {
			return 5;
		}
		if (corp.hasResearched(divisionName, researchNames.capacity2)) {
			return 4;
		}
		return DEFAULT_MAX_PRODUCTS;
	}

	// ====================
	//	 Main Logic Below
	// ====================

	if (!hasDivision(divisionName)) {
		await createDivision(industry, divisionName);
	};

	while (true) {
		const division = corp.getDivision(divisionName);
		ns.print("-------------------------------------------");
        ns.print(" Corp Division Loop in " + divisionName);
		if (divisionName == "Tobacco") {
			if (!ns.scriptRunning(corpScripts.productManager, "home")) {
				ns.run(corpScripts.productManager, 1, prodBudget); // for product management
			};
		};

		for (const city of division.cities) {
			ns.print(city + " in " + divisionName);
			/**
			 *  Start research script
			 */
			if (city == "Sector-12" && researchFlag.sector12Flag == false) {
				researchFlag.sector12Flag = true;
				ns.run(corpScripts.researcher, 1, divisionName, city); // for auto research
			};
			if (city == "Aevum" && researchFlag.aevumFlag == false) {
				researchFlag.aevumFlag = true;
				ns.run(corpScripts.researcher, 1, divisionName, city); // for auto research
			};
			if (city == "Chongqing" && researchFlag.chongqingFlag == false) {
				researchFlag.chongqingFlag = true;
				ns.run(corpScripts.researcher, 1, divisionName, city); // for auto research
			};
			if (city == "Volhaven" && researchFlag.volhavenFlag == false) {
				researchFlag.volhavenFlag = true;
				ns.run(corpScripts.researcher, 1, divisionName, city); // for auto research
			};
			if (city == "Ishima" && researchFlag.ishimaFlag == false) {
				researchFlag.ishimaFlag = true;
				ns.run(corpScripts.researcher, 1, divisionName, city); // for auto research
			};
			if (city == "New Tokyo" && researchFlag.newtokyoFlag == false) {
				researchFlag.newtokyoFlag = true;
				ns.run(corpScripts.researcher, 1, divisionName, city); // for auto research
			};
			/**
			 *  If more employees are needed, or if larger warehouse is needed,
			 */
			//ns.print("Upgrade city");
			if (shouldUpgradeCity(divisionName, city)) {
				ns.print("Upgrade City");
				await upgradeCity(divisionName, city);
			};
			/**
			 *  If a warehouse exists, then diable smart supply
			 */
			ns.print("Warehouse");
			if (corp.hasWarehouse(divisionName, city)) {
				corp.setSmartSupply(divisionName, city, false);
			} 
			/**
			 *  If not, get a warehouse and set the smart supply diabled
			 */
			else {
				ns.print("Set smart supply");
				corp.purchaseWarehouse(divisionName, city);
				corp.setSmartSupply(divisionName, city, false);
			}; 
			/**
			 *  Set the smart supply enabled
			 */
			//ns.print("Enalbe smart supply, margetTA enalbed, buy materials");
			ns.print("Enable smart supply");
			enableSmartSupply(divisionName, city);
			/**
			 *  Set the MargetTA enabled
			 */
			ns.print("Market TA");
			ensureMarketTAEnabled(divisionName, city);
			/**
			 *  Buy materials
			 */
			ns.print("Buy material");
			buyMaterials(divisionName, city);
			//ns.print("    ");
		};

		/**
		 *  Expand to unowned cities
		 */
		ns.print("Expand to unowned cities");
		const unownedCities = getUnownedCities(division);
		if (unownedCities.length > 0) {
			const cityToPurchase = unownedCities.pop(); // grab whatever
			const cost = corp.getConstants().officeInitialCost;
			await waitForFunds(cost);
			corp.expandCity(divisionName, cityToPurchase);
		};

		/** 
		 *  For product-generating industries, start marketer script
		 */
		ns.print("Run marketer script");
		if (divisionName == "Tobacco") {
			const maxProducts = getMaxProducts(divisionName);
			if (division.products.length === maxProducts && unownedCities.length === 0) {
				if (!ns.scriptRunning(corpScripts.marketer, "home")) {
					ns.run(corpScripts.marketer, 1, divisionName);
				};
			};
		};

		await ns.sleep(5000); // wait 5s
	};
}