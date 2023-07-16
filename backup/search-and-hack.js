/** @param {NS} ns */
import {maxThread} from "helpfunc.js";

export async function main(ns) {
	// number of port
	var port = ns.args[0];
 	var portHandle = ns.getPortHandle(port);
    portHandle.clear();

	var home = "home"
	var self = "hacknet-node-" + port
	var targetServ = self;
	var rootServ = self;
	var serverList = [];
	var result = 0;

    // array of servers scanned from current server
	ns.tprint("Initiaing search and hack on " + self);
	ns.exec("scanlist.js", home, 1, home, home, port);

	// Copy our scripts onto each server that requires 0 ports
	// to gain root access. Then use nuke() to gain admin access and
	// run the scripts.

	await ns.sleep(1000);

	while(1) {

		targetServ = ns.readPort(port);

		if ( (targetServ != "NULL PORT DATA") && (targetServ != self) ) {
			if (!serverList.includes(targetServ)) {  // if this server is new one,
				// run hacking script on home server
				if (ns.hasRootAccess(targetServ)) {
					serverList.push(targetServ);
					ns.tprint(" ");
					ns.tprint(self);
					ns.tprint("Now the target server: " + targetServ);
					//if (ns.scriptRunning("early-hack-template.js", self)) {
					//	ns.kill("early-hack-template.js",self, targetServ);
					//};

					if (ns.getServerRequiredHackingLevel(targetServ) < ns.getHackingLevel()) {
						ns.tprint("I can hack " + targetServ);
						ns.args[0]=self;  // my server
						ns.args[1]="early-hack-template.js";
						// Available free RAM on my server
						var freeRamServer = (ns.getServerMaxRam(self) - ns.getServerUsedRam(self)).toFixed(1);
						// Alloted RAM per a target server, 1/10 of max RAM of my server
						var allotedThread = parseInt(maxThread(ns)/10);
						if (maxThread(ns) != 0) {
							var ramUsePerTarget = (allotedThread*ns.getScriptRam("early-hack-template.js")).toFixed(1);
							// total required RAM  =  ramUserPerTarget + ram cost of exec() + ram cost of 'search-and-hack.js'
							ns.tprint("# of threads to run = " + allotedThread.toString() )
							var totalRamUse = parseInt(ramUsePerTarget) + ns.getScriptRam("search-and-hack.js") + 1.3;
							result = ns.exec("early-hack-template.js", self, allotedThread, targetServ);
							//ns.tprint("Free RAM on server = " + freeRamServer);
							//ns.tprint("required RAM on server to run scripts per target = " + totalRamUse.toFixed(1).toString());
							if (result > 0) {
								ns.tprint("Execution success, process # = " + result);
							} else {
								ns.tprint("Execution failed");
								if ( freeRamServer < totalRamUse) {
									ns.tprint("Cause: Insufficient RAM on target");
								};
							};
						} else {
							ns.tprint("Server has too small ram");
						};
					} else {
						ns.tprint("I cannot hack " + targetServ);
					};
					//rootServ = targetServ;
					//ns.exec("scanlist.js", targetServ, 1, targetServ, rootServ, port);
				} else {
					ns.tprint("I don't have root access to " + targetServ);
				};

			};

		} else {
			//ns.tprint("Finishing search and hack on hacknet-node-" + port);
            //ns.exit();
		};
		await ns.sleep(1000);
	};

}ƒ
