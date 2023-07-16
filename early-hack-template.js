/** @param {NS} ns */
export async function main(ns) {
    var target = ns.args[0];
    var moneyThresh = ns.getServerMaxMoney(target) * 0.1;
    var securityThresh = ns.getServerMinSecurityLevel(target) + 2;
    //ns.tprint('starting grow/weak/hack in ' + target);
    while(true) {
        ns.print(" ");
        ns.print("money threshold = " + moneyThresh);
        ns.print("security threshold = " + securityThresh);
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            await ns.grow(target);
        } else {
            await ns.hack(target);
        };
    };
}