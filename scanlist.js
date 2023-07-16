/** @param {NS} ns */
export async function main(ns) {
    var self = ns.args[0];
    var sourceServer = ns.args[1];
    var port = ns.args[2];
    var list = ns.scan(self);
    //ns.tprint("Inside scanlist:, scanlist is " + list);
    for (var i = 0; i < list.length; ++i) {
        if (list[i] != sourceServer && !list[i].includes("pserv") 
        && !list[i].includes("hacknet-server")) {
            //ns.tprint("Inside scanlist, list[i] is " + list[i]);
            await ns.writePort(port, list[i]); //Writes the value of i to port 1
        };
    };
    //ns.tprint("Inside scanlist:, port is " + ns.readPort(port));
}