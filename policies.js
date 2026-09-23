// FICTIONAL DEMONSTRATION DATA — not real insurers, policies, prices, or offers.
// Each country receives a separate generated catalog from these transparent demo templates.
(function(){
  const features={health:["outpatient","dental","mental"],travel:["medical","cancellation","baggage"],car:["liability","collision","roadside"],home:["building","contents","theft"],life:["death","disability","critical"]};
  const basePrice={health:74,travel:22,car:63,home:31,life:28};
  const limitBase={health:100000,travel:75000,car:1000000,home:250000,life:200000};
  const countryFactor={ES:.92,IT:.97,DE:1.14,FR:1.08,BE:1.1,CH:1.48};
  const names=["Essential","Balanced","Complete"];
  const insurers=["Northstar Mutual (fictional)","Civic Shield (fictional)","Lighthouse Cover (fictional)"];
  window.POLICY_DATA={};
  Object.keys(countryFactor).forEach(country=>{
    window.POLICY_DATA[country]={};
    Object.keys(features).forEach(category=>{
      window.POLICY_DATA[country][category]=names.map((name,i)=>({
        id:`${country}-${category}-${i+1}`,
        insurer:insurers[i],name,category,country,
        premium:Math.round(basePrice[category]*countryFactor[country]*[.72,1,1.38][i]),
        deductible:["high","medium","low"][i],
        deductibleAmount:[750,300,100][i],
        coverage:[58,78,94][i],flexibility:[54,78,90][i],extras:[35,67,96][i],
        limit:Math.round(limitBase[category]*[.6,1,1.6][i]),
        features:i===0?features[category].slice(0,1):i===1?features[category].slice(0,2):features[category],
        exclusions:i===0?[features[category][1],features[category][2]]:i===1?[features[category][2]]:[],
        ageMin:18,ageMax:i===0?70:i===1?75:80,
        waitingDays:[45,30,15][i],scope:i===0?"national":i===1?"europe":"worldwide",
        source:"Fictional demonstration dataset",verified:"2026-09-23",commercialRelationship:false
      }));
    });
  });
})();
