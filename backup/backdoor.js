/** @param {NS} ns */
import {maxThread} from "./helpfunc.js";

export async function main(ns) {
	// name of server to run this script
	//var target = ns.args[0];
 	var portHandle = ns.getPortHandle(1);
    portHandle.clear();

	var targetServ = "home";
	var rootServ = "home";
	var serverList = [];
    // array of servers scanned from current server
	ns.exec("scanlist.js",targetServ,1,targetServ, rootServ, 1);

	// Copy our scripts onto each server that requires 0 ports
	// to gain root access. Then use nuke() to gain admin access and
	// run the scripts.

	await ns.sleep(1000);

	while(1) {

		//await ns.sleep(1000);

		targetServ = ns.readPort(1);

		if (targetServ != "NULL PORT DATA") {

			if (!serverList.includes(targetServ)) {

				serverList.push(targetServ);

				ns.tprint(" ");
				ns.tprint("Backdoor : Now the target server: " + targetServ);
				var execHave = 0;  // # of tools to open the ports
				var backdoorDone = 0;  // flag for backdoor installation success


				// If I have root access, and there is enough RAM for running the hacking script,
				if (ns.hasRootAccess(targetServ) )
				{
					// In case current server has 0 RAM, use scan function, not scanlist.js
					if (ns.getServerMaxRam(targetServ) == 0) {
						ns.tprint("Backdoor : " + targetServ + " has zero RAM.");
						var list = ns.scan(targetServ);
						rootServ = targetServ;
						for (var i = 0; i < list.length; ++i) {
							if (list[i] != rootServ && !list[i].includes("pserv") && list[i] != "home" && list[i] != "darkweb") {
								ns.tprint(list[i]);
								await ns.writePort(1, list[i]); //Writes the value of i to port 1
							};
						};
						ns.tprint("Backdoor : trying backdoor installation...")
						//await ns.exec("backdoor", targetServ);
						await ns.Singularity.installBackdoor(targetServ);
					} else { // If current server has non-zero RAM, use scanlist.js script.

						// copy this script to the server
						ns.tprint("At " + targetServ + " :");
						if (targetServ != "home") {
							if ((ns.getServerMaxRam(targetServ) - ns.getServerUsedRam(targetServ)) >= ns.getScriptRam("scanlist.js")) {
								ns.tprint("Backdoor : " + targetServ + " has enough RAM.");
								await ns.scp("scanlist.js", targetServ);
								rootServ = targetServ;
								ns.exec("scanlist.js", targetServ, 1, targetServ, rootServ, 1);
							};
							ns.tprint("Backdoor : trying backdoor installation...")
							//await ns.exec("backdoor", targetServ);
							await ns.Singularity.installBackdoor(targetServ);
						} else {
							ns.tprint("Backdoor : " + targetServ + " does not have RAM to run scanlist.");
						};

					};

				} else {
					ns.tprint("Backdoor : Do not have root access to " + targetServ);
				};


			};

		} else {
			ns.tprint("Finishing installing backdoor.")
            ns.exit();
		};

	};

}
