/** @param {NS} ns **/
export async function main(ns) {
  const manager = new CorpManager(ns);
  await manager.init();
  while (true) {
    await manager.update();
    await ns.sleep(5000);
  }
}

class CorpManager {
  constructor(ns) {
    this.ns = ns;
    this.division = "Tobacco";
    this.homeCity = "Sector-12";
    this.cities = ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"];
    this.prodBudgetRatio = 0.3;
    this.minEmployees = 10;
  }

  async init() {
    const ns = this.ns;
    const corp = ns.corporation;
    ns.disableLog("ALL");

    if (!ns.getPlayer().hasCorporation) {
      corp.createCorporation("MyCorp", false);
    }

    const budget = 150e9;
    let spent = 0;
    const unlock = (name, cost) => {
      if (!corp.hasUnlock(name) && spent + cost <= budget) {
        corp.purchaseUnlock(name);
        spent += cost;
      }
    };
    unlock("Warehouse API", 50e9);
    unlock("Office API", 30e9);

    if (!corp.getCorporation().divisions.includes(this.division)) {
      corp.expandIndustry(this.division, this.division);
    }

    const div = corp.getDivision(this.division);
    for (const city of this.cities) {
      if (!div.cities.includes(city)) {
        const funds = corp.getCorporation().funds;
        const cost = corp.getConstants().officeInitialCost;
        if (funds < cost) break;
        corp.expandCity(this.division, city);
        corp.purchaseWarehouse(this.division, city);
        corp.upgradeOfficeSize(this.division, city, this.minEmployees);
        if (corp.hasUnlock("Smart Supply")) {
          corp.setSmartSupply(this.division, city, true);
        }
      }
    }
  }

  async update() {
    this.manageOffices();
    this.manageWarehouses();
    this.handleProducts();
    this.handleAdvertising();
    await this.tryInvestment();
  }

  manageOffices() {
    const corp = this.ns.corporation;
    for (const city of this.cities) {
      let office;
      try {
        office = corp.getOffice(this.division, city);
      } catch {
        continue;
      }
      if (!office) continue;

      const sizeNeeded = this.minEmployees - office.size;
      if (sizeNeeded > 0) {
        const cost = corp.getOfficeSizeUpgradeCost(this.division, city, sizeNeeded);
        if (corp.getCorporation().funds >= cost) {
          corp.upgradeOfficeSize(this.division, city, sizeNeeded);
        }
      }

      // Ensure employee count
      while (office.employees && office.employees.length < this.minEmployees) {
        corp.hireEmployee(this.division, city);
        office = corp.getOffice(this.division, city); // refresh after hiring
      }

      if (!Array.isArray(office.employees)) continue; // skip if still not valid

      const total = office.employees.length;
      if (total === 0) continue;

      const roles = {
        "Operations": 0.05,
        "Engineer": 0.1,
        "Management": 0.1,
        "Business": 0.6,
        "Research & Development": 0.15
      };

      let assigned = 0;
      const plan = {};
      for (const [role, ratio] of Object.entries(roles)) {
        const num = Math.floor(ratio * total);
        plan[role] = num;
        assigned += num;
      }
      plan["Operations"] += total - assigned; // fill leftover

      for (const [role, amount] of Object.entries(plan)) {
        const unassigned = office.employeeJobs["Unassigned"] ?? 0;
        if (unassigned >= amount) {
          corp.setAutoJobAssignment(this.division, city, role, amount);
        }
      }
    }
  }


  manageWarehouses() {
    const corp = this.ns.corporation;
    for (const city of this.cities) {
      if (!corp.hasWarehouse(this.division, city)) continue;
      const wh = corp.getWarehouse(this.division, city);
      if (wh.sizeUsed / wh.size > 0.9) {
        const cost = corp.getUpgradeWarehouseCost(this.division, city);
        if (corp.getCorporation().funds >= cost) {
          corp.upgradeWarehouse(this.division, city);
          this.ns.print(`[INFO] Upgraded warehouse in ${city}.`);
        }
      }
    }
  }

