/** @param {NS} ns */

export async function main(ns) {

    var upgName = ns.args[0] || "Sell for Money";
    var upgTarget = ns.args[1] || "Must Fill";

    // *********
    // constants
    // *********

    // Do Not Change

    // function myMoney(ns) : amount of money to always keep and not pay for anything
    const KEEPSAKE = 1e6;
    const SLEEP_TIME = 100;	// amount of time between updates in ms
    const MAX_NODES = 16;		// only needed for 'done' to end this script

    const hacknet = ns.hacknet;

    // Possible to change to suit your needs

    // During a 'first run' we want only enough to enable joining Netburners-Faction
    // regardless of money already earned from the hacknet-servers
    const FR_MAX_NODES = 4;  // 4 nodes to keep the investment down
    const FR_MAX_LEVEL = 25; // 25x4=100
    const FR_MAX_RAM   = 2;  //  2x4=  8
    const FR_MAX_CORES = 1;  //  1x4=  4

    // During a 'first run' we want only enough to enable joining Netburners-Faction
    // regardless of money already earned from the hacknet-servers
    //const MAX_NODES = 4;  // 4 nodes to keep the investment down
    const MAX_LEVEL = 75; // 25x4=100
    const MAX_RAM   = 128;  //  2x4=  8
    const MAX_CORES = 8;  //  1x4=  4

    // Change based on the comment possible

    // change MRF to 0 in order to terminate after the 'first run'
    // a MRF greater 1 simply invests up to all money available, but ...
    // that may make the report faulty
    const DEFAULT_MRF = 0.5; // Money Reinvest Factor between 1 for 100% and 0 for 0%
    const MRF = (ns.args[0] === undefined ? DEFAULT_MRF : ns.args[0]);

    // If we only want $ out of the Hacknet-hashes,
    // increasing the cache is not needed.
    // true = Upgrading Cache  -vs-  false = not Upgrading Cache
    const UPGRADE_CACHE = false;
  
    // *********
    // functions
    // *********

    function moneyEarnedHacknet(ns){
        return ns.getMoneySources().sinceInstall.hacknet;
    }

    function moneySpentHacknet(ns) {
        return ns.getMoneySources().sinceInstall.hacknet_expenses;
    }

    function moneyBalanceHacknet2(ns) {
        // money balance weighted by the Reinvestment Factor
        return ((moneyEarnedHacknet(ns) * MRF) + moneySpentHacknet(ns));
    }

    function myMoneyHacknet(ns) {
        // since we want to limit how much money we spent
        //if (moneyBalanceHacknet2(ns) < 0 ) return 0;
        if (myMoney(ns) > moneyBalanceHacknet2(ns)) return myMoney(ns);
        return moneyBalanceHacknet2(ns);
    }

    function currentNodes(ns) {
        return (hacknet.numNodes());
    }

    function currentHashes(ns){
        return hacknet.numHashes();
    }

    function moneyBalanceHacknet(ns) {
        // true count only for the report
        return (moneyEarnedHacknet(ns) + moneySpentHacknet(ns));
    }

    function totalProductionHashes(ns) {
        let sumHashes = 0;
        for (var i = 0; i < currentNodes(ns); i++) {
        sumHashes += hacknet.getNodeStats(i).totalProduction;
        }
        return sumHashes;
    }

    function report(ns) {
        // just a clear summary of things mostly also found elsewhere
        ns.clearLog();
        if (!doneFR(ns)) ns.print("First Run active.");
        ns.print("Hashes available:    # ", ns.formatNumber(currentHashes(ns), 3, 1000, false));
        ns.print("Possible from Sales: $ ", ns.formatNumber(currentHashes(ns)/4*1e6, 3, 1000, false))
        ns.print("--------------------------------");
        ns.print("Hashes produced:     # ", ns.formatNumber(totalProductionHashes(ns), 3, 1000, false));
        ns.print("Brutto Money earned: $ ", ns.formatNumber(moneyEarnedHacknet(ns), 3, 1000, false));
        ns.print("Money spent:         $ ", ns.formatNumber(moneySpentHacknet(ns), 3, 1000, false));
        ns.print("Netto Money earned:  $ ", ns.formatNumber(moneyBalanceHacknet(ns), 3, 1000, false));
        ns.print("--------------------------------");
        ns.print("------ Waiting for enough ------");
        ns.print("Money to ReInvest:   $ ", ns.formatNumber(myMoneyHacknet(ns), 3, 1000, false));
        return;
    }

    function sellHashes(ns){
        //Divide hashes by 4 and round down
        //var count = Math.trunc(currentHashes(ns)/4);
        ns.hacknet.spendHashes("Sell for Money", upgTarget, 1);
        return;
    }

    function upgradeFR(ns) {
        // upgrades during 'first run'
        // - with the original myMoney
        // and without upgrading hash-cache capacity
        for (var i = 0; i < currentNodes(ns); i++) {
        if ((myMoney(ns) > hacknet.getLevelUpgradeCost(i, 1)) &&
            (hacknet.getNodeStats(i).level < FR_MAX_LEVEL)) {
            hacknet.upgradeLevel(i, 1);
        }
        if ((myMoney(ns) > hacknet.getRamUpgradeCost(i, 1)) &&
            (hacknet.getNodeStats(i).ram < FR_MAX_RAM)) {
            hacknet.upgradeRam(i, 1);
        }
        if ((myMoney(ns) > hacknet.getCoreUpgradeCost(i, 1)) &&
            (hacknet.getNodeStats(i).cores < FR_MAX_CORES)) {
            hacknet.upgradeCore(i, 1);
        }
        }
        if ((myMoney(ns) > hacknet.getPurchaseNodeCost()) &&
            (currentNodes(ns) < FR_MAX_NODES)) {
            hacknet.purchaseNode();
        }
        sellHashes(ns);
        report(ns);
        return;
    }

    function doneFR(ns) {
        // simple logic to look out if the 'first run' is still currently active
        let ind = ((FR_MAX_NODES -1) >= currentNodes(ns) ? (currentNodes(ns) -1) : (FR_MAX_NODES -1));
        //ns.tprint("Inside doneFR: ind = " + ind)
        //ns.tprint("Inside doneFR: currentNodes = " + currentNodes(ns))
        if (currentNodes(ns) == 0) return false;
        //ns.tprint("Inside doneFR: node level = " + hacknet.getNodeStats(ind).level)
        //ns.tprint("Inside doneFR: node ram = " + hacknet.getNodeStats(ind).ram)
        //ns.tprint("Inside doneFR: node cores = " + hacknet.getNodeStats(ind).cores)
        if ((currentNodes(ns) >= ind) &&
            (hacknet.getNodeStats(ind).level >= FR_MAX_LEVEL) &&
            (hacknet.getNodeStats(ind).ram >= FR_MAX_RAM) &&
            (hacknet.getNodeStats(ind).cores >= FR_MAX_CORES)){
            //ns.tprint("Inside doneFR: true");
            return true;
        } else {
            return false;
        }
    }

    function findCULevel(ns) {
        // finds Cheapest Upgrade Level and returns the index of the node
        var cl = 0;
        for (var i = 1; i < currentNodes(ns); i++) {
        if (hacknet.getLevelUpgradeCost(i, 1) < hacknet.getLevelUpgradeCost(i-1, 1)) cl = i;
        }
        return cl;
    }

    function findCURam(ns) {
        // finds Cheapest Upgrade Ram and returns the index of the node
        var cr = 0;
        for (var i = 1; i < currentNodes(ns); i++) {
        if (hacknet.getRamUpgradeCost(i, 1) < hacknet.getRamUpgradeCost(i-1, 1)) cr = i;
        }
        return cr;
    }

    function findCUCore(ns) {
        // finds Cheapest Upgrade Core and returns the index of the node
        var cc = 0;
        for (var i = 1; i < currentNodes(ns); i++) {
        if (hacknet.getCoreUpgradeCost(i, 1) < hacknet.getCoreUpgradeCost(i-1, 1)) cc = i;
        }
        return cc;
    }

    function findCUCache(ns) {
        // returns the index of the cheapest level-upgrade node
        var cca = 0;
        for (var i = 1; i < currentNodes(ns); i++) {
        if (hacknet.getCacheUpgradeCost(i, 1) < hacknet.getCacheUpgradeCost(i-1, 1)) cca = i;
        }
        return cca;
    }

    function findCheapest(ns) {
        // returns a string determining which to upgrade
        let cheapestObject = "n";
        let cheapestPrice = hacknet.getPurchaseNodeCost();
        let nodes = ((MAX_NODES -1) >= currentNodes(ns) ? (currentNodes(ns) -1) : (MAX_NODES -1));

        if (
            (hacknet.getLevelUpgradeCost(findCULevel(ns), 1) < cheapestPrice)
        && ((hacknet.getNodeStats(nodes).level < MAX_LEVEL))
        ) {
            cheapestObject = "l";
            cheapestPrice = hacknet.getLevelUpgradeCost(findCULevel(ns), 1);
        }
        if (
            (hacknet.getRamUpgradeCost(findCURam(ns), 1) < cheapestPrice)
        && ((hacknet.getNodeStats(nodes).ram < MAX_RAM))
        ) {
            cheapestObject = "r";
            cheapestPrice = hacknet.getRamUpgradeCost(findCURam(ns), 1);
        }
        if (
            (hacknet.getCoreUpgradeCost(findCUCore(ns), 1) < cheapestPrice)
        && (hacknet.getNodeStats(nodes).cores < MAX_CORES)
        ) {
            cheapestObject = "c";
            cheapestPrice = hacknet.getCoreUpgradeCost(findCUCore(ns), 1);
        }
        if (
            UPGRADE_CACHE && 
            (hacknet.getCacheUpgradeCost(findCUCache(ns), 1) < cheapestPrice)
        ) {
            cheapestObject = "ca";
        }
        return cheapestObject;
    }

    function upgradeReport(ns) {
        // returns a printable string as an upgrade to report
        // would produce errors during 'first run'
        let urs = "";
        let tar2 = findCheapest(ns);
        if (tar2 == "n") urs = ("Next Upgrade Node for $ " + ns.formatNumber(hacknet.getPurchaseNodeCost(), 3, 1000, false));
        if (tar2 == "l") urs = ("Next Upgrade Level for $ " + ns.formatNumber(hacknet.getLevelUpgradeCost(findCULevel(ns), 1), 3, 1000, false));
        if (tar2 == "r") urs = ("Next Upgrade RAM for $ " + ns.formatNumber(hacknet.getRamUpgradeCost(findCURam(ns), 1), 3, 1000, false));
        if (tar2 == "c") urs = ("Next Upgrade Core for $ " + ns.formatNumber(hacknet.getCoreUpgradeCost(findCUCore(ns), 1), 3, 1000, false));
        if (tar2 == "ca") urs = ("Next Upgrade Cache for $ " + ns.formatNumber(hacknet.getCacheUpgradeCost(findCUCache(ns), 1), 3, 1000, false));
        return urs;
    }

    function upgrade(ns) {
        //ns.tprint("Inside upgrade: ");
        let tar = findCheapest(ns);
        
        //ns.tprint("Inside upgrade: tar = " + tar);
        //ns.tprint("Inside upgrade: myMoneyHacknet = " + myMoneyHacknet(ns));
        if (tar == "n" && 
            myMoneyHacknet(ns) > hacknet.getPurchaseNodeCost()) {
            hacknet.purchaseNode();
        } else if (tar == "l" &&
                myMoneyHacknet(ns) > hacknet.getLevelUpgradeCost(findCULevel(ns), 1)) {
            hacknet.upgradeLevel(findCULevel(ns), 1);
        } else if (tar == "r" &&
                myMoneyHacknet(ns) > hacknet.getRamUpgradeCost(findCURam(ns), 1)) {
            hacknet.upgradeRam(findCURam(ns), 1);
        } else if (tar == "c" &&
                myMoneyHacknet(ns) > hacknet.getCoreUpgradeCost(findCUCore(ns), 1)) {
            hacknet.upgradeCore(findCUCore(ns), 1);
        } else if (tar == "ca" &&
                myMoneyHacknet(ns) > hacknet.getCacheUpgradeCost(findCUCache(ns), 1)) {
            hacknet.upgradeCache(findCUCache(ns), 1);
        }
        //sellHashes(ns);
        report(ns);
        ns.print(upgradeReport(ns));
        return;
    }

    function done(ns) {
        if ((hacknet.getPurchaseNodeCost() == Infinity) &&
            (hacknet.getCoreUpgradeCost(MAX_NODES - 1, 1) == Infinity) &&
            (hacknet.getRamUpgradeCost(MAX_NODES - 1, 1) == Infinity) &&
            (hacknet.getLevelUpgradeCost(MAX_NODES - 1, 1) == Infinity) &&
            (hacknet.getCacheUpgradeCost(MAX_NODES - 1, 1) == Infinity)) {
        // case is the 'normal' way to end this script
        ns.tprint("All Nodes bought and completly upgraded!");
        return true;
        } else if ((MRF == 0) && (doneFR(ns))) {
        // case with only enough hacknet capacity for Netburners faction
        return true;
        } else return false;	// default case - keep running the script
    }

    function myMoney(ns) {
        let amount = (ns.getServerMoneyAvailable("home") - KEEPSAKE);
        if (amount > 0) return amount;
        return 0;
    }

    // *************
    // configuration
    // *************

    ns.tail();
    ns.disableLog("sleep");
    ns.disableLog("getServerMoneyAvailable");

    // *********
    // main loop
    // *********

    while(!done(ns)) {

        let nodes = ((MAX_NODES -1) >= currentNodes(ns) ? (currentNodes(ns) -1) : (MAX_NODES -1));

        if (!doneFR(ns)) {
            upgradeFR(ns)   // Do the first run upgrade and sell hashes
        } else {
            // Do the upgrade until maximum amounts of cores, rams, levels are achieved
            if ((nodes < MAX_NODES -1) ||
            (hacknet.getNodeStats(nodes).level < MAX_LEVEL) ||
            (hacknet.getNodeStats(nodes).ram < MAX_RAM) ||
            (hacknet.getNodeStats(nodes).cores < MAX_CORES)){
                //ns.tprint("Inside doneFR: true");
                upgrade(ns);
            } else {
            // Afer arrving the goal, sell the hashes
                sellHashes(ns);
            }
        };

        await ns.sleep(SLEEP_TIME);
    }
}

