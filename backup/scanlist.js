/** @param {NS} ns */
export async function main(ns) {
    var self = ns.args[0];
    var sourceServer = ns.args[1];
    var port = ns.args[2];
    var list = ns.scan(self);
    for (var i = 0; i < list.length; ++i) {
        if (list[i] != sourceServer && !list[i].includes("pserv")
        && list[i] != "home" && list[i] != "home2") {
            ns.tprint(list[i]);
            await ns.writePort(port, list[i]); //Writes the value of i to port 1
        };
    };
}
