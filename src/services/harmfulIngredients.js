export const HARMFUL_INGREDIENTS = [
  { name: "Aspartame", altNames: ["E951"], score: 72, category: "sweetener", reason: "Linked to headaches, potential neurological effects; controversial carcinogenicity classification by IARC" },
  { name: "Acesulfame Potassium", altNames: ["Acesulfame K", "E950"], score: 55, category: "sweetener", reason: "Contains methylene chloride, a known carcinogen; limited long-term safety data" },
  { name: "Sucralose", altNames: ["E955", "Splenda"], score: 50, category: "sweetener", reason: "May alter gut microbiome, produces chlorinated compounds when heated" },
  { name: "Saccharin", altNames: ["E954"], score: 58, category: "sweetener", reason: "Former carcinogen classification; associated with bladder issues in animal studies" },
  { name: "High Fructose Corn Syrup", altNames: ["HFCS", "Glucose-Fructose Syrup", "Isoglucose"], score: 75, category: "sweetener", reason: "Strong association with obesity, insulin resistance, fatty liver disease, and metabolic syndrome" },
  { name: "Neotame", altNames: ["E961"], score: 52, category: "sweetener", reason: "Structurally similar to aspartame; limited independent safety research" },

  { name: "Monosodium Glutamate", altNames: ["MSG", "E621"], score: 42, category: "additive", reason: "Can trigger headaches and flushing in sensitive individuals (Chinese Restaurant Syndrome)" },
  { name: "Sodium Nitrite", altNames: ["E250"], score: 78, category: "preservative", reason: "Forms carcinogenic nitrosamines; strong link to colorectal cancer (WHO Group 1 processed meat)" },
  { name: "Sodium Nitrate", altNames: ["E251"], score: 75, category: "preservative", reason: "Converts to nitrites in the body; associated with increased cancer risk" },
  { name: "Potassium Nitrate", altNames: ["E252", "Saltpeter"], score: 70, category: "preservative", reason: "Similar nitrosamine formation risk as sodium nitrite" },
  { name: "Sodium Benzoate", altNames: ["E211"], score: 65, category: "preservative", reason: "Can form benzene (carcinogen) when combined with ascorbic acid; linked to hyperactivity in children" },
  { name: "Potassium Benzoate", altNames: ["E212"], score: 62, category: "preservative", reason: "Same benzene formation risk as sodium benzoate" },
  { name: "Potassium Sorbate", altNames: ["E202"], score: 30, category: "preservative", reason: "Generally safe; mild allergen potential in sensitive individuals" },
  { name: "Sodium Metabisulfite", altNames: ["E223"], score: 60, category: "preservative", reason: "Can trigger severe asthma attacks and allergic reactions in sulfite-sensitive individuals" },
  { name: "Sulphur Dioxide", altNames: ["Sulfur Dioxide", "E220", "SO2"], score: 58, category: "preservative", reason: "Respiratory irritant; destroys vitamin B1; dangerous for asthmatics" },

  { name: "Butylated Hydroxyanisole", altNames: ["BHA", "E320"], score: 80, category: "preservative", reason: "Classified as reasonably anticipated to be a human carcinogen (NTP); endocrine disruptor" },
  { name: "Butylated Hydroxytoluene", altNames: ["BHT", "E321"], score: 75, category: "preservative", reason: "Potential carcinogen and endocrine disruptor; banned in several countries" },
  { name: "Tertiary Butylhydroquinone", altNames: ["TBHQ", "E319"], score: 70, category: "preservative", reason: "Linked to tumors in animal studies; can cause nausea and delirium at high doses" },
  { name: "Propyl Gallate", altNames: ["E310"], score: 55, category: "preservative", reason: "Suspected endocrine disruptor; limited safety data" },

  { name: "Red 40", altNames: ["Allura Red", "E129", "FD&C Red No. 40", "Red 40 Lake"], score: 72, category: "additive", reason: "Linked to hyperactivity in children; contains benzidine, a known carcinogen; banned in some EU foods" },
  { name: "Red 3", altNames: ["Erythrosine", "E127", "FD&C Red No. 3"], score: 82, category: "additive", reason: "FDA-acknowledged carcinogen in animal studies; recently banned in the US" },
  { name: "Yellow 5", altNames: ["Tartrazine", "E102", "FD&C Yellow No. 5"], score: 68, category: "additive", reason: "Linked to hyperactivity, asthma, and allergic reactions; requires warning labels in EU" },
  { name: "Yellow 6", altNames: ["Sunset Yellow", "E110", "FD&C Yellow No. 6"], score: 70, category: "additive", reason: "Associated with hyperactivity, allergic reactions, and adrenal tumors in animal studies" },
  { name: "Blue 1", altNames: ["Brilliant Blue", "E133", "FD&C Blue No. 1"], score: 50, category: "additive", reason: "May cross blood-brain barrier; linked to chromosomal damage in some studies" },
  { name: "Blue 2", altNames: ["Indigo Carmine", "E132", "FD&C Blue No. 2"], score: 55, category: "additive", reason: "Associated with brain tumors in male rats; insufficient human safety data" },
  { name: "Green 3", altNames: ["Fast Green", "E143", "FD&C Green No. 3"], score: 55, category: "additive", reason: "Linked to bladder tumors in animal studies" },
  { name: "Caramel Color III", altNames: ["E150c", "Ammonia Caramel"], score: 50, category: "additive", reason: "Contains 4-MEI, a potential carcinogen; California Prop 65 listed" },
  { name: "Caramel Color IV", altNames: ["E150d", "Sulfite Ammonia Caramel"], score: 55, category: "additive", reason: "Highest 4-MEI levels of all caramel colors; most commonly used in colas" },
  { name: "Titanium Dioxide", altNames: ["E171", "TiO2"], score: 68, category: "additive", reason: "Banned in the EU as food additive; nanoparticle concerns for gut inflammation and DNA damage" },

  { name: "Carrageenan", altNames: ["E407"], score: 55, category: "additive", reason: "Linked to gut inflammation, ulcers, and potential tumor promotion" },
  { name: "Polysorbate 80", altNames: ["E433", "Tween 80"], score: 50, category: "additive", reason: "May promote gut inflammation and metabolic syndrome; disrupts gut barrier" },
  { name: "Sodium Carboxymethyl Cellulose", altNames: ["CMC", "E466", "Cellulose Gum"], score: 45, category: "additive", reason: "Linked to gut inflammation in animal studies; may alter microbiome" },

  { name: "Partially Hydrogenated Oil", altNames: ["Trans Fat", "PHO", "Partially Hydrogenated Vegetable Oil", "Partially Hydrogenated Soybean Oil"], score: 95, category: "additive", reason: "Contains artificial trans fats; directly linked to heart disease, stroke, and type 2 diabetes; banned by FDA" },
  { name: "Hydrogenated Oil", altNames: ["Fully Hydrogenated Oil", "Hydrogenated Vegetable Oil", "Hydrogenated Palm Oil"], score: 65, category: "additive", reason: "May contain trace trans fats; promotes inflammation and cardiovascular risk" },
  { name: "Interesterified Fat", altNames: ["Interesterified Oil"], score: 50, category: "additive", reason: "Trans fat replacement with limited long-term safety data; may affect blood glucose" },

  { name: "Sodium Phosphate", altNames: ["E339"], score: 55, category: "additive", reason: "Excessive phosphate intake linked to kidney damage and cardiovascular disease" },
  { name: "Calcium Disodium EDTA", altNames: ["E385", "EDTA"], score: 40, category: "preservative", reason: "Heavy metal chelator; may deplete essential minerals at high doses" },
  { name: "Dimethylpolysiloxane", altNames: ["E900", "PDMS", "Simethicone"], score: 35, category: "additive", reason: "Industrial chemical used as anti-foaming agent; limited nutritional safety research" },

  { name: "Azodicarbonamide", altNames: ["E927a", "ADA"], score: 75, category: "additive", reason: "Banned in EU and Australia; breaks down into urethane (carcinogen); respiratory sensitizer" },
  { name: "Potassium Bromate", altNames: ["E924"], score: 90, category: "additive", reason: "Known carcinogen; banned in EU, Canada, China, Brazil; still permitted in US flour" },
  { name: "Brominated Vegetable Oil", altNames: ["BVO", "E443"], score: 80, category: "additive", reason: "Banned by FDA in 2024; accumulates in tissue; linked to neurological and thyroid damage" },

  { name: "Propylene Glycol", altNames: ["E1520", "PG"], score: 38, category: "additive", reason: "Industrial solvent also used in antifreeze; FDA GRAS but may cause skin/kidney issues at high doses" },
  { name: "Propyl Paraben", altNames: ["E214", "Propylparaben"], score: 65, category: "preservative", reason: "Endocrine disruptor mimicking estrogen; EU restricted in food" },
  { name: "Methyl Paraben", altNames: ["E218", "Methylparaben"], score: 60, category: "preservative", reason: "Weak estrogenic activity; concerns about reproductive health" },

  { name: "Sodium Lauryl Sulfate", altNames: ["SLS"], score: 55, category: "additive", reason: "Surfactant/emulsifier; GI irritant; more common in cosmetics but found in some processed foods" },

  { name: "Maltodextrin", altNames: [], score: 45, category: "filler", reason: "Very high glycemic index (105-136); spikes blood sugar faster than table sugar" },
  { name: "Dextrose", altNames: ["D-Glucose"], score: 40, category: "sweetener", reason: "Pure glucose; rapidly spikes blood sugar; commonly used as hidden sugar" },
  { name: "Corn Syrup", altNames: ["Glucose Syrup"], score: 55, category: "sweetener", reason: "Concentrated sugar linked to obesity and insulin resistance when consumed in excess" },
  { name: "Invert Sugar", altNames: ["Inverted Sugar Syrup"], score: 48, category: "sweetener", reason: "Processed sugar that prevents crystallization; same metabolic concerns as sucrose" },

  { name: "Sodium Aluminum Phosphate", altNames: ["E541", "SALP"], score: 55, category: "additive", reason: "Aluminum accumulation concerns; linked to neurological effects including Alzheimer's risk" },
  { name: "Sodium Aluminum Sulfate", altNames: ["E521", "SAS"], score: 58, category: "additive", reason: "Aluminum-based leavening agent; same neurotoxicity concerns" },

  { name: "Artificial Flavor", altNames: ["Artificial Flavoring", "Artificial Flavour", "Artificial Flavours", "Artificial Flavouring"], score: 40, category: "additive", reason: "Umbrella term hiding potentially hundreds of untested chemical compounds" },
  { name: "Natural Flavor", altNames: ["Natural Flavoring", "Natural Flavours", "Natural Flavouring"], score: 25, category: "additive", reason: "Can contain up to 100 chemical compounds; 'natural' is loosely defined by FDA" },

  { name: "Olestra", altNames: ["Olean", "E915"], score: 70, category: "additive", reason: "Fat substitute causing GI distress; blocks absorption of fat-soluble vitamins" },
  { name: "Lecithin", altNames: ["Soy Lecithin", "E322"], score: 15, category: "additive", reason: "Generally safe emulsifier; minor concerns only for soy-allergic individuals" },

  { name: "Xanthan Gum", altNames: ["E415"], score: 12, category: "additive", reason: "Generally recognized as safe; may cause bloating in large amounts" },
  { name: "Silicon Dioxide", altNames: ["E551", "SiO2", "Silica"], score: 20, category: "additive", reason: "Anti-caking agent; nanoparticle form raises some safety questions but generally considered safe" },

  { name: "Sodium Stearoyl Lactylate", altNames: ["SSL", "E481"], score: 22, category: "additive", reason: "Generally safe dough conditioner; well-studied with no major health concerns" },
  { name: "Calcium Stearoyl Lactylate", altNames: ["CSL", "E482"], score: 22, category: "additive", reason: "Similar safety profile to SSL; FDA GRAS" },

  { name: "Potassium Metabisulfite", altNames: ["E224"], score: 58, category: "preservative", reason: "Sulfite compound; dangerous for asthmatics; can cause severe allergic reactions" },
  { name: "Calcium Propionate", altNames: ["E282"], score: 35, category: "preservative", reason: "Common bread preservative; linked to irritability and sleep disturbance in children at high doses" },
  { name: "Sodium Propionate", altNames: ["E281"], score: 35, category: "preservative", reason: "Same concerns as calcium propionate; may affect behavior in sensitive children" },

  { name: "Phosphoric Acid", altNames: ["E338", "Orthophosphoric Acid"], score: 52, category: "additive", reason: "Erodes tooth enamel; excess phosphate linked to bone density loss and kidney strain" },
  { name: "Citric Acid", altNames: ["E330"], score: 8, category: "additive", reason: "Naturally occurring acid; very safe in normal food amounts; minor enamel erosion concern" },

  { name: "Guar Gum", altNames: ["E412"], score: 15, category: "additive", reason: "Generally safe thickener; can cause digestive discomfort in large quantities" },
  { name: "Mono and Diglycerides", altNames: ["E471", "Mono- and Diglycerides of Fatty Acids"], score: 35, category: "additive", reason: "May contain trans fats not required to be labeled; derived from hydrogenated oils" },
];
