import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
 
/* ============================================================
   CONFIG — edit these values
   ============================================================ */
const GOLDAPI_KEY = "goldapi-f87932c125f3d5504a298673fb1ad6b7-io"; // free key at https://www.goldapi.io ; blank = free fallback
const YOUTUBE_HANDLE = "ethnstacks";
const YOUTUBE_URL = "https://youtube.com/@ethnstacks";
const SUBSCRIBER_GOAL = 500;
const YOUTUBE_API_KEY = "";   // optional, exact count
const YOUTUBE_CHANNEL_ID = ""; // optional, needed with YOUTUBE_API_KEY
 
// MYSTERY BOX — your Stripe Payment Link (set price to $60 total, toggle "collect shipping address" ON in Stripe)
const MYSTERY_BOX_LINK = "https://buy.stripe.com/eVq3cvd7W7cebAI1QC0co00";
const MYSTERY_BOX_PRICE = 50;
const MYSTERY_BOX_SHIPPING = 10;
 
// FORMSPREE — where giveaway emails are sent so you can see/export them
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvznlyyo";
/* ============================================================ */
 
const SEED_PRICES = { gold: 4652, silver: 86.26, platinum: 2075, palladium: 1461 };
const STORAGE_KEY = "metals-collection";
const ALERTS_KEY  = "metals-alerts";
const MILESTONE_KEY = "metals-milestone-entry";
 
const PURITIES = {
  gold:      [ { label: "24K / 99.9% Fine", purity: 0.999 }, { label: "22K / 91.6%", purity: 0.916 }, { label: "21.6K / 90%", purity: 0.90 }, { label: "18K / 75%", purity: 0.75 }, { label: "14K / 58.3%", purity: 0.583 }, { label: "10K / 41.7%", purity: 0.417 } ],
  silver:    [ { label: "Fine Silver 99.9%", purity: 0.999 }, { label: "Sterling Silver 92.5%", purity: 0.925 }, { label: "90% Junk Silver (pre-1965)", purity: 0.90 }, { label: "40% Silver (1965-70 Halves)", purity: 0.40 }, { label: "35% War Nickels", purity: 0.35 } ],
  platinum:  [ { label: "Platinum 99.5% Fine", purity: 0.995 }, { label: "Platinum 95%", purity: 0.95 }, { label: "Platinum 90%", purity: 0.90 } ],
  palladium: [ { label: "Palladium 99.9% Fine", purity: 0.999 }, { label: "Palladium 95%", purity: 0.95 } ],
};
 
const WEIGHT_UNITS = [
  { label: "Troy Ounces (ozt)", toTroyOz: 1 },
  { label: "Grams (g)", toTroyOz: 1/31.1035 },
  { label: "Pennyweights (dwt)", toTroyOz: 1/20 },
  { label: "Avoirdupois Ounces (oz)", toTroyOz: 0.911458 },
  { label: "Pounds (lbs)", toTroyOz: 14.5833 },
  { label: "Kilograms (kg)", toTroyOz: 32.1507 },
];
 
const COIN_PRESETS = [
  { label: "Morgan Dollar (1878-1921)", metal: "silver", purity: 0.90, weight: 0.7736, symbol: "MGN" },
  { label: "Peace Dollar (1921-1935)", metal: "silver", purity: 0.90, weight: 0.7736, symbol: "PCE" },
  { label: "Eisenhower Dollar (1971-78)", metal: "silver", purity: 0.40, weight: 0.3161, symbol: "IKE" },
  { label: "Walking Liberty Half Dollar", metal: "silver", purity: 0.90, weight: 0.3617, symbol: "WLK" },
  { label: "Franklin Half Dollar", metal: "silver", purity: 0.90, weight: 0.3617, symbol: "FRK" },
  { label: "Kennedy Half (1964) 90%", metal: "silver", purity: 0.90, weight: 0.3617, symbol: "JFK" },
  { label: "Kennedy Half (1965-70) 40%", metal: "silver", purity: 0.40, weight: 0.1479, symbol: "JFK" },
  { label: "Washington Quarter (pre-65)", metal: "silver", purity: 0.90, weight: 0.1808, symbol: "25c" },
  { label: "Standing Liberty Quarter", metal: "silver", purity: 0.90, weight: 0.1808, symbol: "25c" },
  { label: "Mercury Dime", metal: "silver", purity: 0.90, weight: 0.07234, symbol: "10c" },
  { label: "Roosevelt Dime (pre-65)", metal: "silver", purity: 0.90, weight: 0.07234, symbol: "10c" },
  { label: "War Nickel (1942-45)", metal: "silver", purity: 0.35, weight: 0.05626, symbol: "5c" },
  { label: "Silver Eagle 1 oz", metal: "silver", purity: 0.999, weight: 1, symbol: "ASE" },
  { label: "Silver Maple Leaf 1 oz", metal: "silver", purity: 0.9999, weight: 1, symbol: "SML" },
  { label: "Gold Eagle 1 oz", metal: "gold", purity: 0.9167, weight: 1, symbol: "AGE" },
  { label: "Gold Eagle 1/2 oz", metal: "gold", purity: 0.9167, weight: 0.5, symbol: "AGE" },
  { label: "Gold Eagle 1/4 oz", metal: "gold", purity: 0.9167, weight: 0.25, symbol: "AGE" },
  { label: "Gold Eagle 1/10 oz", metal: "gold", purity: 0.9167, weight: 0.1, symbol: "AGE" },
  { label: "Gold Buffalo 1 oz", metal: "gold", purity: 0.9999, weight: 1, symbol: "BUF" },
  { label: "Gold Buffalo 1/10 oz", metal: "gold", purity: 0.9999, weight: 0.1, symbol: "BUF" },
  { label: "Gold Maple Leaf 1 oz", metal: "gold", purity: 0.9999, weight: 1, symbol: "GML" },
  { label: "Gold Maple Leaf 1/10 oz", metal: "gold", purity: 0.9999, weight: 0.1, symbol: "GML" },
  { label: "Gold Krugerrand 1 oz", metal: "gold", purity: 0.9167, weight: 1, symbol: "KRG" },
  { label: "Gold Krugerrand 1/2 oz", metal: "gold", purity: 0.9167, weight: 0.5, symbol: "KRG" },
  { label: "Gold Krugerrand 1/4 oz", metal: "gold", purity: 0.9167, weight: 0.25, symbol: "KRG" },
  { label: "Gold Krugerrand 1/10 oz", metal: "gold", purity: 0.9167, weight: 0.1, symbol: "KRG" },
  { label: "Gold Philharmonic 1 oz", metal: "gold", purity: 0.9999, weight: 1, symbol: "PHI" },
  { label: "Gold Philharmonic 1/10 oz", metal: "gold", purity: 0.9999, weight: 0.1, symbol: "PHI" },
  { label: "Gold Britannia 1 oz", metal: "gold", purity: 0.9999, weight: 1, symbol: "BRI" },
  { label: "Gold Britannia 1/10 oz", metal: "gold", purity: 0.9999, weight: 0.1, symbol: "BRI" },
  { label: "$20 Saint-Gaudens (Pre-33)", metal: "gold", purity: 0.9675, weight: 0.9675, symbol: "SG" },
  { label: "$20 Liberty Double Eagle", metal: "gold", purity: 0.9675, weight: 0.9675, symbol: "LDE" },
  { label: "$10 Indian Head Eagle", metal: "gold", purity: 0.9675, weight: 0.48375, symbol: "IHE" },
  { label: "$5 Liberty Half Eagle", metal: "gold", purity: 0.9675, weight: 0.24188, symbol: "LHE" },
];
 
