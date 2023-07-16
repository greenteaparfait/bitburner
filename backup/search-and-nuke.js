/** @param {NS} ns */
import {maxThread} from "helpfunc.js";

export async function main(ns) {
	// name of server to run this script
	//var target = ns.args[0];
 	var portHandle = ns.getPortHandle(1);
    portHandle.clear();

	var threads = 5000;
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

		await ns.sleep(1000);

		ns.tprint(" ");
		ns.tprint("Current port data");
        ns.tprint(ns.peek(1));
		ns.tprint(" ");

		targetServ = ns.readPort(1);

		if (targetServ != "NULL PORT DATA") {

			if (!serverList.includes(targetServ)) {

				serverList.push(targetServ);

				ns.tprint(" ");
				ns.tprint("Now the target server: " + targetServ);

				ns.tprint("Server List at " + targetServ);
                ns.tprint(serverList);

				var execHave = 0;  // # of tools to open the ports
				var backdoorDone = 0;  // flag for backdoor installation success

				// Determine max # of threads that can be run on the serv.
				ns.args[0] = targetServ;
				ns.args[1] = "early-hack-template.js";
				//var maxInstance = maxThread(ns);
				//ns.tprint("Max # of thread: " + maxInstance);
				var numPorts = ns.getServerNumPortsRequired(targetServ);

				ns.tprint(" ")
				ns.tprint("Start------------------------------------------")

				// if i do not have root access yet
				if (!ns.hasRootAccess(targetServ))
				{
					// check # of ports to open

					ns.tprint(targetServ + " has " + numPorts + " ports to open.");

					// Open ports
					if (ns.fileExists("BruteSSH.exe", "home"))
					{
						ns.brutessh(targetServ);
						execHave = execHave + 1;
					};
					if (ns.fileExists("FTPCrack.exe", "home"))
					{
						ns.ftpcrack(targetServ);
						execHave = execHave + 1;
					};
					if (ns.fileExists("relaySMTP.exe", "home"))
					{
						ns.relaysmtp(targetServ);
						execHave = execHave + 1;
					};
					if (ns.fileExists("HTTPWorm.exe", "home"))
					{
						ns.httpworm(targetServ);
						execHave = execHave + 1;
					};
					if (ns.fileExists("SQLInject.exe", "home"))
					{
						ns.sqlinject(targetServ);
						execHave = execHave + 1;
					};
					ns.tprint("I have " + execHave + " tools.");

					// Once enough number of ports are open,
					if (numPorts <= execHave)
					{
						// gain root access by nuke
						ns.nuke(targetServ);

						ns.tprint("End ----------------------------------------")

					};

				} else {
					ns.tprint("Already have root access on " + targetServ);
					ns.tprint("End ----------------------------------------")
				};

				// If I have root access,
				if (ns.hasRootAccess(targetServ) == true)
				{
					ns.tprint("Gained root access on " + targetServ);

					// copy hack script to the server
					//ns.scp("early-hack-template.js", targetServ, "home");

					if (ns.scriptRunning("early-hack-template.js", "home"))
					{
						ns.kill("early-hack-template.js","home", targetServ);
					};

					if(ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(targetServ))
					{
						ns.tprint("My hacking skill is enough to hack this server: " + targetServ);
						ns.exec("early-hack-template.js", "home", threads, targetServ);
					} else {
						ns.tprint("Server's required hacking level is higher than mine")
					};

				};

				/*
				// If I have root access, and there is enough RAM for running the hacking script,
				if (ns.hasRootAccess(targetServ) && (ns.getServerMaxRam(targetServ) - ns.getServerUsedRam(targetServ))  >= ns.getScriptRam("early-hack-template.js") ) {
					// if the script is running already, kill the script first,
					if (ns.scriptRunning("early-hack-template.js", targetServ)) {
						ns.killall(targetServ);
					};
					maxInstance = maxThread(targetServ, "early-hack-template.js");
					if (maxInstance > 0) {
						// then restart the script.
						if(ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(targetServ))
						{
							ns.exec("early-hack-template.js", targetServ, maxInstance, targetServ);
						}else {
							ns.tprint("Server's required hacking level is higher than mine")
						};
					};
				} else {
					ns.tprint(targetServ + " does not have enough RAM.");
				};
				*/

				ns.tprint("Recursive Start *********************************************************")

				// In case current server has 0 RAM, use scan function, not scanlist.js
				if (ns.getServerMaxRam(targetServ) == 0) {
					ns.tprint(targetServ + " has zero RAM.");
					let list = ns.scan(targetServ);
					rootServ = targetServ;
					ns.tprint("Enumerating servers from here")
					for (let i = 0; i < list.length; ++i) {
						if (list[i] != rootServ && !list[i].includes("pserv") && list[i] != "home" && list[i] != "darkweb") {
							ns.tprint(list[i]);
							await ns.writePort(1, list[i]); //Writes the value of i to port 1
						};
					};
				} else { // If current server has non-zero RAM, use scanlist.js script.
					// copy this script to the server
					ns.tprint("At " + targetServ + " :");
					if (targetServ != "home") {
						if ((ns.getServerMaxRam(targetServ) - ns.getServerUsedRam(targetServ)) >= ns.getScriptRam("scanlist.js"))
						{
							ns.tprint(targetServ + " has enough RAM.");
							ns.tprint("!! Trying copy of scanlist.js to " + targetServ);
							if (ns.scp("scanlist.js", targetServ, "home") == true)
							{
								ns.tprint("!! Scanlist copy success to " + targetServ);
								rootServ = targetServ;
								ns.exec("scanlist.js", targetServ, 1, targetServ, rootServ, 1);
							} else {
								ns.tprint("!! Scanlist copy fail !")
							};

						};
					} else {
						ns.tprint(targetServ + " does not have RAM to run scanlist.");
					};
				};

				ns.tprint("Recursive End *********************************************************")
				ns.tprint(" ");
			};

		} else {
			ns.tprint("Finishing search and nuke.")
            ns.exit();
		};

	};

}
