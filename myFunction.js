/** @param {NS} ns */

// function myMoney(ns) : amount of money to always keep and not pay for anything
const KEEPSAKE = 1e6;

export function myMoney(ns) {
  let amount = (ns.getServerMoneyAvailable("home") - KEEPSAKE);
  if (amount > 0) return amount;
  return 0;
}