const JUNK_OZT = 0.715;
const FORTY_OZT = 0.295;
 
const MC = {
  gold:      { accent: "#D4A017", glow: "rgba(212,160,23,0.25)",  bg: "rgba(212,160,23,0.07)"  },
  silver:    { accent: "#C8C8C8", glow: "rgba(200,200,200,0.25)", bg: "rgba(200,200,200,0.07)" },
  platinum:  { accent: "#8ECFDF", glow: "rgba(142,207,223,0.25)", bg: "rgba(142,207,223,0.07)" },
  palladium: { accent: "#B89FD8", glow: "rgba(184,159,216,0.25)", bg: "rgba(184,159,216,0.07)" },
};
 
async function fetchFromGoldAPI(metalCode) {
  const res = await fetch(`https://www.goldapi.io/api/${metalCode}/USD`, { headers: { "x-access-token": GOLDAPI_KEY, "Content-Type": "application/json" } });
  if (!res.ok) throw new Error("GoldAPI error");
  const data = await res.json();
  return data.price;
}
async function fetchLivePrices() {
  if (GOLDAPI_KEY) {
    const [gold, silver, platinum, palladium] = await Promise.all([ fetchFromGoldAPI("XAU"), fetchFromGoldAPI("XAG"), fetchFromGoldAPI("XPT"), fetchFromGoldAPI("XPD") ]);
    return { gold, silver, platinum, palladium };
  }
  const res = await fetch("https://api.gold-api.com/price/XAU").catch(() => null);
  if (res && res.ok) {
    const g = await res.json();
    const [s, pt, pd] = await Promise.all([
      fetch("https://api.gold-api.com/price/XAG").then(r => r.json()).catch(() => null),
      fetch("https://api.gold-api.com/price/XPT").then(r => r.json()).catch(() => null),
      fetch("https://api.gold-api.com/price/XPD").then(r => r.json()).catch(() => null),
    ]);
    return { gold: g.price, silver: s?.price ?? SEED_PRICES.silver, platinum: pt?.price ?? SEED_PRICES.platinum, palladium: pd?.price ?? SEED_PRICES.palladium };
  }
  throw new Error("No price source available");
}
async function fetchSubCount() {
  if (YOUTUBE_API_KEY && YOUTUBE_CHANNEL_ID) {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
    if (res.ok) { const d = await res.json(); const n = d?.items?.[0]?.statistics?.subscriberCount; if (n != null) return parseInt(n, 10); }
  }
  const res = await fetch(`https://mixerno.space/api/youtube-channel-counter/user/@${YOUTUBE_HANDLE}`).catch(() => null);
  if (res && res.ok) { const d = await res.json(); const sub = d?.counts?.find(c => c.value === "subscribers" || c.label === "subscribers"); if (sub?.count != null) return parseInt(sub.count, 10); }
  throw new Error("Sub count unavailable");
}
function fmtUSD(n) { return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
 
async function submitToFormspree(email, type) {
  if (!FORMSPREE_ENDPOINT) return;
  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ email, entry_type: type, channel: YOUTUBE_HANDLE, submitted_at: new Date().toISOString() }),
    });
  } catch (e) { /* entry still saved locally even if this fails */ }
}
 
