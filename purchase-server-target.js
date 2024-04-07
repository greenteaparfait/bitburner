/** @param {NS} ns */
import {prefixMoney} from "helpfunc.js";

export async function main(ns) {

	// placeholder for purchased server
	var hostname = "";
	var maxServer = 25;
	var reducedMoney = [];

	var availableMoney = ns.getServerMoneyAvailable("home");
	reducedMoney = prefixMoney(availableMoney);
	ns.tprint("Available money = " + reducedMoney[0] + reducedMoney[1]);

	var fundPerServer = parseInt(availableMoney/(maxServer));
	reducedMoney = prefixMoney(fundPerServer);
	ns.tprint("Fund per server = " + reducedMoney[0] + reducedMoney[1]);

	var ram = 8;

	// How much RAM each purchased server will have.
	for (let i = 2; i <= 20; i++) {
		if ( fundPerServer >= ns.getPurchasedServerCost(Math.pow(2, i)) ) {
			ram = Math.pow(2,i);
		};
	};
	ns.tprint("Ram = " + ram);
	ns.tprint(prefixMoney(availableMoney)[0] + prefixMoney(availableMoney)[1]);

    await ns.sleep(100);
	
	// Iterator we'll use for our loop
	var i = 2;
    var numThreads = 1;
    var serverName = "";
	var targetList = [];

	ns.tprint("We can have a maximum number of servers : " + maxServer);

    /**
     * Choose the target
     */
    var j = 0;
    var fileContent = await ns.read("network-report.txt");
    // If the file is empty, set the target as n00dles
    if (fileContent == "") {
        await ns.write("network-report.txt", "node: n00dles", 'w');
        ns.tprint("File is empty. Target " + fileContent);
        targetList.push("n00dles");
    };   
    // Make a list of targets
    var lines = fileContent.split('\n');
    for (var line = 0; line < lines.length; line++) {
        //ns.tprint(lines[line]);
        var key = lines[line].split(" ")[0];
        var value = lines[line].split(" ")[1];
        if ( key == "node:") {
            targetList.push(value);
            //ns.tprint("Target node #" + j + " = " + value);
        };
    };

	j = targetList.length;
	ns.tprint("Target list : " + targetList);
    // Choose the first target among the target list
    if ( j != 0) {
        var target = targetList.pop()
        ns.tprint("Target = " + target);
        //ns.exec("early-hack-template.js", hostname, numThreads, target);
    } else {
        ns.tprint("No target, set to default, n00dles");
        var target = "n00dles";
    };

    i = 2;
	// Continuously try to purchase servers until we've reached the maximum
	// amount of servers
	while (i <= maxServer) {
		//ns.tprint("Purchase cost = " + ns.getPurchasedServerCost(ram))
		// Check if we have enough money to purchase a server
		if (availableMoney >= fundPerServer*maxServer) {
			//ns.tprint("Purchase cost = " + ns.getPurchasedServerCost(ram))
			// If we have enough money, then:
			//  1. Purchase the server
			//  2. Copy our hacking script onto the newly-purchased server
			//  3. Run our hacking script on the newly-purchased server with 3 threads
			//  4. Increment our iterator to indicate that we've bought a new server
			serverName = "pserv-" + i.toString();
			//ns.tprint("Server name, " + serverName)
			hostname = ns.purchaseServer(serverName, ram);
			hostname = serverName;

			//numThreads = parseInt(ns.getServerMaxRam(hostname)/(ns.getScriptRam("early-hack-template.js")*j)); 
			//ns.tprint("Number of threads per target = " + numThreads);
			if (hostname != "") {
				//ns.tprint("We have a server, " + hostname);
				//await ns.scp("search-and-hack.js", hostname);
				await ns.scp("early-hack-template.js", hostname);
				//await ns.scp("helpfunc.js", hostname)              
                numThreads = parseInt(ns.getServerMaxRam(hostname)/(ns.getScriptRam("early-hack-template.js")*j)); 
				//ns.tprint("Number of threads per target = " + numThreads);
				ns.exec("early-hack-template.js", hostname, numThreads, target);
			} else {
				ns.tprint("hostname is empty");
			}
		} else {
			ns.tprint("Not enough money available...");	
		};
		++i;
	};
}