 /* @param {NS} ns */
  export async function main(ns) {

    let hudElement = null;  
      hudElement = initializeHud(ns);
    ns.atExit(() => hudElement.parentElement.parentElement.parentElement.removeChild(hudElement.parentElement.parentElement));
  
      while(true) {
          hudElement.innerText = "$0.000 ";
          await ns.sleep(1000);
      };
  
  }
  
  function initializeHud(ns) {
      const d = eval("document");
      let htmlDisplay = d.getElementById("stock-display-1");
      if (htmlDisplay !== null) return htmlDisplay;
      // Get the custom display elements in HUD.
      let customElements = d.getElementById("overview-extra-hook-0").parentElement.parentElement;
      // Make a clone of the hook for extra hud elements, and move it up under money
      let stockValueTracker = customElements.cloneNode(true);
      // Remove any nested elements created by stats.js
      stockValueTracker.querySelectorAll("p > p").forEach(el => el.parentElement.removeChild(el));
      // Change ids since duplicate id's are invalid
      stockValueTracker.querySelectorAll("p").forEach((el, i) => el.id = "stock-display-" + i);
      // Get out output element
      htmlDisplay = stockValueTracker.querySelector("#stock-display-1");
      // Display label and default value
      stockValueTracker.querySelectorAll("p")[0].innerText = "ScrInc";
      htmlDisplay.innerText = ns.getScriptIncome()[0].toPrecision(5) + "/sec"
      // Insert our element right after Money
      customElements.parentElement.insertBefore(stockValueTracker, customElements.parentElement.childNodes[2]);
      return htmlDisplay;
  }