/** @param {NS} ns **/
import { ALL_CITIES, MATERIALS, JOB_TYPE, RESEARCH, CORP_SCRIPTS } from "corp-constants.js";

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
    this.cities = ALL_CITIES;
    this.prodBudgetRatio = 0.3;
    this.researchGoals = [
      RESEARCH.lab,
      RESEARCH.marketTA1,
      RESEARCH.marketTA2,
      RESEARCH.capacity1,
      RESEARCH.capacity2
    ];
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
        const officeCost = corp.getConstants().officeInitialCost;
        const warehouseCost = corp.getConstants().warehouseInitialCost;
        if (corp.getCorporation().funds < officeCost + warehouseCost || spent + officeCost + warehouseCost > budget) break;

        corp.expandCity(this.division, city);
        corp.purchaseWarehouse(this.division, city);
        corp.upgradeOfficeSize(this.division, city, 3);
        spent += officeCost + warehouseCost;

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
    this.handleResearch();
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

      const requiredUpgrade = 3 - office.size;
      if (requiredUpgrade > 0) {
        const upgradeCost = corp.getOfficeSizeUpgradeCost(this.division, city, requiredUpgrade);
        if (corp.getCorporation().funds >= upgradeCost) {
          corp.upgradeOfficeSize(this.division, city, requiredUpgrade);
        }
      }

      if (!Array.isArray(office.employees)) continue;

      while (office.employees.length < office.size) {
        if (!corp.hireEmployee(this.division, city)) break;
        office = corp.getOffice(this.division, city);
        if (!Array.isArray(office.employees)) break;
      }

      const total = office.employees.length;
      const div = corp.getDivision(this.division);
      const devStage = div.products.length === 0;

      corp.setAutoJobAssignment(this.division, city, JOB_TYPE.operations, 0);
      corp.setAutoJobAssignment(this.division, city, JOB_TYPE.engineer, 0);
      corp.setAutoJobAssignment(this.division, city, JOB_TYPE.business, 0);

      if (devStage) {
        corp.setAutoJobAssignment(this.division, city, JOB_TYPE.engineer, total);
      } else {
        const perRole = Math.floor(total / 3);
        corp.setAutoJobAssignment(this.division, city, JOB_TYPE.operations, perRole);
        corp.setAutoJobAssignment(this.division, city, JOB_TYPE.engineer, perRole);
        corp.setAutoJobAssignment(this.division, city, JOB_TYPE.business, total - 2 * perRole);
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
    const max = 3 + (corp.hasResearched(this.division, RESEARCH.capacity1) ? 1 : 0) + (corp.hasResearched(this.division, RESEARCH.capacity2) ? 1 : 0);

    for (const city of this.cities) {
      if (!div.cities.includes(city)) continue;
      for (const productName of div.products) {
        const prod = corp.getProduct(this.division, city, productName);
        corp.sellProduct(this.division, city, productName, "MAX", "MP", true);
        if (prod.developmentProgress === 100) {
          if (corp.hasResearched(this.division, RESEARCH.marketTA1)) corp.setProductMarketTA1(this.division, productName, true);
          if (corp.hasResearched(this.division, RESEARCH.marketTA2)) corp.setProductMarketTA2(this.division, productName, true);
        }
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

  handleResearch() {
    const corp = this.ns.corporation;
    const div = corp.getDivision(this.division);
    for (const research of this.researchGoals) {
      if (!corp.hasResearched(this.division, research)) {
        const cost = corp.getResearchCost(this.division, research);
        if (div.researchPoints >= cost) {
          corp.research(this.division, research);
          this.ns.print(`[INFO] Researched: ${research}`);
        }
      }
    }
  }

  async tryInvestment() {
    const corp = this.ns.corporation;
    const div = corp.getDivision(this.division);
    if (corp.numShares !== corp.totalShares || div.products.length < 2 || corp.getCorporation().public) return;

    for (const p of div.products) corp.sellProduct(this.division, this.homeCity, p, "0", "MP", true);
    for (const city of this.cities) {
      if (!div.cities.includes(city)) continue;
      const office = corp.getOffice(this.division, city);
      const count = office && Array.isArray(office.employees) ? office.employees.length : 0;
      corp.setAutoJobAssignment(this.division, city, JOB_TYPE.operations, count);
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
      corp.setAutoJobAssignment(this.division, city, JOB_TYPE.business, size);
    }
    for (const p of div.products) corp.sellProduct(this.division, this.homeCity, p, "MAX", "MP", true);

    while (corp.getInvestmentOffer().funds < 4 * base) {
      await this.ns.sleep(500);
    }

    corp.goPublic(800e6);
    this.ns.print(`[INFO] ${this.division} went public.`);
  }
}
