/** @param {NS} ns */
export function maxThread(ns) {

  //ns.tprint("Values in helpfunc = " + values);
  // args[0]: server name, args[1]: size of script to be run on the server
  var target = ns.args[0];
  var script = ns.args[1];

  //ns.tprint('server name = ' + target);

  var hostRAM = ns.getServerMaxRam(target) - ns.getScriptRam("early-hack-template.js") - ns.getScriptRam("helpfunc.js");
  //ns.tprint('server RAM (-3) = ' + hostRAM);

  var scriptRAM = ns.getScriptRam(script);
  //ns.tprint('script size = ' + scriptRAM.toString());

  //ns.tprint('maxInstance = ');
  var maxInstance = parseInt(hostRAM/scriptRAM);
  //ns.tprint("max # of thread = ", + maxInstance);

  return maxInstance;
};

/** @param {NS} ns */
export function lookUpServer(ns) {

	var symbol = ns.args[0];

	// Mapping between symbols and servers
	var symbolList = [ //<----Meticulous part----
			["AERO","AeroCorp","aerocorp"],
			["APHE","Alpha Enterprises","alpha-ent"],
			["BLD","Blade Industries","blade"],
			["CLRK","Clarke Incorporated","clarkinc"],
			["CTK","CompuTek","computek"],
			["CTYS","Catalyst Ventures","catalyst"],
			["DCOMM","DefComm","defcomm"],
			["ECP","ECorp","ecorp"],
			["FLCM","Fulcrum Technologies","fulcrumassets"],
			["FNS","FoodNStuff","foodnstuff"],
			["FSIG","Four Sigma","4sigma"],
			["GPH","Global Pharmaceuticals","global-pharm"],
			["HLS","Helios Labs","helios"],
			["ICRS","Icarus Microsystems","icarus"],
			["JGN","Joe's Guns","joesguns"],
			["KGI","KuaiGong International","kuai-gong"],
			["LXO","LexoCorp","lexo-corp"],
			["MDYN","Microdyne Technologies","microdyne"],
			["MGCP","MegaCorp","megacorp"],
			["NTLK","NetLink Technologies","netlink"],
			["NVMD","Nova Medical","nova-med"],
			["OMGA","Omega Software","omega-net"],
			["OMN","Omnia Cybersystems","omnia"],
			["OMTK","OmniTek Incorporated","omnitek"],
			["RHOC","Rho Contruction","rho-construction"],
			["SGC","Sigma Cosmetics","sigma-cosmetics"],
			["SLRS","Solaris Space Systems","solaris"],
			["STM","Storm Technologies","stormtech"],
			["SYSC","SysCore Securities","syscore"],
			["TITN","Titan Laboratories","titan-labs"],
			["UNV","Universal Energy","univ-energy"],
			["VITA","VitaLife","vitalife"],
			["WDS","Watchdog Security",""]
	];

    //loop through array to find symbol
    for (var index = 0; index < symbolList.length; index++)
    {
        if(symbolList[index][0] == symbol) {
            //return server name
            return symbolList[index][2];
        }
    }

    return "Not Found";
}

/** @param {NS} ns */
export function expCalculator(ns, level){
	// Usage: expCalculator level multiplier
	// level: target level of a skill
	// multiplier: mutiplier of the skill

	return ns.formulas.skills.calculateExp(level, 2.4);
}

/** @param {NS} ns */
export function canHack(ns, server) {
	ns.tprint("Inside canHack");
	var pHackLvl = ns.getHackingLeve();
	var sHackLvl = ns.getServerRequiredHackingLevel(server);
	return pHackLvl >= sHackLvl;
}

/** @param {NS} ns */
export function prefixMoney(number) {

	var moneyShort = 0;

	if (number >= Math.pow(10,18)) {
		moneyShort = (number/Math.pow(10,18)).toFixed(2);
		return [moneyShort, 'q'];
	} else if (number >= Math.pow(10,15)) {
		moneyShort = (number/Math.pow(10,15)).toFixed(2);
		return [moneyShort, 't'];
	} else if (number >= Math.pow(10,12)) {
		moneyShort = (number/Math.pow(10,12)).toFixed(2);
		return [moneyShort, 'b'];
	} else if (number >= Math.pow(10,9)) {
		moneyShort = (number/Math.pow(10,9)).toFixed(2);
		return [moneyShort, 'g'];
	} else if (number >= Math.pow(10,6)) {
		moneyShort = (number/Math.pow(10,6)).toFixed(2);
		return [moneyShort, 'm'];
	} else if (number >= Math.pow(10,3)) {
		moneyShort = (number/Math.pow(10,3)).toFixed(2);
		return [moneyShort, 'k'];
	} else {
		return moneyShort = [number, ' '];
	};
}
