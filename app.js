(function(){
  "use strict";
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const state={country:null,lang:"en",category:null,answers:null,results:[],compare:new Set()};
  const icons={health:"✚",travel:"✈",car:"▰",home:"⌂",life:"◉"};
  const t=(key)=>TRANSLATIONS[state.lang]?.[key]||TRANSLATIONS.en[key]||key;
  const country=()=>APP_CONFIG.countries.find(c=>c.code===state.country);
  const money=n=>new Intl.NumberFormat(country()?.locale||"en-US",{style:"currency",currency:country()?.currency||"EUR",maximumFractionDigits:0}).format(n);

  function init(){
    renderCountries(); bind();
    const saved=JSON.parse(localStorage.getItem("policyCompassPreferences")||"null");
    if(saved?.consented&&APP_CONFIG.countries.some(c=>c.code===saved.country)){
      $("#countrySelect").value=saved.country;
    }
  }
  function bind(){
    $("#countrySelect").addEventListener("change",e=>{
      $("#languagePanel").hidden=true;
      if(e.target.value)selectCountry(e.target.value);
    });
    $("#changeLocale").addEventListener("click",showOnboarding);
    $("#resetApp").addEventListener("click",()=>{localStorage.removeItem("policyCompassPreferences");location.reload()});
    $$('[data-back]').forEach(b=>b.addEventListener("click",()=>showStep(+b.dataset.back)));
    $("#needsForm").addEventListener("submit",submitNeeds);
    $$('input[type="range"]').forEach(r=>r.addEventListener("input",()=>r.previousElementSibling.textContent=r.value));
    $("#sortResults").addEventListener("change",renderResults);
    $("#withinBudget").addEventListener("change",renderResults);
    $("#printButton").addEventListener("click",()=>window.print());
  }
  function renderCountries(){
    const select=$("#countrySelect");
    APP_CONFIG.countries.forEach(c=>{
      const option=document.createElement("option");
      option.value=c.code;
      option.textContent=`${c.flag} ${c.name} — ${c.languages.map(l=>l.name).join(" / ")}`;
      select.appendChild(option);
    });
  }
  function selectCountry(code,preferred){
    const c=APP_CONFIG.countries.find(x=>x.code===code);state.country=code;
    if(preferred&&c.languages.some(l=>l.code===preferred)){chooseLanguage(preferred);return}
    if(c.languages.length===1){chooseLanguage(c.languages[0].code);return}
    $("#languagePanel").hidden=false;$("#languagePrompt").textContent=`${c.flag} ${c.name} — choose a language / choisissez une langue / Sprache wählen`;
    $("#languageChoices").innerHTML=c.languages.map(l=>`<button type="button" data-lang="${l.code}">${l.name}</button>`).join("");
    $$('#languageChoices button').forEach(b=>b.addEventListener("click",()=>chooseLanguage(b.dataset.lang)));
  }
  function chooseLanguage(lang){state.lang=lang;document.documentElement.lang=lang;applyTranslations();openApp();}
  function applyTranslations(){
    $$('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});
    $("#changeLocale").textContent=t("change");$("#resetApp").textContent=t("reset");
  }
  function openApp(){
    const c=country();$("#onboarding").hidden=true;$("#app").hidden=false;$("#changeLocale").hidden=false;$("#resetApp").hidden=false;
    $("#contextFlag").textContent=c.flag;$("#contextCountry").textContent=c.name;$("#regulatoryNotice").textContent=c.notice[state.lang]||c.notice[Object.keys(c.notice)[0]];$("#currencySymbol").textContent=new Intl.NumberFormat(c.locale,{style:"currency",currency:c.currency}).formatToParts(0).find(p=>p.type==="currency")?.value||c.currency;
    renderCategories();showStep(1);
  }
  function showOnboarding(){$("#app").hidden=true;$("#onboarding").hidden=false;$("#languagePanel").hidden=true;$("#countrySelect").focus();}
  function showStep(n){
    $$('.step-section').forEach((s,i)=>s.hidden=i!==n-1);$$('.stepper li').forEach((s,i)=>s.classList.toggle("active",i<=n-1));
    document.title=`${n}/3 · Policy Compass`;$("#liveRegion").textContent=`${n}/3`;window.scrollTo({top:0,behavior:"smooth"});
  }
  function renderCategories(){
    $("#categoryGrid").innerHTML=APP_CONFIG.categories.map(c=>`<button class="category-card" type="button" data-category="${c.id}"><span class="category-icon" aria-hidden="true">${icons[c.id]}</span><strong>${t(c.id)}</strong><small>${t(c.id+"Hint")}</small></button>`).join("");
    $$('.category-card').forEach(b=>b.addEventListener("click",()=>{state.category=b.dataset.category;renderFeatures();showStep(2)}));
  }
  function renderFeatures(){
    const labels=APP_CONFIG.featureLabels[state.lang]||APP_CONFIG.featureLabels.en;
    const fs=APP_CONFIG.categories.find(c=>c.id===state.category).features;
    $("#featureChoices").innerHTML=fs.map(f=>`<label><input type="checkbox" name="feature" value="${f}"> ${labels[f]}</label>`).join("");
  }
  function submitNeeds(e){
    e.preventDefault();const age=+$("#age").value,budget=+$("#budget").value;
    if(age<18||age>85||budget<=0){$("#formError").textContent=t("required");return}
    $("#formError").textContent="";state.answers={age,budget,household:$("#household").value,deductible:$("#deductible").value,features:$$('input[name="feature"]:checked').map(x=>x.value),weights:{price:+$("#priceWeight").value,coverage:+$("#coverageWeight").value,flexibility:+$("#flexWeight").value,extras:+$("#extrasWeight").value}};
    if($("#savePreference").checked)localStorage.setItem("policyCompassPreferences",JSON.stringify({consented:true,country:state.country,lang:state.lang}));else localStorage.removeItem("policyCompassPreferences");
    state.results=POLICY_DATA[state.country][state.category].map(scorePolicy);state.compare.clear();renderResults();showStep(3);
  }
  function scorePolicy(p){
    const a=state.answers;const missing=a.features.filter(f=>!p.features.includes(f));const eligible=a.age>=p.ageMin&&a.age<=p.ageMax&&!missing.length;
    const price=Math.max(0,Math.min(100,100-(Math.max(0,p.premium-a.budget)/Math.max(a.budget,1))*100));
    const deductible=p.deductible===a.deductible?100:({low:0,medium:1,high:2}[p.deductible]-{low:0,medium:1,high:2}[a.deductible])**2===1?65:30;
    const metrics={price,coverage:p.coverage,flexibility:(p.flexibility+deductible)/2,extras:p.extras};const w=a.weights,total=Object.values(w).reduce((x,y)=>x+y,0);let score=Math.round(Object.keys(w).reduce((s,k)=>s+metrics[k]*w[k],0)/total);if(!eligible)score=0;
    const why=[p.premium<=a.budget?t("goodPrice"):null,p.coverage>=78?t("strongCoverage"):null,t("balanced")].filter(Boolean);
    const issues=[p.premium>a.budget?t("budgetIssue"):null,p.deductible!==a.deductible?t("deductibleIssue"):null,missing.length?t("featureIssue"):null,a.age>p.ageMax||a.age<p.ageMin?t("ageIssue"):null].filter(Boolean);
    return {...p,score,eligible,metrics,why,issues};
  }
  function renderResults(){
    let rows=[...state.results];const sort=$("#sortResults").value;if($("#withinBudget").checked)rows=rows.filter(p=>p.premium<=state.answers.budget);rows.sort((a,b)=>sort==="price"?a.premium-b.premium:sort==="coverage"?b.coverage-a.coverage:b.score-a.score);
    const eligible=rows.filter(p=>p.eligible).slice(0,3);$("#resultsList").innerHTML=eligible.length?eligible.map((p,i)=>resultCard(p,i)).join(""):`<p class="demo-warning">${t("noResults")}</p>`;
    $$('.compare-box').forEach(c=>c.addEventListener("change",()=>{c.checked?state.compare.add(c.value):state.compare.delete(c.value);renderComparison()}));renderComparison();
  }
  function resultCard(p,i){
    const labels=APP_CONFIG.featureLabels[state.lang]||APP_CONFIG.featureLabels.en;const included=p.features.map(f=>labels[f]).join(", ");const excluded=p.exclusions.map(f=>labels[f]).join(", ")||"—";
    return `<article class="result-card"><div class="result-top"><span class="rank">${i+1}</span><div class="result-name"><h2>${p.name}</h2><p>${p.insurer}</p></div><div class="score"><strong>${p.score}</strong><small>/ 100</small></div></div><div class="score-bar" aria-label="${p.score}/100"><span style="width:${p.score}%"></span></div><div class="result-metrics"><div class="metric"><small>${t("price")}</small><strong>${money(p.premium)} ${t("monthly")}</strong></div><div class="metric"><small>${t("deductibleLabel")}</small><strong>${money(p.deductibleAmount)} · ${t(p.deductible)}</strong></div><div class="metric"><small>${t("limitLabel")}</small><strong>${money(p.limit)}</strong></div></div><p class="explanation"><strong>${t("why")}:</strong> ${p.why.join(" ")}</p><p class="explanation"><strong>${t("included")}:</strong> ${included}</p><p class="tradeoff"><strong>${t("tradeoff")}:</strong> ${p.issues[0]||t("officialCheck")} ${p.exclusions.length?`${t("notIncluded")}: ${excluded}.`:""}</p><div class="result-actions"><label class="compare-check"><input class="compare-box" type="checkbox" value="${p.id}" ${state.compare.has(p.id)?"checked":""}> ${t("compareLabel")}</label><span class="source">${t("verified")}: ${p.verified}</span></div></article>`;
  }
  function renderComparison(){
    const selected=state.results.filter(p=>state.compare.has(p.id));$("#comparison").hidden=selected.length<2;if(selected.length<2)return;
    $("#compareHead").innerHTML=`<tr><th></th>${selected.map(p=>`<th>${p.name}</th>`).join("")}</tr>`;
    const labels=APP_CONFIG.featureLabels[state.lang]||APP_CONFIG.featureLabels.en;
    const rows=[[t("price"),...selected.map(p=>money(p.premium)+" "+t("monthly"))],[t("coverageLabel"),...selected.map(p=>p.coverage+"/100")],[t("deductibleLabel"),...selected.map(p=>money(p.deductibleAmount))],[t("limitLabel"),...selected.map(p=>money(p.limit))],[t("included"),...selected.map(p=>p.features.map(f=>labels[f]).join(", "))]];
    $("#compareBody").innerHTML=rows.map(r=>`<tr><th>${r[0]}</th>${r.slice(1).map(v=>`<td>${v}</td>`).join("")}</tr>`).join("");
  }
  init();
})();
