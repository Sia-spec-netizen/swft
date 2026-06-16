import { useState, useRef, useEffect } from "react";

/* ─────────────────────────────────────────────
   THEME
───────────────────────────────────────────── */


const T = {
  navy:    "#001A57",
  navyMid: "#002880",
  navyLt:  "#0038A8",
  blue:    "#0052CC",
  blueLt:  "#1A6FE8",
  silver:  "#B8C4D8",
  silverLt:"#D6E0EE",
  gold:    "#C9A84C",
  goldLt:  "#E8C96A",
  white:   "#FFFFFF",
  offWhite:"#F4F7FC",
  surface: "#EEF2FA",
  card:    "#FFFFFF",
  border:  "#DDE4F0",
  text:    "#0A1628",
  textMd:  "#3D4F6E",
  textSm:  "#6B7A99",
  green:   "#0E7C4A",
  greenLt: "#E6F9F0",
  red:     "#C0392B",
  redLt:   "#FEF0EF",
  amber:   "#B45309",
  amberLt: "#FEF3CD",
};

/* ─────────────────────────────────────────────
   STATIC DATA  (will be updated by state)
───────────────────────────────────────────── */
const SAVED_PAYEES = [
  { id:1, name:"Morgan Blackwell", bank:"Chase Bank",    acct:"••••7821", routing:"021000021", avatar:"MB", color:"#1A6FE8" },
  { id:2, name:"Diana Rothschild", bank:"Goldman Sachs", acct:"••••4432", routing:"026009593", avatar:"DR", color:"#0E7C4A" },
  { id:3, name:"James Kensington", bank:"Bank of America",acct:"••••9901",routing:"026009593", avatar:"JK", color:"#7B2FBE" },
  { id:4, name:"Sophie Laurent",   bank:"Wells Fargo",   acct:"••••5566", routing:"121042882", avatar:"SL", color:"#C9A84C" },
];

const INIT_TXN = [
  { id:1,  desc:"Wired Funds – Morgan Blackwell",   date:"Jun 05, 2026", amt: 150000,  type:"credit", cat:"Wire Transfer" },
  { id:2,  desc:"Ritz-Carlton Residences",          date:"Jun 04, 2026", amt:-18420,   type:"debit",  cat:"Travel" },
  { id:3,  desc:"SIB Investment Dividend",          date:"Jun 03, 2026", amt: 42800,   type:"credit", cat:"Investment" },
  { id:4,  desc:"Bloomberg Terminal – Annual",      date:"Jun 02, 2026", amt:-24000,   type:"debit",  cat:"Subscriptions" },
  { id:5,  desc:"Real Estate Escrow Receipt",       date:"Jun 01, 2026", amt: 500000,  type:"credit", cat:"Income" },
  { id:6,  desc:"Gulfstream Charter – NYC→LDN",    date:"May 30, 2026", amt:-89500,   type:"debit",  cat:"Travel" },
  { id:7,  desc:"Christie's Auction House",         date:"May 29, 2026", amt:-215000,  type:"debit",  cat:"Shopping" },
  { id:8,  desc:"Bond Portfolio Coupon",            date:"May 28, 2026", amt: 31250,   type:"credit", cat:"Investment" },
  { id:9,  desc:"SIB Wealth Management Fee",        date:"May 27, 2026", amt:-3500,    type:"debit",  cat:"Fees" },
  { id:10, desc:"Wire Transfer – Diana Rothschild", date:"May 26, 2026", amt: 75000,   type:"credit", cat:"Wire Transfer" },
];

const fmtUSD = (n) => Math.abs(n).toLocaleString("en-US",{style:"currency",currency:"USD"});
const fmtDate = () => new Date().toLocaleString("en-US",{dateStyle:"medium",timeStyle:"short"});

function genOTP() { return Math.floor(100000+Math.random()*900000).toString(); }

const CAT_ICO = {
  "Wire Transfer":"⚡","Travel":"✈️","Investment":"📊","Subscriptions":"📋",
  "Income":"💰","Shopping":"🛍️","Fees":"🏦","Transfer":"💸",
};

