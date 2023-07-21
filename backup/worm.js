/** @param {NS} ns **/
export async function main(ns)
{
    // a server list holding names of servers already tried
    var serverlist = [];
	var server = "home";
	await wormFunc(ns, server, "", serverlist);
};

async function wormFunc(ns, curr_serv, oldserv, serverlist) {

	await ns.sleep(500);

	var target_server = "";
	var stepUp = oldserv;
	//ns.tprint("1: Curr serv = " + curr_serv)
	ns.singularity.connect(curr_serv);

	// ************  Server report
	if ( curr_serv != "home") {
		ns.tprint(`${curr_serv}:`);
		let money = ns.getServerMoneyAvailable(curr_serv);
		if (money === 0) money = 1;
		//const maxMoney = ns.getServerMaxMoney(curr_serv);
		//ns.tprint("Max money = " + maxMoney);
		//const minSec = ns.getServerMinSecurityLevel(curr_serv);
		//ns.tprint("Minimum security level= " + minSec);
		//const sec = ns.getServerSecurityLevel(curr_serv);
		//ns.tprint("Current security level= " + sec);

		//ns.tprint(` $_______: ${ns.nFormat(money, "$0.000a")} / ${ns.nFormat(maxMoney, "$0.000a")} (${(money / maxMoney * 100).toFixed(2)}%)`);
		//ns.tprint(` security: +${(sec - minSec).toFixed(2)}`);
		ns.tprint(` hack____: ${ns.tFormat(ns.getHackTime(curr_serv))} (t=${Math.ceil(ns.hackAnalyzeThreads(curr_serv, money))})`);
		//if (maxMoney > 0) {
		//	ns.tprint(` grow____: ${ns.tFormat(ns.getGrowTime(curr_serv))} (t=${Math.ceil(ns.growthAnalyze(curr_serv, maxMoney / money))})`);
		//};
		//ns.tprint(` weaken__: ${ns.tFormat(ns.getWeakenTime(curr_serv))} (t=${Math.ceil((sec - minSec) * 20)})`);
	};
	// ************ Server report end



	// scan other servers connected to current server
	var servers_to_scan = ns.scan(curr_serv);
    // remove old server and home from servers_to_scan
	servers_to_scan = servers_to_scan.filter(function(item) {
    	return item !== oldserv
	})
	servers_to_scan = servers_to_scan.filter(function(item) {
    	return item !== "home"
	})
    ns.tprint(curr_serv + ": " + servers_to_scan);

	// If the server is not backdoored,
	// and I have root access,
	// and I have an enough hacking level,
	// then execute backdoor.
	if (ns.hasRootAccess(curr_serv) && !ns.getServer(curr_serv).backdoorInstalled &&
		ns.getServerRequiredHackingLevel(curr_serv) <= ns.getHackingLevel() )
	{
		ns.tprint("Trying worm to server = " + curr_serv);
		ns.tprint("Got root access? " + ns.hasRootAccess(curr_serv));
		ns.tprint("Required hacking level = " + ns.getServerRequiredHackingLevel(curr_serv));
		ns.tprint("Current hacking level = " + ns.getHackingLevel());

		try {
			await ns.singularity.installBackdoor()
		} catch {
			ns.tprint("Required hacking level > player hacking level")
		}
		ns.tprint("Backdoor tried on " + curr_serv)

	} else {
		if(ns.getServer(curr_serv).backdoorInstalled){
			ns.tprint("The server " + curr_serv + " is already backdoored")
		}
	}

	for (var j = 0; j < servers_to_scan.length; j++)
	{
		// Set CURR_SERV as the next target to worm
		target_server = servers_to_scan[j];

		// If the target is a new one
        if ( !serverlist.includes(target_server) )
		{
			// Record the target name in the serverlist
			serverlist.push(target_server);

			// Now the current server becomes the old server
			oldserv = curr_serv;
			ns.tprint("---------------------------------------------");
			ns.tprint("Stepping down : " + curr_serv + " --> " + target_server)
			//ns.tprint("2: Target server = " + target_server + ", " + j);
			//ns.singularity.connect(target_server);
			// recursive call
			await wormFunc(ns, target_server, oldserv, serverlist);

		} else {
			ns.tprint(" already in server list.")
		};
		// If the targer is a server already encountered, do nothing.
	};
    ns.tprint("Returning : " + curr_serv + " --> " + stepUp)

	if ( stepUp != ""){
		ns.singularity.connect(stepUp);
	} else {
		ns.tprint("Finishing the installing backdoors.")
	}

};