  handleProducts() {
    const corp = this.ns.corporation;
    const div = corp.getDivision(this.division);
    const funds = corp.getCorporation().funds;
    const budget = funds * this.prodBudgetRatio;
    const max = 3 + (corp.hasResearched(this.division, "uPgrade: Capacity.I") ? 1 : 0) + (corp.hasResearched(this.division, "uPgrade: Capacity.II") ? 1 : 0);

    for (const city of this.cities) {
      if (!div.cities.includes(city)) continue;
      for (const productName of div.products) {
        corp.sellProduct(this.division, city, productName, "MAX", "MP", true);
        if (corp.hasResearched(this.division, "Market-TA.I")) corp.setProductMarketTA1(this.division, productName, true);
        if (corp.hasResearched(this.division, "Market-TA.II")) corp.setProductMarketTA2(this.division, productName, true);
      }
    }

    const devInProgress = div.products.some(p => corp.getProduct(this.division, this.homeCity, p).developmentProgress < 100);
    if (devInProgress) return;

    if (div.products.length < max && funds > 2 * budget) {
      const name = `prod-${Date.now()}`;
      corp.makeProduct(this.division, this.homeCity, name, budget, budget);
      corp.sellProduct(this.division, this.homeCity, name, "MAX", "MP", true);
    } else {
      const underperformers = div.products
        .map(p => corp.getProduct(this.division, this.homeCity, p))
        .filter(p => p.demand < p.competition);
      if (underperformers.length > 0 && funds > 2 * budget) {
        const worst = underperformers.sort((a, b) => (b.competition - b.demand) - (a.competition - a.demand))[0];
        corp.discontinueProduct(this.division, worst.name);
        corp.makeProduct(this.division, this.homeCity, worst.name, budget, budget);
        corp.sellProduct(this.division, this.homeCity, worst.name, "MAX", "MP", true);
      }
    }
  }

  handleAdvertising() {
    const corp = this.ns.corporation;
    const div = corp.getDivision(this.division);
    const profit = div.lastCycleRevenue - div.lastCycleExpenses;
    const cost = corp.getHireAdVertCost(this.division);
    if (profit > cost) {
      corp.hireAdVert(this.division);
      this.ns.print(`[INFO] Hired AdVert for ${this.division}`);
    }
  }

  async tryInvestment() {
    const corp = this.ns.corporation;
    const div = corp.getDivision(this.division);
    if (corp.numShares !== corp.totalShares || div.products.length < 2) return;

    for (const p of div.products) corp.sellProduct(this.division, this.homeCity, p, "0", "MP", true);
    for (const city of this.cities) {
      if (!div.cities.includes(city)) continue;
      const office = corp.getOffice(this.division, city);
      const count = office && Array.isArray(office.employees) ? office.employees.length : 0;
      corp.setAutoJobAssignment(this.division, city, "Operations", count);
    }

    while (!this.cities.every(c => {
      if (!div.cities.includes(c) || !corp.hasWarehouse(this.division, c)) return false;
      const wh = corp.getWarehouse(this.division, c);
      return wh.sizeUsed > 0.98 * wh.size;
    })) {
      await this.ns.sleep(5000);
    }

    const base = corp.getInvestmentOffer().funds;
    for (const city of this.cities) {
      if (!div.cities.includes(city)) continue;
      const office = corp.getOffice(this.division, city);
      const size = office && Array.isArray(office.employees) ? office.employees.length : 0;
      corp.setAutoJobAssignment(this.division, city, "Business", size);
    }
    for (const p of div.products) corp.sellProduct(this.division, this.homeCity, p, "MAX", "MP", true);

    while (corp.getInvestmentOffer().funds < 4 * base) {
      await this.ns.sleep(500);
    }

    corp.goPublic(800e6);
    this.ns.print(`[INFO] ${this.division} went public.`);
  }
}