/* ─────────────────────────────────────────────
   AVATAR  (initials chip)
───────────────────────────────────────────── */
function Av({ initials, color, size=40 }) {
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:color||T.navyMid,
      display:"flex",alignItems:"center",justifyContent:"center",
      color:"#fff",fontSize:size*0.34,fontWeight:700,flexShrink:0,fontFamily:"'DM Sans',sans-serif",letterSpacing:0.5}}>
      {initials}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function SwiftInvestmentBank() {

  /* ── Auth ── */
  const [screen, setScreen] = useState("login"); // login | app
  const [loginEmail, setLoginEmail]   = useState("");
  const [loginPass,  setLoginPass]    = useState("");
  const [showPass,   setShowPass]     = useState(false);
  const [loginErr,   setLoginErr]     = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  /* ── App ── */
  const [tab, setTab]               = useState("dashboard");
  const [balance, setBalance]       = useState(8_247_391.55);
  const [showBal, setShowBal]       = useState(true);
  const [txns, setTxns]             = useState(INIT_TXN);
  const [toast, setToast]           = useState(null);

  /* ── Transfer ── */
  // Steps: 0=recipient, 1=amount, 2=code, 3=phrase, 4=success
  const [txStep, setTxStep]               = useState(0);
  const [recipientMode, setRecipientMode] = useState("saved");
  const [selPayee, setSelPayee]           = useState(null);
  const [newAcct, setNewAcct]             = useState({ name:"", bank:"", routing:"", account:"" });
  const [txAmt, setTxAmt]                 = useState("");
  const [txNote, setTxNote]               = useState("");
  const [txErr, setTxErr]                 = useState("");
  // Step 2 – security code
  const VALID_CODES = ["3828","8276","2836","2962"];
  const [secCode, setSecCode]             = useState("");
  const [secCodeErr, setSecCodeErr]       = useState("");
  const [secCodeOk, setSecCodeOk]         = useState(false);
  // Step 3 – security question
  const [secAnswer, setSecAnswer]         = useState("");
  const [secAnswerErr, setSecAnswerErr]   = useState("");
  const [secAnswerOk, setSecAnswerOk]     = useState(false);
  // Step 4 – 3-word phrase
  const [phrase, setPhrase]               = useState("");
  const [phraseErr, setPhraseErr]         = useState("");
  const [verifying, setVerifying]         = useState(false);
  const [txInProgress, setTxInProgress]   = useState(false);
  const [progressStep, setProgressStep]   = useState(0);
  const VALID_PHRASES = [
    "best look rock",
    "wait more hope",
    "hold mood still",
    "hard wood rain",
    "life hack rune",
  ];

  const showToast = (msg, type="info") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 4500);
  };

  /* ── Login ── */
  const handleLogin = () => {
    if(!loginEmail || !loginPass){ setLoginErr("Please enter your credentials."); return; }
    setLoginLoading(true);
    setTimeout(()=>{
      setLoginLoading(false);
      setScreen("app"); setTab("dashboard");
    }, 1800);
  };

  /* ── Transfer helpers ── */
  const resetTransfer = () => {
    setTxStep(0); setSelPayee(null);
    setNewAcct({name:"",bank:"",routing:"",account:""});
    setTxAmt(""); setTxNote(""); setTxErr("");
    setSecCode(""); setSecCodeErr(""); setSecCodeOk(false);
    setSecAnswer(""); setSecAnswerErr(""); setSecAnswerOk(false);
    setPhrase(""); setPhraseErr(""); setVerifying(false);
    setTxInProgress(false); setProgressStep(0);
    setRecipientMode("saved");
  };

  /* Step 0 → 1: validate recipient */
  const handleRecipientNext = () => {
    if(recipientMode==="saved" && !selPayee) return setTxErr("Please select a saved payee.");
    if(recipientMode==="new"){
      if(!newAcct.name||!newAcct.bank||!newAcct.routing||!newAcct.account)
        return setTxErr("Please complete all recipient fields.");
    }
    setTxErr(""); setTxStep(1);
  };

  /* Step 1 → 2: validate amount */
  const handleAmountNext = () => {
    const amt = parseFloat(txAmt);
    if(!amt||amt<=0) return setTxErr("Enter a valid amount.");
    if(amt>balance)  return setTxErr("Insufficient funds in your account.");
    if(amt>5000000)  return setTxErr("Single transfer limit is $5,000,000.");
    setTxErr(""); setTxStep(2);
  };

  /* Step 2 → 3: validate security code */
  const handleCodeNext = () => {
    if(!secCode.trim()) return setSecCodeErr("Please enter your security code.");
    if(!VALID_CODES.includes(secCode.trim())) return setSecCodeErr("Invalid security code. Please try again.");
    setSecCodeErr(""); setSecCodeOk(true);
    setTimeout(()=>setTxStep(3), 600);
  };

  /* Step 3 → 4: validate security question */
  const handleSecurityQuestion = () => {
    if(!secAnswer.trim()) return setSecAnswerErr("Please enter your answer.");
    if(secAnswer.trim().toLowerCase() !== "peugeot 306")
      return setSecAnswerErr("Incorrect answer. Please try again.");
    setSecAnswerErr(""); setSecAnswerOk(true);
    setTimeout(()=>setTxStep(4), 600);
  };

  /* Step 4 → 5: validate 3-word phrase and complete */
  const handlePhraseSubmit = () => {
    const words = phrase.trim().split(/\s+/).filter(w=>w.length>0);
    if(words.length!==3) return setPhraseErr("Please enter exactly 3 words separated by spaces.");
    const entered = words.join(" ").toLowerCase();
    if(!VALID_PHRASES.includes(entered)) return setPhraseErr("Incorrect phrase. Please check and try again.");
    setPhraseErr("");
    setVerifying(true);
    // kick off "Transaction in Progress" flow
    setTxInProgress(true);
    setProgressStep(0);
    const stages = [600, 1400, 2400, 3600];
    stages.forEach((delay, i) => setTimeout(() => setProgressStep(i+1), delay));
    setTimeout(() => {
      const amt = parseFloat(txAmt);
      setBalance(b=>b-amt);
      setTxns(prev=>[{
        id:Date.now(),
        desc:`Wire to ${recipientMode==="saved"?selPayee?.name:newAcct.name}`,
        date:new Date().toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"}),
        amt:-amt, type:"debit", cat:"Wire Transfer",
      },...prev]);
      setVerifying(false);
      setTxInProgress(false);
      setProgressStep(0);
      setTxStep(5);
      showToast("Transfer authorised and completed!","success");
    }, 4800);
  };

  /* ─────── CSS ─────── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'DM Sans',sans-serif;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
    @keyframes progressPulse{0%,100%{opacity:1;transform:scaleX(1)}50%{opacity:.7;transform:scaleX(.97)}}
    @keyframes dotBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-10px)}}
    @keyframes ripple{0%{transform:scale(0);opacity:.6}100%{transform:scale(3);opacity:0}}
    @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    .sib-btn-primary{background:linear-gradient(135deg,${T.navy},${T.navyMid},${T.blue});color:#fff;border:none;border-radius:10px;padding:14px 20px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;box-shadow:0 4px 16px rgba(0,40,128,.35);}
    .sib-btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,40,128,.45);}
    .sib-btn-ghost{background:#fff;color:${T.navyMid};border:1.5px solid ${T.border};border-radius:10px;padding:14px 20px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;}
    .sib-btn-ghost:hover{border-color:${T.navyMid};background:${T.offWhite};}
    .sib-input{width:100%;padding:13px 16px;border:1.5px solid ${T.border};border-radius:10px;font-size:14px;outline:none;font-family:'DM Sans',sans-serif;color:${T.text};background:#fafcff;transition:border .2s;}
    .sib-input:focus{border-color:${T.navyMid};box-shadow:0 0 0 3px rgba(0,40,128,.08);}
    .sib-card{background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,20,80,.07);overflow:hidden;}
    .nav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 14px;border:none;background:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;color:${T.textSm};transition:color .2s;position:relative;}
    .nav-btn.active{color:${T.navy};font-weight:700;}
    .nav-btn.active::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:20px;height:3px;background:${T.navy};border-radius:2px;}
    .qact-btn{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:13px 6px;cursor:pointer;color:#fff;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;transition:all .2s;}
    .qact-btn:hover{background:rgba(255,255,255,.15);transform:translateY(-2px);}
    .payee-row{display:flex;align-items:center;gap:12px;padding:13px 16px;border:2px solid ${T.border};border-radius:13px;margin-bottom:9px;cursor:pointer;background:#fafcff;transition:all .15s;}
    .payee-row.sel{border-color:${T.navyMid};background:#f0f4ff;}
    .payee-row:hover{border-color:${T.silver};background:#f5f8ff;}
    .txn-row{display:flex;align-items:center;padding:13px 20px;border-bottom:1px solid #f4f6fc;gap:13px;transition:background .15s;}
    .txn-row:hover{background:#fafcff;}
    .tab-pill{padding:9px 18px;border-radius:30px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;transition:all .2s;}
    .tab-pill.active{background:${T.navyMid};color:#fff;}
    .tab-pill.inactive{background:transparent;color:${T.textSm};}
    .tab-pill.inactive:hover{background:${T.surface};}
    .stat-card{background:#fff;border-radius:16px;padding:18px;box-shadow:0 2px 10px rgba(0,20,80,.06);}
    .progress-bar{height:6px;background:${T.surface};border-radius:10px;overflow:hidden;}
    .progress-fill{height:100%;border-radius:10px;transition:width .8s ease;}
    input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
  `;

  /* ─────────────────────────────────────────────
     LOGIN
  ───────────────────────────────────────────── */
  if(screen==="login") return (
    <div style={{minHeight:"100vh",background:`linear-gradient(145deg, ${T.navy} 0%, ${T.navyMid} 45%, #0045B5 80%, #1058CC 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:24,position:"relative",overflow:"hidden"}}>
      <style>{css}</style>

      {/* background geometry */}
      {[["-180px","-120px","380px","rgba(255,255,255,.03)"],[" 60%","55%","280px","rgba(201,168,76,.07)"],["10%","80%","200px","rgba(0,82,204,.15)"]].map(([l,t,s,c],i)=>(
        <div key={i} style={{position:"absolute",left:l,top:t,width:s,height:s,borderRadius:"50%",background:c,filter:"blur(60px)",pointerEvents:"none"}}/>
      ))}
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,backgroundImage:`repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.015) 39px,rgba(255,255,255,.015) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.015) 39px,rgba(255,255,255,.015) 40px)`,pointerEvents:"none"}}/>

      {/* brand */}
      <div style={{textAlign:"center",marginBottom:36,animation:"fadeUp .7s ease",position:"relative"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:10}}>
          <div style={{width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#C9A84C,#E8C96A)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 0 8px rgba(201,168,76,.18),0 12px 36px rgba(201,168,76,.35)",animation:"floatUp 3s ease-in-out infinite"}}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 22 L16 6 L28 22 Z" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
              <path d="M10 22 L16 12 L22 22" stroke="white" strokeWidth="2" fill="rgba(255,255,255,.25)" strokeLinejoin="round"/>
              <rect x="12" y="22" width="8" height="4" rx="1" fill="white"/>
            </svg>
          </div>
          <div>
            <div style={{color:"#E8C96A",fontSize:26,fontWeight:700,fontFamily:"'Playfair Display',serif",letterSpacing:.5}}>Swift Investment Bank</div>
            <div style={{color:"rgba(255,255,255,.45)",fontSize:11,letterSpacing:3,marginTop:1}}>SIB · PRIVATE WEALTH BANKING</div>
          </div>
        </div>
      </div>

      {/* card */}
      <div style={{background:"rgba(255,255,255,.98)",borderRadius:24,padding:"38px 34px",width:"100%",maxWidth:420,boxShadow:"0 40px 100px rgba(0,0,0,.5)",animation:"scaleIn .5s ease .2s both"}}>
        <h2 style={{color:T.navy,fontSize:22,fontWeight:700,fontFamily:"'Playfair Display',serif",marginBottom:4}}>Secure Sign In</h2>
        <p style={{color:T.textSm,fontSize:13,marginBottom:28}}>Access your private banking portal</p>

        {loginErr && (
          <div style={{background:T.redLt,border:`1px solid #f9c4c0`,borderRadius:10,padding:"10px 14px",marginBottom:18,color:T.red,fontSize:13,display:"flex",gap:8}}>
            <span>⚠️</span><span>{loginErr}</span>
          </div>
        )}

        <label style={{display:"block",marginBottom:16}}>
          <span style={{fontSize:11,color:T.textMd,fontWeight:700,display:"block",marginBottom:7,letterSpacing:.6}}>USER ID / EMAIL</span>
          <input className="sib-input" type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="Enter your email address" onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
        </label>

        <label style={{display:"block",marginBottom:26}}>
          <span style={{fontSize:11,color:T.textMd,fontWeight:700,display:"block",marginBottom:7,letterSpacing:.6}}>PASSWORD</span>
          <div style={{position:"relative"}}>
            <input className="sib-input" type={showPass?"text":"password"} value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Enter your password" style={{paddingRight:46}} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            <button onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.textSm,fontSize:16,padding:4}}>{showPass?"🙈":"👁️"}</button>
          </div>
        </label>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:26}}>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
            <input type="checkbox" style={{accentColor:T.navyMid,width:16,height:16}}/>
            <span style={{fontSize:13,color:T.textMd}}>Remember device</span>
          </label>
          <span style={{color:T.blue,fontSize:13,cursor:"pointer",fontWeight:500}}>Forgot Password?</span>
        </div>

        <button className="sib-btn-primary" onClick={handleLogin} style={{width:"100%",fontSize:15,padding:"15px",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          {loginLoading
            ? <><span style={{width:18,height:18,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/> Authenticating…</>
            : <><span>🔐</span> Sign In Securely</>}
        </button>

        <div style={{display:"flex",alignItems:"center",gap:10,margin:"22px 0 18px"}}>
          <div style={{flex:1,height:1,background:T.border}}/><span style={{color:T.textSm,fontSize:11,whiteSpace:"nowrap"}}>OR CONTINUE WITH</span><div style={{flex:1,height:1,background:T.border}}/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[{ico:"🔑",lbl:"Biometrics"},{ico:"📱",lbl:"Mobile Token"}].map(b=>(
            <button key={b.lbl} className="sib-btn-ghost" style={{borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontSize:13}}>
              <span>{b.ico}</span>{b.lbl}
            </button>
          ))}
        </div>
      </div>

      <div style={{marginTop:28,color:"rgba(255,255,255,.28)",fontSize:11,textAlign:"center",lineHeight:1.8,position:"relative"}}>
        🔒 256-bit TLS Encryption · FDIC Insured · SIPC Protected<br/>
        © 2026 Swift Investment Bank N.A. · Member FDIC · Equal Housing Lender
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────
     APP SHELL
  ───────────────────────────────────────────── */
  const hour = new Date().getHours();
  const greet = hour<12?"Good Morning":hour<17?"Good Afternoon":"Good Evening";

  return (
    <div style={{minHeight:"100vh",background:T.surface,fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column",maxWidth:500,margin:"0 auto",position:"relative"}}>
      <style>{css}</style>

      {/* SMS popup removed – new security flow active */}

      {/* ── Toast ── */}
      {toast && (
        <div style={{position:"fixed",bottom:88,left:"50%",transform:"translateX(-50%)",zIndex:9998,background:toast.type==="success"?T.green:T.navyMid,color:"#fff",borderRadius:30,padding:"12px 24px",fontSize:13,fontWeight:600,boxShadow:"0 8px 28px rgba(0,0,0,.3)",whiteSpace:"nowrap",animation:"fadeUp .3s ease"}}>
          {toast.type==="success"?"✅":"ℹ️"} {toast.msg}
        </div>
      )}

      {/* ══════════════════════════════════════
          HEADER / HERO
      ══════════════════════════════════════ */}
      <div style={{background:`linear-gradient(150deg, ${T.navy} 0%, ${T.navyMid} 55%, #0042B0 100%)`,padding:"22px 20px 32px",position:"relative",overflow:"hidden"}}>
        {/* subtle grid */}
        <div style={{position:"absolute",inset:0,backgroundImage:`repeating-linear-gradient(0deg,transparent,transparent 29px,rgba(255,255,255,.02) 29px,rgba(255,255,255,.02) 30px),repeating-linear-gradient(90deg,transparent,transparent 29px,rgba(255,255,255,.02) 29px,rgba(255,255,255,.02) 30px)`,pointerEvents:"none"}}/>

        {/* top bar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,position:"relative"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:22,height:22,borderRadius:6,background:"linear-gradient(135deg,#C9A84C,#E8C96A)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="12" height="12" viewBox="0 0 32 32" fill="none"><path d="M4 22 L16 6 L28 22 Z" stroke="white" strokeWidth="3" fill="none" strokeLinejoin="round"/></svg>
              </div>
              <span style={{color:"rgba(255,255,255,.5)",fontSize:11,letterSpacing:2,fontWeight:600}}>SIB PRIVATE</span>
            </div>
            <div style={{color:"#fff",fontSize:17,fontWeight:700,marginTop:4}}>{greet} 👋</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{position:"relative",cursor:"pointer"}} onClick={()=>showToast("2 new account alerts")}>
              <div style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🔔</div>
              <span style={{position:"absolute",top:-3,right:-3,width:11,height:11,background:"#E84040",borderRadius:"50%",border:`2px solid ${T.navy}`}}/>
            </div>
            <div onClick={()=>setTab("profile")} style={{width:42,height:42,borderRadius:12,background:"linear-gradient(135deg,#C9A84C,#E8C96A)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,fontWeight:700,color:T.navy,boxShadow:"0 4px 12px rgba(201,168,76,.35)"}}>SIB</div>
            <button onClick={()=>setScreen("login")} title="Log out" style={{width:42,height:42,borderRadius:12,background:"rgba(255,255,255,.09)",border:"1px solid rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,transition:"background .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(220,50,50,.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.09)"}>🚪</button>
          </div>
        </div>

        {/* Balance card */}
        <div style={{background:"rgba(255,255,255,.07)",borderRadius:20,padding:"22px 22px 18px",border:"1px solid rgba(255,255,255,.1)",backdropFilter:"blur(12px)",position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{color:"rgba(255,255,255,.5)",fontSize:10,letterSpacing:1.5,fontWeight:600,marginBottom:8}}>TOTAL PORTFOLIO VALUE</div>
              <div style={{color:"#fff",fontSize:showBal?32:28,fontWeight:700,letterSpacing:-.5,transition:"font-size .2s",fontFamily:"'Playfair Display',serif"}}>
                {showBal ? fmtUSD(balance) : "••••••••••"}
              </div>
              <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}>
                <span style={{background:"rgba(14,124,74,.25)",color:"#4ADE80",fontSize:11,fontWeight:600,padding:"2px 10px",borderRadius:20,border:"1px solid rgba(74,222,128,.2)"}}>▲ +$1.24M YTD</span>
                <span style={{color:"rgba(255,255,255,.35)",fontSize:11}}>+17.8%</span>
              </div>
            </div>
            <button onClick={()=>setShowBal(!showBal)} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.15)",borderRadius:9,padding:"8px 11px",color:"#fff",cursor:"pointer",fontSize:16}}>
              {showBal?"🙈":"👁️"}
            </button>
          </div>

          <div style={{display:"flex",gap:0,marginTop:18,paddingTop:14,borderTop:"1px solid rgba(255,255,255,.08)"}}>
            {[
              {lbl:"PRIMARY",val:"••••  4829"},
              {lbl:"ROUTING",val:"026009593"},
              {lbl:"TIER",val:"⭐ Platinum",col:"#E8C96A"},
            ].map(x=>(
              <div key={x.lbl} style={{flex:1}}>
                <div style={{color:"rgba(255,255,255,.4)",fontSize:9,fontWeight:700,letterSpacing:.5}}>{x.lbl}</div>
                <div style={{color:x.col||"#fff",fontSize:11,fontWeight:600,marginTop:3}}>{x.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{display:"flex",gap:8,marginTop:16}}>
          {[
            {ico:"📤",lbl:"Transfer",act:()=>{resetTransfer();setTab("transfer");}},
            {ico:"📥",lbl:"Receive",act:()=>showToast("Share your account details to receive funds.")},
            {ico:"📊",lbl:"Invest",act:()=>showToast("Investment module loading…")},
            {ico:"💳",lbl:"Cards",act:()=>setTab("cards")},
          ].map(a=>(
            <button key={a.lbl} className="qact-btn" onClick={a.act}>
              <span style={{fontSize:22}}>{a.ico}</span>{a.lbl}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          CONTENT
      ══════════════════════════════════════ */}
      <div style={{flex:1,padding:"18px 14px 88px",overflowY:"auto"}}>

        {/* ────── DASHBOARD ────── */}
        {tab==="dashboard" && (
          <div style={{animation:"fadeUp .4s ease"}}>

            {/* Account summary grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
              {[
                {lbl:"Checking",amt:"$2,847,391",ico:"🏦",chg:"+1.2%",bg:"#EFF6FF",col:"#1D4ED8"},
                {lbl:"Savings",amt:"$1,820,000",ico:"💎",chg:"+0.8%",bg:"#F0FDF4",col:T.green},
                {lbl:"Investment",amt:"$3,250,000",ico:"📈",chg:"+5.7%",bg:"#FDF4FF",col:"#7C3AED"},
                {lbl:"Credit Line",amt:"$850,000",ico:"💳",chg:"Available",bg:"#FEFCE8",col:"#92400E"},
              ].map(c=>(
                <div key={c.lbl} className="stat-card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{width:38,height:38,borderRadius:10,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{c.ico}</div>
                    <span style={{color:c.col,fontSize:10,fontWeight:700,background:c.bg,padding:"2px 8px",borderRadius:20}}>{c.chg}</span>
                  </div>
                  <div style={{color:T.textSm,fontSize:10,fontWeight:600,marginTop:11,letterSpacing:.3}}>{c.lbl.toUpperCase()}</div>
                  <div style={{color:T.navy,fontSize:15,fontWeight:700,marginTop:3,fontFamily:"'Playfair Display',serif"}}>{c.amt}</div>
                </div>
              ))}
            </div>

            {/* SIB Market Pulse */}
            <div style={{background:`linear-gradient(135deg,${T.navy},${T.navyMid})`,borderRadius:16,padding:18,marginBottom:18,color:"#fff"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.9)"}}>SIB Market Pulse</span>
                <span style={{color:"#E8C96A",fontSize:11,fontWeight:600}}>Live ●</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                {[
                  {lbl:"S&P 500",val:"5,841.47",chg:"+1.23%",up:true},
                  {lbl:"DOW",val:"43,290.83",chg:"+0.87%",up:true},
                  {lbl:"NASDAQ",val:"18,440.29",chg:"-0.34%",up:false},
                ].map(m=>(
                  <div key={m.lbl} style={{background:"rgba(255,255,255,.07)",borderRadius:10,padding:"10px 12px"}}>
                    <div style={{color:"rgba(255,255,255,.5)",fontSize:9,fontWeight:600,marginBottom:4}}>{m.lbl}</div>
                    <div style={{color:"#fff",fontSize:13,fontWeight:700}}>{m.val}</div>
                    <div style={{color:m.up?"#4ADE80":"#F87171",fontSize:10,fontWeight:600,marginTop:2}}>{m.chg}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="sib-card" style={{marginBottom:18}}>
              <div style={{padding:"16px 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.border}`}}>
                <span style={{color:T.navy,fontWeight:700,fontSize:15}}>Recent Activity</span>
                <span style={{color:T.blue,fontSize:12,cursor:"pointer",fontWeight:500}} onClick={()=>setTab("transactions")}>View All →</span>
              </div>
              {txns.slice(0,6).map((t,i)=>(
                <div key={t.id} className="txn-row" style={{borderBottom:i<5?`1px solid #F4F6FC`:"none"}}>
                  <div style={{width:42,height:42,borderRadius:12,background:t.type==="credit"?T.greenLt:T.redLt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>
                    {CAT_ICO[t.cat]||"💳"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{color:T.text,fontSize:13,fontWeight:600}}>{t.desc}</div>
                    <div style={{color:T.textSm,fontSize:11,marginTop:2}}>{t.date} · {t.cat}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:t.type==="credit"?T.green:T.red,fontSize:13,fontWeight:700}}>
                      {t.type==="credit"?"+":"-"}{fmtUSD(t.amt)}
                    </div>
                    <div style={{fontSize:10,color:T.silver,marginTop:1}}>Settled</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Spending breakdown */}
            <div className="sib-card" style={{padding:18}}>
              <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:14}}>Spending Breakdown · June</div>
              {[
                {lbl:"Investments",pct:80,amt:"$3,250,000",col:"#1D4ED8"},
                {lbl:"Travel",pct:55,amt:"$107,920",col:"#7C3AED"},
                {lbl:"Shopping",pct:40,amt:"$215,000",col:"#C9A84C"},
                {lbl:"Subscriptions",pct:20,amt:"$24,000",col:"#0E7C4A"},
                {lbl:"Fees",pct:8,amt:"$3,500",col:"#6B7A99"},
              ].map(s=>(
                <div key={s.lbl} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:12,color:T.textMd,fontWeight:500}}>{s.lbl}</span>
                    <span style={{fontSize:12,fontWeight:700,color:T.text}}>{s.amt}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width:`${s.pct}%`,background:s.col}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ────── TRANSACTIONS ────── */}
        {tab==="transactions" && (
          <div style={{animation:"fadeUp .4s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h3 style={{color:T.navy,fontSize:17,fontFamily:"'Playfair Display',serif"}}>Transaction History</h3>
              <div style={{fontSize:11,color:T.textSm,background:"#fff",border:`1px solid ${T.border}`,borderRadius:20,padding:"4px 12px"}}>June 2026</div>
            </div>
            <div className="sib-card">
              {txns.map((t,i)=>(
                <div key={t.id} className="txn-row" style={{borderBottom:i<txns.length-1?`1px solid #F4F6FC`:"none"}}>
                  <div style={{width:44,height:44,borderRadius:13,background:t.type==="credit"?T.greenLt:T.redLt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                    {CAT_ICO[t.cat]||"💳"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{color:T.text,fontSize:13,fontWeight:600}}>{t.desc}</div>
                    <div style={{color:T.textSm,fontSize:11,marginTop:2}}>{t.date} · {t.cat}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:t.type==="credit"?T.green:T.red,fontSize:13,fontWeight:700}}>
                      {t.type==="credit"?"+":"-"}{fmtUSD(t.amt)}
                    </div>
                    <div style={{fontSize:10,color:"#CBD5E1",marginTop:1}}>✔ Completed</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ────── TRANSFER ────── */}
        {tab==="transfer" && (
          <div style={{animation:"fadeUp .4s ease"}}>

            {/* Header row */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h3 style={{color:T.navy,fontSize:17,fontFamily:"'Playfair Display',serif"}}>Wire Transfer</h3>
              {txStep!==0 && txStep!==5 && (
                <button onClick={resetTransfer} style={{fontSize:12,color:T.textSm,background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕ Cancel</button>
              )}
            </div>

            {/* ── Progress bar (steps 0-3) ── */}
            {txStep<5 && !txInProgress && (
              <div style={{display:"flex",alignItems:"center",marginBottom:22}}>
                {["Recipient","Amount","Code","Security","Phrase"].map((s,i)=>(
                  <div key={s} style={{display:"flex",alignItems:"center",flex:1}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                      <div style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,border:"2px solid",borderColor:txStep>=i?T.navyMid:T.border,background:txStep>i?T.navyMid:txStep===i?"#fff":"#f8fafc",color:txStep>i?"#fff":txStep===i?T.navyMid:T.textSm,transition:"all .3s"}}>
                        {txStep>i?"✓":i+1}
                      </div>
                      <span style={{fontSize:9,color:txStep>=i?T.navyMid:T.textSm,marginTop:4,fontWeight:txStep===i?700:400}}>{s}</span>
                    </div>
                    {i<3&&<div style={{flex:1,height:2,background:txStep>i?T.navyMid:T.border,margin:"0 3px 14px",transition:"background .3s"}}/>}
                  </div>
                ))}
              </div>
            )}

            {/* ════ STEP 0 — RECIPIENT ════ */}
            {txStep===0 && (
              <div style={{animation:"fadeUp .3s ease"}}>
                <div className="sib-card" style={{padding:18,marginBottom:14}}>
                  {/* Toggle */}
                  <div style={{display:"flex",background:T.surface,borderRadius:12,padding:4,marginBottom:16,gap:4}}>
                    {["saved","new"].map(m=>(
                      <button key={m} onClick={()=>{setRecipientMode(m);setSelPayee(null);setTxErr("");}}
                        style={{flex:1,padding:"10px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,transition:"all .2s",background:recipientMode===m?"#fff":T.surface,color:recipientMode===m?T.navy:T.textSm,boxShadow:recipientMode===m?"0 2px 8px rgba(0,0,0,.1)":"none"}}>
                        {m==="saved"?"📋 Saved Payees":"➕ New Recipient"}
                      </button>
                    ))}
                  </div>

                  {recipientMode==="saved" ? (
                    <>
                      <div style={{fontSize:11,color:T.textSm,fontWeight:700,marginBottom:12,letterSpacing:.5}}>SELECT PAYEE</div>
                      {SAVED_PAYEES.map(p=>(
                        <div key={p.id} className={`payee-row ${selPayee?.id===p.id?"sel":""}`} onClick={()=>setSelPayee(p)}>
                          <Av initials={p.avatar} color={p.color}/>
                          <div style={{flex:1}}>
                            <div style={{color:T.text,fontSize:13,fontWeight:700}}>{p.name}</div>
                            <div style={{color:T.textSm,fontSize:11,marginTop:1}}>{p.bank} · {p.acct}</div>
                          </div>
                          {selPayee?.id===p.id && <div style={{width:24,height:24,borderRadius:"50%",background:T.navyMid,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13}}>✓</div>}
                        </div>
                      ))}
                    </>
                  ):(
                    <>
                      <div style={{fontSize:11,color:T.textSm,fontWeight:700,marginBottom:12,letterSpacing:.5}}>RECIPIENT DETAILS</div>
                      {[
                        {lbl:"Full Name / Business",key:"name",ph:"Recipient's full name"},
                        {lbl:"Bank Name",key:"bank",ph:"e.g. JPMorgan Chase"},
                        {lbl:"Routing Number",key:"routing",ph:"9-digit ABA routing number"},
                        {lbl:"Account Number",key:"account",ph:"Account number"},
                      ].map(f=>(
                        <label key={f.key} style={{display:"block",marginBottom:14}}>
                          <span style={{fontSize:11,color:T.textMd,fontWeight:700,display:"block",marginBottom:6,letterSpacing:.5}}>{f.lbl.toUpperCase()}</span>
                          <input className="sib-input" value={newAcct[f.key]} onChange={e=>setNewAcct(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}/>
                        </label>
                      ))}
                    </>
                  )}
                </div>

                {txErr && <div style={{background:T.redLt,border:"1px solid #f9c4c0",borderRadius:10,padding:"10px 14px",marginBottom:12,color:T.red,fontSize:13,display:"flex",gap:8}}>⚠️ {txErr}</div>}
                <button className="sib-btn-primary" onClick={handleRecipientNext} style={{width:"100%",fontSize:15,padding:"15px",borderRadius:12}}>
                  Next: Enter Amount →
                </button>
              </div>
            )}


            {/* ════ STEP 1 — AMOUNT ════ */}
            {txStep===1 && (
              <div style={{animation:"fadeUp .3s ease"}}>
                {/* Recipient summary pill */}
                <div style={{display:"flex",alignItems:"center",gap:12,background:"#fff",borderRadius:14,padding:"12px 16px",marginBottom:14,boxShadow:"0 1px 8px rgba(0,20,80,.06)"}}>
                  {recipientMode==="saved"
                    ? <Av initials={selPayee?.avatar} color={selPayee?.color} size={38}/>
                    : <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#6366F1,#818CF8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🏦</div>
                  }
                  <div>
                    <div style={{color:T.navy,fontSize:13,fontWeight:700}}>{recipientMode==="saved"?selPayee?.name:newAcct.name}</div>
                    <div style={{color:T.textSm,fontSize:11}}>{recipientMode==="saved"?`${selPayee?.bank} · ${selPayee?.acct}`:`${newAcct.bank} · ••••${newAcct.account.slice(-4)}`}</div>
                  </div>
                  <div style={{marginLeft:"auto",color:T.green,fontSize:11,fontWeight:700,background:"#F0FDF4",padding:"3px 10px",borderRadius:20}}>✓ Set</div>
                </div>

                <div className="sib-card" style={{padding:22,marginBottom:14}}>
                  <div style={{fontSize:11,color:T.textSm,fontWeight:700,marginBottom:12,letterSpacing:.5}}>ENTER TRANSFER AMOUNT</div>
                  <div style={{position:"relative",marginBottom:10}}>
                    <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:T.textMd,fontSize:24,fontWeight:700}}>$</span>
                    <input type="number" value={txAmt} onChange={e=>setTxAmt(e.target.value)}
                      placeholder="0.00" className="sib-input"
                      style={{paddingLeft:40,fontSize:28,fontWeight:700,color:T.navy,borderRadius:12,height:64}}/>
                  </div>
                  <div style={{color:T.textSm,fontSize:11,marginBottom:14}}>Available: {fmtUSD(balance)} · Daily limit: $5,000,000</div>

                  {/* Quick amounts */}
                  <div style={{display:"flex",gap:8,marginBottom:18}}>
                    {[5000,25000,100000,500000].map(v=>(
                      <button key={v} onClick={()=>setTxAmt(String(v))}
                        style={{flex:1,padding:"9px 4px",border:`1.5px solid ${txAmt==v?T.navyMid:T.border}`,borderRadius:9,background:txAmt==v?"#f0f4ff":"#fff",color:txAmt==v?T.navyMid:T.textSm,fontSize:10,cursor:"pointer",fontWeight:txAmt==v?700:400,fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>
                        ${v>=1000000?v/1000000+"M":v/1000+"K"}
                      </button>
                    ))}
                  </div>

                  <label style={{display:"block"}}>
                    <span style={{fontSize:11,color:T.textMd,fontWeight:700,display:"block",marginBottom:6,letterSpacing:.5}}>WIRE MEMO (OPTIONAL)</span>
                    <input className="sib-input" value={txNote} onChange={e=>setTxNote(e.target.value)} placeholder="Reference / memo for recipient"/>
                  </label>
                </div>

                {/* Transfer fee note */}
                <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:16}}>✅</span>
                  <span style={{color:"#065F46",fontSize:12}}>Wire fee <strong>waived</strong> — SIB Platinum Tier benefit</span>
                </div>

                {txErr && <div style={{background:T.redLt,border:"1px solid #f9c4c0",borderRadius:10,padding:"10px 14px",marginBottom:12,color:T.red,fontSize:13,display:"flex",gap:8}}>⚠️ {txErr}</div>}

                <div style={{display:"flex",gap:10}}>
                  <button className="sib-btn-ghost" onClick={()=>setTxStep(0)} style={{flex:1,borderRadius:12}}>← Back</button>
                  <button className="sib-btn-primary" onClick={handleAmountNext} style={{flex:2,borderRadius:12}}>Next: Security Code →</button>
                </div>
              </div>
            )}

            {/* ════ STEP 2 — SECURITY CODE ════ */}
            {txStep===2 && (
              <div style={{animation:"fadeUp .3s ease"}}>
                {/* Mini summary */}
                <div style={{background:`linear-gradient(135deg,${T.navy},${T.navyMid})`,borderRadius:16,padding:"16px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{color:"rgba(255,255,255,.5)",fontSize:10,fontWeight:700,letterSpacing:1}}>SENDING TO</div>
                    <div style={{color:"#fff",fontSize:14,fontWeight:700,marginTop:2}}>{recipientMode==="saved"?selPayee?.name:newAcct.name}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:"rgba(255,255,255,.5)",fontSize:10,fontWeight:700,letterSpacing:1}}>AMOUNT</div>
                    <div style={{color:"#E8C96A",fontSize:18,fontWeight:700,fontFamily:"'Playfair Display',serif",marginTop:2}}>{fmtUSD(parseFloat(txAmt))}</div>
                  </div>
                </div>

                <div className="sib-card" style={{padding:28,textAlign:"center",marginBottom:14}}>
                  <div style={{width:76,height:76,borderRadius:"50%",background:"linear-gradient(135deg,#EEF2FF,#C7D2FE)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,margin:"0 auto 18px",boxShadow:"0 8px 28px rgba(99,102,241,.18)"}}>🔑</div>
                  <h3 style={{color:T.navy,fontSize:19,fontFamily:"'Playfair Display',serif",marginBottom:8}}>Enter Security Code</h3>
                  <p style={{color:T.textMd,fontSize:13,lineHeight:1.6,marginBottom:24}}>
                    Enter your <strong>4-digit SIB security code</strong> to authorise this wire transfer.
                  </p>

                  <div style={{position:"relative",maxWidth:200,margin:"0 auto 10px"}}>
                    <input
                      type="password" inputMode="numeric" maxLength={4}
                      value={secCode} onChange={e=>{ setSecCode(e.target.value.replace(/\D/g,"").slice(0,4)); setSecCodeErr(""); setSecCodeOk(false); }}
                      placeholder="••••"
                      style={{width:"100%",padding:"16px",textAlign:"center",fontSize:28,fontWeight:700,letterSpacing:8,border:`2px solid ${secCodeOk?T.green:secCodeErr?T.red:T.border}`,borderRadius:14,outline:"none",fontFamily:"'DM Sans',sans-serif",color:T.navy,background:secCodeOk?"#F0FDF4":"#FAFCFF",transition:"all .2s"}}
                      onFocus={e=>{ if(!secCodeOk) e.target.style.border=`2px solid ${T.navyMid}`; }}
                      onBlur={e=>{ if(!secCodeOk&&!secCodeErr) e.target.style.border=`2px solid ${T.border}`; }}
                    />
                    {secCodeOk && (
                      <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",width:28,height:28,borderRadius:"50%",background:T.green,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,animation:"scaleIn .3s ease"}}>✓</div>
                    )}
                  </div>

                  {secCodeErr && (
                    <div style={{background:T.redLt,border:"1px solid #f9c4c0",borderRadius:10,padding:"10px 14px",marginBottom:14,color:T.red,fontSize:13,marginTop:10}}>
                      ⚠️ {secCodeErr}
                    </div>
                  )}
                  {secCodeOk && (
                    <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:10,padding:"10px 14px",color:"#065F46",fontSize:13,marginTop:10,animation:"fadeIn .3s ease"}}>
                      ✅ Code verified — proceeding to final step…
                    </div>
                  )}

                  <div style={{marginTop:22,display:"flex",gap:10}}>
                    <button className="sib-btn-ghost" onClick={()=>{setTxStep(1);setSecCode("");setSecCodeErr("");setSecCodeOk(false);}} style={{flex:1,borderRadius:12}}>← Back</button>
                    <button className="sib-btn-primary" onClick={handleCodeNext} disabled={secCodeOk}
                      style={{flex:2,borderRadius:12,opacity:secCodeOk?.6:1,cursor:secCodeOk?"not-allowed":"pointer"}}>
                      Confirm Code →
                    </button>
                  </div>
                </div>

                <div style={{background:T.amberLt,border:"1px solid #FCD34D",borderRadius:12,padding:"10px 14px",display:"flex",gap:8}}>
                  <span style={{flexShrink:0}}>⚠️</span>
                  <span style={{color:T.amber,fontSize:12}}>Wire transfers are <strong>final and cannot be reversed</strong> once authorised.</span>
                </div>
              </div>
            )}

            {/* ════ TRANSACTION IN PROGRESS OVERLAY ════ */}
            {txInProgress && (
              <div style={{animation:"fadeUp .4s ease"}}>
                {/* Amount banner */}
                <div style={{background:`linear-gradient(135deg,${T.navy},${T.navyMid})`,borderRadius:16,padding:"16px 20px",marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{color:"rgba(255,255,255,.5)",fontSize:10,fontWeight:700,letterSpacing:1}}>WIRE TRANSFER</div>
                    <div style={{color:"#fff",fontSize:13,fontWeight:600,marginTop:2}}>{recipientMode==="saved"?selPayee?.name:newAcct.name}</div>
                  </div>
                  <div style={{color:"#E8C96A",fontSize:20,fontWeight:700,fontFamily:"'Playfair Display',serif"}}>{fmtUSD(parseFloat(txAmt))}</div>
                </div>

                {/* Progress card */}
                <div className="sib-card" style={{padding:"32px 24px",textAlign:"center",marginBottom:16}}>
                  {/* Animated icon with ripple */}
                  <div style={{position:"relative",width:100,height:100,margin:"0 auto 24px"}}>
                    <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(0,40,128,.08)",animation:"ripple 1.6s ease-out infinite"}}/>
                    <div style={{position:"absolute",inset:8,borderRadius:"50%",background:"rgba(0,40,128,.06)",animation:"ripple 1.6s ease-out .4s infinite"}}/>
                    <div style={{position:"relative",width:100,height:100,borderRadius:"50%",background:`linear-gradient(135deg,${T.navy},${T.navyMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,boxShadow:`0 12px 36px rgba(0,40,128,.3)`}}>
                      💸
                    </div>
                  </div>

                  <h3 style={{color:T.navy,fontSize:22,fontFamily:"'Playfair Display',serif",marginBottom:6}}>Transaction in Progress</h3>
                  <p style={{color:T.textMd,fontSize:13,marginBottom:28}}>Please do not close or refresh this page</p>

                  {/* Animated dots */}
                  <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:28}}>
                    {[0,1,2].map(i=>(
                      <div key={i} style={{width:10,height:10,borderRadius:"50%",background:T.navyMid,animation:`dotBounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>
                    ))}
                  </div>

                  {/* Progress stages */}
                  <div style={{textAlign:"left",display:"flex",flexDirection:"column",gap:10}}>
                    {[
                      {lbl:"Phrase Authenticated",    ico:"🔐"},
                      {lbl:"Connecting to Fedwire",   ico:"🌐"},
                      {lbl:"Routing to Destination",  ico:"📡"},
                      {lbl:"Settlement Confirmed",    ico:"✅"},
                    ].map((s,i)=>(
                      <div key={s.lbl} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,background:progressStep>i?"#F0FDF4":progressStep===i?"#EEF2FF":T.surface,border:`1px solid ${progressStep>i?"#BBF7D0":progressStep===i?"#C7D2FE":T.border}`,transition:"all .4s ease"}}>
                        <div style={{width:32,height:32,borderRadius:"50%",background:progressStep>i?T.green:progressStep===i?T.navyMid:"#CBD5E1",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0,transition:"background .4s"}}>
                          {progressStep>i?"✓":s.ico}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{color:progressStep>=i?T.navy:T.textSm,fontSize:13,fontWeight:progressStep>=i?600:400,transition:"color .3s"}}>{s.lbl}</div>
                          {progressStep===i && <div style={{color:T.navyMid,fontSize:11,marginTop:2,animation:"pulse 1s infinite"}}>Processing…</div>}
                          {progressStep>i  && <div style={{color:T.green,fontSize:11,marginTop:2}}>Complete</div>}
                        </div>
                        {progressStep===i && (
                          <div style={{width:18,height:18,border:`2.5px solid rgba(0,40,128,.2)`,borderTopColor:T.navyMid,borderRadius:"50%",animation:"spin .8s linear infinite",flexShrink:0}}/>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div style={{marginTop:20,height:6,background:T.surface,borderRadius:10,overflow:"hidden"}}>
                    <div style={{height:"100%",background:`linear-gradient(90deg,${T.navyMid},${T.blue})`,borderRadius:10,width:`${(progressStep/4)*100}%`,transition:"width 1s ease",animation:"progressPulse 2s ease-in-out infinite"}}/>
                  </div>
                  <div style={{color:T.textSm,fontSize:11,marginTop:8}}>{Math.round((progressStep/4)*100)}% complete</div>
                </div>

                <div style={{background:T.amberLt,border:"1px solid #FCD34D",borderRadius:12,padding:"10px 14px",display:"flex",gap:8}}>
                  <span>⏳</span>
                  <span style={{color:T.amber,fontSize:12}}>This usually takes a few seconds. Funds move via Fedwire in real time.</span>
                </div>
              </div>
            )}

            {/* ════ STEP 3 — SECURITY QUESTION ════ */}
            {txStep===3 && (
              <div style={{animation:"fadeUp .3s ease"}}>

                {/* Mini summary banner */}
                <div style={{background:`linear-gradient(135deg,${T.navy},${T.navyMid})`,borderRadius:16,padding:"16px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{color:"rgba(255,255,255,.5)",fontSize:10,fontWeight:700,letterSpacing:1}}>SENDING TO</div>
                    <div style={{color:"#fff",fontSize:14,fontWeight:700,marginTop:2}}>{recipientMode==="saved"?selPayee?.name:newAcct.name}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:"rgba(255,255,255,.5)",fontSize:10,fontWeight:700,letterSpacing:1}}>AMOUNT</div>
                    <div style={{color:"#E8C96A",fontSize:18,fontWeight:700,fontFamily:"'Playfair Display',serif",marginTop:2}}>{fmtUSD(parseFloat(txAmt))}</div>
                  </div>
                </div>

                <div className="sib-card" style={{padding:28,textAlign:"center",marginBottom:14}}>
                  {/* Icon */}
                  <div style={{width:76,height:76,borderRadius:"50%",background:"linear-gradient(135deg,#FDF4FF,#E9D5FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,margin:"0 auto 18px",boxShadow:"0 8px 28px rgba(124,58,237,.15)"}}>🛡️</div>

                  <h3 style={{color:T.navy,fontSize:19,fontFamily:"'Playfair Display',serif",marginBottom:6}}>Security Question</h3>
                  <p style={{color:T.textMd,fontSize:13,lineHeight:1.6,marginBottom:20}}>
                    Please answer your registered security question to continue.
                  </p>

                  {/* Question box */}
                  <div style={{background:`linear-gradient(135deg,${T.navy},${T.navyMid})`,borderRadius:14,padding:"16px 18px",marginBottom:20,textAlign:"left",display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:32,height:32,borderRadius:8,background:"rgba(201,168,76,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>❓</div>
                    <div>
                      <div style={{color:"rgba(255,255,255,.5)",fontSize:10,fontWeight:700,letterSpacing:1,marginBottom:4}}>YOUR SECURITY QUESTION</div>
                      <div style={{color:"#fff",fontSize:15,fontWeight:600,lineHeight:1.4}}>What's your first car?</div>
                    </div>
                  </div>

                  {/* Answer input */}
                  <div style={{position:"relative",marginBottom:10,textAlign:"left"}}>
                    <span style={{fontSize:11,color:T.textMd,fontWeight:700,display:"block",marginBottom:7,letterSpacing:.5}}>YOUR ANSWER</span>
                    <div style={{position:"relative"}}>
                      <input
                        type="text"
                        value={secAnswer}
                        onChange={e=>{ setSecAnswer(e.target.value); setSecAnswerErr(""); setSecAnswerOk(false); }}
                        onKeyDown={e=>e.key==="Enter"&&handleSecurityQuestion()}
                        placeholder="Type your answer here…"
                        className="sib-input"
                        style={{fontSize:15,fontWeight:600,borderRadius:12,paddingRight:46,border:`2px solid ${secAnswerOk?T.green:secAnswerErr?T.red:T.border}`,background:secAnswerOk?"#F0FDF4":"#FAFCFF",transition:"all .2s"}}
                      />
                      {secAnswerOk && (
                        <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",width:28,height:28,borderRadius:"50%",background:T.green,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,animation:"scaleIn .3s ease"}}>✓</div>
                      )}
                    </div>
                  </div>

                  {secAnswerErr && (
                    <div style={{background:T.redLt,border:"1px solid #f9c4c0",borderRadius:10,padding:"10px 14px",marginBottom:14,color:T.red,fontSize:13,textAlign:"left",display:"flex",gap:8}}>
                      <span>⚠️</span><span>{secAnswerErr}</span>
                    </div>
                  )}
                  {secAnswerOk && (
                    <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:10,padding:"10px 14px",color:"#065F46",fontSize:13,textAlign:"left",marginBottom:4,animation:"fadeIn .3s ease",display:"flex",gap:8}}>
                      <span>✅</span><span>Answer verified — proceeding to final step…</span>
                    </div>
                  )}

                  <div style={{marginTop:20,display:"flex",gap:10}}>
                    <button className="sib-btn-ghost"
                      onClick={()=>{setTxStep(2);setSecAnswer("");setSecAnswerErr("");setSecAnswerOk(false);}}
                      style={{flex:1,borderRadius:12}}>← Back</button>
                    <button className="sib-btn-primary"
                      onClick={handleSecurityQuestion}
                      disabled={secAnswerOk}
                      style={{flex:2,borderRadius:12,opacity:secAnswerOk?.6:1,cursor:secAnswerOk?"not-allowed":"pointer"}}>
                      Confirm Answer →
                    </button>
                  </div>
                </div>

                <div style={{background:"#F0F4FF",border:`1px solid ${T.silverLt}`,borderRadius:12,padding:"10px 14px",display:"flex",gap:8}}>
                  <span style={{flexShrink:0}}>🔒</span>
                  <span style={{color:T.navyMid,fontSize:12}}>This answer is encrypted and verified against your registered SIB security profile.</span>
                </div>
              </div>
            )}

            {/* ════ STEP 4 — 3-WORD PHRASE ════ */}
            {!txInProgress && txStep===4 && (
              <div style={{animation:"fadeUp .3s ease"}}>
                {/* Mini summary */}
                <div style={{background:`linear-gradient(135deg,${T.navy},${T.navyMid})`,borderRadius:16,padding:"16px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{color:"rgba(255,255,255,.5)",fontSize:10,fontWeight:700,letterSpacing:1}}>SENDING TO</div>
                    <div style={{color:"#fff",fontSize:14,fontWeight:700,marginTop:2}}>{selPayee?.name}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:"rgba(255,255,255,.5)",fontSize:10,fontWeight:700,letterSpacing:1}}>AMOUNT</div>
                    <div style={{color:"#E8C96A",fontSize:18,fontWeight:700,fontFamily:"'Playfair Display',serif",marginTop:2}}>{fmtUSD(parseFloat(txAmt))}</div>
                  </div>
                </div>

                <div className="sib-card" style={{padding:28,textAlign:"center",marginBottom:14}}>
                  <div style={{width:76,height:76,borderRadius:"50%",background:"linear-gradient(135deg,#FDF4FF,#E9D5FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,margin:"0 auto 18px",boxShadow:"0 8px 28px rgba(124,58,237,.15)"}}>🗝️</div>
                  <h3 style={{color:T.navy,fontSize:19,fontFamily:"'Playfair Display',serif",marginBottom:8}}>3-Word Security Phrase</h3>
                  <p style={{color:T.textMd,fontSize:13,lineHeight:1.6,marginBottom:8}}>
                    Enter your <strong>personal 3-word security phrase</strong> to complete this wire transfer.
                  </p>
                  <p style={{color:T.textSm,fontSize:11,marginBottom:22}}>
                    Example format: <em>ocean · silver · bridge</em>
                  </p>

                  <input
                    className="sib-input"
                    value={phrase}
                    onChange={e=>{ setPhrase(e.target.value); setPhraseErr(""); }}
                    placeholder="word1  word2  word3"
                    style={{textAlign:"center",fontSize:17,fontWeight:600,letterSpacing:1,padding:"15px",borderRadius:13,marginBottom:10}}
                  />

                  <div style={{color:T.textSm,fontSize:11,marginBottom:phrase.trim().split(/\s+/).filter(w=>w).length===3?0:16}}>
                    {phrase.trim()===" "||phrase.trim()===""
                      ? "Enter three words separated by spaces"
                      : phrase.trim().split(/\s+/).filter(w=>w).length===3
                        ? <span style={{color:T.green,fontWeight:600}}>✓ 3 words entered</span>
                        : <span style={{color:T.amber}}>{phrase.trim().split(/\s+/).filter(w=>w).length} / 3 words</span>
                    }
                  </div>

                  {phraseErr && (
                    <div style={{background:T.redLt,border:"1px solid #f9c4c0",borderRadius:10,padding:"10px 14px",marginBottom:14,color:T.red,fontSize:13,marginTop:10}}>
                      ⚠️ {phraseErr}
                    </div>
                  )}

                  <div style={{marginTop:20,display:"flex",gap:10}}> 
                    <button className="sib-btn-ghost" onClick={()=>{setTxStep(3);setPhrase("");setPhraseErr("");}} style={{flex:1,borderRadius:12}}>← Back</button>
                    <button className="sib-btn-primary" onClick={handlePhraseSubmit} disabled={verifying}
                      style={{flex:2,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:verifying?.7:1,cursor:verifying?"not-allowed":"pointer"}}>
                      {verifying
                        ?<><span style={{width:17,height:17,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/>Processing…</>
                        :"Authorise Transfer 🔐"}
                    </button>
                  </div>
                </div>

                <div style={{background:"#F0F4FF",border:`1px solid ${T.silverLt}`,borderRadius:12,padding:"10px 14px",display:"flex",gap:8}}>
                  <span style={{flexShrink:0}}>🛡️</span>
                  <span style={{color:T.navyMid,fontSize:12}}>Your phrase is end-to-end encrypted and never stored in plaintext.</span>
                </div>
              </div>
            )}

            {/* ════ STEP 5 — SUCCESS ════ */}
            {txStep===5 && (
              <div style={{textAlign:"center",animation:"scaleIn .45s ease"}}>
                <div style={{width:104,height:104,borderRadius:"50%",background:"linear-gradient(135deg,#DCFCE7,#BBF7D0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:54,margin:"0 auto 22px",boxShadow:"0 14px 44px rgba(14,124,74,.2)"}}>✅</div>
                <h2 style={{color:T.navy,fontFamily:"'Playfair Display',serif",marginBottom:8,fontSize:24}}>Wire Transfer Complete</h2>
                <p style={{color:T.textMd,fontSize:14,marginBottom:26}}>Your funds have been dispatched via Fedwire.</p>

                <div className="sib-card" style={{padding:20,marginBottom:20,textAlign:"left"}}>
                  <div style={{textAlign:"center",padding:"10px 0 16px",borderBottom:`1px solid ${T.surface}`,marginBottom:14}}>
                    <div style={{color:T.textSm,fontSize:12}}>Total Wired</div>
                    <div style={{color:T.navy,fontSize:32,fontWeight:700,marginTop:4,fontFamily:"'Playfair Display',serif"}}>{fmtUSD(parseFloat(txAmt))}</div>
                  </div>
                  {[
                    {lbl:"Beneficiary",val:selPayee?.name},
                    {lbl:"Destination Bank",val:selPayee?.bank},
                    {lbl:"Account",val:selPayee?.acct},
                    {lbl:"Timestamp",val:fmtDate()},
                    {lbl:"Reference No.",val:`SIB${Date.now().toString().slice(-10)}`},
                    {lbl:"Settlement",val:"✅ Fedwire Confirmed",col:T.green},
                    {lbl:"New Balance",val:fmtUSD(balance),col:T.navyMid,bold:true},
                  ].map(r=>(
                    <div key={r.lbl} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${T.surface}`}}>
                      <span style={{color:T.textSm,fontSize:12}}>{r.lbl}</span>
                      <span style={{color:r.col||"#374151",fontSize:12,fontWeight:r.bold?700:500}}>{r.val}</span>
                    </div>
                  ))}
                </div>

                <div style={{display:"flex",gap:10}}>
                  <button className="sib-btn-primary" onClick={()=>{setTab("dashboard");resetTransfer();}} style={{flex:1,borderRadius:12}}>Dashboard</button>
                  <button className="sib-btn-ghost" onClick={resetTransfer} style={{flex:1,borderRadius:12}}>New Wire</button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ────── CARDS ────── */}

        {tab==="cards" && (
          <div style={{animation:"fadeUp .4s ease"}}>
            <h3 style={{color:T.navy,fontSize:17,fontFamily:"'Playfair Display',serif",marginBottom:14}}>My Cards</h3>

            {/* Primary card */}
            <div style={{background:`linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 50%, #0052CC 100%)`,borderRadius:22,padding:"28px 24px",marginBottom:16,color:"#fff",boxShadow:`0 16px 48px rgba(0,26,87,.4)`,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",right:-40,top:-40,width:180,height:180,borderRadius:"50%",background:"rgba(255,255,255,.04)"}}/>
              <div style={{position:"absolute",right:20,bottom:-30,width:130,height:130,borderRadius:"50%",background:"rgba(201,168,76,.08)"}}/>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:32,position:"relative"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:20,height:20,borderRadius:5,background:"linear-gradient(135deg,#C9A84C,#E8C96A)"}}>
                      <svg width="20" height="20" viewBox="0 0 32 32" fill="none"><path d="M4 22 L16 6 L28 22 Z" stroke="white" strokeWidth="3" fill="none" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.7)",letterSpacing:1.5}}>SWIFT INVESTMENT BANK</span>
                  </div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:2,letterSpacing:1}}>SIB PLATINUM INFINITE</div>
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.5)",letterSpacing:1}}>VISA</div>
              </div>
              <div style={{fontSize:16,letterSpacing:5,marginBottom:22,color:"rgba(255,255,255,.9)",fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>4829  ••••  ••••  7391</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                <div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,.45)",letterSpacing:1,marginBottom:3}}>CARD HOLDER</div>
                  <div style={{fontSize:12,fontWeight:700,letterSpacing:.5}}>TOM JONES WOODWARD</div>
                </div>
                <div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,.45)",letterSpacing:1,marginBottom:3}}>VALID THRU</div>
                  <div style={{fontSize:12,fontWeight:700}}>06/31</div>
                </div>
                <div style={{display:"flex"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(201,168,76,.6)"}}/>
                  <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(201,168,76,.8)",marginLeft:-16}}/>
                </div>
              </div>
            </div>

            <div className="sib-card" style={{padding:18,marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:14}}>Card Summary</div>
              {[
                {lbl:"Card Status",val:"● Active & Unlocked",col:T.green},
                {lbl:"Credit Limit",val:"$1,000,000.00"},
                {lbl:"Available Credit",val:"$976,400.00",col:T.navyMid},
                {lbl:"Statement Balance",val:"$23,600.00"},
                {lbl:"Minimum Payment",val:"$1,180.00"},
                {lbl:"Payment Due",val:"July 1, 2026",col:T.red},
                {lbl:"Rewards Points",val:"⭐ 5,482,100 pts"},
                {lbl:"Cashback Earned",val:"$8,740.50",col:T.green},
              ].map(r=>(
                <div key={r.lbl} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:`1px solid ${T.surface}`}}>
                  <span style={{color:T.textMd,fontSize:13}}>{r.lbl}</span>
                  <span style={{color:r.col||T.text,fontSize:13,fontWeight:600}}>{r.val}</span>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {ico:"🔒",lbl:"Lock Card",bg:"#FEF2F2",brd:"#FECACA",col:"#DC2626"},
                {ico:"🌍",lbl:"Travel Mode",bg:"#EFF6FF",brd:"#BFDBFE",col:"#1D4ED8"},
                {ico:"💳",lbl:"Virtual Card",bg:"#F0FDF4",brd:"#BBF7D0",col:T.green},
                {ico:"🚨",lbl:"Report Lost",bg:"#FFF7ED",brd:"#FED7AA",col:"#EA580C"},
              ].map(a=>(
                <button key={a.lbl} style={{background:a.bg,border:`1.5px solid ${a.brd}`,borderRadius:14,padding:"18px",textAlign:"center",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"transform .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                  <div style={{fontSize:28,marginBottom:7}}>{a.ico}</div>
                  <div style={{color:a.col,fontSize:12,fontWeight:700}}>{a.lbl}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ────── PROFILE ────── */}
        {tab==="profile" && (
          <div style={{animation:"fadeUp .4s ease"}}>
            <div style={{background:`linear-gradient(135deg,${T.navy},${T.navyMid},${T.blue})`,borderRadius:20,padding:"26px 22px",marginBottom:14,textAlign:"center",color:"#fff"}}>
              <div style={{width:84,height:84,borderRadius:22,background:"linear-gradient(135deg,#C9A84C,#E8C96A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:T.navy,margin:"0 auto 14px",boxShadow:"0 8px 28px rgba(201,168,76,.35)",letterSpacing:1}}>SIB</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginTop:4}}>Private Wealth Banking · Platinum</div>
              <div style={{display:"inline-block",background:"rgba(201,168,76,.18)",color:"#E8C96A",borderRadius:20,padding:"4px 18px",fontSize:11,marginTop:10,fontWeight:700,border:"1px solid rgba(201,168,76,.3)"}}>⭐ Platinum Client</div>
            </div>

            {[
              {title:"Account Details",rows:[
                {ico:"🏦",lbl:"Account Type",val:"SIB Premier Platinum Checking"},
                {ico:"💳",lbl:"Primary Account",val:"••••  ••••  ••••  4829"},
                {ico:"🔢",lbl:"Routing Number",val:"026009593"},
                {ico:"📅",lbl:"Member Since",val:"January 15, 2019"},
                {ico:"💰",lbl:"Portfolio Value",val:fmtUSD(balance),col:T.navyMid},
              ]},
              {title:"Contact & Security",rows:[
                {ico:"📞",lbl:"Support Email",val:"Infoswiftibn@yahoo.com",col:T.blue},
                {ico:"📱",lbl:"Hotline",val:"+1 (888) SIB-WIRE"},
                {ico:"🛡️",lbl:"Security Level",val:"Enhanced 2FA Active",col:T.green},
                {ico:"🌐",lbl:"Region",val:"United States · USD"},
              ]},
            ].map(g=>(
              <div key={g.title} className="sib-card" style={{marginBottom:14,overflow:"hidden"}}>
                <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.surface}`,color:T.navy,fontWeight:700,fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>{g.title}</div>
                {g.rows.map(r=>(
                  <div key={r.lbl} style={{display:"flex",alignItems:"center",padding:"14px 20px",borderBottom:`1px solid ${T.surface}`}}>
                    <span style={{fontSize:20,marginRight:14}}>{r.ico}</span>
                    <div style={{flex:1}}>
                      <div style={{color:T.textSm,fontSize:11,fontWeight:600,letterSpacing:.3}}>{r.lbl.toUpperCase()}</div>
                      <div style={{color:r.col||T.text,fontSize:13,fontWeight:600,marginTop:3}}>{r.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <button onClick={()=>setScreen("login")} style={{width:"100%",padding:"15px",background:"linear-gradient(135deg,#DC2626,#B91C1C)",color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 16px rgba(220,38,38,.3)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              🚪 Sign Out Securely
            </button>
          </div>
        )}

        {/* ────── SETTINGS ────── */}
        {tab==="settings" && (
          <div style={{animation:"fadeUp .4s ease"}}>
            <h3 style={{color:T.navy,fontSize:17,fontFamily:"'Playfair Display',serif",marginBottom:14}}>Settings</h3>
            {[
              {sec:"Security",items:[
                {ico:"🔐",lbl:"Security & 2FA",sub:"Hardware key · Biometrics · OTP active"},
                {ico:"📱",lbl:"Trusted Devices",sub:"3 devices authorized"},
                {ico:"🛡️",lbl:"Fraud Monitoring",sub:"AI-powered real-time surveillance"},
                {ico:"🔑",lbl:"Change Password",sub:"Last changed 32 days ago"},
              ]},
              {sec:"Account",items:[
                {ico:"🔔",lbl:"Notifications",sub:"Push · SMS · Email alerts"},
                {ico:"📄",lbl:"Statements",sub:"Download PDF statements"},
                {ico:"💱",lbl:"Currency & FX",sub:"USD primary · 12 currencies enabled"},
                {ico:"🤝",lbl:"Linked Accounts",sub:"4 accounts · 2 brokerages"},
              ]},
              {sec:"Support",items:[
                {ico:"📧",lbl:"Email Support",sub:"Infoswiftibn@yahoo.com",col:T.blue},
                {ico:"📞",lbl:"Private Banking Line",sub:"+1 (888) SIB-WIRE · 24/7"},
                {ico:"💬",lbl:"Secure Live Chat",sub:"Connect with a Wealth Advisor"},
                {ico:"ℹ️",lbl:"App Version",sub:"SIB Digital v8.4.2 (2026)"},
              ]},
            ].map(g=>(
              <div key={g.sec} style={{marginBottom:16}}>
                <div style={{color:T.textSm,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:8,paddingLeft:4}}>{g.sec.toUpperCase()}</div>
                <div className="sib-card">
                  {g.items.map((r,i)=>(
                    <div key={r.lbl} style={{display:"flex",alignItems:"center",padding:"15px 20px",borderBottom:i<g.items.length-1?`1px solid ${T.surface}`:"none",cursor:"pointer"}}>
                      <span style={{fontSize:22,marginRight:14}}>{r.ico}</span>
                      <div style={{flex:1}}>
                        <div style={{color:T.text,fontSize:13,fontWeight:600}}>{r.lbl}</div>
                        <div style={{color:r.col||T.textSm,fontSize:11,marginTop:2}}>{r.sub}</div>
                      </div>
                      <span style={{color:T.silver,fontSize:18}}>›</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════
          BOTTOM NAV
      ══════════════════════════════════════ */}
      <div style={{position:"sticky",bottom:0,background:"#fff",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-around",padding:"6px 0 10px",boxShadow:"0 -4px 24px rgba(0,20,80,.08)",zIndex:100}}>
        {[
          {id:"dashboard",ico:"🏠",lbl:"Home"},
          {id:"transactions",ico:"📋",lbl:"Activity"},
        ].map(n=>(
          <button key={n.id} className={`nav-btn ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
            <span style={{fontSize:22}}>{n.ico}</span>{n.lbl}
          </button>
        ))}

        {/* Centre FAB */}
        <button onClick={()=>{resetTransfer();setTab("transfer");}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,border:"none",background:"none",cursor:"pointer",padding:"0 12px",fontFamily:"'DM Sans',sans-serif"}}>
          <div style={{width:54,height:54,borderRadius:"50%",background:`linear-gradient(135deg,${T.navy},${T.navyMid},${T.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:`0 6px 24px rgba(0,40,128,.45)`,marginTop:-20,border:"3px solid #EEF2FA"}}>📤</div>
          <span style={{fontSize:10,color:T.navy,fontWeight:700,marginTop:1}}>Transfer</span>
        </button>

        {[
          {id:"cards",ico:"💳",lbl:"Cards"},
          {id:"settings",ico:"⚙️",lbl:"Settings"},
        ].map(n=>(
          <button key={n.id} className={`nav-btn ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
            <span style={{fontSize:22}}>{n.ico}</span>{n.lbl}
          </button>
        ))}
      </div>
    </div>
  );
}
