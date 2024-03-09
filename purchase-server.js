/** @param {NS} ns */
export async function main(ns) {

    // Usage: run purchase-server.js {number of server to purchase}, if omitted it is set to 15
	// placeholder for purchased server
	var hostname = "";
	var maxServer = (ns.args[0] || 20);
	const name = "pserv-";

	var availableMoney = ns.getServerMoneyAvailable("home");
	ns.print("Fund at home = " + ns.formatNumber(availableMoney, 3, 1000, false));
	var fundPerServer = parseInt(availableMoney/(maxServer));
	ns.print("Fund per server = " + ns.formatNumber(fundPerServer, 3, 1000, false));
	var ram = 8;

	// How much RAM each purchased server will have.
	for (let i = 4; i <= 20; i++) {
		if ( fundPerServer >= ns.getPurchasedServerCost(Math.pow(2, i)) ) {
			ram = Math.pow(2,i);
		};
	};
	ns.print("Ram = " + ram);

    await ns.sleep(500);
	
	// Iterator we'll use for our loop
	var i = 2;
    var numThreads = 1;
    var serverName = "";

	ns.print("We can have a maximum number of servers : " + maxServer);

    i = 2;
	// Continuously try to purchase servers until we've reached the maximum
	// amount of servers
	while (i <= maxServer) {
		//ns.print("Purchase cost = " + ns.getPurchasedServerCost(ram))
		// Check if we have enough money to purchase a server
		if (availableMoney >= fundPerServer*maxServer) {
			//ns.print("Purchase cost = " + ns.getPurchasedServerCost(ram))
			// If we have enough money, then:
			//  1. Purchase the server
			//  2. Copy our hacking script onto the newly-purchased server
			//  3. Run our hacking script on the newly-purchased server with 3 threads
			//  4. Increment our iterator to indicate that we've bought a new server
			//serverName = "pserv-" + i.toString();
			//ns.print("Server name, " + serverName);
			if (!ns.serverExists(name + i)) {
				hostname = ns.purchaseServer(name + i, ram);
				ns.print("Purchased server == " + hostname);
				ns.print("We have a server, " + name + i);
			} else {
				ns.print("Server, " + name + i + " already exists.");
				hostname = name + i;
			};

			ns.brutessh(hostname);
			ns.ftpcrack(hostname);
			ns.relaysmtp(hostname);
			ns.httpworm(hostname);
			ns.sqlinject(hostname);

			await ns.scp("search-and-nuke.js", hostname);
            await ns.scp("scanlist.js", hostname);
			await ns.scp("early-hack-template.js", hostname);
			await ns.scp("helpfunc.js", hostname);
			//numThreads = parseInt(ns.getServerMaxRam(hostname)/(ns.getScriptRam("search-and-hack.js") 
			//+ ns.getScriptRam("early-hack-template.js")*5) - ns.getScriptRam("scanlist.js") );
			ns.exec("search-and-nuke.js", hostname, numThreads, hostname, i);
			
		} else {
			ns.print("Not enough money available...");	
		};
		++i;
	};
}