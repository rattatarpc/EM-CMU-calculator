const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf-8');

// Replace the explicit calcNac() calls with a general calcCurrentAntidote()
content = content.replaceAll("if (typeof calcNac === 'function') calcNac();", "if (typeof calcCurrentAntidote === 'function') calcCurrentAntidote();");

// Update selectAntidote to route AC and WBI
const old_select =     if (name === 'N-ACETYLCYSTEINE') {
        renderNacCalculator(content);
        calcNac();
    } else {;

const new_select =     if (name === 'N-ACETYLCYSTEINE') {
        renderNacCalculator(content);
        calcNac();
    } else if (name === 'ACTIVATED CHARCOAL') {
        renderCharcoalCalculator(content);
        calcCharcoal();
    } else if (name === 'WHOLE-BOWEL IRRIGATION AND OTHER INTESTINAL EVACUANTS') {
        renderWbiCalculator(content);
        calcWbi();
    } else {;

content = content.replace(old_select, new_select);

// Insert the new calculator functions before renderAntidotes()
const calc_funcs = 
function calcCurrentAntidote() {
    if (window.currentAntidote === 'N-ACETYLCYSTEINE' && typeof calcNac === 'function') calcNac();
    if (window.currentAntidote === 'ACTIVATED CHARCOAL' && typeof calcCharcoal === 'function') calcCharcoal();
    if (window.currentAntidote === 'WHOLE-BOWEL IRRIGATION AND OTHER INTESTINAL EVACUANTS' && typeof calcWbi === 'function') calcWbi();
}

function renderCharcoalCalculator(container) {
    container.innerHTML = \
        <div class="p-4 bg-white">
            <div id="charcoal-content"></div>
            <div class="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-slate-600 shadow-inner">
                <b>Reference:</b> Antidotes in Depth: ACTIVATED CHARCOAL by Silas W. Smith and Mary Ann Howland<br>
                <b>Note:</b> Slurry ratio is 1:8 (AC to liquid).
            </div>
        </div>
    \;
}

function calcCharcoal() {
    const content = document.getElementById('charcoal-content');
    if (!content) return;
    const hasW = (P.calcWt && P.calcWt > 0);
    const wt = hasW ? P.calcWt : 0;

    if (!hasW) {
        content.innerHTML = '<div class="text-center text-red-500 font-bold p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm animate-pulse"><i class="fas fa-exclamation-circle mr-2"></i>Please enter patient weight first.</div>';
        return;
    }

    const loadDose = Math.min(wt * 1, 100);
    const loadVol = loadDose * 8;
    
    const maintDose = Math.min(wt * 0.5, 50);
    const maintVol = maintDose * 8;

    let html = \
        <div class="space-y-3">
            <div class="border border-purple-200 rounded-lg overflow-hidden shadow-sm">
                <div class="bg-purple-600 text-white font-bold p-2 text-sm flex items-center justify-between">
                    <div><i class="fas fa-pills mr-2"></i>SDAC / Loading Dose</div>
                    <div class="text-xs font-normal opacity-90 text-purple-100">Max 100 g</div>
                </div>
                <div class="p-3 bg-white">
                    <div class="flex items-baseline justify-between mb-2 border-b border-dashed border-slate-200 pb-2">
                        <span class="text-slate-500 text-sm">Target Dose</span>
                        <span class="font-bold text-slate-800">1 g/kg</span>
                    </div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-purple-700">Total Dose</span>
                        <span class="font-black text-lg text-purple-700">\ <span class="text-sm font-normal">g</span></span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-600">Slurry Liquid Vol (1:8)</span>
                        <span class="font-bold text-slate-800">\ <span class="text-sm font-normal">mL</span></span>
                    </div>
                    <div class="mt-2 text-xs font-bold text-center bg-slate-100 text-slate-600 rounded p-1">Single dose</div>
                </div>
            </div>

            <div class="border border-blue-200 rounded-lg overflow-hidden shadow-sm">
                <div class="bg-blue-600 text-white font-bold p-2 text-sm flex items-center justify-between">
                    <div><i class="fas fa-clock mr-2"></i>MDAC (Subsequent Doses)</div>
                    <div class="text-xs font-normal opacity-90 text-blue-100">Max 50 g</div>
                </div>
                <div class="p-3 bg-white">
                    <div class="flex items-baseline justify-between mb-2 border-b border-dashed border-slate-200 pb-2">
                        <span class="text-slate-500 text-sm">Target Dose</span>
                        <span class="font-bold text-slate-800">0.5 g/kg</span>
                    </div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-blue-700">Total Dose</span>
                        <span class="font-black text-lg text-blue-700">\ <span class="text-sm font-normal">g</span></span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-600">Slurry Liquid Vol (1:8)</span>
                        <span class="font-bold text-slate-800">\ <span class="text-sm font-normal">mL</span></span>
                    </div>
                    <div class="mt-2 text-xs font-bold text-center bg-slate-100 text-slate-600 rounded p-1">Every 4-6 hours</div>
                </div>
            </div>
        </div>
    \;
    content.innerHTML = html;
}

function renderWbiCalculator(container) {
    container.innerHTML = \
        <div class="p-4 bg-white">
            <div class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 shadow-inner">
                <div class="font-bold text-amber-700 mb-1"><i class="fas fa-prescription-bottle mr-1"></i>Maharaj Formula Preparation</div>
                1 set = PEG 4000 (90g) + Electrolytes (14.3g) = Total 104.3g.<br>
                Mix with clean water 1,500 mL.
            </div>
            <div id="wbi-content"></div>
            
            <div class="mt-4 border border-red-200 rounded-lg overflow-hidden shadow-sm">
                <div class="bg-red-50 p-2 text-sm font-bold text-red-700 border-b border-red-200">
                    <i class="fas fa-hand-paper mr-1"></i>CMU Safety Stop Criteria & Notes
                </div>
                <div class="p-3 text-xs text-slate-700 space-y-2">
                    <p><b>Observe:</b> Abdominal sign, vomiting every 1 hr. If mild nausea/vomiting, give antiemetics and reduce rate.</p>
                    <p class="text-red-700 font-bold">STOP WBI and notify Toxicologist if &ge; 1 of the following:</p>
                    <ul class="list-disc pl-4 space-y-1">
                        <li>Significant abdominal distension</li>
                        <li>Severe vomiting</li>
                        <li>Bowel ileus</li>
                        <li>Signs of GI tract perforation</li>
                        <li>WBI &ge; 9 L/day without stool</li>
                    </ul>
                    <p class="pt-2 border-t border-slate-200 mt-2"><b>Special Consideration:</b> Pregnancy (FDA Category C), Breastfeeding (Infant risk cannot be ruled out)</p>
                </div>
            </div>
        </div>
    \;
}

function calcWbi() {
    const content = document.getElementById('wbi-content');
    if (!content) return;
    const hasW = (P.calcWt && P.calcWt > 0);
    const wt = hasW ? P.calcWt : 0;
    const age = P.age || 0;
    
    if (!hasW) {
        content.innerHTML = '<div class="text-center text-red-500 font-bold p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm animate-pulse"><i class="fas fa-exclamation-circle mr-2"></i>Please enter patient weight first.</div>';
        return;
    }

    let rateText = "";
    let rateVal = "";
    let ageGroup = "";
    
    if (age > 0 && age < 6) {
        ageGroup = "Small Children (9 mo - 6 yr)";
        rateText = "25 mL/kg/hr (Max 500 mL/hr)";
        rateVal = rnd(Math.min(wt * 25, 500)) + " mL/hr";
    } else if (age >= 6 && age < 12) {
        ageGroup = "Children (6 - 12 yr)";
        rateText = "1,000 mL/hr";
        rateVal = "1,000 mL/hr";
    } else if (age >= 12) {
        ageGroup = "Adolescents & Adults (\\u2265 12 yr)";
        rateText = "1,500 - 2,000 mL/hr";
        rateVal = "1,500 - 2,000 mL/hr";
    } else {
        // Fallback based on weight if age not provided
        if (wt < 20) {
            ageGroup = "Small Children (Estimated by weight < 20kg)";
            rateText = "25 mL/kg/hr (Max 500 mL/hr)";
            rateVal = rnd(Math.min(wt * 25, 500)) + " mL/hr";
        } else if (wt < 40) {
            ageGroup = "Children (Estimated by weight 20-40kg)";
            rateText = "1,000 mL/hr";
            rateVal = "1,000 mL/hr";
        } else {
            ageGroup = "Adolescents & Adults (Estimated by weight \\u2265 40kg)";
            rateText = "1,500 - 2,000 mL/hr";
            rateVal = "1,500 - 2,000 mL/hr";
        }
    }

    let html = \
        <div class="border border-teal-200 rounded-lg overflow-hidden shadow-sm">
            <div class="bg-teal-600 text-white font-bold p-2 text-sm flex items-center justify-between">
                <div><i class="fas fa-tint mr-2"></i>Administration Rate</div>
                <div class="text-xs font-normal opacity-90 text-teal-100">\</div>
            </div>
            <div class="p-3 bg-white">
                <div class="flex items-baseline justify-between mb-2 border-b border-dashed border-slate-200 pb-2">
                    <span class="text-slate-500 text-sm">Target Rate</span>
                    <span class="font-bold text-slate-800">\</span>
                </div>
                <div class="flex items-center justify-between mb-2">
                    <span class="font-bold text-teal-700">Calculated Rate</span>
                    <span class="font-black text-xl text-teal-700">\</span>
                </div>
                
                <div class="bg-slate-100 p-3 rounded-lg text-xs text-slate-700 mt-3 border border-slate-200">
                    <div class="font-bold text-slate-800 mb-1">How to order:</div>
                    Colon prep (1 ????????????? Polyethylene glycol 4000 ???? 90 gm + Electrolyte ???? 14.3 gm ??? 104.3 gm) 1 ??? + ???????? 1,500 mL oral / feed via gastric tube rate <b>\</b> ????????????????? (clear rectal effluent)
                </div>
                <div class="mt-3 text-xs font-bold text-center bg-teal-50 text-teal-800 rounded p-1 border border-teal-100">Duration: 4-6 hours or until clear effluent</div>
            </div>
        </div>
    \;
    content.innerHTML = html;
}

function renderAntidotes() {
;

const old_renderAntidotes = unction renderAntidotes() {;
content = content.replace(old_renderAntidotes, calc_funcs);

fs.writeFileSync('index.html', content);
