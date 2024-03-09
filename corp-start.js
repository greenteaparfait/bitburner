/** @param {NS} ns **/
export async function main(ns) {

    var division = ns.args[0] || "Tobacco";  // Type of Industry
    var divisionName = ns.args[1];          // Name of Industry

	if (!ns.getPlayer().hasCorporation) {
		ns.corporation.createCorporation("MyCorp");
	}
	var corp = ns.corporation.getCorporation();
    ns.tprint("Name of Corporation = " + corp.name);

    //ns.corporation.expandIndustry(division, divisionName);

    var div = ns.corporation.getDivision(divisionName);
    // If Tobacco division already exists, exit this script
    if ( div.name == "Tobacco") {
        return false;
    };

    ns.tprint("Corp-Start, main, Name of Division = " + div.name);

	//if (corp.divisions.length < 1) {
		// initial Company setup
	//	ns.corporation.expandIndustry("Tobacco", "Tobacco");
		ns.tprint("Corp-Start, main, Name of division[0] = " + div.cities);
        if ( div.name == "Tobacco") {
            initialCorpUpgrade(ns);
        };
		initCities(ns, div.name);
	//};
}

async function initialCorpUpgrade(ns) {
	ns.tprint("Corp-Start, initialCorpUpgrade, unlock upgrades");
    if (!ns.corporation.hasUnlock("Warehouse API")) {
        ns.corporation.purchaseUnlock("Warehouse API");};
    if (!ns.corporation.hasUnlock("Office API")) {    
        ns.corporation.purchaseUnlock("Office API");};
    if (!ns.corporation.hasUnlock("Smart Supply")) {
	    ns.corporation.purchaseUnlock("Smart Supply");};
	ns.corporation.levelUpgrade("Smart Storage");
	ns.corporation.levelUpgrade("Smart Storage");
	ns.corporation.levelUpgrade("Smart Storage");
	ns.corporation.levelUpgrade("Smart Storage");
	ns.corporation.levelUpgrade("DreamSense");
	// upgrade employee stats
    //ns.corporation.purchaseUnlock("Nuoptimal Nootropic Injector Implants");
	ns.corporation.levelUpgrade("Nuoptimal Nootropic Injector Implants");
    //ns.corporation.purchaseUnlock("Speech Processor Implants");
	ns.corporation.levelUpgrade("Speech Processor Implants");
    //ns.corporation.purchaseUnlock("Neural Accelerators");
	ns.corporation.levelUpgrade("Neural Accelerators");
    //ns.corporation.purchaseUnlock("FocusWires");
	ns.corporation.levelUpgrade("FocusWires");
}


function initCities(ns, division, productCity = "Sector-12") {

    var div = ns.corporation.getDivision(division);
    ns.tprint("Corp-Start, main, Name of Division = " + div.name);

    const warehouseUpgrades = 3;
    const newEmployees = 9;

	for (const city of cities) {

		if (city != productCity) {
            if (!div.cities.includes(city)) {
                ns.tprint("Corp-Start, initCities, Expand " + division + " to City " + city);
			    ns.corporation.expandCity(division, city);
            };
			ns.corporation.purchaseWarehouse(division, city);
			ns.corporation.setSmartSupply(division, city, true); // does not work anymore, bug?
			
            // setup employees
            for (let i = 0; i < 3; i++) {
                ns.tprint("initCities, in " + city + ", hiring " + i + "th employee");
                ns.corporation.hireEmployee(division, city);
            };
            ns.corporation.setAutoJobAssignment(division, city, "Research & Development", 3);
		} else {
            if (!div.cities.includes(productCity)) {
                ns.tprint("Corp-Start, initCities, Expand " + division + " to City " + city);
			    ns.corporation.expandCity(division, city);}
			ns.corporation.purchaseWarehouse(division, city);
			ns.corporation.setSmartSupply(division, city, true); // does not work anymore, bug?
            
            // get a bigger warehouse in the product city. we can produce and sell more here
            for (let i = 0; i < warehouseUpgrades; i++) {
                ns.corporation.upgradeWarehouse(division, city);
            }
            // get more employees in the main product development city
            
            ns.corporation.upgradeOfficeSize(division, productCity, newEmployees);
            for (let i = 0; i < newEmployees + 3; i++) {
                ns.tprint("initCities, in " + city + ", hiring " + i + "th employee");
                ns.corporation.hireEmployee(division, productCity);
            };
            ns.corporation.setAutoJobAssignment(division, productCity, "Research & Development", newEmployees + 3);
		};
	};
}

const cities = ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"];
