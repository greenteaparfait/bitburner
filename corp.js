/** @param {NS} ns **/
export async function main(ns) {
  const manager = new CorpManager(ns);
  await manager.init();
  while (true) {
    await manager.run();
    await ns.sleep(5000);
  }
}

class CorpManager {
  constructor(ns) {
    this.ns = ns;
    this.cities = ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"];
    this.upgradeList = [
      { prio: 2, name: "Project Insight" },
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
    this.researchList = [
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
  }

  async init() {
    const ns = this.ns;
    ns.disableLog("disableLog");
    ns.disableLog("sleep");

    if (!ns.getPlayer().hasCorporation) {
      ns.corporation.createCorporation("MyCorp");
    }

    // Track total initial spend
    let spent = 0;
    const budget = 150e9;

    // Unlock Warehouse API
    if (!ns.corporation.hasUnlock("Warehouse API")) {
      const cost = 50e9;
      if (spent + cost <= budget) {
        try {
          ns.corporation.purchaseUnlock("Warehouse API");
          spent += cost;
        } catch (err) {
          ns.print(`⚠️ Could not unlock Warehouse API: ${err.message}`);
        }
      }
    }

    // Unlock Office API
    if (!ns.corporation.hasUnlock("Office API")) {
      const cost = 30e9;
      if (spent + cost <= budget) {
        try {
          ns.corporation.purchaseUnlock("Office API");
          spent += cost;
        } catch (err) {
          ns.print(`⚠️ Could not unlock Office API: ${err.message}`);
        }
      }
    }

    const corp = ns.corporation.getCorporation();
    if (corp.divisions.length < 1) {
      const divCost = 20e9;
      if (spent + divCost <= budget) {
        try {
          ns.corporation.expandIndustry("Tobacco", "Tobacco");
          spent += divCost;
        } catch (err) {
          ns.print(`⚠️ Could not expand Tobacco division: ${err.message}`);
          return;
        }
      } else {
        ns.print("❌ Not enough funds to expand Tobacco division.");
        return;
      }

      this.initCities("Tobacco");

      // Limit expansion to only Sector-12 initially
      const city = "Sector-12";
      const officeCost = 4e9; // office + warehouse estimate
      if (spent + officeCost <= budget) {
        try {
          ns.corporation.expandCity("Tobacco", city);
          ns.corporation.purchaseWarehouse("Tobacco", city);
          ns.corporation.upgradeOfficeSize("Tobacco", city, 3); // small initial office
          spent += officeCost;
        } catch (err) {
          ns.print(`⚠️ Failed city expansion/setup in ${city}: ${err.message}`);
        }
      }
    }

    ns.print(`💸 Initial setup completed. Total spent: ${ns.formatNumber(spent)}`);
  }

  async run() {
    const corp = this.ns.corporation.getCorporation();
    this.purchaseUnlocks();
    for (const division of corp.divisions.reverse()) {
      if (!this.ns.corporation.hasUnlock("Warehouse API")) continue;
      this.hireEmployees(division);
      this.manageEmployees(division);
      this.upgradeWarehouses(division);
      this.upgradeCorp();
      this.doResearch(division);
      this.newProduct(division); // moved to end to ensure employees & research set before creation
    }
    if (corp.divisions.length < 2 && corp.numShares === corp.totalShares) {
      const division = this.ns.corporation.getDivision("Tobacco");
      if (division.products?.length >= 2) {
        this.trickInvest(division);
      }
    }
  }

  async initialCorpUpgrade() {
    const ns = this.ns;
    ns.corporation.purchaseUnlock("Smart Supply");
    for (let i = 0; i < 4; i++) ns.corporation.levelUpgrade("Smart Storage");
    ns.corporation.levelUpgrade("DreamSense");
    ns.corporation.levelUpgrade("Nuoptimal Nootropic Injector Implants");
    ns.corporation.levelUpgrade("Speech Processor Implants");
    ns.corporation.levelUpgrade("Neural Accelerators");
    ns.corporation.levelUpgrade("FocusWires");
  }

  initCities(division) {
    const ns = this.ns;
    if (!ns.corporation.hasUnlock("Warehouse API")) return;
    for (const city of this.cities) {
      if (!ns.corporation.hasWarehouse(division, city)) {
        ns.corporation.expandCity(division, city);
        ns.corporation.purchaseWarehouse(division, city);
        ns.corporation.setSmartSupply(division, city, true);
      }
    }
  }

  purchaseUnlocks() {
    const ns = this.ns;
    const corp = ns.corporation.getCorporation();
    const unlocks = [
      "Office API", "Warehouse API", "Export", "Smart Supply",
      "Market Research - Demand", "Market Data - Competition", "VeChain"
    ];
    for (const name of unlocks) {
      const cost = ns.corporation.getUnlockCost(name);
      if (!ns.corporation.hasUnlock(name) && corp.funds >= cost) {
        try {
          ns.corporation.purchaseUnlock(name);
        } catch (err) {
          ns.tprint(`❌ Failed to unlock ${name}: ${err.message}`);
        }
      }
    }
  }

  newProduct(division) {
    const ns = this.ns;
    const city = "Sector-12";
    const divObj = ns.corporation.getDivision(division);
    const products = divObj.products || [];

    const maxProducts =
      3 +
      (ns.corporation.hasResearched(division, "uPgrade: Capacity.I") ? 1 : 0) +
      (ns.corporation.hasResearched(division, "uPgrade: Capacity.II") ? 1 : 0);

    // Skip if product is being developed
    for (const name of products) {
      const product = ns.corporation.getProduct(division, city, name);
      if (product.developmentProgress < 100) {
        ns.print(`⏳ Product ${name} still developing (${product.developmentProgress.toFixed(1)}%)`);
        return;
      }
    }

    // Sell completed products
    for (const name of products) {
      const product = ns.corporation.getProduct(division, city, name);
      if (product.developmentProgress === 100 && product.sCost === "0") {
        ns.print(`💰 Selling ${name}`);
        ns.corporation.sellProduct(division, city, name, "MAX", "MP", true);
        if (ns.corporation.hasResearched(division, "Market-TA.II")) {
          ns.corporation.setProductMarketTA1(division, name, true);
          ns.corporation.setProductMarketTA2(division, name, true);
        }
      }
    }

    // Don't create if max reached
    if (products.length >= maxProducts) return;

    // ✅ Create product
    const name = `Product-${products.length}`;
    const funds = ns.corporation.getCorporation().funds;
    const investAmt = Math.max(1e6, Math.floor(funds / 3));

    if (funds < investAmt) {
      ns.print("❌ Not enough funds to start new product.");
      return;
    }

    ns.print(`🚀 Starting development of ${name} with $${investAmt.toLocaleString()}`);
    ns.corporation.makeProduct(division, city, name, investAmt, investAmt);
  }


  hireEmployees(division) {
    const ns = this.ns;
    for (const city of this.cities) {
      if (!ns.corporation.hasWarehouse(division, city)) continue;
      const office = ns.corporation.getOffice(division, city);
      if (ns.corporation.getCorporation().funds > this.cities.length * ns.corporation.getOfficeSizeUpgradeCost(division, city, 3)) {
        ns.corporation.upgradeOfficeSize(division, city, 3);
        for (let i = 0; i < 3; i++) ns.corporation.hireEmployee(division, city);
      }
    }
  }

  async manageEmployees(division) {
    const ns = this.ns;
    for (const city of this.cities) {
      const div = ns.corporation.getDivision(division);

      if (!div.cities.includes(city)) continue; // Only manage initialized cities

      let office;
      try {
        office = ns.corporation.getOffice(division, city);
      } catch (err) {
        ns.print(`❌ Failed to get office in ${city}: ${err.message}`);
        continue;
      }

      if (!office || !Array.isArray(office.employees)) {
        ns.print(`⚠️ Office in ${city} not ready (employees missing). Skipping.`);
        continue;
      }

      const targetSize = 3;
      if (office.size < targetSize) {
        const increase = targetSize - office.size;
        try {
          ns.print(`🏢 Upgrading office in ${city} by ${increase}`);
          ns.corporation.upgradeOfficeSize(division, city, increase);
        } catch (err) {
          ns.print(`⚠️ Failed to upgrade office in ${city}: ${err.message}`);
          continue;
        }
      }

      // ✅ Reliable hire loop
      ns.print(`👀 Before hiring in ${city}: ${office.employees.length} / ${office.size}`);
      while (
        ns.corporation.getOffice(division, city).employees.length <
        ns.corporation.getOffice(division, city).size
      ) {
        const hired = ns.corporation.hireEmployee(division, city);
        if (!hired) {
          ns.print(`⚠️ Failed to hire in ${city}, possibly no space.`);
          break;
        }
        await ns.sleep(1); // Let Bitburner update state
      }
      const finalCount = ns.corporation.getOffice(division, city).employees.length;
      ns.print(`✅ After hiring in ${city}: ${finalCount} / ${office.size}`);

      const roles = ["Operations", "Engineer", "Business"];
      const perRole = Math.floor(targetSize / roles.length);
      for (const role of roles) {
        try {
          ns.corporation.setAutoJobAssignment(division, city, role, perRole);
        } catch (err) {
          ns.print(`⚠️ Could not assign ${role} in ${city}: ${err.message}`);
        }
      }

      ns.print(`👔 ${city}: ${targetSize} total, assigned ${perRole} per role.`);
    }
  }

  upgradeWarehouses(division) {
    const ns = this.ns;
    for (const city of this.cities) {
      if (!ns.corporation.hasWarehouse(division, city)) continue;
      const warehouse = ns.corporation.getWarehouse(division, city);
      if (warehouse.sizeUsed > 0.9 * warehouse.size && ns.corporation.getCorporation().funds > ns.corporation.getUpgradeWarehouseCost(division, city)) {
        ns.corporation.upgradeWarehouse(division, city);
      }
    }
    if (ns.corporation.getUpgradeLevel("Wilson Analytics") > 20 && ns.corporation.getCorporation().funds > 4 * ns.corporation.getHireAdVertCost(division)) {
      ns.corporation.hireAdVert(division);
    }
  }

  upgradeCorp() {
    const ns = this.ns;
    for (const upgrade of this.upgradeList) {
      if (ns.corporation.getCorporation().funds > upgrade.prio * ns.corporation.getUpgradeLevelCost(upgrade.name)) {
        if ((upgrade.name !== "ABC SalesBots" && upgrade.name !== "Wilson Analytics") || ns.corporation.getUpgradeLevel("DreamSense") > 20) {
          ns.corporation.levelUpgrade(upgrade.name);
        }
      }
    }
  }

  doResearch(division) {
    const ns = this.ns;
    const lab = "Hi-Tech R&D Laboratory";
    const tai = "Market-TA.I";
    const taii = "Market-TA.II";
    const divObj = ns.corporation.getDivision(division);
    if (!ns.corporation.hasResearched(division, lab)) {
      if (divObj.research > ns.corporation.getResearchCost(division, lab)) {
        ns.corporation.research(division, lab);
      }
    } else if (!ns.corporation.hasResearched(division, taii)) {
      const cost = ns.corporation.getResearchCost(division, tai) + ns.corporation.getResearchCost(division, taii);
      if (divObj.research > 1.1 * cost) {
        ns.corporation.research(division, tai);
        ns.corporation.research(division, taii);
        for (const product of divObj.products) {
          ns.corporation.setProductMarketTA1(division, product, true);
          ns.corporation.setProductMarketTA2(division, product, true);
        }
      }
    } else {
      for (const research of this.researchList) {
        if (!ns.corporation.hasResearched(division, research.name)) {
          if (divObj.research > research.prio * ns.corporation.getResearchCost(division, research.name)) {
            ns.corporation.research(division, research.name);
          }
        }
      }
    }
  }

  trickInvest(division) {
    const ns = this.ns;
    for (const product of division.products) {
      ns.corporation.sellProduct(division.name, "Sector-12", product, "0", "MP", true);
    }
    for (const city of this.cities) {
      const employees = ns.corporation.getOffice(division.name, city).employees.length;
      ns.corporation.setAutoJobAssignment(division.name, city, "Operations", employees);
    }
    let full = false;
    while (!full) {
      full = this.cities.every(city => {
        const wh = ns.corporation.getWarehouse(division.name, city);
        return wh.sizeUsed > 0.98 * wh.size;
      });
      ns.sleep(5000);
    }
    const start = ns.corporation.getInvestmentOffer().funds;
    for (const city of this.cities) {
      const employees = ns.corporation.getOffice(division.name, city).employees.length;
      ns.corporation.setAutoJobAssignment(division.name, city, "Business", employees);
    }
    for (const product of division.products) {
      ns.corporation.sellProduct(division.name, "Sector-12", product, "MAX", "MP", true);
    }
    while (ns.corporation.getInvestmentOffer().funds < 4 * start) {
      ns.sleep(500);
    }
    ns.corporation.goPublic(800e6);
  }
}
