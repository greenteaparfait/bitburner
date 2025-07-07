/** @param {NS} ns **/
import { ALL_CITIES, MATERIALS, JOB_TYPE, RESEARCH } from "corp-constants.js";

export async function main(ns) {
  const division = ns.args[0] || "Tobacco";
  const manager = new DivisionManager(ns, division);
  await manager.run();
}

class DivisionManager {
  constructor(ns, division) {
    this.ns = ns;
    this.division = division;
    this.cities = ALL_CITIES;
  }

  async run() {
    while (true) {
      this.upgradeWarehouses();
      this.manageSmartSupply();
      this.enableMarketTA();
      this.purchaseMaterials();
      await this.ns.sleep(5000);
    }
  }

  upgradeWarehouses() {
    const corp = this.ns.corporation;
    const div = corp.getDivision(this.division);
    for (const city of this.cities) {
      if (!div.cities.includes(city)) continue;
      if (!corp.hasWarehouse(this.division, city)) continue;
      const wh = corp.getWarehouse(this.division, city);
      if (wh.sizeUsed / wh.size > 0.9) {
        const cost = corp.getUpgradeWarehouseCost(this.division, city);
        if (corp.getCorporation().funds >= cost) {
          corp.upgradeWarehouse(this.division, city);
          this.ns.print(`[UPGRADE] Warehouse expanded in ${city}`);
        }
      }
    }
  }

  manageSmartSupply() {
    const corp = this.ns.corporation;
    const div = corp.getDivision(this.division);
    for (const city of this.cities) {
      if (!div.cities.includes(city)) continue;
      if (!corp.hasWarehouse(this.division, city)) continue;
      if (corp.hasUnlock("Smart Supply")) {
        corp.setSmartSupply(this.division, city, true);
      }
    }
  }

  enableMarketTA() {
    const corp = this.ns.corporation;
    const div = corp.getDivision(this.division);
    const ta1 = corp.hasResearched(this.division, RESEARCH.marketTA1);
    const ta2 = corp.hasResearched(this.division, RESEARCH.marketTA2);

    for (const product of div.products) {
      if (ta1) corp.setProductMarketTA1(this.division, product, true);
      if (ta2) corp.setProductMarketTA2(this.division, product, true);
    }
  }

  purchaseMaterials() {
    const corp = this.ns.corporation;
    const div = corp.getDivision(this.division);
    const matList = MATERIALS[this.division] || [];

    for (const city of this.cities) {
      if (!div.cities.includes(city)) continue;
      if (!corp.hasWarehouse(this.division, city)) continue;
      for (const mat of matList) {
        corp.buyMaterial(this.division, city, mat, 0.0);
      }
    }
  }
}
