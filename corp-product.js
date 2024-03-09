/** @param {NS} ns **/
export async function main(ns) {

    var division = ns.args[0] || "Tobacco";

	var maxNumProducts = 3;
	var productNumbers = [];
	var newProductNumber = 0;
	var productInvest = 1e6;
    productNumbers.push("0");

	ns.tail();

    while(true) {

        ns.print(" ");
        ns.print("-----------------------------------")
        //ns.print("productNumbers: " + productNumbers);
        ns.print("size of productNumbers: " + (productNumbers.length - 1).toString());

        // In case this script was run again while the coporation operates already,
        // If product-0, product-1, product-2 exist already but they are not generated through this script, renew division.products by makeProducts
        /*
        for (var productNumber of productNumbers) {
            var product = ns.corporation.getProduct(
                division, 
                "Sector-12", 
                "Product-" + productNumber.toString()
                );
            if (product.name == "Product-0") {
                ns.print("productNumbers: " + productNumbers);
            } else if (product.name == "Product-1") {
                ns.print("productNumbers: " + productNumbers);
            } else if (product.name == "Product-1") {
                ns.print("productNumbers: " + productNumbers);
            };
        };
        */

        // amount of products which can be sold in parallel is 3; can be upgraded
        //if (ns.corporation.hasResearched(division, "uPgrade: Capacity.I")) {
        //	maxNumProducts++;
        //	if (ns.corporation.hasResearched(division, "uPgrade: Capacity.II")) {
        //		maxNumProducts++;
        //	};
        //};

        // Determination of newProductNumber, default is 0
        // get the product number of the latest product and increase it by 1 for the mext product. Product names must be unique.
        if (productNumbers.length <= maxNumProducts) {
            //ns.print("productNubmers = " + productNumbers);
            newProductNumber = parseInt(productNumbers[productNumbers.length-1]) + 1;
            ns.print("newProductNumber = " + newProductNumber);

            // Determination of newProductName
            const newProductName = "Product-" + newProductNumber.toString();
            ns.print("new product name = " + newProductName);
            if (ns.corporation.getCorporation().funds < (2 * productInvest)) {
                if (ns.corporation.getCorporation().funds <= 0) {
                    ns.print("WARN negative funds, cannot start new product development " + ns.nFormat(ns.corporation.getCorporation().funds, "0.0a"));
                    return;
                    // productInvest = 0; // product development with 0 funds not possible if corp has negative funds
                } else {
                    productInvest = Math.floor(ns.corporation.getCorporation().funds / 2);
                };
            };

            // Start development of new product
            ns.print("Start new product development " + newProductName);
            if ( productNumbers.length == 1) {  // zero product
                // Make Product-1
                ns.corporation.makeProduct(division, "Sector-12", newProductName, productInvest, productInvest);
                productNumbers.push("1");
            } else if ( productNumbers.length == 2) {  // one product, "Product-1" exists
                // Make Product-2
                ns.corporation.makeProduct(division, "Sector-12", newProductName, productInvest, productInvest);
                productNumbers.push("2");
            } else if ( productNumbers.length == 3) {  // two products, "Product-1" & "Product-2" exist
                // Make Product-3
                ns.corporation.makeProduct(division, "Sector-12", newProductName, productInvest, productInvest);
                productNumbers.push("3");
            };
        };

        ns.print("productNumbers: " + productNumbers);
        for (var productNumber of productNumbers) {
            var productNum = parseInt(productNumber) + 1;
            if (productNum < productNumbers.length) {
                var product = ns.corporation.getProduct(division, "Sector-12", "Product-" + productNum.toString());
                ns.print("**********************************");
                ns.print("For product-" + productNum + ": ");
                // if a product is still under development, pass it
                if (product.developmentProgress < 100) {
                    ns.print("Product development progress: " + product.developmentProgress.toFixed(1) + "%");
                    //return false;
                }  // if a product development is done, sell the product
                else {
                    //productNumbers.push(product.charAt(product.length - 1));
                    // initial sell value if nothing is defined yet is 0
                    if (product.sCost == 0) {
                        ns.print("Start selling product-" + productNum.toString());
                        ns.corporation.sellProduct(division, "Sector-12", product, "MAX", "MP", true);
                        if (ns.corporation.hasResearched(division, "Market-TA.II")) {
                            ns.corporation.setProductMarketTA1(division, product, true);
                            ns.corporation.setProductMarketTA2(division, product, true);
                        };
                    };
                };  
            };
        };

        ns.print("-------------------------------");
		await ns.sleep(3000);

        //if (productNumbers.length > maxNumProducts) {
        //    return false;
        //};
    };
};