/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");

    const args = ns.flags([["help", false]]);
    if (args.help) {
        ns.tprint("This script will enhance your HUD (Heads up Display) with custom statistics.");
        ns.tprint(`Usage: run ${ns.getScriptName()}`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()}`);
        return;
    }

    const doc = eval('document');
    const removeByClassName = (sel) => doc.querySelectorAll(sel).forEach(el => el.remove());
    const colorByClassName = (sel, col) => doc.querySelectorAll(sel).forEach(el => el.style.color = col);
    const hook0 = doc.getElementById('overview-extra-hook-0');
    const hook1 = doc.getElementById('overview-extra-hook-1');

    while (true) {
        try {
            let player = ns.getPlayer();

            // Corporation stats
            let corpFund = "N/A", corpRevenue = "N/A", corpProfit = "N/A";
            try {
                const corp = ns.corporation.getCorporation();
                corpFund = ns.formatNumber(corp.funds, 2);

                let totalRevenue = 0;
                let totalExpenses = 0;

                for (const divName of corp.divisions) {
                    const div = ns.corporation.getDivision(divName);
                    totalRevenue += div.lastCycleRevenue;
                    totalExpenses += div.lastCycleExpenses;
                }

                corpRevenue = ns.formatNumber(totalRevenue, 2);
                corpProfit = ns.formatNumber(totalRevenue - totalExpenses, 2);
            } catch {}

            // Gang info
            let gangInfo = null;
            let gangFaction = "";
            let gangIncome = 0;
            let gangRespect = 0;

            try {
                gangInfo = ns.gang.getGangInformation();
                gangFaction = gangInfo.faction;
                gangIncome = ns.formatNumber(gangInfo.moneyGainRate * 5, 2);
                gangRespect = ns.formatNumber(gangInfo.respect, 5);
            } catch {}

            let playerCity = player.city;
            let playerLocation = player.location;
            let playerKills = player.numPeopleKilled;
            let playerKarma = Math.round(ns.heart.break());

            let purchased_servers = ns.getPurchasedServers();
            purchased_servers.push("home");
            let cumulative = 0;
            for (let pserv of purchased_servers) {
                let gains = 0;
                for (let script of ns.ps(pserv)) {
                    let s = ns.getRunningScript(script.pid);
                    if (s.onlineRunningTime > 0) gains += s.onlineMoneyMade / s.onlineRunningTime;
                }
                cumulative += gains;
            }
            let scriptIncome = ns.formatNumber(cumulative, 2);
            let scriptXP = ns.formatNumber(ns.getTotalScriptExpGain(), 2);

            let hacknetHashRate = 0;
            try {
                hacknetHashRate = ns.hacknet.getHashGainRate();
            } catch {}
            let formattedHashRate = hacknetHashRate > 0 ? ns.formatNumber(hacknetHashRate, 2) + " h/s" : "N/A";

            let currentHashes = ns.hacknet.numHashes();
            let hashCapacity = ns.hacknet.hashCapacity();
            let formattedHashes = `${ns.formatNumber(currentHashes, 2)} / ${ns.formatNumber(hashCapacity, 2)} hashes`;

            removeByClassName('.HUD_el');
            removeByClassName('.HUD_sep');

            hook0.insertAdjacentHTML('beforebegin', `<hr class="HUD_sep HUD_el">`);
            hook1.insertAdjacentHTML('beforebegin', `<hr class="HUD_sep HUD_el">`);

            const insertStat = (key, label, value, colorKey) => {
                hook0.insertAdjacentHTML('beforeend', `<element class="${key}_H HUD_el" title="${label}">${label}</element><br class="HUD_el">`);
                colorByClassName(`.${key}_H`, ns.ui.getTheme()[colorKey]);
                hook1.insertAdjacentHTML('beforeend', `<element class="${key} HUD_el">${value}<br class="HUD_el"></element>`);
                colorByClassName(`.${key}`, ns.ui.getTheme()[colorKey]);
            }

            insertStat("HUD_GN_C", "City", playerCity, 'cha');
            insertStat("HUD_GN_L", "Location", playerLocation, 'cha');

            if (gangInfo) {
                insertStat("HUD_GN_F", "Faction", gangFaction, 'int');
                insertStat("HUD_GN_R", "Gang Respect", gangRespect, 'int');
                insertStat("HUD_GN_I", "Gang Income", "$" + gangIncome + "/sec", 'int');
            }

            insertStat("HUD_ScrInc", "ScrInc", "$" + scriptIncome + "/sec", 'money');
            insertStat("HUD_ScrExp", "ScrExp", scriptXP + " XP/sec", 'hack');
            insertStat("HUD_Hash_Storage", "HashCap", formattedHashes, 'int');
            insertStat("HUD_Karma", "Karma", playerKarma, 'hp');
            insertStat("HUD_Kills", "Kills", playerKills, 'hp');

            insertStat("HUD_CorpFunds", "Corp Funds", "$" + corpFund, 'money');
            insertStat("HUD_CorpRevenue", "Corp Revenue", "$" + corpRevenue, 'money');
            insertStat("HUD_CorpProfit", "Corp Profit", "$" + corpProfit, 'money');

        } catch (err) {
            ns.print("ERROR: Update Skipped: " + String(err));
        }

        ns.atExit(() => removeByClassName('.HUD_el'));
        await ns.sleep(200);
    }
}
