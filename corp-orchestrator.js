/** @param {NS} ns **/
import { INDUSTRIES, CORP_SCRIPTS } from "corp-constants.js";

export async function main(ns) {
  const corp = ns.corporation;
  const divisions = corp.getCorporation().divisions;

  const scripts = [];
  if (CORP_SCRIPTS.manager) {
    scripts.push({ script: CORP_SCRIPTS.manager, args: [] });
  } else {
    ns.tprint("[ERROR] CORP_SCRIPTS.manager is undefined. Check corp-constants.js");
  }

  if (CORP_SCRIPTS.divisionManager) {
    for (const division of divisions) {
      scripts.push({ script: CORP_SCRIPTS.divisionManager, args: [division] });
    }
  } else {
    ns.tprint("[ERROR] CORP_SCRIPTS.divisionManager is undefined. Check corp-constants.js");
  }

  for (const { script, args } of scripts) {
    const running = ns.isRunning(script, "home", ...args);
    const scriptRam = ns.getScriptRam(script);
    const availableRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");

    if (!running) {
      if (availableRam >= scriptRam) {
        ns.run(script, 1, ...args);
        ns.tprint(`[ORCH] Launched ${script}${args.length ? ` for ${args.join(", ")}` : ""}`);
      } else {
        ns.tprint(`[WARN] Not enough RAM to launch ${script}${args.length ? ` for ${args.join(", ")}` : ""}`);
      }
    }
  }
}