function CoinImg({ symbol = "o", metal, size = 72 }) {
  const accent = MC[metal]?.accent || "#888";
  const fontSize = symbol.length > 2 ? size * 0.28 : size * 0.38;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, border: `2px solid ${accent}55`, background: `radial-gradient(circle at 38% 32%, ${accent}28 0%, ${accent}08 60%, transparent 100%)`, boxShadow: `inset 0 1px 3px ${accent}22, 0 0 12px ${accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize, color: accent, fontWeight: 700, letterSpacing: "-0.02em", userSelect: "none", fontFamily: "'Courier New', monospace" }}>{symbol}</div>
  );
}
 
export default function App() {
  const [prices, setPrices] = useState(SEED_PRICES);
  const [priceStatus, setPriceStatus] = useState("seed");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [tab, setTab] = useState("calc");
  const [collection, setCollection] = useState([]);
  const [storageReady, setStorageReady] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [milestoneDone, setMilestoneDone] = useState(false);
  const [milestoneEmail, setMilestoneEmail] = useState("");
  const [milestoneInput, setMilestoneInput] = useState("");
  const [subCount, setSubCount] = useState(null);
  const [subStatus, setSubStatus] = useState("loading");
  const [metal, setMetal] = useState("silver");
  const [purity, setPurity] = useState(0.90);
  const [customPct, setCustomPct] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState(WEIGHT_UNITS[0]);
  const [qty, setQty] = useState(1);
  const [entryLabel, setEntryLabel] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [result, setResult] = useState(null);
  const [exported, setExported] = useState("");
  const [faceType, setFaceType] = useState("90pct");
  const [faceValue, setFaceValue] = useState("");
  const [faceResult, setFaceResult] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertMetal, setAlertMetal] = useState("gold");
  const [alertDir, setAlertDir] = useState("above");
  const [alertPrice, setAlertPrice] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [firedAlerts, setFiredAlerts] = useState([]);
  const [chartMetal, setChartMetal] = useState("gold");
  const [showGiveawayBanner, setShowGiveawayBanner] = useState(true);
 
  useEffect(() => {
    async function load() {
      try { const col = await window.storage.get(STORAGE_KEY); if (col?.value) { const p = JSON.parse(col.value); if (Array.isArray(p)) setCollection(p); } } catch(e) {}
      try { const alts = await window.storage.get(ALERTS_KEY); if (alts?.value) { const p = JSON.parse(alts.value); if (Array.isArray(p)) setAlerts(p); } } catch(e) {}
      try { const ms = await window.storage.get(MILESTONE_KEY); if (ms?.value) { setMilestoneDone(true); setMilestoneEmail(ms.value); } } catch(e) {}
      setStorageReady(true);
    }
    load();
  }, []);
  useEffect(() => { if (storageReady) window.storage.set(STORAGE_KEY, JSON.stringify(collection)).then(()=>{ setSavedNotice(true); setTimeout(()=>setSavedNotice(false),1800); }).catch(()=>{}); }, [collection, storageReady]);
  useEffect(() => { if (storageReady) window.storage.set(ALERTS_KEY, JSON.stringify(alerts)).catch(()=>{}); }, [alerts, storageReady]);
  useEffect(() => { setPriceStatus("loading"); fetchLivePrices().then(p => { setPrices(p); setPriceStatus("live"); setUpdatedAt(new Date()); }).catch(() => { setPriceStatus("error"); setUpdatedAt(new Date()); }); }, []);
  useEffect(() => { setSubStatus("loading"); fetchSubCount().then(n => { setSubCount(n); setSubStatus("live"); }).catch(() => { setSubStatus("error"); }); }, []);
  useEffect(() => { if (!alerts.length) return; const fired = alerts.filter(a => { const spot = prices[a.metal]; return a.dir === "above" ? spot >= a.price : spot <= a.price; }); if (fired.length) setFiredAlerts(fired); }, [prices]);
  useEffect(() => { setPurity(PURITIES[metal][metal==="silver"?2:0].purity); setCustomPct(""); setResult(null); setSelectedPreset(null); }, [metal]);
 
  const activePurity = customPct !== "" && parseFloat(customPct) > 0 ? parseFloat(customPct)/100 : purity;
  const calculate = () => { const w = parseFloat(weight); if (!w||w<=0) return; const troyOz = w*unit.toTroyOz*activePurity*qty; setResult({ value: troyOz*prices[metal], troyOz, spot: prices[metal], pct: activePurity*100 }); };
  const addToCollection = () => { if (!result) return; const lbl = entryLabel || (selectedPreset ? selectedPreset.label : `${metal.toUpperCase()} ${(activePurity*100).toFixed(0)}% ${weight}${unit.label.split(" ")[0]}${qty>1?" x"+qty:""}`); setCollection(prev => [...prev, { id: Date.now(), label: lbl, metal, troyOz: result.troyOz, value: result.value, spot: result.spot, symbol: selectedPreset?.symbol||null, savedAt: new Date().toLocaleDateString() }]); setEntryLabel(""); };
  const addFaceToCollection = () => { if (!faceResult) return; setCollection(prev => [...prev, { id: Date.now(), label: `${faceResult.type==="90pct"?"90%":"40%"} Junk Silver $${faceResult.fv} face`, metal:"silver", troyOz: faceResult.troyOz, value: faceResult.value, spot: faceResult.spot, symbol:"o", savedAt: new Date().toLocaleDateString() }]); };
  const removeFromCollection = id => setCollection(prev => prev.filter(e => e.id !== id));
  const collectionTotal = collection.reduce((s,e) => s+e.value, 0);
  const calcFaceValue = () => { const fv = parseFloat(faceValue); if (!fv||fv<=0) return; const ozt = fv*(faceType==="90pct"?JUNK_OZT:FORTY_OZT); setFaceResult({ value: ozt*prices.silver, troyOz: ozt, fv, spot: prices.silver, type: faceType }); };
  const exportCollection = () => { const lines = ["PRECIOUS METALS COLLECTION", `Date: ${new Date().toLocaleDateString()}`, `Spot: Gold ${fmtUSD(prices.gold)} | Silver ${fmtUSD(prices.silver)} | Platinum ${fmtUSD(prices.platinum)} | Palladium ${fmtUSD(prices.palladium)}`, "", ...collection.map((e,i)=>`${i+1}. ${e.label}  -  ${e.troyOz.toFixed(4)} fine ozt  -  ${fmtUSD(e.value)}`), "", `TOTAL: ${fmtUSD(collectionTotal)}`, "", "Melt value only. Not financial advice."]; const t = lines.join("\n"); setExported(t); navigator.clipboard?.writeText(t).catch(()=>{}); };
  const applyPreset = (preset) => { setMetal(preset.metal); setTimeout(() => { const p = PURITIES[preset.metal].find(x=>Math.abs(x.purity-preset.purity)<0.001); setPurity(p?p.purity:PURITIES[preset.metal][0].purity); setCustomPct(""); setWeight(preset.weight.toString()); setUnit(WEIGHT_UNITS[0]); setEntryLabel(preset.label); setSelectedPreset(preset); setResult(null); setTab("calc"); }, 10); };
  const addAlert = () => { const p = parseFloat(alertPrice); if (!p||p<=0) return; setAlerts(prev => [...prev, { id: Date.now(), metal: alertMetal, dir: alertDir, price: p, email: alertEmail, createdAt: new Date().toLocaleDateString() }]); setAlertPrice(""); setAlertEmail(""); };
 
  const chartData = (() => { const cur = prices[chartMetal]; const months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"]; const f = [0.82,0.85,0.88,0.86,0.90,0.93,0.95,0.97,0.96,0.99,1.0,1.0]; return months.map((m,i) => ({ month: m, price: +(cur*f[i]).toFixed(2) })); })();
 
  const c = MC[metal];
  const statusInfo = priceStatus==="loading" ? { text:"FETCHING LIVE PRICES...", col:"#888" } : priceStatus==="live" ? { text:`* LIVE  ${updatedAt?.toLocaleTimeString()}`, col:"#66BB6A" } : { text:"PRICES UNAVAILABLE - SHOWING LAST KNOWN", col:"#EF5350" };
  const subPct = subCount != null ? Math.min(100, (subCount/SUBSCRIBER_GOAL)*100) : 0;
  const goalReached = subCount != null && subCount >= SUBSCRIBER_GOAL;
  const TABS = [ ["calc","CALCULATOR"], ["face","FACE VALUE"], ["presets","COIN PRESETS"], ["collection", `COLLECTION${collection.length?` (${collection.length})`:""}`], ["alerts","PRICE ALERTS"], ["charts","CHARTS"], ["mystery","MYSTERY BOX"], ["giveaway","GIVEAWAY"] ];
 
  return (
    <div style={{ minHeight:"100vh", background:"#08080a", color:"#e8e8e0", fontFamily:"'Courier New', monospace" }}>
      {showGiveawayBanner && (
        <div style={{ background:"linear-gradient(90deg, #0f0f11, #1a1a1c, #0f0f11)", borderBottom:"1px solid #C8C8C822", padding:"10px 26px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}><div style={{ fontSize:18 }}>S</div><div><span style={{ fontSize:13, color:"#C8C8C8", fontWeight:700 }}>1 oz Silver Giveaway at {SUBSCRIBER_GOAL} subs</span><span style={{ fontSize:12, color:"#555", marginLeft:10 }}>Free to enter</span></div></div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}><button onClick={()=>{ setTab("giveaway"); }} style={{ padding:"6px 16px", background:"#C8C8C8", border:"none", color:"#08080a", fontFamily:"inherit", fontSize:11, fontWeight:700, letterSpacing:"0.15em", cursor:"pointer" }}>ENTER FREE</button><button onClick={()=>setShowGiveawayBanner(false)} style={{ background:"transparent", border:"none", color:"#333", cursor:"pointer", fontSize:18, padding:"0 4px" }}>x</button></div>
        </div>
      )}
      {firedAlerts.length > 0 && (
        <div style={{ background:"#1a0a0a", borderBottom:"1px solid #EF535055", padding:"10px 26px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <div style={{ fontSize:12, color:"#EF5350" }}>ALERT: {firedAlerts.map(a=>`${a.metal.toUpperCase()} is ${a.dir} ${fmtUSD(a.price)}`).join(" / ")}</div>
          <button onClick={()=>setFiredAlerts([])} style={{ background:"transparent", border:"none", color:"#555", cursor:"pointer", fontSize:16 }}>x</button>
        </div>
      )}
      <div style={{ padding:"20px 26px 14px", borderBottom:`1px solid ${c.accent}20`, background:`linear-gradient(170deg,${c.bg},transparent 80%)` }}>
        <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
          <div>
            <div style={{ fontSize:11, letterSpacing:"0.3em", color:c.accent, marginBottom:5 }}>ETHNSTACKS - PRECIOUS METALS</div>
            <div style={{ fontSize:"clamp(20px,5vw,34px)", fontWeight:700, letterSpacing:"-0.02em", lineHeight:1 }}>SPOT METAL</div>
            <div style={{ fontSize:"clamp(20px,5vw,34px)", fontWeight:700, letterSpacing:"-0.02em", color:c.accent, lineHeight:1.15 }}>CALCULATOR</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:statusInfo.col, marginBottom:8 }}>{statusInfo.text}</div>
            {Object.entries(prices).map(([m,p]) => (<div key={m} style={{ display:"flex", justifyContent:"flex-end", gap:12, marginBottom:3 }}><span style={{ fontSize:11, color:MC[m].accent, textTransform:"uppercase", letterSpacing:"0.1em" }}>{m==="palladium"?"PALLAD.":m}</span><span style={{ fontSize:14, fontWeight:700 }}>{fmtUSD(p)}</span></div>))}
            {savedNotice && <div style={{ fontSize:10, color:"#66BB6A", marginTop:6 }}>SAVED</div>}
          </div>
        </div>
      </div>
      <div style={{ display:"flex", borderBottom:"1px solid #181818", overflowX:"auto" }}>
        {TABS.map(([id,lbl]) => (<button key={id} onClick={()=>setTab(id)} style={{ padding:"10px 16px", background:"transparent", border:"none", borderBottom: tab===id ? `2px solid ${id==="giveaway"?"#C8C8C8":c.accent}` : "2px solid transparent", color: tab===id ? (id==="giveaway"?"#C8C8C8":c.accent) : id==="giveaway"?"#C8C8C899":"#555", fontFamily:"inherit", fontSize:11, letterSpacing:"0.12em", cursor:"pointer", whiteSpace:"nowrap" }} className={id==="giveaway"&&tab!=="giveaway"?"giveaway-tab-pulse":""}>{lbl}</button>))}
      </div>
      <div style={{ padding:"20px 26px", maxWidth:900, margin:"0 auto" }}>
        {tab==="calc" && (<>
          <Sec label="01 - METAL"><div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{Object.keys(PURITIES).map(m=><Btn key={m} active={metal===m} color={MC[m]} onClick={()=>setMetal(m)}>{m==="palladium"?"PALLADIUM":m.toUpperCase()}</Btn>)}</div></Sec>
          <Sec label="02 - PURITY / ALLOY">
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:12 }}>{PURITIES[metal].map(p => { const active=customPct===""&&Math.abs(purity-p.purity)<0.0001; return (<button key={p.purity} onClick={()=>{setPurity(p.purity);setCustomPct("");}} style={{ padding:"8px 14px", background:active?c.bg:"#111", border:`1px solid ${active?c.accent:"#1e1e1e"}`, color:active?c.accent:"#666", fontFamily:"inherit", fontSize:13, cursor:"pointer", transition:"all 0.1s" }}>{p.label}</button>); })}</div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}><span style={{ fontSize:12, color:"#555", letterSpacing:"0.1em" }}>CUSTOM %</span><input type="number" min="0.1" max="100" step="0.1" value={customPct} placeholder="e.g. 80" onChange={e=>setCustomPct(e.target.value)} style={{ width:90, padding:"7px 11px", background:"#111", border:`1px solid ${customPct?c.accent+"55":"#1e1e1e"}`, color:"#e8e8e0", fontFamily:"inherit", fontSize:14, outline:"none" }} /></div>
          </Sec>
          <Sec label="03 - WEIGHT & QUANTITY">
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end" }}>
              <div><div style={{ fontSize:11, color:"#444", marginBottom:5 }}>WEIGHT</div><input type="number" min="0" step="any" value={weight} onChange={e=>{setWeight(e.target.value);setSelectedPreset(null);}} placeholder="0.00" style={{ width:130, padding:"12px 14px", background:"#111", border:`1px solid ${weight?c.accent+"60":"#1e1e1e"}`, color:"#fff", fontFamily:"inherit", fontSize:24, fontWeight:700, outline:"none" }} /></div>
              <div><div style={{ fontSize:11, color:"#444", marginBottom:5 }}>UNIT</div><select value={unit.label} onChange={e=>setUnit(WEIGHT_UNITS.find(u=>u.label===e.target.value))} style={{ padding:"12px", background:"#111", border:"1px solid #1e1e1e", color:"#e8e8e0", fontFamily:"inherit", fontSize:13, cursor:"pointer", outline:"none", minWidth:215 }}>{WEIGHT_UNITS.map(u=><option key={u.label} value={u.label}>{u.label}</option>)}</select></div>
              <div><div style={{ fontSize:11, color:"#444", marginBottom:5 }}>QTY</div><input type="number" min="1" step="1" value={qty} onChange={e=>setQty(Math.max(1,parseInt(e.target.value)||1))} style={{ width:80, padding:"12px 14px", background:"#111", border:"1px solid #1e1e1e", color:"#fff", fontFamily:"inherit", fontSize:24, fontWeight:700, outline:"none" }} /></div>
            </div>
          </Sec>
          <Sec label="04 - LABEL (optional)"><input type="text" value={entryLabel} onChange={e=>setEntryLabel(e.target.value)} placeholder="e.g. Morgan Dollars, Grandma's ring" style={{ width:"100%", padding:"10px 13px", background:"#111", border:"1px solid #1e1e1e", color:"#e8e8e0", fontFamily:"inherit", fontSize:14, outline:"none" }} /></Sec>
          {selectedPreset && (<div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18, padding:"12px 16px", background:"#0f0f11", border:`1px solid ${c.accent}30` }}><CoinImg symbol={selectedPreset.symbol} metal={selectedPreset.metal} size={56} /><div><div style={{ fontSize:14, color:"#ccc" }}>{selectedPreset.label}</div><div style={{ fontSize:11, color:"#555", marginTop:2 }}>{(selectedPreset.purity*100).toFixed(selectedPreset.purity>=0.999?1:0)}% / {selectedPreset.weight} ozt/coin</div></div></div>)}
          <button onClick={calculate} disabled={!weight} style={{ width:"100%", padding:"16px", marginBottom:18, background:weight?c.accent:"#141414", border:"none", color:weight?"#08080a":"#2a2a2a", fontFamily:"inherit", fontSize:14, fontWeight:700, letterSpacing:"0.25em", cursor:weight?"pointer":"not-allowed", textTransform:"uppercase", boxShadow:weight?`0 0 30px ${c.glow}`:"none", transition:"all 0.15s" }}>CALCULATE MELT VALUE</button>
          {result && (<div style={{ border:`1px solid ${c.accent}`, background:c.bg, padding:"22px 26px", boxShadow:`0 0 44px ${c.glow}`, animation:"fadeIn 0.2s ease" }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}><div style={{ flex:1 }}><div style={{ fontSize:11, letterSpacing:"0.3em", color:c.accent, marginBottom:10 }}>MELT VALUE</div><div style={{ fontSize:"clamp(36px,8vw,62px)", fontWeight:700, color:"#fff", letterSpacing:"-0.02em", lineHeight:1 }}>{fmtUSD(result.value)}</div><div style={{ marginTop:14, display:"flex", flexWrap:"wrap", gap:18, fontSize:12, color:"#555" }}><span><span style={{color:"#383838"}}>FINE OZT </span><span style={{color:"#bbb"}}>{result.troyOz.toFixed(4)}</span></span><span><span style={{color:"#383838"}}>SPOT </span><span style={{color:"#bbb"}}>{fmtUSD(result.spot)}/ozt</span></span><span><span style={{color:"#383838"}}>PURITY </span><span style={{color:"#bbb"}}>{result.pct.toFixed(1)}%</span></span><span><span style={{color:"#383838"}}>QTY </span><span style={{color:"#bbb"}}>x{qty}</span></span></div><button onClick={addToCollection} style={{ marginTop:16, padding:"9px 18px", background:"transparent", border:`1px solid ${c.accent}66`, color:c.accent, fontFamily:"inherit", fontSize:12, letterSpacing:"0.15em", cursor:"pointer" }}>+ ADD TO COLLECTION</button><div style={{ marginTop:10, fontSize:10, color:"#282828" }}>MELT VALUE ONLY / NOT FINANCIAL ADVICE</div></div>{selectedPreset && <CoinImg symbol={selectedPreset.symbol} metal={selectedPreset.metal} size={90} />}</div></div>)}
        </>)}
        {tab==="face" && (<>
          <div style={{ fontSize:13, color:"#666", marginBottom:20, lineHeight:1.8 }}>Calculate melt value by dollar face - the way dealers trade junk silver bags.<br/><span style={{color:"#444"}}>90% silver: $1 face = 0.715 troy oz / 40% silver: $1 face = 0.295 troy oz</span></div>
          <Sec label="COIN TYPE"><div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{[["90pct","90% Silver - pre-1965 dimes, quarters, halves, dollars"],["40pct","40% Silver - 1965-1970 Kennedy Halves"]].map(([id,lbl])=>(<button key={id} onClick={()=>{setFaceType(id);setFaceResult(null);}} style={{ padding:"10px 16px", background:faceType===id?MC.silver.bg:"#111", border:`1px solid ${faceType===id?MC.silver.accent:"#1e1e1e"}`, color:faceType===id?MC.silver.accent:"#666", fontFamily:"inherit", fontSize:13, cursor:"pointer", transition:"all 0.1s" }}>{lbl}</button>))}</div></Sec>
          <Sec label="FACE VALUE ($)"><div style={{ position:"relative", display:"inline-block", marginBottom:12 }}><span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:20, color:"#555", fontWeight:700, pointerEvents:"none" }}>$</span><input type="number" min="0" step="0.01" value={faceValue} onChange={e=>setFaceValue(e.target.value)} placeholder="0.00" style={{ width:170, padding:"12px 14px 12px 30px", background:"#111", border:`1px solid ${faceValue?MC.silver.accent+"60":"#1e1e1e"}`, color:"#fff", fontFamily:"inherit", fontSize:24, fontWeight:700, outline:"none" }} /></div><div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>{[1,5,10,25,50,100,500,1000].map(v=>(<button key={v} onClick={()=>setFaceValue(v.toString())} style={{ padding:"7px 13px", background:parseFloat(faceValue)===v?MC.silver.bg:"#111", border:`1px solid ${parseFloat(faceValue)===v?MC.silver.accent:"#1e1e1e"}`, color:parseFloat(faceValue)===v?MC.silver.accent:"#555", fontFamily:"inherit", fontSize:13, cursor:"pointer", transition:"all 0.1s" }}>${v}</button>))}</div></Sec>
          <button onClick={calcFaceValue} disabled={!faceValue} style={{ width:"100%", padding:"16px", marginBottom:18, background:faceValue?MC.silver.accent:"#141414", border:"none", color:faceValue?"#08080a":"#2a2a2a", fontFamily:"inherit", fontSize:14, fontWeight:700, letterSpacing:"0.25em", cursor:faceValue?"pointer":"not-allowed", textTransform:"uppercase", boxShadow:faceValue?`0 0 30px ${MC.silver.glow}`:"none", transition:"all 0.15s" }}>CALCULATE FACE VALUE</button>
          {faceResult && (<div style={{ border:`1px solid ${MC.silver.accent}`, background:MC.silver.bg, padding:"22px 26px", boxShadow:`0 0 44px ${MC.silver.glow}`, animation:"fadeIn 0.2s ease" }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}><div style={{ flex:1 }}><div style={{ fontSize:11, letterSpacing:"0.3em", color:MC.silver.accent, marginBottom:10 }}>MELT VALUE</div><div style={{ fontSize:"clamp(36px,8vw,62px)", fontWeight:700, color:"#fff", letterSpacing:"-0.02em", lineHeight:1 }}>{fmtUSD(faceResult.value)}</div><div style={{ marginTop:14, display:"flex", flexWrap:"wrap", gap:18, fontSize:12, color:"#555" }}><span><span style={{color:"#383838"}}>FACE </span><span style={{color:"#bbb"}}>{fmtUSD(faceResult.fv)}</span></span><span><span style={{color:"#383838"}}>FINE OZT </span><span style={{color:"#bbb"}}>{faceResult.troyOz.toFixed(4)}</span></span><span><span style={{color:"#383838"}}>SPOT </span><span style={{color:"#bbb"}}>{fmtUSD(faceResult.spot)}/ozt</span></span></div><button onClick={addFaceToCollection} style={{ marginTop:16, padding:"9px 18px", background:"transparent", border:`1px solid ${MC.silver.accent}66`, color:MC.silver.accent, fontFamily:"inherit", fontSize:12, letterSpacing:"0.15em", cursor:"pointer" }}>+ ADD TO COLLECTION</button></div><div style={{ width:90, height:90, flexShrink:0, borderRadius:"50%", border:`2px solid ${MC.silver.accent}44`, background:`radial-gradient(circle at 38% 32%, ${MC.silver.accent}28, transparent)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, color:MC.silver.accent }}>o</div></div></div>)}
        </>)}
        {tab==="presets" && (<div><div style={{ fontSize:13, color:"#555", marginBottom:16, letterSpacing:"0.1em" }}>TAP A COIN TO AUTO-FILL THE CALCULATOR</div>{["silver","gold"].map(m=>(<div key={m} style={{ marginBottom:26 }}><div style={{ fontSize:12, color:MC[m].accent, letterSpacing:"0.2em", textTransform:"uppercase", borderBottom:`1px solid ${MC[m].accent}20`, paddingBottom:8, marginBottom:12 }}>{m==="silver"?"SILVER COINS":"GOLD COINS"}</div><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:8 }}>{COIN_PRESETS.filter(p=>p.metal===m).map(p=>(<button key={p.label} onClick={()=>applyPreset(p)} onMouseEnter={e=>{e.currentTarget.style.borderColor=MC[m].accent+"50";e.currentTarget.style.background="#141416";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#181818";e.currentTarget.style.background="#0f0f11";}} style={{ padding:"12px 14px", background:"#0f0f11", border:"1px solid #181818", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.1s", display:"flex", alignItems:"center", gap:12 }}><CoinImg symbol={p.symbol} metal={p.metal} size={48} /><div><div style={{ fontSize:9, color:MC[m].accent, letterSpacing:"0.1em", marginBottom:3 }}>{(p.purity*100)>=99?(p.purity*100).toFixed(1):(p.purity*100).toFixed(0)}% / {p.weight} ozt</div><div style={{ fontSize:13, color:"#bbb", lineHeight:1.4 }}>{p.label}</div></div></button>))}</div></div>))}</div>)}
        {tab==="collection" && (<div><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}><div style={{ fontSize:12, color:"#555", letterSpacing:"0.1em" }}>{!storageReady?"LOADING...":collection.length===0?"NO ITEMS YET":`${collection.length} ITEM${collection.length!==1?"S":""} / AUTO-SAVED`}</div>{collection.length>0 && (<div style={{ display:"flex", gap:8 }}><button onClick={exportCollection} style={{ padding:"8px 16px", background:"transparent", border:"1px solid #2a2a2a", color:"#888", fontFamily:"inherit", fontSize:12, letterSpacing:"0.1em", cursor:"pointer" }}>EXPORT / COPY</button><button onClick={()=>{setCollection([]);setExported("");}} style={{ padding:"8px 16px", background:"transparent", border:"1px solid #222", color:"#444", fontFamily:"inherit", fontSize:12, letterSpacing:"0.1em", cursor:"pointer" }}>CLEAR ALL</button></div>)}</div>{collection.length===0&&storageReady&&(<div style={{ color:"#2e2e2e", fontSize:14, padding:"40px 0", textAlign:"center", lineHeight:2 }}>NO ITEMS YET<br/><span style={{fontSize:12,color:"#222"}}>Calculate and click "+ ADD TO COLLECTION"</span></div>)}{collection.map(e=>(<div key={e.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 16px", background:"#0f0f11", border:"1px solid #181818", marginBottom:7, gap:12, flexWrap:"wrap" }}><div style={{ display:"flex", alignItems:"center", gap:12 }}><CoinImg symbol={e.symbol||"o"} metal={e.metal} size={44} /><div><div style={{ fontSize:14, color:"#ccc", marginBottom:3 }}>{e.label}</div><div style={{ fontSize:11, color:"#444" }}><span style={{color:MC[e.metal].accent}}>{e.metal.toUpperCase()}</span>{" / "}{e.troyOz.toFixed(4)} fine ozt{e.savedAt&&<span style={{color:"#2a2a2a"}}> / added {e.savedAt}</span>}</div></div></div><div style={{ display:"flex", alignItems:"center", gap:14 }}><span style={{ fontSize:18, fontWeight:700, color:MC[e.metal].accent }}>{fmtUSD(e.value)}</span><button onClick={()=>removeFromCollection(e.id)} style={{ background:"transparent", border:"none", color:"#333", cursor:"pointer", fontSize:20, padding:"0 4px" }}>x</button></div></div>))}{collection.length>0&&(<div style={{ marginTop:18, padding:"18px 20px", border:"1px solid #242424", background:"#0c0c0e", display:"flex", justifyContent:"space-between", alignItems:"center" }}><div><div style={{ fontSize:11, letterSpacing:"0.2em", color:"#444", marginBottom:6 }}>TOTAL MELT VALUE</div><div style={{ fontSize:11, color:"#2a2a2a" }}>{Object.entries(collection.reduce((acc,e)=>{acc[e.metal]=(acc[e.metal]||0)+e.value;return acc;},{})).map(([m,v])=>`${m}: ${fmtUSD(v)}`).join(" / ")}</div></div><div style={{ fontSize:"clamp(26px,5vw,40px)", fontWeight:700, color:"#fff" }}>{fmtUSD(collectionTotal)}</div></div>)}{exported&&(<div style={{ marginTop:16 }}><div style={{ fontSize:11, color:"#66BB6A", marginBottom:8 }}>COPIED TO CLIPBOARD</div><textarea readOnly value={exported} style={{ width:"100%", height:210, background:"#0c0c0e", border:"1px solid #1e1e1e", color:"#666", fontFamily:"inherit", fontSize:12, padding:13, resize:"vertical", outline:"none" }} /></div>)}</div>)}
        {tab==="alerts" && (<div><div style={{ fontSize:13, color:"#555", marginBottom:20, lineHeight:1.8 }}>Set a target price - the app notifies you when spot crosses your threshold while it's open.<br/><span style={{color:"#333",fontSize:11}}>For background email alerts, connect a mail service after deploying.</span></div><Sec label="NEW ALERT"><div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end", marginBottom:12 }}><div><div style={{ fontSize:10, color:"#444", marginBottom:5 }}>METAL</div><select value={alertMetal} onChange={e=>setAlertMetal(e.target.value)} style={{ padding:"10px 12px", background:"#111", border:"1px solid #1e1e1e", color:"#e8e8e0", fontFamily:"inherit", fontSize:13, cursor:"pointer", outline:"none" }}>{Object.keys(PURITIES).map(m=><option key={m} value={m}>{m.toUpperCase()}</option>)}</select></div><div><div style={{ fontSize:10, color:"#444", marginBottom:5 }}>DIRECTION</div><select value={alertDir} onChange={e=>setAlertDir(e.target.value)} style={{ padding:"10px 12px", background:"#111", border:"1px solid #1e1e1e", color:"#e8e8e0", fontFamily:"inherit", fontSize:13, cursor:"pointer", outline:"none" }}><option value="above">Rises ABOVE</option><option value="below">Falls BELOW</option></select></div><div><div style={{ fontSize:10, color:"#444", marginBottom:5 }}>TARGET ($/ozt)</div><input type="number" min="0" step="0.01" value={alertPrice} onChange={e=>setAlertPrice(e.target.value)} placeholder="0.00" style={{ width:120, padding:"10px 12px", background:"#111", border:`1px solid ${alertPrice?MC[alertMetal].accent+"55":"#1e1e1e"}`, color:"#fff", fontFamily:"inherit", fontSize:18, fontWeight:700, outline:"none" }} /></div></div><div style={{ marginBottom:12 }}><div style={{ fontSize:10, color:"#444", marginBottom:5 }}>EMAIL (optional)</div><input type="email" value={alertEmail} onChange={e=>setAlertEmail(e.target.value)} placeholder="you@email.com" style={{ width:"100%", maxWidth:320, padding:"9px 12px", background:"#111", border:"1px solid #1e1e1e", color:"#e8e8e0", fontFamily:"inherit", fontSize:13, outline:"none" }} /></div><button onClick={addAlert} disabled={!alertPrice} style={{ padding:"11px 24px", background:alertPrice?MC[alertMetal].accent:"#141414", border:"none", color:alertPrice?"#08080a":"#2a2a2a", fontFamily:"inherit", fontSize:12, fontWeight:700, letterSpacing:"0.2em", cursor:alertPrice?"pointer":"not-allowed" }}>+ ADD ALERT</button></Sec>{alerts.length>0&&(<Sec label={`ACTIVE ALERTS (${alerts.length})`}>{alerts.map(a=>(<div key={a.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:"#0f0f11", border:`1px solid ${MC[a.metal].accent}22`, marginBottom:7 }}><div><div style={{ fontSize:13, color:"#ccc" }}><span style={{color:MC[a.metal].accent}}>{a.metal.toUpperCase()}</span> {a.dir==="above"?"rises above":"falls below"} <span style={{color:"#fff",fontWeight:700}}>{fmtUSD(a.price)}</span></div><div style={{ fontSize:10, color:"#444", marginTop:3 }}>Current: {fmtUSD(prices[a.metal])}/ozt / Set {a.createdAt}{a.email&&` / ${a.email}`}</div></div><button onClick={()=>setAlerts(prev=>prev.filter(x=>x.id!==a.id))} style={{ background:"transparent", border:"none", color:"#333", cursor:"pointer", fontSize:18 }}>x</button></div>))}</Sec>)}</div>)}
        {tab==="charts" && (<div><div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>{Object.keys(MC).map(m=>(<Btn key={m} active={chartMetal===m} color={MC[m]} onClick={()=>setChartMetal(m)}>{m==="palladium"?"PALLADIUM":m.toUpperCase()}</Btn>))}</div><div style={{ fontSize:11, color:"#555", marginBottom:14, letterSpacing:"0.1em" }}>12-MONTH TREND (EST.) - USD PER TROY OZ / anchored to live price</div><div style={{ background:"#0c0c0e", border:"1px solid #181818", padding:"20px 10px 10px" }}><ResponsiveContainer width="100%" height={260}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" /><XAxis dataKey="month" tick={{ fill:"#555", fontSize:10, fontFamily:"Courier New" }} /><YAxis tick={{ fill:"#555", fontSize:10, fontFamily:"Courier New" }} tickFormatter={v=>`$${v.toLocaleString()}`} width={70} /><Tooltip contentStyle={{ background:"#111", border:`1px solid ${MC[chartMetal].accent}55`, fontFamily:"Courier New", fontSize:12 }} labelStyle={{ color:"#888" }} formatter={v=>[`$${Number(v).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,"Price"]} /><Line type="monotone" dataKey="price" stroke={MC[chartMetal].accent} strokeWidth={2} dot={{ fill:MC[chartMetal].accent, r:3 }} activeDot={{ r:5 }} /></LineChart></ResponsiveContainer></div><div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginTop:14 }}>{[{ label:"CURRENT", val:fmtUSD(prices[chartMetal]) },{ label:"12M HIGH", val:fmtUSD(Math.max(...chartData.map(d=>d.price))) },{ label:"12M LOW", val:fmtUSD(Math.min(...chartData.map(d=>d.price))) }].map(s=>(<div key={s.label} style={{ background:"#0f0f11", border:"1px solid #181818", padding:"12px 16px", flex:1, minWidth:100 }}><div style={{ fontSize:9, color:"#444", letterSpacing:"0.2em", marginBottom:5 }}>{s.label}</div><div style={{ fontSize:16, fontWeight:700, color:MC[chartMetal].accent }}>{s.val}</div></div>))}</div><div style={{ marginTop:14, fontSize:10, color:"#2a2a2a" }}>Note: 12-month trend is estimated from the current live price for display. For exact historical data, connect a historical metals API.</div></div>)}
        {tab==="mystery" && (<div>
          <div style={{ padding:"26px 26px 24px", background:"linear-gradient(160deg, rgba(212,160,23,0.08), #0f0f11)", border:"1px solid #D4A01744", marginBottom:16, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(90deg, transparent, #D4A017, #C8C8C8, #D4A017, transparent)" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20, flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:240 }}>
                <div style={{ fontSize:10, letterSpacing:"0.3em", color:"#D4A017", marginBottom:10 }}>ETHNSTACKS EXCLUSIVE</div>
                <div style={{ fontSize:"clamp(26px,6vw,40px)", fontWeight:700, color:"#fff", lineHeight:1.05, marginBottom:6 }}>SILVER<br/>MYSTERY BOX</div>
                <div style={{ display:"inline-block", padding:"4px 12px", background:"rgba(200,200,200,0.1)", border:"1px solid #C8C8C844", color:"#C8C8C8", fontSize:12, fontWeight:700, letterSpacing:"0.1em", marginTop:8 }}>GUARANTEED SILVER IN EVERY BOX</div>
              </div>
              <div style={{ width:120, height:120, flexShrink:0, borderRadius:12, border:"2px solid #D4A01755", background:"radial-gradient(circle at 38% 32%, #D4A01730, #C8C8C810, transparent)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:54 }}>📦</div>
            </div>
 
            <div style={{ fontSize:14, color:"#999", lineHeight:1.8, margin:"20px 0" }}>
              Every box is packed with a hand-picked mix of collectible coins and <strong style={{color:"#C8C8C8"}}>guaranteed real silver</strong>. Could include:
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:8, marginBottom:22 }}>
              {[
                "Guaranteed silver coin or round",
                "Indian Head cents",
                "Proof sets",
                "Vintage & collectible coins",
                "Wheat pennies",
                "Surprise bonus pieces",
              ].map(item => (
                <div key={item} style={{ padding:"10px 14px", background:"#0c0c0e", border:"1px solid #1e1e1e", fontSize:12, color:"#888", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:"#D4A017" }}>◆</span>{item}
                </div>
              ))}
            </div>
 
            {/* Price breakdown */}
            <div style={{ background:"#0c0c0e", border:"1px solid #1e1e1e", padding:"18px 20px", marginBottom:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, fontSize:14, color:"#888" }}>
                <span>Mystery Box</span><span>{fmtUSD(MYSTERY_BOX_PRICE)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, fontSize:14, color:"#888" }}>
                <span>Shipping (tracked)</span><span>{fmtUSD(MYSTERY_BOX_SHIPPING)}</span>
              </div>
              <div style={{ borderTop:"1px solid #1e1e1e", paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, letterSpacing:"0.15em", color:"#555" }}>TOTAL</span>
                <span style={{ fontSize:32, fontWeight:700, color:"#D4A017" }}>{fmtUSD(MYSTERY_BOX_PRICE+MYSTERY_BOX_SHIPPING)}</span>
              </div>
            </div>
 
            <a href={MYSTERY_BOX_LINK} target="_blank" rel="noopener noreferrer"
              style={{ display:"block", textAlign:"center", padding:"16px", background:"#D4A017", color:"#08080a", textDecoration:"none", fontFamily:"inherit", fontSize:15, fontWeight:700, letterSpacing:"0.2em", boxShadow:"0 0 30px rgba(212,160,23,0.3)" }}>
              BUY MYSTERY BOX — {fmtUSD(MYSTERY_BOX_PRICE+MYSTERY_BOX_SHIPPING)}
            </a>
            <div style={{ fontSize:11, color:"#444", marginTop:12, textAlign:"center", lineHeight:1.7 }}>
              Secure checkout by Stripe. You'll enter your shipping address at checkout.<br/>
              Ships within 3-5 business days with tracking.
            </div>
          </div>
 
          <div style={{ padding:"14px 16px", background:"#0c0c0e", border:"1px solid #181818", fontSize:11, color:"#2e2e2e", lineHeight:1.8 }}>
            ◆ SETUP: In your Stripe Payment Link settings, set the price to {fmtUSD(MYSTERY_BOX_PRICE+MYSTERY_BOX_SHIPPING)} and turn ON "Collect customers' addresses → Shipping address". Stripe emails you each order with the address to ship to.
          </div>
        </div>)}
 
        {tab==="giveaway" && (<div><div style={{ padding:"22px 24px", background:"linear-gradient(160deg, rgba(200,200,200,0.06), #0f0f11)", border:"1px solid #C8C8C844", marginBottom:18 }}><div style={{ fontSize:10, letterSpacing:"0.25em", color:"#C8C8C8", marginBottom:8 }}>MILESTONE GIVEAWAY</div><div style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:4, lineHeight:1.25 }}>Win 1 oz Silver when<br/>@{YOUTUBE_HANDLE} hits {SUBSCRIBER_GOAL} subscribers</div><div style={{ fontSize:13, color:"#666", margin:"10px 0 18px", lineHeight:1.7 }}>Subscribe on YouTube and drop your email below. When the channel reaches {SUBSCRIBER_GOAL} subs, one entrant wins a free 1 oz silver round. Free to enter - no purchase necessary.</div><div style={{ background:"#0c0c0e", border:"1px solid #1e1e1e", padding:"16px 18px", marginBottom:18 }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10, flexWrap:"wrap", gap:8 }}><div><span style={{ fontSize:32, fontWeight:700, color:"#C8C8C8" }}>{subStatus==="loading" ? "-" : subStatus==="error" ? "?" : subCount?.toLocaleString()}</span><span style={{ fontSize:14, color:"#555" }}> / {SUBSCRIBER_GOAL} subs</span></div><div style={{ fontSize:11, color: goalReached?"#66BB6A":"#555" }}>{subStatus==="loading" ? "loading count..." : subStatus==="error" ? "count unavailable" : goalReached ? "GOAL REACHED!" : `${SUBSCRIBER_GOAL-subCount} to go`}</div></div><div style={{ height:10, background:"#1a1a1a", borderRadius:5, overflow:"hidden" }}><div style={{ width:`${subPct}%`, height:"100%", background:"linear-gradient(90deg, #888, #C8C8C8)", borderRadius:5, transition:"width 0.6s ease" }} /></div></div>{!milestoneDone ? (<div><a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", padding:"11px 22px", background:"#FF0000", color:"#fff", textDecoration:"none", fontFamily:"inherit", fontSize:13, fontWeight:700, letterSpacing:"0.1em", marginBottom:14 }}>SUBSCRIBE ON YOUTUBE</a><div style={{ display:"flex", gap:10, alignItems:"flex-end", flexWrap:"wrap" }}><div style={{ flex:1, minWidth:200 }}><div style={{ fontSize:10, color:"#444", marginBottom:5, letterSpacing:"0.1em" }}>YOUR EMAIL</div><input type="email" value={milestoneInput} onChange={e=>setMilestoneInput(e.target.value)} placeholder="you@email.com" style={{ width:"100%", padding:"10px 13px", background:"#111", border:`1px solid ${milestoneInput?"#C8C8C855":"#1e1e1e"}`, color:"#e8e8e0", fontFamily:"inherit", fontSize:14, outline:"none" }} /></div><button onClick={async ()=>{ if(!milestoneInput||!milestoneInput.includes("@")) return; setMilestoneDone(true); setMilestoneEmail(milestoneInput); await window.storage.set(MILESTONE_KEY, milestoneInput); submitToFormspree(milestoneInput, "500-sub milestone giveaway"); }} disabled={!milestoneInput||!milestoneInput.includes("@")} style={{ padding:"10px 22px", background:milestoneInput&&milestoneInput.includes("@")?"#C8C8C8":"#141414", border:"none", color:milestoneInput&&milestoneInput.includes("@")?"#08080a":"#2a2a2a", fontFamily:"inherit", fontSize:12, fontWeight:700, letterSpacing:"0.15em", cursor:milestoneInput&&milestoneInput.includes("@")?"pointer":"not-allowed" }}>ENTER GIVEAWAY</button></div><div style={{ fontSize:10, color:"#2a2a2a", marginTop:10 }}>No purchase necessary. Subscribe + email to enter. Winner verified against subscriber list.</div></div>) : (<div style={{ padding:"14px 18px", background:"rgba(102,187,106,0.06)", border:"1px solid #66BB6A33" }}><div style={{ fontSize:13, color:"#66BB6A", fontWeight:700, marginBottom:4 }}>You're entered!</div><div style={{ fontSize:11, color:"#555" }}>Registered: {milestoneEmail} / Make sure you've subscribed to @{YOUTUBE_HANDLE}</div></div>)}</div></div>)}
      </div>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        @keyframes silverPulse{0%,100%{box-shadow:0 0 0px rgba(200,200,200,0)}50%{box-shadow:0 0 14px rgba(200,200,200,0.35)}}
        .giveaway-tab-pulse{animation:silverPulse 2.5s ease-in-out infinite}
        *{box-sizing:border-box}
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        select option{background:#0f0f11}
        ::-webkit-scrollbar{height:4px;background:#111}
        ::-webkit-scrollbar-thumb{background:#2a2a2a}
      `}</style>
    </div>
  );
}
 
function Sec({ label, children }) { return (<div style={{ marginBottom:22 }}><div style={{ fontSize:11, letterSpacing:"0.25em", color:"#3a3a3a", marginBottom:9, textTransform:"uppercase" }}>{label}</div>{children}</div>); }
function Btn({ active, color, onClick, children }) { return (<button onClick={onClick} style={{ padding:"9px 18px", border:`1px solid ${active?color.accent:"#1e1e1e"}`, background:active?color.bg:"transparent", color:active?color.accent:"#555", fontFamily:"'Courier New', monospace", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", transition:"all 0.1s", boxShadow:active?`0 0 14px ${color.glow}`:"none" }}>{children}</button>); }
