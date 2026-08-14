function renderAntidotes() {
    filterAntidotes(); // populate the list initially
    // Re-calculate NAC if it's currently selected
    const active = document.querySelector('.antidote-btn.ring-2');
    if (active && active.dataset.name === 'N-ACETYLCYSTEINE') {
        calcNac();
    }
}

function filterAntidotes() {
    const q = (document.getElementById('antidoteSearch').value || '').toLowerCase();
    const c = document.getElementById('antidoteListContainer');
    if (!c) return;
    
    let html = '';
    antidoteList.forEach(d => {
        if (d.name.toLowerCase().includes(q)) {
            html += <button onclick="selectAntidote('\')" class="antidote-btn w-full text-left p-3 rounded bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition text-sm font-semibold text-slate-700" data-name="\">\</button>;
        }
    });
    c.innerHTML = html;
}

function selectAntidote(name) {
    // highlight button
    document.querySelectorAll('.antidote-btn').forEach(b => {
        b.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-50');
        if(b.dataset.name === name) b.classList.add('ring-2', 'ring-indigo-500', 'bg-indigo-50');
    });

    const card = document.getElementById('antidoteDetailCard');
    const title = document.getElementById('adTitle');
    const content = document.getElementById('adContent');
    
    card.classList.remove('hidden');
    title.innerHTML = <i class="fas fa-prescription-bottle-medical mr-2"></i>\;
    
    if (name === 'N-ACETYLCYSTEINE') {
        renderNacCalculator(content);
        calcNac();
    } else {
        content.innerHTML = <div class="p-8 text-center text-slate-400">
            <i class="fas fa-hammer text-4xl mb-3"></i>
            <div>Calculator or Information for <b>\</b> is under construction.</div>
        </div>;
    }
}

function renderNacCalculator(container) {
    container.innerHTML = 
        <div class="border-b border-indigo-100 flex flex-wrap bg-indigo-50/50">
            <button id="tab-nac-iv3" onclick="switchNacTab('iv3')" class="nac-tab flex-1 py-3 text-sm font-bold border-b-2 border-indigo-600 text-indigo-700 transition">IV 3-Bag</button>
            <button id="tab-nac-po" onclick="switchNacTab('po')" class="nac-tab flex-1 py-3 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-indigo-600 transition">Oral (72h)</button>
            <button id="tab-nac-iv2" onclick="switchNacTab('iv2')" class="nac-tab flex-1 py-3 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-indigo-600 transition">Simplified 2-Bag</button>
            <button id="tab-nac-snap" onclick="switchNacTab('snap')" class="nac-tab flex-1 py-3 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-indigo-600 transition">SNAP 2-Bag</button>
        </div>
        
        <div class="p-4 bg-white">
            <div class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-start gap-2">
                <i class="fas fa-triangle-exclamation mt-1 text-amber-600"></i>
                <div>
                    <b>Max Body Weight = 100 kg</b><br>
                    Current calculating weight: <b class="text-lg">\</b> kg (Capped at 100)
                </div>
            </div>
            
            <div id="nac-content"></div>
        </div>
    ;
}

let activeNacTab = 'iv3';
function switchNacTab(tab) {
    activeNacTab = tab;
    document.querySelectorAll('.nac-tab').forEach(b => {
        b.classList.remove('border-indigo-600', 'text-indigo-700');
        b.classList.add('border-transparent', 'text-slate-500');
    });
    const btn = document.getElementById('tab-nac-' + tab);
    if(btn) {
        btn.classList.remove('border-transparent', 'text-slate-500');
        btn.classList.add('border-indigo-600', 'text-indigo-700');
    }
    calcNac();
}

