// corp-constants.js

export const ALL_CITIES = [
  "Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"
];

export const INDUSTRIES = [
  "Agriculture", "Chemical", "Computer Hardware", "Fishing", "Healthcare",
  "Mining", "Pharmaceutical", "Real Estate", "Refinery", "Restaurant",
  "Robotics", "Software", "Spring Water", "Tobacco", "Water Utilities"
];

export const PRODUCT_INDUSTRIES = ["Tobacco", "Restaurant"];
export const NON_PRODUCT_INDUSTRIES = ["Agriculture", "Chemical", "Fishing"];

export const MATERIALS = {
  Tobacco:     ["Plants", "Hardware", "Robots", "AI Cores", "Real Estate"],
  Fishing:     ["Food", "Plants", "Hardware", "Robots", "AI Cores", "Real Estate"],
  Agriculture: ["Water", "Plants", "Food", "Chemicals", "Hardware", "Robots", "AI Cores", "Real Estate"],
  Chemical:    ["Water", "Plants", "Hardware", "Chemicals", "Robots", "AI Cores", "Real Estate"],
  Restaurant:  ["Water", "Food", "Hardware", "Robots", "AI Cores", "Real Estate"]
};

export const JOB_TYPE = {
  operations: "Operations",
  engineer: "Engineer",
  business: "Business",
  management: "Management",
  development: "Research & Development"
};

export const RESEARCH = {
  lab: "Hi-Tech R&D Laboratory",
  marketTA1: "Market-TA.I",
  marketTA2: "Market-TA.II",
  fulcrum: "uPgrade: Fulcrum",
  capacity1: "uPgrade: Capacity.I",
  capacity2: "uPgrade: Capacity.II"
};

export const CORP_SCRIPTS = {
  recruiter: "corp-recruiter.js",
  researcher: "corp-researcher.js",
  marketer: "corp-marketer.js",
  productManager: "corp-product-manager.js",
  manager: "corp-manager.js",
  divisionManager: "corp-division-manager.js"
};
