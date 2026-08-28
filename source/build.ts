import * as css from 'css';
import cssToReactNative, {StyleTuple} from 'css-to-react-native';
import remToPx from './lib/rem-to-px';
import {Utilities} from './types';

const getStyle = (rule: css.Rule) => {
	const declarations = rule.declarations as Array<Required<css.Declaration>>;

	const properties: StyleTuple[] = declarations
		.filter(({property}) => property !== 'transform')
		.map(({property, value}) => {
			if (typeof value === 'string' && value.endsWith('rem')) {
				return [property, remToPx(value)];
			}

			return [property, value];
		});

	return cssToReactNative(properties);
};

const build = (source: string) => {
	const {stylesheet} = css.parse(source);

	// Mapping of Tailwind class names to React Native styles
	const utilities: Utilities = {};

	if (!stylesheet) {
		return utilities;
	}

	const addRule = (rule: css.Rule, media?: string) => {
		if (!Array.isArray(rule.selectors)) {
			return;
		}

		for (const selector of rule.selectors) {
			const utility = selector.replace(/^\./, '').replace(/\\/g, '');

			utilities[utility] = {
				style: getStyle(rule),
				media
			};
		}
	};

	for (const rule of stylesheet.rules) {
		if (rule.type === 'rule') {
			addRule(rule);
		}

		if (rule.type === 'media') {
			const mediaRule = rule as Required<css.Media>;

			for (const childRule of mediaRule.rules) {
				if (childRule.type === 'rule') {
					addRule(childRule, mediaRule.media);
				}
			}
		}
	}

	return utilities;
};

export default build;
import React, { useState } from 'react';

// --- MOCK DATA: 6 of the 18 Atlanta Locations ---
const ATLANTA_STORES = [
  { id: 1, name: 'Buckhead', region: 'Intown', sales: 14500, foodCost: 28.5 },
  { id: 2, name: 'Midtown', region: 'Intown', sales: 16200, foodCost: 29.1 },
  { id: 3, name: 'Sandy Springs', region: 'North Metro', sales: 12800, foodCost: 27.8 },
  { id: 4, name: 'Alpharetta', region: 'North Metro', sales: 15400, foodCost: 28.2 },
  { id: 5, name: 'Marietta', region: 'Cobb', sales: 11900, foodCost: 30.5 },
  { id: 6, name: 'Smyrna', region: 'Cobb', sales: 13100, foodCost: 29.8 },
];

export default function JerseyMikesPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStores, setSelectedStores] = useState([1, 2, 3]); // Default selections
  
  // Inventory Reconciliation State
  const [reconciliationLog, setReconciliationLog] = useState([]);
  const [form, setForm] = useState({ store: 1, item: '', qty: '', reason: 'Short Shipment' });

  // Toggle store selection
  const handleStoreToggle = (id) => {
    if (selectedStores.includes(id)) {
      setSelectedStores(selectedStores.filter(storeId => storeId !== id));
    } else {
      setSelectedStores([...selectedStores, id]);
    }
  };

  // Handle Inventory Correction Submission
  const submitCorrection = (e) => {
    e.preventDefault();
    const storeName = ATLANTA_STORES.find(s => s.id === Number(form.store)).name;
    setReconciliationLog([{ ...form, storeName, date: new Date().toLocaleDateString(), id: Date.now() }, ...reconciliationLog]);
    setForm({ ...form, item: '', qty: '' }); // Reset fields
  };

  // Filter data based on CEO's selection
  const activeData = ATLANTA_STORES.filter(store => selectedStores.includes(store.id));
  const totalSales = activeData.reduce((sum, store) => sum + store.sales, 0);
  const avgFoodCost = activeData.length > 0 
    ? (activeData.reduce((sum, store) => sum + store.foodCost, 0) / activeData.length).toFixed(1) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* HEADER */}
      <header className="bg-blue-950 text-white p-6 shadow-md rounded-b-2xl">
        <h1 className="text-2xl font-bold tracking-tight">JM Atlanta Hub</h1>
        <p className="text-blue-200 text-sm mt-1">Multi-Unit Diagnostics & Recon</p>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {/* --- TAB 1: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Store Selector */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <h2 className="font-semibold text-slate-700 mb-3 flex items-center justify-between">
                <span>Compare Units</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{selectedStores.length} Selected</span>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {ATLANTA_STORES.map(store => (
                  <button
                    key={store.id}
                    onClick={() => handleStoreToggle(store.id)}
                    className={`text-sm py-2 px-3 rounded-lg border transition-all text-left ${
                      selectedStores.includes(store.id) 
                        ? 'bg-blue-950 border-blue-950 text-white shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {store.name}
                  </button>
                ))}
              </div>
            </section>

            {/* CEO KPIs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-emerald-500">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Sales (Selected)</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">${totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-amber-500">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Avg Food Cost</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{avgFoodCost}%</p>
              </div>
            </div>

            {/* Visual Comparison Chart */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <h2 className="font-semibold text-slate-700 mb-4">Sales Comparison</h2>
              {activeData.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Select stores to view data.</p>
              ) : (
                <div className="space-y-4">
                  {activeData.map(store => {
                    const widthPercent = (store.sales / 17000) * 100; // Relative to a high max
                    return (
                      <div key={store.id} className="relative">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{store.name}</span>
                          <span className="text-slate-500">${store.sales.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-blue-950 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${widthPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* --- TAB 2: INVENTORY RECONCILIATION --- */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
              <div className="mb-4 border-b border-slate-100 pb-4">
                <h2 className="font-semibold text-slate-800">Crunchtime Correction Tool</h2>
                <p className="text-xs text-slate-500 mt-1">Log shorted/damaged inventory to adjust paper variance.</p>
              </div>

              <form onSubmit={submitCorrection} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Store Location</label>
                  <select 
                    value={form.store}
                    onChange={(e) => setForm({...form, store: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-950 outline-none"
                  >
                    {ATLANTA_STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Item Missing</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g., Roast Beef" 
                      value={form.item}
                      onChange={(e) => setForm({...form, item: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-950 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity (Cases)</label>
                    <input 
                      required
                      type="number"
                      placeholder="e.g., 2" 
                      value={form.qty}
                      onChange={(e) => setForm({...form, qty: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-950 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Issue Type</label>
                  <div className="flex gap-2">
                    {['Short Shipment', 'Damaged', 'Spoiled'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({...form, reason: type})}
                        className={`text-xs py-1 px-3 rounded-full border transition-all ${
                          form.reason === type 
                            ? 'bg-amber-100 border-amber-300 text-amber-800' 
                            : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-950 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-900 transition-colors mt-2">
                  Log Correction
                </button>
              </form>
            </section>

            {/* Log History */}
            {reconciliationLog.length > 0 && (
              <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Pending Adjustments</h3>
                <div className="space-y-3">
                  {reconciliationLog.map(log => (
                    <div key={log.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{log.item} <span className="text-slate-500 font-normal">({log.qty}x)</span></p>
                        <p className="text-xs text-slate-500">{log.storeName} • {log.date}</p>
                      </div>
                      <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded border border-amber-200">
                        {log.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* iOS STYLE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 px-6 py-4 flex justify-around shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-blue-950' : 'text-slate-400'}`}
        >
          {/* Simple SVG icon for Dashboard */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          <span className="text-[10px] font-semibold uppercase tracking-wider">Metrics</span>
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'inventory' ? 'text-blue-950' : 'text-slate-400'}`}
        >
          {/* Simple SVG icon for Inventory */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          <span className="text-[10px] font-semibold uppercase tracking-wider">Reconcile</span>
        </button>
      </nav>
    </div>
  );
}