function calcNac() {
    const content = document.getElementById('nac-content');
    if (!content) return;
    
    // Weight is capped at 100kg for ALL NAC protocols
    const wt = Math.min(P.calcWt || 0, 100);
    if (wt <= 0) {
        content.innerHTML = '<div class="text-center text-red-500 font-bold p-4">Please enter patient weight first.</div>';
        return;
    }
    
    let html = '';
    
    if (activeNacTab === 'iv3') {
        // IV 3-Bag:
        // 1. 150 mg/kg in 200 mL D5W (60 min)
        // 2. 50 mg/kg in 500 mL D5W (4 hr)
        // 3. 100 mg/kg in 1000 mL D5W (16 hr)
        // Adjust diluent for < 40 kg
        let d1 = 200, d2 = 500, d3 = 1000;
        if (wt <= 10) { d1 = 30; d2 = 70; d3 = 140; }
        else if (wt <= 15) { d1 = 45; d2 = 105; d3 = 210; }
        else if (wt <= 20) { d1 = 60; d2 = 140; d3 = 280; }
        else if (wt <= 25) { d1 = 100; d2 = 250; d3 = 500; }
        else if (wt <= 30) { d1 = 100; d2 = 250; d3 = 500; }
        // For >30 to <40, there is no exact table but usually it's the 30kg dilution or full.
        // The table says <40 kg needs adjustment. 
        // 30 kg is d1:100, d2:250, d3:500. So we will use that for 30-39kg as well since the table jumps from 30kg to 40kg.
        else if (wt < 40) { d1 = 100; d2 = 250; d3 = 500; }

        html = renderNacBag('Bag 1 (Loading)', 150, wt, d1, '60 minutes', 'indigo') +
               renderNacBag('Bag 2', 50, wt, d2, '4 hours', 'blue') +
               renderNacBag('Bag 3', 100, wt, d3, '16 hours', 'teal');
               
    } else if (activeNacTab === 'po') {
        // Oral: 140 mg/kg loading, 70 mg/kg maint.
        // Diluted to 5%. 20% solution -> 1 part NAC, 3 parts diluent.
        // 1 mL of 20% = 200 mg.
        const loadVol20 = (140 * wt) / 200;
        const loadDiluent = loadVol20 * 3;
        const maintVol20 = (70 * wt) / 200;
        const maintDiluent = maintVol20 * 3;
        
        html = \
            <div class="mb-4 border border-indigo-200 rounded-lg overflow-hidden shadow-sm">
                <div class="bg-indigo-600 text-white font-bold p-2 text-sm">Loading Dose (140 mg/kg)</div>
                <div class="p-3 bg-white grid grid-cols-2 gap-2 text-sm">
                    <div><b>NAC 20% Vol:</b> <span class="text-indigo-700 font-bold">\</span> mL</div>
                    <div><b>Diluent Vol:</b> <span class="text-blue-700 font-bold">\</span> mL</div>
                    <div class="col-span-2 pt-2 border-t mt-1"><b>Total 5% Solution Volume:</b> <span class="text-lg font-bold text-green-700">\</span> mL</div>
                </div>
            </div>
            <div class="border border-blue-200 rounded-lg overflow-hidden shadow-sm">
                <div class="bg-blue-600 text-white font-bold p-2 text-sm">Maintenance Dose (70 mg/kg) x 17 doses</div>
                <div class="bg-blue-50 text-xs p-2 text-blue-800 border-b border-blue-100">Every 4 hours</div>
                <div class="p-3 bg-white grid grid-cols-2 gap-2 text-sm">
                    <div><b>NAC 20% Vol:</b> <span class="text-indigo-700 font-bold">\</span> mL</div>
                    <div><b>Diluent Vol:</b> <span class="text-blue-700 font-bold">\</span> mL</div>
                    <div class="col-span-2 pt-2 border-t mt-1"><b>Total 5% Solution Volume:</b> <span class="text-lg font-bold text-green-700">\</span> mL</div>
                </div>
            </div>
        \;
        
    } else if (activeNacTab === 'iv2') {
        // Simplified 2-Bag
        html = renderNacBag('Bag 1', 200, wt, 500, '4 hours', 'indigo') +
               renderNacBag('Bag 2', 100, wt, 1000, '16 hours', 'teal');
               
    } else if (activeNacTab === 'snap') {
        // SNAP 2-Bag
        html = renderNacBag('Bag 1', 100, wt, 200, '2 hours', 'indigo') +
               renderNacBag('Bag 2', 200, wt, 1000, '10 hours', 'teal');
    }
    
    content.innerHTML = html;
}

function renderNacBag(title, mgKg, wt, diluent, duration, color) {
    const doseMg = mgKg * wt;
    const vol20 = doseMg / 200; // 200 mg/mL
    
    return \
        <div class="mb-4 border border-\-200 rounded-lg overflow-hidden shadow-sm">
            <div class="bg-\-600 text-white font-bold p-2 text-sm flex justify-between">
                <span>\</span>
                <span>\ mg/kg</span>
            </div>
            <div class="bg-\-50 text-xs p-2 text-\-800 border-b border-\-100 font-medium">
                <i class="fas fa-clock mr-1"></i> Infuse over \
            </div>
            <div class="p-3 bg-white text-sm">
                <div class="grid grid-cols-2 gap-3 mb-3">
                    <div class="bg-slate-50 p-2 rounded border border-slate-100">
                        <div class="text-xs text-slate-500 mb-1">Total Dose</div>
                        <div class="font-bold text-slate-700">\ mg</div>
                        <div class="text-[10px] text-slate-400">(\ g)</div>
                    </div>
                    <div class="bg-indigo-50 p-2 rounded border border-indigo-100">
                        <div class="text-xs text-indigo-500 mb-1">NAC 20% Volume</div>
                        <div class="font-bold text-indigo-700 text-lg">\ mL</div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-xs font-bold text-slate-500 uppercase">Mix in D5W:</div>
                    <div class="font-bold text-blue-600 text-lg">\ mL</div>
                </div>
            </div>
        </div>
    \;
}
