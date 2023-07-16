/** @param {NS} ns */
import {maxThread} from "helpfunc.js";

export async function main(ns) {
	// name of server to run this script
	var home_server = (ns.args[0] || "home");
	var port_number = (ns.args[1] || "1");
 	var portHandle = ns.getPortHandle(port_number);
    portHandle.clear();

	var threads = 200;
	var targetServ = home_server;
	var rootServ = home_server;
	var serverList = [];
    // array of servers scanned from current server
	ns.exec("scanlist.js",targetServ,1,targetServ, rootServ, port_number);

	// Copy our scripts onto each server that requires 0 ports
	// to gain root access. Then use nuke() to gain admin access and
	// run the scripts.

	await ns.sleep(1000);

	while(1) {

		await ns.sleep(1000);

		ns.print(" ");
		ns.print("Current port data");
        ns.print(ns.peek(port_number));
		ns.print(" ");

		targetServ = ns.readPort(port_number);

		if (targetServ != "NULL PORT DATA") {

			if (!serverList.includes(targetServ) && !targetServ.includes("hacknet-server") 
			&& !targetServ.includes("pserv")) {

				serverList.push(targetServ);

				ns.print(" ");
				ns.print("Now the target server: " + targetServ);

				ns.print("Server List at " + targetServ);
                ns.print(serverList);

				var execHave = 0;  // # of tools to open the ports
				var backdoorDone = 0;  // flag for backdoor installation success

				// Determine max # of threads that can be run on the serv.
				ns.args[0] = targetServ;
				ns.args[1] = "early-hack-template.js";
				//var maxInstance = maxThread(ns);
				//ns.print("Max # of thread: " + maxInstance);
				var numPorts = ns.getServerNumPortsRequired(targetServ);

				ns.print(" ")
				ns.print("Start------------------------------------------")

				// if i do not have root access yet
				if (!ns.hasRootAccess(targetServ))
				{
					// check # of ports to open

					ns.print(targetServ + " has " + numPorts + " ports to open.");

					// Open ports
					if (ns.fileExists("BruteSSH.exe", home_server))
					{
						ns.brutessh(targetServ);
						execHave = execHave + 1;
					};
					if (ns.fileExists("FTPCrack.exe", home_server))
					{
						ns.ftpcrack(targetServ);
						execHave = execHave + 1;
					};
					if (ns.fileExists("relaySMTP.exe", home_server))
					{
						ns.relaysmtp(targetServ);
						execHave = execHave + 1;
					};
					if (ns.fileExists("HTTPWorm.exe", home_server))
					{
						ns.httpworm(targetServ);
						execHave = execHave + 1;
					};
					if (ns.fileExists("SQLInject.exe", home_server))
					{
						ns.sqlinject(targetServ);
						execHave = execHave + 1;
					};
					ns.print("I have " + execHave + " tools.");

					// Once enough number of ports are open,
					if (numPorts <= execHave)
					{
						// gain root access by nuke
						ns.nuke(targetServ);

						ns.print("End ----------------------------------------")

					};

				} else {
					ns.print("Already have root access on " + targetServ);
					ns.print("End ----------------------------------------")
				};

				// If I have root access,
				if (ns.hasRootAccess(targetServ) == true)
				{
					ns.print("Gained root access on " + targetServ);

					// copy hack script to the server
					//ns.scp("early-hack-template.js", targetServ, home_server);

					if (ns.scriptRunning("early-hack-template.js", home_server))
					{
						ns.kill("early-hack-template.js",home_server, targetServ);
					};

					if(ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(targetServ))
					{
						ns.print("My hacking skill is enough to hack this server: " + targetServ);
						ns.exec("early-hack-template.js", home_server, threads, targetServ);
					} else {
						ns.print("Server's required hacking level is higher than mine")
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
							ns.print("Server's required hacking level is higher than mine")
						};
					};
				} else {
					ns.print(targetServ + " does not have enough RAM.");
				};
				*/

				ns.print("Recursive Start *********************************************************")

				// In case current server has 0 RAM, use scan function, not scanlist.js
				if (ns.getServerMaxRam(targetServ) == 0) {
					ns.print(targetServ + " has zero RAM.");
					let list = ns.scan(targetServ);
					rootServ = targetServ;
					ns.print("Enumerating servers from here")
					for (let i = 0; i < list.length; ++i) {
						if (list[i] != rootServ && !list[i].includes("pserv") && list[i] != home_server && list[i] != "darkweb") {
							ns.print(list[i]);
							await ns.writePort(port_number, list[i]); //Writes the value of i to port 1
						};
					};
				} else { // If current server has non-zero RAM, use scanlist.js script.
					// copy this script to the server
					ns.print("At " + targetServ + " :");
					if (targetServ != home_server) {
						if ((ns.getServerMaxRam(targetServ) - ns.getServerUsedRam(targetServ)) >= ns.getScriptRam("scanlist.js"))
						{
							ns.print(targetServ + " has enough RAM.");
							ns.print("!! Trying copy of scanlist.js to " + targetServ);
							if (ns.scp("scanlist.js", targetServ, home_server) == true)
							{
								ns.print("!! Scanlist copy success to " + targetServ);
								rootServ = targetServ;
								ns.exec("scanlist.js", targetServ, 1, targetServ, rootServ, port_number);
							} else {
								ns.print("!! Scanlist copy fail !")
							};

						};
					} else {
						ns.print(targetServ + " does not have RAM to run scanlist.");
					};
				};

				ns.print("Recursive End *********************************************************")
				ns.print(" ");
			};

		} else {
			ns.tprint("Finishing search and nuke.")
            ns.exit();
		};

	};

}
