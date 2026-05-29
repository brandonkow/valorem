import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { upload } from "@vercel/blob/client";

const CSS = `
  @keyframes toastIn{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:translateX(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
  @keyframes expandIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes modalIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes rotateSlowR{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
  @keyframes glowPulse{0%,100%{opacity:.5}50%{opacity:1}}
  @keyframes tickerScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  @keyframes inkSink{0%{opacity:0;transform:translateY(8px);letter-spacing:.04em}100%{opacity:1;transform:translateY(0);letter-spacing:normal}}
  @keyframes inkFade{from{opacity:0}to{opacity:1}}
  @keyframes underlineDraw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  @keyframes caretBlink{0%,49%{opacity:1}50%,100%{opacity:0}}
  @keyframes phosphorPulse{0%,100%{opacity:.7}50%{opacity:1}}
  @keyframes scanLineDrift{0%{transform:translateY(-2%)}100%{transform:translateY(2%)}}
  @keyframes numberTick{0%{opacity:.45;transform:translateY(-2px)}45%{opacity:1;transform:translateY(0)}100%{opacity:1;transform:translateY(0)}}
  @keyframes barRise{from{transform:scaleY(0)}to{transform:scaleY(1)}}
  @keyframes dotJitter{0%,100%{transform:translate(0,0)}25%{transform:translate(1px,-1px)}50%{transform:translate(0,1px)}75%{transform:translate(-1px,0)}}
  @keyframes bootLineIn{0%{opacity:0;transform:translateX(-6px)}100%{opacity:1;transform:translateX(0)}}
  @keyframes bootFadeOut{0%{opacity:1;visibility:visible}100%{opacity:0;visibility:hidden}}
  @keyframes bootGlowSweep{0%{transform:translateX(-120%)}100%{transform:translateX(420%)}}
  @keyframes bootRingSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes bootRingSpinR{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
  @keyframes bootFlicker{0%,100%{opacity:1}48%{opacity:1}49%{opacity:.4}50%{opacity:1}92%{opacity:1}93%{opacity:.6}94%{opacity:1}}
  @keyframes bootCoreThrob{0%,100%{transform:scale(1);box-shadow:0 0 24px rgba(0,200,150,.4)}50%{transform:scale(1.08);box-shadow:0 0 44px rgba(0,200,150,.7)}}
  @keyframes bootScan{0%{transform:translateY(0)}100%{transform:translateY(100%)}}
  @keyframes hintFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}
  body{margin:0;font-family:'Onest',sans-serif;font-feature-settings:"ss01","cv11";color:#E5E9E7;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;background:#0B0F0D}
  .btn-p{transition:all .15s ease;cursor:pointer;border:none;font-family:inherit}
  .btn-p:hover{filter:brightness(1.1)}
  .btn-o{transition:all .15s ease;cursor:pointer;font-family:inherit}
  .btn-o:hover{border-color:#00C896!important;color:#00C896!important}
  .vf-card{transition:border-color .2s ease,box-shadow .25s ease,transform .25s ease}
  .vf-card:hover{transform:translateY(-2px);border-color:rgba(0,200,150,.42)!important;box-shadow:0 0 0 1px rgba(0,200,150,.08),0 22px 44px rgba(0,0,0,.4)}
  .dl-btn{transition:filter .15s ease,transform .15s ease;cursor:pointer}
  .dl-btn:hover{filter:brightness(1.1)}
  .prop-card{transition:all .15s ease;cursor:pointer;user-select:none}
  .prop-card:hover{border-color:rgba(0,200,150,.5)!important}
  .fltr{cursor:pointer;font-family:inherit;border:none;transition:all .15s ease}
  .adm-row{transition:background .15s ease}
  .adm-row:hover{background:rgba(0,200,150,.04)!important}
  .upload-zone{transition:all .2s ease;cursor:pointer}
  .upload-zone:hover{border-color:#00C896!important;background:rgba(0,200,150,.05)!important;color:#00C896!important}
  input:focus,textarea:focus{outline:none;border-color:#00C896!important}
  input::placeholder{color:#4B5450}
  .ed-link{position:relative;display:inline-block}
  .ed-link::after{content:"";position:absolute;left:0;right:0;bottom:-2px;height:1px;background:currentColor;transform:scaleX(0);transform-origin:left center;transition:transform .35s cubic-bezier(.22,1,.36,1)}
  .ed-link:hover::after{transform:scaleX(1)}
  .lp-card{transition:border-color .22s ease,background .22s ease,box-shadow .25s ease,transform .25s ease;cursor:default}
  .lp-card:hover{border-color:#00C896!important;background:rgba(0,200,150,.045)!important;box-shadow:inset 0 0 0 1px rgba(0,200,150,.18),0 18px 40px rgba(0,0,0,.45);transform:translateY(-2px)}
  .lp-card:hover .lp-card-num{color:#38EFA6!important;text-shadow:0 0 10px rgba(56,239,166,.5)}
  .lp-card:hover .lp-card-arrow{opacity:1!important;transform:translateX(0)!important;color:#00C896!important}
  .lp-card:hover .lp-card-name{color:#FFFFFF!important}
  .lp-chip{transition:border-color .15s ease,color .15s ease,background .15s ease,transform .15s ease;cursor:default}
  .lp-chip:hover{border-color:rgba(0,200,150,.6)!important;color:#00C896!important;background:rgba(0,200,150,.08)!important;transform:translateY(-1px)}
  .lp-stat{transition:background .2s ease;cursor:default}
  .lp-stat:hover{background:rgba(0,200,150,.03)}
  .lp-stat:hover .lp-stat-num{color:#00C896!important;text-shadow:0 0 10px rgba(0,200,150,.4)}
  .lp-stat:hover .lp-stat-label{color:#7C8881!important}
  .lp-formula{transition:border-color .2s ease,background .2s ease;cursor:default}
  .lp-formula:hover{border-color:#00C896!important;background:rgba(0,200,150,.025)!important;box-shadow:inset 0 0 0 1px rgba(0,200,150,.15)}
  .lp-formula:hover .lp-formula-eq{border-color:rgba(0,200,150,.55)!important;background:#0C1411!important;color:#00C896!important}
  .lp-formula:hover .lp-formula-key{color:#38EFA6!important;text-shadow:0 0 10px rgba(56,239,166,.45)}
  .lp-ticker:hover .lp-ticker-track{animation-play-state:paused}
  .lp-ticker-item{transition:filter .15s ease,opacity .15s ease}
  .lp-ticker:hover .lp-ticker-item{opacity:.45}
  .lp-ticker:hover .lp-ticker-item:hover{opacity:1;filter:brightness(1.4)}
  .lp-dcf-row{transition:background .15s ease;cursor:default}
  .lp-dcf-row:hover{background:rgba(0,200,150,.07)!important}
  .lp-dcf-result{transition:border-color .18s ease,background .18s ease;cursor:default}
  .lp-dcf-result:hover{background:rgba(0,200,150,.06)!important;border-left-color:#00C896!important}
  .lp-dcf-result:hover .lp-dcf-result-val{text-shadow:0 0 14px rgba(0,200,150,.5)}
  .lp-bar{transition:filter .2s ease;cursor:default}
  .lp-bar:hover .lp-bar-pv{filter:brightness(1.25);box-shadow:inset 0 1px 0 rgba(56,239,166,.6),0 0 20px rgba(0,200,150,.3)!important}
  .lp-bar:hover .lp-bar-noi{border-color:rgba(0,200,150,.55)!important;background:rgba(0,200,150,.04)}
  .lp-bar:hover .lp-bar-label{color:#00C896!important;text-shadow:0 0 10px rgba(0,200,150,.45)}
  .lp-bar:hover .lp-bar-x{color:#FFFFFF!important}
  .lp-sys-pill{transition:background .15s ease,border-color .15s ease;cursor:default}
  .lp-sys-pill:hover{background:rgba(0,200,150,.06)}
  .lp-sys-pill:hover .lp-sys-val{text-shadow:0 0 8px rgba(0,200,150,.45)}
  .lp-execute:hover{border-color:rgba(0,200,150,.55)!important;box-shadow:0 0 18px rgba(0,200,150,.1)!important}
  .lp-knob{cursor:pointer;display:inline-flex;align-items:baseline;gap:6px;padding:2px 8px;margin:-2px -4px;border:1px solid transparent;transition:border-color .15s ease,background .15s ease;-webkit-tap-highlight-color:transparent}
  .lp-knob:hover{border-color:rgba(0,200,150,.55);background:rgba(0,200,150,.08)}
  .lp-knob:hover .lp-knob-val{color:#00C896!important;text-shadow:0 0 8px rgba(0,200,150,.35)}
  .lp-knob:hover .lp-knob-chev{color:#00C896!important;opacity:1!important}
  .lp-knob:active{transform:translateY(1px)}
  .lp-knob-chev{font-size:9px;color:#7C8881;opacity:.45;transition:color .15s ease,opacity .15s ease;letter-spacing:-1px}
  .lp-cell-flash{animation:cellFlash .55s ease}
  @keyframes cellFlash{0%{background:rgba(0,200,150,.3)}100%{background:rgba(0,200,150,0)}}
  .lp-expand-link{cursor:pointer;color:#00C896;font-family:'JetBrains Mono',monospace;font-size:10;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;padding:4px 10px;border:1px solid rgba(0,200,150,.35);background:rgba(0,200,150,.05);transition:all .15s ease;-webkit-tap-highlight-color:transparent}
  .lp-expand-link:hover{background:rgba(0,200,150,.15);border-color:#00C896;text-shadow:0 0 6px rgba(0,200,150,.45)}
  .lp-expand-grid{animation:expandIn .35s cubic-bezier(.22,1,.36,1)}
  .lp-pin-item{cursor:pointer;-webkit-tap-highlight-color:transparent}
  .lp-pin-item.is-pinned{background:rgba(0,200,150,.16)!important;outline:1px solid #00C896}
  .lp-pin-panel{animation:pinSlide .35s cubic-bezier(.22,1,.36,1)}
  @keyframes pinSlide{from{opacity:0;transform:translateY(-12px);max-height:0}to{opacity:1;transform:translateY(0);max-height:400px}}
  .lp-fit{min-height:calc(100vh - 94px);display:flex;flex-direction:column}
  .lp-fit > section{flex:1 0 auto;display:flex;flex-direction:column;justify-content:center;width:100%}
  ::-webkit-scrollbar{width:6px}
  ::-webkit-scrollbar-track{background:#0F1411}
  ::-webkit-scrollbar-thumb{background:#283129;border-radius:0}
  ::-webkit-scrollbar-thumb:hover{background:#3a463d}
`;

const BG="#0B0F0D";
const D="#003F2D",M="#006A4D",BR="#1DB87B",PL="#EEF6F2",PLR="#F7FBF9",W="#FFF",MU="#587066",BD="rgba(0,63,45,.1)";
const TERM_BG="#0B0F0D",TERM_PANEL="#10161300",TERM_PANEL_S="#101613",TERM_GRID="#1B221E",TERM_BORDER="#283129",TERM_FG="#E5E9E7",TERM_FG_DIM="#7C8881",TERM_FG_MUTE="#4B5450",PHOSPHOR="#00C896",PHOSPHOR_DIM="#0F5239",SIG_UP="#38EFA6",SIG_DOWN="#E66660",AMBER="#FFC640";
const ADMIN_USER="admin", ADMIN_PASS="cbre";

const computeCatStats=(catId,stats)=>{
  const dl=Object.entries(stats?.downloads||{})
    .filter(([k])=>k.startsWith(`${catId}__`))
    .reduce((s,[,v])=>s+(v||0),0);
  const upCount=stats?.uploads?.[catId]||0;
  const major=1+Math.floor(upCount/10),minor=upCount%10;
  const lu=stats?.lastUpdated?.[catId];
  return{
    downloads:dl.toLocaleString(),
    version:`v${major}.${minor}`,
    updated:lu?new Date(lu).toLocaleDateString("en-MY",{month:"short",year:"numeric"}):"—",
  };
};

const TMPLS=[
  {id:"residential",title:"Residential",sub:"Landed & Strata Properties",
   desc:"End-to-end DCF model covering all residential asset classes. Select a property type below to download the corresponding template.",
   tag:"Most Popular",ver:"v2.1",updated:"May 2025",dl:"1,240",
   types:[
     {id:"condo",label:"Condominium",note:"High-rise strata title"},
     {id:"serviced",label:"Serviced Residence",note:"Dual-key & serviced units"},
     {id:"apartment",label:"Apartment",note:"Walk-up & low-rise"},
     {id:"terrace",label:"Terrace House",note:"Single & double storey"},
     {id:"semid",label:"Semi-Detached",note:"Linked bungalow"},
     {id:"bungalow",label:"Bungalow",note:"Detached dwelling"},
     {id:"soho",label:"SOHO",note:"Small office home office"},
     {id:"affordable",label:"Affordable Housing",note:"PR1MA & PPR schemes"},
   ]},
  {id:"commercial",title:"Commercial",sub:"Office, Retail & Mixed-Use",
   desc:"Advanced valuation framework covering all commercial property classes. Select a property type to get the right DCF model.",
   tag:"Professional",ver:"v1.8",updated:"Apr 2025",dl:"890",
   types:[
     {id:"office",label:"Office Tower",note:"MSC & Grade A/B"},
     {id:"retail",label:"Retail Mall",note:"Regional & neighbourhood"},
     {id:"shophouse",label:"Shophouse",note:"2–4 storey commercial"},
     {id:"hotel",label:"Hotel",note:"Budget to luxury grading"},
     {id:"mixed",label:"Mixed-Use",note:"Integrated development"},
     {id:"sofo",label:"SOFO / SOVO",note:"Small office flex units"},
     {id:"medicalcentre",label:"Medical Centre",note:"Specialist & GP clinic"},
   ]},
  {id:"industrial",title:"Industrial",sub:"Factory, Warehouse & Logistics",
   desc:"Specialised DCF models for industrial and logistics assets. Choose a sub-category to download the purpose-built template.",
   tag:"Specialist",ver:"v1.5",updated:"Mar 2025",dl:"621",
   types:[
     {id:"detachedfactory",label:"Detached Factory",note:"Freestanding industrial"},
     {id:"semifactory",label:"Semi-D Factory",note:"Linked industrial unit"},
     {id:"warehouse",label:"Warehouse",note:"General & bulk storage"},
     {id:"logistics",label:"Logistics Hub",note:"Last-mile & fulfilment"},
     {id:"coldstore",label:"Cold Storage",note:"Temperature-controlled"},
     {id:"ipark",label:"Industrial Park",note:"Multi-tenant campus"},
     {id:"light",label:"Light Industrial",note:"Small enterprise units"},
   ]},
  {id:"land",title:"Land",sub:"Bare Land & Development Sites",
   desc:"Residual land value DCF models for all land categories. Select your land type to download the correct valuation template.",
   tag:"Advanced",ver:"v1.3",updated:"Feb 2025",dl:"445",
   types:[
     {id:"resland",label:"Residential Land",note:"Housing development site"},
     {id:"comland",label:"Commercial Land",note:"Retail or office site"},
     {id:"indland",label:"Industrial Land",note:"Factory or logistics plot"},
     {id:"agri",label:"Agricultural Land",note:"Farming & plantation"},
     {id:"infill",label:"Infill Site",note:"Urban brownfield plot"},
     {id:"leasehold",label:"Leasehold Land",note:"Leasehold interest"},
     {id:"freehold",label:"Freehold Land",note:"Freehold title"},
   ]},
];

function useInView(t=.05){
  const r=useRef(null),[v,sv]=useState(false);
  useEffect(()=>{
    if(!r.current)return;
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)sv(true);},{threshold:t});
    o.observe(r.current);return()=>o.disconnect();
  },[]);
  return[r,v];
}

function ProgressBar({scrollRef}){
  const[p,sp]=useState(0);
  useEffect(()=>{
    const el=scrollRef.current;if(!el)return;
    const fn=()=>sp(Math.min(el.scrollTop/(el.scrollHeight-el.clientHeight)*100,100));
    el.addEventListener("scroll",fn,{passive:true});return()=>el.removeEventListener("scroll",fn);
  },[scrollRef]);
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,height:2,zIndex:9999,background:"rgba(0,200,150,.1)"}}>
      <div style={{height:"100%",width:`${p}%`,background:PHOSPHOR,boxShadow:`0 0 8px ${PHOSPHOR}`,transition:"width .08s linear"}}/>
    </div>
  );
}

/* ── Nav: unified terminal status bar across all pages ── */
function Nav({page,onBack,onAdminClick}){
  const onLanding = page==="landing";
  const onDash    = page==="dashboard";
  const onAdmin   = page==="admin";
  const path      = onLanding?"/":onDash?"/dashboard":"/admin";

  return(
    <nav style={{
      position:"fixed",top:2,left:0,right:0,zIndex:300,height:54,
      background:"rgba(11,15,13,.88)",
      backdropFilter:"blur(18px)",
      borderBottom:`1px solid ${TERM_BORDER}`,
      display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"0 28px"}}>
      <div style={{display:"flex",alignItems:"center",gap:22}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{width:8,height:8,background:PHOSPHOR,
            boxShadow:`0 0 8px ${PHOSPHOR}`,
            animation:"phosphorPulse 1.8s ease infinite"}}/>
          <div style={{fontFamily:"'JetBrains Mono', monospace",fontWeight:600,
            fontSize:13,letterSpacing:"2.5px",color:TERM_FG,textTransform:"uppercase"}}>
            VALOREM<span style={{color:PHOSPHOR,margin:"0 6px"}}>·</span><span style={{color:TERM_FG_DIM,fontWeight:500}}>CBRE.MY</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:18,
          fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
          color:TERM_FG_MUTE,letterSpacing:"1.8px",textTransform:"uppercase",fontWeight:500}}>
          <span style={{color:TERM_FG_DIM}}>SYS:OK</span>
          <span style={{color:PHOSPHOR,fontWeight:600}}>PATH:{path}</span>
          {onAdmin&&<span style={{color:AMBER}}>USER:ADMIN</span>}
          <span>BLD:01.4</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {(onDash||onAdmin)&&(
          <button className="btn-o" onClick={onBack}
            style={{background:"transparent",color:TERM_FG,
              border:`1px solid ${TERM_BORDER}`,fontFamily:"'JetBrains Mono', monospace",
              padding:"7px 16px",borderRadius:0,fontWeight:500,fontSize:10,
              cursor:"pointer",letterSpacing:"2.5px",textTransform:"uppercase"}}>
            ← [Home]
          </button>
        )}
        {onLanding&&(
          <button className="btn-o" onClick={onAdminClick}
            style={{background:"transparent",color:TERM_FG,
              border:`1px solid ${TERM_BORDER}`,fontFamily:"'JetBrains Mono', monospace",
              padding:"7px 16px",borderRadius:0,fontWeight:500,fontSize:10,
              cursor:"pointer",letterSpacing:"2.5px",textTransform:"uppercase"}}>
            [Admin]
          </button>
        )}
      </div>
    </nav>
  );
}

function Toast({msg,onClose}){
  useEffect(()=>{const t=setTimeout(onClose,3600);return()=>clearTimeout(t);},[]);
  return(
    <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,
      background:TERM_PANEL_S,border:`1px solid ${PHOSPHOR}`,padding:"14px 18px",
      display:"flex",alignItems:"flex-start",gap:14,
      boxShadow:`0 0 24px rgba(0,200,150,.18),0 18px 40px rgba(0,0,0,.5)`,
      animation:"toastIn .4s cubic-bezier(.34,1.4,.64,1) forwards",maxWidth:340,
      fontFamily:"'Onest',sans-serif"}}>
      <span style={{width:8,height:8,background:PHOSPHOR,marginTop:6,flexShrink:0,
        boxShadow:`0 0 8px ${PHOSPHOR}`,animation:"phosphorPulse 1.6s ease infinite"}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
          color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,
          textTransform:"uppercase",marginBottom:5}}>
          ✓ DOWNLOAD READY
        </div>
        <div style={{color:TERM_FG,fontSize:12.5,lineHeight:1.5,fontWeight:500}}>{msg}</div>
      </div>
      <div onClick={onClose} style={{color:TERM_FG_DIM,cursor:"pointer",
        fontSize:14,lineHeight:1,padding:"0 4px",
        fontFamily:"'JetBrains Mono',monospace"}}>×</div>
    </div>
  );
}

function AdminLoginModal({onClose,onSuccess}){
  const[u,su]=useState(""),[p,sp]=useState(""),[err,se]=useState(""),[loading,sl]=useState(false);
  const submit=()=>{
    sl(true);se("");
    setTimeout(()=>{
      if(u===ADMIN_USER&&p===ADMIN_PASS){onSuccess();}
      else{se("AUTH FAILED · invalid credentials");sl(false);}
    },900);
  };
  return(
    <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(11,15,13,.78)",
      backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",
      animation:"fadeIn .2s ease",padding:"24px"}}>
      <div style={{background:TERM_PANEL_S,border:`1px solid ${TERM_BORDER}`,
        padding:"32px 32px 28px",width:380,maxWidth:"100%",position:"relative",
        boxShadow:`0 0 0 1px rgba(0,200,150,.06),0 28px 64px rgba(0,0,0,.55)`,
        animation:"modalIn .3s cubic-bezier(.22,1,.36,1)",
        fontFamily:"'Onest',sans-serif"}}>
        <ScanLines opacity={.45}/>
        {/* Header strip */}
        <div style={{position:"relative",zIndex:1,
          paddingBottom:14,marginBottom:24,borderBottom:`1px solid ${TERM_BORDER}`,
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,
            fontFamily:"'JetBrains Mono',monospace",fontSize:10,
            color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,textTransform:"uppercase"}}>
            <span style={{width:7,height:7,background:PHOSPHOR,
              boxShadow:`0 0 8px ${PHOSPHOR}`,
              animation:"phosphorPulse 1.6s ease infinite"}}/>
            AUTH · REQUIRED
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
            color:TERM_FG_MUTE,letterSpacing:"1.5px",fontWeight:500,textTransform:"uppercase"}}>
            S/ADMIN
          </div>
        </div>

        <div style={{position:"relative",zIndex:1,marginBottom:22}}>
          <h2 style={{fontFamily:"'Onest',sans-serif",fontSize:22,fontWeight:600,
            color:TERM_FG,margin:"0 0 6px",letterSpacing:"-.02em"}}>
            Sign in to <span style={{color:PHOSPHOR}}>admin</span>
          </h2>
          <p style={{color:TERM_FG_DIM,fontSize:13,margin:0,lineHeight:1.5}}>
            Restricted access · CBRE administrators only.
          </p>
        </div>

        {[["USERNAME","text",u,su,"admin"],["PASSWORD","password",p,sp,"··········"]].map(([lbl,type,val,set,ph])=>(
          <div key={lbl} style={{marginBottom:14,position:"relative",zIndex:1}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
              color:TERM_FG_DIM,fontWeight:600,letterSpacing:"2px",
              textTransform:"uppercase",marginBottom:7}}>—— {lbl}</div>
            <input type={type} value={val} onChange={e=>set(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()} placeholder={ph}
              style={{width:"100%",boxSizing:"border-box",
                background:TERM_BG,border:`1px solid ${TERM_BORDER}`,
                padding:"12px 14px",fontSize:13.5,color:TERM_FG,
                fontFamily:"'JetBrains Mono',monospace",letterSpacing:".5px",
                borderRadius:0}}/>
          </div>
        ))}

        {err&&<div style={{position:"relative",zIndex:1,
          background:"rgba(230,102,96,.08)",border:`1px solid ${SIG_DOWN}`,
          padding:"10px 13px",marginBottom:14,fontSize:11.5,
          color:SIG_DOWN,fontFamily:"'JetBrains Mono',monospace",
          letterSpacing:"1.2px",textTransform:"uppercase",fontWeight:500,
          display:"flex",alignItems:"center",gap:8}}>
          <span>!</span> {err}
        </div>}

        <button onClick={submit} className="btn-p"
          style={{width:"100%",position:"relative",zIndex:1,
            background:PHOSPHOR,color:TERM_BG,
            padding:"14px",fontWeight:700,fontSize:12,borderRadius:0,
            border:`1px solid ${PHOSPHOR}`,
            fontFamily:"'JetBrains Mono',monospace",letterSpacing:"2.5px",
            textTransform:"uppercase",
            display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          {loading?<><div style={{width:11,height:11,
            border:`2px solid rgba(11,15,13,.35)`,borderTopColor:TERM_BG,
            animation:"spin .8s linear infinite"}}/> Authenticating</>
            :<>$ login · execute ▶</>}
        </button>
        <button onClick={onClose} className="btn-o"
          style={{width:"100%",marginTop:10,position:"relative",zIndex:1,
            background:"transparent",color:TERM_FG_DIM,
            border:`1px solid ${TERM_BORDER}`,
            padding:"11px",borderRadius:0,fontSize:11,cursor:"pointer",
            fontFamily:"'JetBrains Mono',monospace",letterSpacing:"2px",
            textTransform:"uppercase",fontWeight:500}}>Cancel</button>
      </div>
    </div>
  );
}

function AdminPanel({onLogout,uploads,setUploads,setStats}){
  const[expandedCat,setExp]=useState(null);
  const[uploadToast,setUT]=useState(null);
  const abortRefs=useRef({});
  const totalUploaded=Object.keys(uploads).filter(k=>uploads[k]?.url).length;

  const handleCancel=key=>{
    abortRefs.current[key]?.abort();
    setUploads(prev=>{const n={...prev};delete n[key];return n;});
  };

  const handleFileChange=async(catId,typeId,label,e)=>{
    const file=e.target.files[0];if(!file)return;
    const key=`${catId}__${typeId}`;
    e.target.value="";
    const controller=new AbortController();
    abortRefs.current[key]=controller;
    const timeoutId=setTimeout(()=>controller.abort(),120000);
    setUploads(prev=>({...prev,[key]:{loading:true,progress:0,name:file.name,label,size:"...",date:""}}));
    try{
      const blob=await upload(
        `templates/${catId}/${typeId}/${file.name}`,
        file,
        {access:"public",handleUploadUrl:"/api/upload",
         abortSignal:controller.signal,
         onUploadProgress:({percentage})=>{
           setUploads(prev=>prev[key]?({...prev,[key]:{...prev[key],progress:Math.round(percentage)}}):prev);
         }}
      );
      clearTimeout(timeoutId);
      delete abortRefs.current[key];
      setUploads(prev=>({...prev,[key]:{
        url:blob.url,name:file.name,label,
        size:(file.size/1024).toFixed(1)+"KB",
        date:new Date().toLocaleDateString("en-MY",{day:"2-digit",month:"short",year:"numeric"}),
      }}));
      setStats(prev=>({...prev,
        uploads:{...(prev.uploads||{}),[catId]:((prev.uploads||{})[catId]||0)+1},
        lastUpdated:{...(prev.lastUpdated||{}),[catId]:new Date().toISOString()}}));
      fetch("/api/stats",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action:"upload",catId,typeId})}).catch(()=>{});
      setUT(`"${label}" template uploaded successfully.`);
    }catch(err){
      clearTimeout(timeoutId);
      delete abortRefs.current[key];
      setUploads(prev=>{const n={...prev};delete n[key];return n;});
      if(err?.name==="AbortError"||err?.message?.includes("abort"))
        setUT(`Upload cancelled.`);
      else{
        console.error("Upload failed:",err);
        setUT(`Failed to upload "${label}": ${err?.message||"unknown error"}`);
      }
    }
    setTimeout(()=>setUT(null),5000);
  };
  const handleRemove=async key=>{
    const upload=uploads[key];
    setUploads(prev=>{const n={...prev};delete n[key];return n;});
    if(upload?.url){
      await fetch(`/api/delete-template?url=${encodeURIComponent(upload.url)}`,{method:"DELETE"}).catch(()=>{});
    }
  };

  return(
    <div style={{background:TERM_BG,minHeight:"100vh",paddingTop:56,position:"relative"}}>
      <ScanLines opacity={.35}/>

      {/* Header status strip */}
      <div style={{borderBottom:`1px solid ${TERM_BORDER}`,
        background:"rgba(255,198,64,.04)",position:"relative",zIndex:1}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"20px 32px",
          display:"flex",justifyContent:"space-between",alignItems:"flex-end",
          flexWrap:"wrap",gap:18}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,
              fontFamily:"'JetBrains Mono',monospace",fontSize:10,
              letterSpacing:"2.5px",fontWeight:600,textTransform:"uppercase"}}>
              <span style={{width:7,height:7,background:AMBER,
                boxShadow:`0 0 8px ${AMBER}`,
                animation:"phosphorPulse 1.8s ease infinite"}}/>
              <span style={{color:AMBER}}>RESTRICTED · S/ADMIN</span>
              <span style={{color:TERM_FG_MUTE}}>·</span>
              <span style={{color:TERM_FG_DIM}}>USER:ADMIN</span>
            </div>
            <h1 style={{fontFamily:"'Onest',sans-serif",fontSize:24,fontWeight:600,
              color:TERM_FG,margin:0,letterSpacing:"-.02em",lineHeight:1.1}}>
              Template <span style={{color:AMBER}}>Management</span>
            </h1>
            <p style={{fontFamily:"'Onest',sans-serif",fontSize:13,
              color:TERM_FG_DIM,margin:"5px 0 0",lineHeight:1.5}}>
              Upload and manage DCF Excel workbooks for end-user distribution.
            </p>
          </div>
          <div style={{display:"flex",gap:14,alignItems:"flex-end"}}>
            <div style={{textAlign:"right",
              border:`1px solid ${TERM_BORDER}`,padding:"10px 18px",
              background:TERM_PANEL_S}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
                color:TERM_FG_MUTE,letterSpacing:"2px",
                textTransform:"uppercase",fontWeight:500,marginBottom:4}}>UPLOADED</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,
                color:totalUploaded===29?PHOSPHOR:totalUploaded>0?AMBER:TERM_FG_DIM,
                fontWeight:600,fontVariantNumeric:"tabular-nums",letterSpacing:"-.3px"}}>
                {totalUploaded}<span style={{color:TERM_FG_MUTE,fontWeight:500}}> / 29</span>
              </div>
            </div>
            <button onClick={onLogout} className="btn-o"
              style={{background:"transparent",color:TERM_FG,
                border:`1px solid ${TERM_BORDER}`,
                fontFamily:"'JetBrains Mono',monospace",
                padding:"10px 18px",borderRadius:0,fontWeight:500,fontSize:10,
                cursor:"pointer",letterSpacing:"2.5px",textTransform:"uppercase"}}>
              ↳ [Sign Out]
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1280,margin:"0 auto",padding:"32px 32px 60px",
        position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,
          fontFamily:"'JetBrains Mono',monospace",fontSize:10,
          color:AMBER,letterSpacing:"2px",fontWeight:600,textTransform:"uppercase"}}>
          <span style={{flex:0,height:1,background:AMBER,width:24}}/>
          ↳ Each row accepts a single .xlsx workbook (max 50MB).
        </div>

        {TMPLS.map((cat,catIdx)=>{
          const catUploads=cat.types.filter(pt=>uploads[`${cat.id}__${pt.id}`]).length;
          const isOpen=expandedCat===cat.id;
          const code=CAT_CODES[cat.id]||cat.id.slice(0,3).toUpperCase();
          const catNum=String(catIdx+1).padStart(2,"0");
          const complete=catUploads===cat.types.length;
          const dotColor=complete?PHOSPHOR:catUploads>0?AMBER:TERM_FG_MUTE;
          return(
            <div key={cat.id} style={{background:TERM_PANEL_S,
              border:`1px solid ${isOpen?PHOSPHOR:TERM_BORDER}`,
              marginBottom:12,overflow:"hidden",position:"relative",
              transition:"border-color .15s ease"}}>
              <div onClick={()=>setExp(isOpen?null:cat.id)}
                style={{padding:"18px 22px",display:"flex",alignItems:"center",
                  justifyContent:"space-between",cursor:"pointer",
                  background:isOpen?"rgba(0,200,150,.05)":"transparent",
                  borderBottom:isOpen?`1px solid ${TERM_BORDER}`:"none",
                  transition:"background .15s ease",gap:18,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <span style={{width:8,height:8,background:dotColor,
                    boxShadow:complete?`0 0 8px ${PHOSPHOR}`:"none",flexShrink:0}}/>
                  <div style={{display:"flex",alignItems:"baseline",gap:10,
                    fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,
                    color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,
                    textTransform:"uppercase"}}>
                    <span>{catNum}</span>
                    <span style={{color:TERM_FG_MUTE}}>[{code}]</span>
                  </div>
                  <div>
                    <div style={{fontFamily:"'Onest',sans-serif",fontWeight:600,
                      fontSize:16.5,color:TERM_FG,letterSpacing:"-.01em"}}>
                      {cat.title}
                    </div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
                      color:TERM_FG_DIM,letterSpacing:"1.2px",fontWeight:500,
                      marginTop:2,textTransform:"uppercase"}}>{cat.sub}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{border:`1px solid ${complete?PHOSPHOR:catUploads>0?AMBER:TERM_BORDER}`,
                    background:complete?"rgba(0,200,150,.08)":catUploads>0?"rgba(255,198,64,.06)":"transparent",
                    color:complete?PHOSPHOR:catUploads>0?AMBER:TERM_FG_DIM,
                    padding:"5px 12px",fontSize:10,fontWeight:600,
                    fontFamily:"'JetBrains Mono',monospace",
                    letterSpacing:"1.5px",textTransform:"uppercase",
                    fontVariantNumeric:"tabular-nums"}}>
                    {catUploads}<span style={{opacity:.5,margin:"0 3px"}}>/</span>{cat.types.length} UP
                  </div>
                  <div style={{color:TERM_FG_DIM,fontSize:11,
                    fontFamily:"'JetBrains Mono',monospace",fontWeight:600,
                    transition:"transform .2s",transform:isOpen?"rotate(180deg)":"none",
                    width:18,textAlign:"center"}}>▾</div>
                </div>
              </div>
              {isOpen&&(
                <div style={{animation:"expandIn .25s ease"}}>
                  {cat.types.map((pt,i)=>{
                    const key=`${cat.id}__${pt.id}`;
                    const uploaded=uploads[key];
                    return(
                      <div key={pt.id} className="adm-row"
                        style={{padding:"14px 22px",
                          borderBottom:i<cat.types.length-1?`1px solid ${TERM_GRID}`:"none",
                          display:"flex",alignItems:"center",justifyContent:"space-between",
                          flexWrap:"wrap",gap:12,background:"transparent"}}>
                        <div style={{flex:"1 1 200px",minWidth:0}}>
                          <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
                              color:TERM_FG_MUTE,letterSpacing:"1.5px",fontWeight:500,
                              textTransform:"uppercase"}}>{String(i+1).padStart(2,"0")}</span>
                            <div>
                              <div style={{fontFamily:"'Onest',sans-serif",fontWeight:600,
                                fontSize:13.5,color:TERM_FG}}>{pt.label}</div>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
                                color:TERM_FG_DIM,marginTop:2,letterSpacing:".5px",
                                textTransform:"uppercase"}}>{pt.note}</div>
                            </div>
                          </div>
                        </div>
                        {uploaded?.loading?(
                          <div style={{display:"flex",alignItems:"center",gap:10,
                            minWidth:240,flex:"1 1 auto",justifyContent:"flex-end"}}>
                            <div style={{flex:"0 1 200px"}}>
                              <div style={{display:"flex",justifyContent:"space-between",
                                alignItems:"center",fontSize:9.5,color:TERM_FG_DIM,marginBottom:5,
                                fontFamily:"'JetBrains Mono',monospace",
                                letterSpacing:"1.5px",textTransform:"uppercase",fontWeight:500}}>
                                <span style={{display:"flex",alignItems:"center",gap:6}}>
                                  <div style={{width:9,height:9,border:`2px solid ${TERM_BORDER}`,
                                    borderTopColor:PHOSPHOR,
                                    animation:"spin .8s linear infinite"}}/>
                                  UPLOADING
                                </span>
                                <span style={{fontWeight:600,color:PHOSPHOR,
                                  fontVariantNumeric:"tabular-nums"}}>{uploaded.progress??0}%</span>
                              </div>
                              <div style={{height:4,background:TERM_BG,
                                border:`1px solid ${TERM_BORDER}`,overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${uploaded.progress??0}%`,
                                  background:`linear-gradient(90deg,${PHOSPHOR_DIM},${PHOSPHOR})`,
                                  transition:"width .2s ease"}}/>
                              </div>
                            </div>
                            <div onClick={()=>handleCancel(key)}
                              style={{border:`1px solid ${SIG_DOWN}`,
                                background:"rgba(230,102,96,.08)",
                                padding:"7px 12px",fontSize:10,fontWeight:600,
                                color:SIG_DOWN,cursor:"pointer",whiteSpace:"nowrap",
                                fontFamily:"'JetBrains Mono',monospace",
                                letterSpacing:"2px",textTransform:"uppercase"}}>
                              ABORT
                            </div>
                          </div>
                        ):uploaded?(
                          <div style={{display:"flex",alignItems:"center",gap:8,
                            flex:"1 1 auto",justifyContent:"flex-end",flexWrap:"wrap"}}>
                            <div style={{
                              border:`1px solid ${PHOSPHOR}`,
                              background:"rgba(0,200,150,.06)",
                              padding:"7px 12px",fontSize:10.5,
                              fontFamily:"'JetBrains Mono',monospace",
                              letterSpacing:".5px",
                              display:"flex",alignItems:"center",gap:10,maxWidth:280}}>
                              <span style={{width:6,height:6,background:PHOSPHOR,
                                boxShadow:`0 0 4px ${PHOSPHOR}`,flexShrink:0}}/>
                              <div style={{minWidth:0}}>
                                <div style={{color:PHOSPHOR,fontWeight:600,
                                  overflow:"hidden",textOverflow:"ellipsis",
                                  whiteSpace:"nowrap"}}>{uploaded.name}</div>
                                <div style={{color:TERM_FG_DIM,marginTop:2,fontSize:9.5,
                                  letterSpacing:"1px",textTransform:"uppercase",fontWeight:500}}>
                                  {uploaded.size} · {uploaded.date}
                                </div>
                              </div>
                            </div>
                            <label style={{cursor:"pointer"}}>
                              <input type="file" accept=".xlsx,.xls" style={{display:"none"}}
                                onChange={e=>handleFileChange(cat.id,pt.id,pt.label,e)}/>
                              <div className="btn-o"
                                style={{border:`1px solid ${TERM_BORDER}`,
                                  padding:"7px 12px",fontSize:10,fontWeight:600,
                                  color:TERM_FG_DIM,cursor:"pointer",
                                  fontFamily:"'JetBrains Mono',monospace",
                                  letterSpacing:"2px",textTransform:"uppercase"}}>
                                ↻ Replace
                              </div>
                            </label>
                            <div onClick={()=>handleRemove(key)} className="btn-o"
                              style={{border:`1px solid ${TERM_BORDER}`,
                                padding:"7px 12px",fontSize:10,fontWeight:600,
                                color:TERM_FG_DIM,cursor:"pointer",
                                fontFamily:"'JetBrains Mono',monospace",
                                letterSpacing:"2px",textTransform:"uppercase"}}>
                              × Remove
                            </div>
                          </div>
                        ):(
                          <label style={{cursor:"pointer",flex:"0 0 auto"}}>
                            <input type="file" accept=".xlsx,.xls" style={{display:"none"}}
                              onChange={e=>handleFileChange(cat.id,pt.id,pt.label,e)}/>
                            <div className="upload-zone"
                              style={{border:`1px dashed ${TERM_BORDER}`,
                                padding:"9px 18px",
                                display:"flex",alignItems:"center",gap:10,fontSize:10.5,
                                fontWeight:600,color:TERM_FG_DIM,
                                fontFamily:"'JetBrains Mono',monospace",
                                letterSpacing:"2px",textTransform:"uppercase"}}>
                              <span style={{fontSize:13,fontWeight:700}}>+</span> Upload .xlsx
                            </div>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {uploadToast&&(
        <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,
          background:TERM_PANEL_S,border:`1px solid ${PHOSPHOR}`,
          padding:"14px 18px",
          display:"flex",alignItems:"flex-start",gap:12,
          boxShadow:`0 0 24px rgba(0,200,150,.16),0 18px 40px rgba(0,0,0,.5)`,
          animation:"toastIn .35s ease",maxWidth:340,
          fontFamily:"'Onest',sans-serif"}}>
          <span style={{width:7,height:7,background:PHOSPHOR,marginTop:6,flexShrink:0,
            boxShadow:`0 0 8px ${PHOSPHOR}`,animation:"phosphorPulse 1.6s ease infinite"}}/>
          <div style={{fontSize:13,color:TERM_FG,fontWeight:500,lineHeight:1.5}}>{uploadToast}</div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Terminal data — live financial signals
   ───────────────────────────────────────────── */
const BENCHMARKS=[
  {code:"KLOA",label:"OFFICE A · KL",y:5.75,d:-0.12},
  {code:"KLOB",label:"OFFICE B · KL",y:6.40,d:-0.05},
  {code:"KLRP",label:"RETAIL · KLCC",y:7.10,d:0.08},
  {code:"PJRT",label:"RETAIL · PJ",y:7.85,d:0.02},
  {code:"SALG",label:"LOGISTICS · SA",y:6.20,d:0.00},
  {code:"JBID",label:"INDUSTRIAL · JB",y:7.05,d:-0.03},
  {code:"PGHT",label:"HOTEL · PEN",y:8.10,d:0.15},
  {code:"MKRH",label:"HIGH-RISE · MK",y:4.90,d:-0.08},
  {code:"DLND",label:"LANDED · DMS",y:4.20,d:-0.04},
  {code:"PHAG",label:"AGRI · PHG",y:6.80,d:0.01},
];

/* DCF model parameters · the showpiece sample */
const DCF_MODEL={
  asset:"Grade A Office Tower",
  location:"Kuala Lumpur Sentral",
  noi:[2400,2496,2596,2700,2808],
  growth:0.04,
  wacc:0.08,
  terminal:35400,
  workbook:"01.4",
};

const CATEGORIES=[
  {n:"01",id:"residential",code:"RES",name:"Residential",types:8,subtitle:"Landed & strata title",
   sample:["Condominium","Terrace","Bungalow","SOHO","Affordable"]},
  {n:"02",id:"commercial",code:"COM",name:"Commercial",types:7,subtitle:"Office, retail & mixed-use",
   sample:["Office Tower","Retail Mall","Hotel","Shophouse","Med. Centre"]},
  {n:"03",id:"industrial",code:"IND",name:"Industrial",types:7,subtitle:"Factory & logistics",
   sample:["Det. Factory","Warehouse","Logistics","Cold Storage","Light Ind."]},
  {n:"04",id:"land",code:"LND",name:"Land",types:7,subtitle:"Bare land & development",
   sample:["Resi Land","Comm. Land","Industrial","Agricultural","Freehold"]},
];

const ASSETS=[
  {asset:"Grade A Office Tower",location:"Kuala Lumpur Sentral",noi:2400,wkb:"01.4"},
  {asset:"Retail Mall · Prime",location:"Bukit Bintang, KL",noi:3200,wkb:"02.7"},
  {asset:"Logistics Hub",location:"Shah Alam, Selangor",noi:1800,wkb:"03.3"},
  {asset:"Hotel · Upscale",location:"Georgetown, Penang",noi:1500,wkb:"02.4"},
  {asset:"Industrial Park",location:"Pasir Gudang, JB",noi:2100,wkb:"03.6"},
];
const WACC_STEPS=[600,650,700,750,800,850,900,950,1000];
const GROWTH_STEPS=[200,300,400,500,600,700];

const FORMULAS=[
  {key:"NPV",label:"Net Present Value",
   eq:"NPV = Σ ( CFₜ / (1+r)ᵗ ) + TV / (1+r)ⁿ",
   where:[
     ["CFₜ","Net cash flow in year t"],
     ["r","Discount rate · WACC"],
     ["TV","Terminal value at exit"],
     ["n","Holding period · years"],
   ]},
  {key:"IRR",label:"Internal Rate of Return",
   eq:"0 = Σ ( CFₜ / (1+IRR)ᵗ ) − I₀",
   where:[
     ["IRR","Rate that makes NPV = 0"],
     ["CFₜ","Cash flow in year t"],
     ["I₀","Initial investment outlay"],
   ]},
  {key:"CAP",label:"Capitalisation Rate",
   eq:"Cap = NOI / Property Value",
   where:[
     ["NOI","Net Operating Income · annual"],
     ["Value","Current market valuation"],
   ]},
];

function useIsWide(bp=920){
  const[w,sw]=useState(typeof window!=="undefined"?window.innerWidth:1280);
  useEffect(()=>{
    const fn=()=>sw(window.innerWidth);
    window.addEventListener("resize",fn);
    return()=>window.removeEventListener("resize",fn);
  },[]);
  return w>=bp;
}

/* ── The Wax Seal — press and hold to enter the library ── */
/* ── Subtle CRT scan-lines overlay ── */
function ScanLines({opacity=.4}){
  return(
    <div aria-hidden style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0,
      opacity,
      backgroundImage:"repeating-linear-gradient(0deg,rgba(229,233,231,.012) 0px,rgba(229,233,231,.012) 1px,transparent 1px,transparent 3px)"}}/>
  );
}

/* ── ExecuteBar — terminal-style press-and-hold CTA ── */
function ExecuteBar({onComplete,duration=900,command="initiate --library --region=MY",width=600}){
  const[p,setP]=useState(0);
  const[holding,setHolding]=useState(false);
  const rafRef=useRef(0),startRef=useRef(0),doneRef=useRef(false);

  useEffect(()=>()=>{ if(rafRef.current)cancelAnimationFrame(rafRef.current); },[]);

  const tick=t=>{
    if(!startRef.current)startRef.current=t;
    const np=Math.min(1,(t-startRef.current)/duration);
    setP(np);
    if(np>=1){doneRef.current=true;setHolding(false);rafRef.current=0;onComplete();return;}
    rafRef.current=requestAnimationFrame(tick);
  };

  const start=e=>{
    e.preventDefault();e.stopPropagation();
    if(doneRef.current)return;
    setHolding(true);startRef.current=0;rafRef.current=requestAnimationFrame(tick);
  };

  const stop=e=>{
    if(e)e.stopPropagation();
    if(rafRef.current){cancelAnimationFrame(rafRef.current);rafRef.current=0;}
    setHolding(false);
    if(!doneRef.current)setP(0);
  };

  const pct=p*100;
  const trans=holding?"none":"width .35s cubic-bezier(.4,0,.2,1),clip-path .35s cubic-bezier(.4,0,.2,1),-webkit-clip-path .35s cubic-bezier(.4,0,.2,1)";

  const inner=(invert)=>(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"18px 22px",height:"100%",boxSizing:"border-box"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,fontSize:14}}>
        <span style={{color:invert?TERM_BG:PHOSPHOR,fontWeight:700}}>$</span>
        <span style={{color:invert?TERM_BG:TERM_FG,fontWeight:invert?600:500,letterSpacing:".4px"}}>{command}</span>
        {!holding && !invert && (
          <span aria-hidden style={{display:"inline-block",
            width:8,height:14,background:TERM_FG,verticalAlign:"middle",
            marginLeft:1,animation:"caretBlink 1.05s steps(2) infinite"}}/>
        )}
      </div>
      <div style={{fontSize:10,letterSpacing:"2.5px",
        color:invert?TERM_BG:TERM_FG_DIM,fontWeight:invert?700:600,
        textTransform:"uppercase"}}>
        {holding?`${Math.floor(pct).toString().padStart(2,"0")}%`:"HOLD ↓ TO EXEC"}
      </div>
    </div>
  );

  return(
    <button
      onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      onClick={e=>e.stopPropagation()} onContextMenu={e=>e.preventDefault()}
      aria-label="Hold to execute"
      className="lp-execute"
      style={{position:"relative",display:"block",width:"100%",maxWidth:width,
        background:TERM_PANEL_S,
        border:`1px solid ${holding?PHOSPHOR:TERM_BORDER}`,
        padding:0,cursor:"pointer",overflow:"hidden",
        fontFamily:"'JetBrains Mono', monospace",
        boxShadow:holding?`0 0 28px rgba(0,200,150,.18)`:"none",
        transition:"border-color .15s ease,box-shadow .2s ease",
        touchAction:"none",userSelect:"none"}}>
      {/* phosphor fill background */}
      <div aria-hidden style={{position:"absolute",left:0,top:0,bottom:0,
        width:`${pct}%`,
        background:`linear-gradient(90deg,${PHOSPHOR_DIM} 0%,${PHOSPHOR} 100%)`,
        transition:trans,willChange:"width"}}/>

      {/* base content layer (dark text on dark) */}
      <div style={{position:"relative",zIndex:1}}>{inner(false)}</div>

      {/* inverted overlay clipped to fill — perfect color flip */}
      <div aria-hidden style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",
        clipPath:`inset(0 ${100-pct}% 0 0)`,
        WebkitClipPath:`inset(0 ${100-pct}% 0 0)`,
        transition:trans,willChange:"clip-path"}}>{inner(true)}</div>
    </button>
  );
}

/* ── Masthead-style hero — editorial cover ── */
/* ── Live yield ticker — top financial ticker ── */
function LiveYieldTicker({pinnedCode,onPin}){
  const seq=[...BENCHMARKS,...BENCHMARKS];
  return(
    <section className="lp-ticker" style={{background:"#070A09",
      borderBottom:`1px solid ${TERM_BORDER}`,borderTop:`1px solid ${TERM_BORDER}`,
      padding:"10px 0",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,
        background:"linear-gradient(90deg,#070A09 0%,transparent 6%,transparent 94%,#070A09 100%)",
        zIndex:2,pointerEvents:"none"}}/>
      <div style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",zIndex:3,
        background:"#070A09",paddingRight:14,
        fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
        color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,textTransform:"uppercase",
        display:"flex",alignItems:"center",gap:8}}>
        <span style={{width:6,height:6,background:PHOSPHOR,
          boxShadow:`0 0 6px ${PHOSPHOR}`,
          animation:"phosphorPulse 1.6s ease infinite"}}/>
        LIVE · YIELDS
      </div>
      <div className="lp-ticker-track" style={{display:"flex",animation:"tickerScroll 110s linear infinite",
        whiteSpace:"nowrap",width:"max-content",willChange:"transform",paddingLeft:140}}>
        {seq.map((r,i)=>{
          const sign=r.d<0?"down":r.d>0?"up":"flat";
          const arrow=sign==="down"?"↓":sign==="up"?"↑":"→";
          const col=sign==="down"?SIG_UP:sign==="up"?SIG_DOWN:TERM_FG_MUTE;
          const isPin=pinnedCode===r.code;
          return(
            <span key={i}
              className={`lp-ticker-item lp-pin-item${isPin?" is-pinned":""}`}
              onClick={e=>{e.stopPropagation();onPin&&onPin(isPin?null:r);}}
              title={isPin?"Click to unpin":"Click to pin this benchmark"}
              style={{display:"inline-flex",alignItems:"baseline",gap:10,
              fontFamily:"'JetBrains Mono', monospace",fontSize:10.5,letterSpacing:"1px",fontWeight:500,
              padding:"3px 6px",margin:"-3px 38px -3px -6px"}}>
              <span style={{color:TERM_FG,fontWeight:600}}>{r.code}</span>
              <span style={{color:TERM_FG_DIM,fontSize:9.5,letterSpacing:".8px"}}>{r.label}</span>
              <span style={{color:TERM_FG,fontWeight:600,fontSize:12,fontVariantNumeric:"tabular-nums"}}>{r.y.toFixed(2)}%</span>
              <span style={{color:col,fontSize:10,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{arrow}{Math.abs(r.d).toFixed(2)}</span>
            </span>
          );
        })}
      </div>
    </section>
  );
}

function PinnedTickerPanel({item,onClose}){
  if(!item)return null;
  const sign=item.d<0?"down":item.d>0?"up":"flat";
  const arrow=sign==="down"?"↓":sign==="up"?"↑":"→";
  const col=sign==="down"?SIG_UP:sign==="up"?SIG_DOWN:TERM_FG_MUTE;
  // Stylised 12M sparkline points (deterministic from yield + delta)
  const baseY=item.y-item.d*8;
  const seedR=(n,seed)=>{const x=Math.sin((seed+n)*9301)*43758.5453;return x-Math.floor(x);};
  const pts=Array.from({length:12},(_,i)=>{
    const noise=(seedR(i,item.code.charCodeAt(0)+item.code.charCodeAt(1))-.5)*0.25;
    const trend=item.d*(i/11);
    return baseY+trend+noise;
  });
  const minY=Math.min(...pts),maxY=Math.max(...pts),rangeY=maxY-minY||1;
  const path="M "+pts.map((y,i)=>`${(i/(pts.length-1)*100).toFixed(1)} ${(100-((y-minY)/rangeY)*100).toFixed(1)}`).join(" L ");
  return(
    <section className="lp-pin-panel" style={{background:"#080B0A",
      borderBottom:`1px solid ${TERM_BORDER}`,position:"relative",overflow:"hidden"}}>
      <ScanLines opacity={.35}/>
      <div style={{maxWidth:1480,margin:"0 auto",padding:"18px 36px",
        display:"grid",gridTemplateColumns:"auto 1fr auto auto",gap:24,alignItems:"center",
        position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={{width:7,height:7,background:PHOSPHOR,
            boxShadow:`0 0 8px ${PHOSPHOR}`,
            animation:"phosphorPulse 1.6s ease infinite"}}/>
          <div>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
              color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,textTransform:"uppercase",
              marginBottom:3}}>📌 Pinned · Watching</div>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:18,
              color:TERM_FG,letterSpacing:"1.5px",fontWeight:700,
              fontVariantNumeric:"tabular-nums"}}>{item.code}</div>
          </div>
        </div>

        <div style={{minWidth:0}}>
          <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
            color:TERM_FG_MUTE,letterSpacing:"2px",fontWeight:500,
            textTransform:"uppercase",marginBottom:4}}>Asset · Location</div>
          <div style={{fontFamily:"'Onest',sans-serif",fontSize:14.5,
            color:TERM_FG,fontWeight:600,letterSpacing:"-.005em"}}>{item.label}</div>
          <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
            color:TERM_FG_DIM,letterSpacing:"1.5px",marginTop:3,
            textTransform:"uppercase",fontWeight:500}}>
            ↳ 12M trend · benchmark yield
          </div>
        </div>

        {/* Sparkline */}
        <div style={{width:160,height:60,position:"relative"}}>
          <svg width="160" height="60" viewBox="0 0 100 100" preserveAspectRatio="none"
            style={{display:"block",overflow:"visible"}}>
            <line x1="0" y1="50" x2="100" y2="50" stroke={TERM_BORDER} strokeWidth=".4" strokeDasharray="2 2"/>
            <path d={path} fill="none" stroke={col} strokeWidth="1.6"
              vectorEffect="non-scaling-stroke"/>
            <circle cx="100" cy={(100-((pts[pts.length-1]-minY)/rangeY)*100).toFixed(1)} r="2.5"
              fill={col} style={{filter:`drop-shadow(0 0 4px ${col})`}}/>
          </svg>
          <div style={{position:"absolute",left:0,bottom:-14,
            fontFamily:"'JetBrains Mono', monospace",fontSize:8.5,
            color:TERM_FG_MUTE,letterSpacing:"1px",
            textTransform:"uppercase",fontWeight:500}}>12M · BPS</div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
              color:TERM_FG_MUTE,letterSpacing:"2px",fontWeight:500,
              textTransform:"uppercase",marginBottom:4}}>Yield · Δ</div>
            <div style={{display:"flex",alignItems:"baseline",gap:10,
              fontFamily:"'JetBrains Mono', monospace"}}>
              <span style={{fontSize:24,color:TERM_FG,fontWeight:700,
                fontVariantNumeric:"tabular-nums",letterSpacing:"-.5px"}}>
                {item.y.toFixed(2)}<span style={{color:TERM_FG_MUTE,fontSize:14,fontWeight:500}}>%</span>
              </span>
              <span style={{color:col,fontSize:13,fontWeight:600,
                fontVariantNumeric:"tabular-nums",letterSpacing:".5px"}}>
                {arrow}{Math.abs(item.d).toFixed(2)}
              </span>
            </div>
          </div>
          <button onClick={e=>{e.stopPropagation();onClose();}}
            style={{background:"transparent",color:TERM_FG,
              border:`1px solid ${TERM_BORDER}`,
              fontFamily:"'JetBrains Mono', monospace",
              padding:"8px 12px",borderRadius:0,fontWeight:500,fontSize:10,
              cursor:"pointer",letterSpacing:"2px",textTransform:"uppercase"}}>
            × Unpin
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── DCFViewport — live calculation panel · the showpiece ── */
function DCFViewport(){
  const[assetIdx,setAssetIdx]=useState(0);
  const[waccBps,setWaccBps]=useState(800);
  const[growthBps,setGrowthBps]=useState(400);
  const[tickN,setTickN]=useState(0);
  const[changeKey,setChangeKey]=useState(0);

  useEffect(()=>{
    const i=setInterval(()=>setTickN(n=>n+1),1100);
    return()=>clearInterval(i);
  },[]);

  const asset=ASSETS[assetIdx];
  const wacc=waccBps/10000;
  const growth=growthBps/10000;

  const cycle=(arr,cur,setter)=>{
    const next=(arr.indexOf(cur)+1)%arr.length;
    setter(arr[next]);
    setChangeKey(k=>k+1);
  };
  const cycleAsset=()=>{ setAssetIdx(i=>(i+1)%ASSETS.length); setChangeKey(k=>k+1); };
  const cycleWacc=()=>cycle(WACC_STEPS,waccBps,setWaccBps);
  const cycleGrowth=()=>cycle(GROWTH_STEPS,growthBps,setGrowthBps);

  const years=[1,2,3,4,5].map(t=>{
    const noi=asset.noi*Math.pow(1+growth,t-1);
    const df=1/Math.pow(1+wacc,t);
    const pv=noi*df;
    return{t,noi,df,pv};
  });
  const npv=years.reduce((s,r)=>s+r.pv,0);
  // Terminal value: NOI(Y6) capitalised at (WACC - g), conventional Gordon growth
  const noiY6=asset.noi*Math.pow(1+growth,5);
  const terminalRate=Math.max(.005,wacc-growth);
  const terminal=noiY6/terminalRate;
  const tvPv=terminal/Math.pow(1+wacc,5);
  const totalPv=npv+tvPv;
  // Stylised derived metrics
  const irr=(wacc+(growth-0.04)*1.4)*100;
  const cap=(asset.noi/totalPv)*100;
  // Baseline (default state) for delta arrows
  const BASE_NPV=42180,BASE_IRR=8.40,BASE_CAP=5.75;
  const npvDelta=(totalPv-BASE_NPV)/BASE_NPV*100;
  const irrDelta=irr-BASE_IRR;
  const capDelta=cap-BASE_CAP;
  const tDir=(d,th=0.01)=>d>th?"up":d<-th?"down":"flat";
  const fmtM=v=>v.toLocaleString("en-MY",{maximumFractionDigits:0});

  return(
    <div style={{background:TERM_PANEL_S,border:`1px solid ${TERM_BORDER}`,
      fontFamily:"'JetBrains Mono', monospace",position:"relative",overflow:"hidden"}}>
      <ScanLines opacity={.55}/>

      {/* Header */}
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${TERM_BORDER}`,
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,
        background:"rgba(0,200,150,.045)",position:"relative",zIndex:1,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,fontSize:10,
          letterSpacing:"2px",textTransform:"uppercase",fontWeight:600}}>
          <span style={{width:7,height:7,background:PHOSPHOR,
            boxShadow:`0 0 8px ${PHOSPHOR}`,
            animation:"phosphorPulse 1.6s ease infinite"}}/>
          <span style={{color:TERM_FG}}>DCF · WKB {asset.wkb}</span>
          <span style={{color:TERM_FG_MUTE}}>·</span>
          <span style={{color:PHOSPHOR,fontWeight:500}}>INTERACTIVE</span>
        </div>
        <div style={{display:"flex",gap:6,fontSize:9.5,color:TERM_FG_DIM,
          letterSpacing:"1.4px",textTransform:"uppercase",fontWeight:500,alignItems:"baseline"}}>
          <span style={{color:TERM_FG_MUTE}}>WACC</span>
          <span className="lp-knob" onClick={cycleWacc} title="Tap to cycle">
            <span className="lp-knob-val" key={`wacc-${waccBps}`} style={{color:TERM_FG,fontWeight:600,
              fontVariantNumeric:"tabular-nums",animation:"numberTick .35s ease"}}>{(wacc*100).toFixed(2)}%</span>
            <span className="lp-knob-chev">▾</span>
          </span>
          <span style={{color:TERM_FG_MUTE,margin:"0 4px"}}>·</span>
          <span style={{color:TERM_FG_MUTE}}>g</span>
          <span className="lp-knob" onClick={cycleGrowth} title="Tap to cycle">
            <span className="lp-knob-val" key={`g-${growthBps}`} style={{color:TERM_FG,fontWeight:600,
              fontVariantNumeric:"tabular-nums",animation:"numberTick .35s ease"}}>{(growth*100).toFixed(2)}%</span>
            <span className="lp-knob-chev">▾</span>
          </span>
        </div>
      </div>

      {/* Asset subtitle — clickable */}
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${TERM_BORDER}`,
        display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14,
        position:"relative",zIndex:1}}>
        <div className="lp-knob" onClick={cycleAsset} title="Tap to cycle asset"
          style={{padding:"6px 10px",margin:"-6px -10px",alignItems:"flex-start",flex:"1 1 auto",minWidth:0}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:9.5,color:TERM_FG_DIM,letterSpacing:"1.8px",
              textTransform:"uppercase",fontWeight:500,marginBottom:5,
              display:"flex",alignItems:"center",gap:6}}>
              Asset <span className="lp-knob-chev" style={{fontSize:8}}>[TAP]</span>
            </div>
            <div className="lp-knob-val" key={`a-${assetIdx}`} style={{fontSize:14,color:TERM_FG,fontWeight:600,
              fontFamily:"'Onest',sans-serif",animation:"numberTick .4s ease"}}>{asset.asset}</div>
            <div style={{fontSize:11,color:TERM_FG_DIM,marginTop:2,
              fontFamily:"'Onest',sans-serif"}}>{asset.location}</div>
          </div>
        </div>
        <div style={{textAlign:"right",fontSize:9.5,color:TERM_FG_DIM,
          letterSpacing:"1.5px",textTransform:"uppercase",fontWeight:500,lineHeight:1.8,flexShrink:0}}>
          <div>5Y · HOLD</div>
          <div style={{color:TERM_FG_MUTE}}>RM '000</div>
        </div>
      </div>

      {/* Year header row */}
      <div style={{display:"grid",gridTemplateColumns:"66px repeat(5,1fr)",
        padding:"10px 16px 8px",borderBottom:`1px solid ${TERM_GRID}`,
        fontSize:9.5,color:TERM_FG_MUTE,letterSpacing:"1.5px",
        textTransform:"uppercase",fontWeight:500,position:"relative",zIndex:1}}>
        <span/>
        {years.map(r=>(
          <span key={r.t} style={{textAlign:"right"}}>Y<span style={{color:TERM_FG_DIM,marginLeft:2,fontWeight:600}}>{r.t}</span></span>
        ))}
      </div>

      {/* Data rows */}
      {[
        {label:"NOI",values:years.map(r=>r.noi),fmt:v=>fmtM(v)},
        {label:"DF",values:years.map(r=>r.df),fmt:v=>v.toFixed(3),mute:true},
        {label:"PV",values:years.map(r=>r.pv),fmt:v=>fmtM(v),highlight:true},
      ].map((row)=>(
        <div key={row.label} className="lp-dcf-row" style={{
          display:"grid",gridTemplateColumns:"66px repeat(5,1fr)",
          padding:"11px 16px",borderBottom:`1px solid ${TERM_GRID}`,
          background:row.highlight?"rgba(0,200,150,.04)":"transparent",
          alignItems:"center",position:"relative",zIndex:1}}>
          <span style={{fontSize:10,color:TERM_FG_DIM,letterSpacing:"1.8px",
            textTransform:"uppercase",fontWeight:600}}>{row.label}</span>
          {row.values.map((v,i)=>(
            <span key={`${row.label}-${i}-${changeKey}`}
              className={row.highlight?"lp-cell-flash":""}
              style={{textAlign:"right",
                fontVariantNumeric:"tabular-nums",
                fontSize:row.highlight?13:12,
                color:row.highlight?PHOSPHOR:row.mute?TERM_FG_DIM:TERM_FG,
                fontWeight:row.highlight?600:500,
                transition:"background .25s ease",padding:"3px 6px",margin:"-3px -6px"}}>
              {row.fmt(v)}
            </span>
          ))}
        </div>
      ))}

      {/* Terminal value row */}
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${TERM_BORDER}`,
        display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,
        background:"rgba(255,198,64,.045)",position:"relative",zIndex:1,flexWrap:"wrap"}}>
        <span style={{fontSize:10,color:AMBER,letterSpacing:"1.7px",
          textTransform:"uppercase",fontWeight:600,display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:5,height:5,background:AMBER}}/>
          Terminal · Y5
        </span>
        <span key={`tv-${changeKey}`} style={{fontSize:12.5,color:AMBER,fontWeight:600,
          fontVariantNumeric:"tabular-nums",letterSpacing:".5px",
          animation:"numberTick .35s ease"}}>
          {fmtM(terminal)} <span style={{color:"rgba(255,198,64,.55)"}}>→ PV</span> {fmtM(tvPv)}
        </span>
      </div>

      {/* Results row */}
      <div style={{padding:"22px 16px 20px",
        display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,
        background:"linear-gradient(180deg,rgba(0,200,150,.06) 0%,transparent 100%)",
        position:"relative",zIndex:1}}>
        {[
          {label:"NPV",sub:"PV + TV",value:fmtM(totalPv),unit:"RM '000",trend:tDir(npvDelta),delta:`${npvDelta>=0?"+":""}${npvDelta.toFixed(1)}%`},
          {label:"IRR",sub:"",value:`${irr.toFixed(2)}%`,unit:"",trend:tDir(irrDelta,0.005),delta:`${irrDelta>=0?"+":""}${(irrDelta*100).toFixed(0)} bps`},
          {label:"CAP",sub:"RATE",value:`${cap.toFixed(2)}%`,unit:"",trend:tDir(capDelta,0.05),delta:`${capDelta>=0?"+":""}${capDelta.toFixed(2)}`},
        ].map((r,i)=>(
          <div key={r.label} className="lp-dcf-result" style={{
            borderLeft:i>0?`1px solid ${TERM_BORDER}`:"none",
            paddingLeft:i>0?14:6,paddingTop:4,paddingBottom:4,marginTop:-4,marginBottom:-4}}>
            <div style={{fontSize:9,color:TERM_FG_DIM,letterSpacing:"1.5px",
              textTransform:"uppercase",fontWeight:500,marginBottom:6,
              display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span>{r.label}{r.sub&&<span style={{color:TERM_FG_MUTE,marginLeft:6}}>{r.sub}</span>}</span>
              {r.unit&&<span style={{opacity:.6,fontSize:8}}>{r.unit}</span>}
            </div>
            <div className="lp-dcf-result-val" key={`${r.label}-${changeKey}`} style={{fontSize:22,fontWeight:600,
              color:r.trend==="flat"?TERM_FG:PHOSPHOR,
              fontVariantNumeric:"tabular-nums",letterSpacing:"-.5px",lineHeight:1,
              transition:"text-shadow .2s ease",animation:"numberTick .4s ease"}}>
              {r.value}
            </div>
            <div style={{fontSize:9.5,color:r.trend==="up"?SIG_UP:r.trend==="down"?SIG_DOWN:TERM_FG_MUTE,
              marginTop:6,letterSpacing:"1.2px",fontWeight:600,textTransform:"uppercase"}}>
              {r.trend==="up"?"↗":r.trend==="down"?"↘":"→"} {r.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{padding:"9px 16px",borderTop:`1px solid ${TERM_BORDER}`,
        display:"flex",justifyContent:"space-between",alignItems:"center",
        background:"rgba(11,15,13,.5)",position:"relative",zIndex:1,
        fontSize:9,color:TERM_FG_MUTE,letterSpacing:"1.5px",
        textTransform:"uppercase",fontWeight:500,flexWrap:"wrap",gap:6}}>
        <span style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:4,height:4,background:PHOSPHOR,
            opacity:tickN%2?.4:1,transition:"opacity .2s"}}/>
          ↳ TAP WACC · g · ASSET TO ADJUST
        </span>
        <span>SRC · CBRE.RES</span>
        <span>VAL.MY/{asset.wkb}</span>
      </div>
    </div>
  );
}

/* ── Hero — split layout: command pane + DCF viewport ── */
function Hero({onEnter}){
  const wide=useIsWide(960);
  return(
    <section style={{position:"relative",background:TERM_BG,
      borderBottom:`1px solid ${TERM_BORDER}`,overflow:"hidden"}}>
      <ScanLines/>
      {/* Grid backdrop */}
      <div aria-hidden style={{position:"absolute",inset:0,zIndex:0,
        backgroundImage:`linear-gradient(${TERM_GRID} 1px,transparent 1px),linear-gradient(90deg,${TERM_GRID} 1px,transparent 1px)`,
        backgroundSize:"56px 56px",
        maskImage:"radial-gradient(ellipse 60% 70% at 50% 50%,#000 30%,transparent 80%)",
        WebkitMaskImage:"radial-gradient(ellipse 60% 70% at 50% 50%,#000 30%,transparent 80%)",
        opacity:.55,pointerEvents:"none"}}/>

      <div style={{maxWidth:1480,margin:"0 auto",width:"100%",
        padding:wide?"40px 36px":"32px 24px",
        position:"relative",zIndex:1,
        display:"grid",
        gridTemplateColumns:wide?"minmax(0,1fr) minmax(0,1fr)":"1fr",
        gap:wide?56:28,alignItems:"center"}}>

        {/* LEFT — command pane */}
        <div>
          {/* Breadcrumb / system path */}
          <div data-morph style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10,
            color:TERM_FG_DIM,letterSpacing:"2.2px",fontWeight:500,
            marginBottom:20,display:"flex",alignItems:"center",gap:10,
            textTransform:"uppercase"}}>
            <span style={{color:PHOSPHOR}}>[</span>
            <span style={{color:PHOSPHOR,fontWeight:600}}>DCF/04</span>
            <span style={{color:TERM_FG_MUTE}}>·</span>
            <span>Model Library</span>
            <span style={{color:PHOSPHOR}}>]</span>
            <span style={{flex:1,height:1,background:TERM_BORDER}}/>
            <span style={{color:TERM_FG_MUTE}}>v01.4</span>
          </div>

          <h1 data-morph style={{
            fontFamily:"'Onest', sans-serif",
            fontSize:"clamp(38px,5.2vw,68px)",
            fontWeight:600,
            lineHeight:.98,letterSpacing:"-.035em",
            color:TERM_FG,margin:"0 0 18px"}}>
            Discounted<br/>
            Cash Flow,<br/>
            <span style={{color:PHOSPHOR,position:"relative"}}>
              deployed
              <span aria-hidden style={{
                display:"inline-block",width:14,height:14,
                background:PHOSPHOR,marginLeft:10,marginBottom:6,
                verticalAlign:"middle",
                boxShadow:`0 0 14px ${PHOSPHOR}`}}/>
            </span>
          </h1>

          <p data-morph style={{fontFamily:"'Onest', sans-serif",
            fontSize:15,lineHeight:1.5,color:TERM_FG_DIM,
            maxWidth:520,margin:"0 0 26px",fontWeight:400}}>
            A precision library of pre-built DCF workbooks for the Malaysian property market. Wired by practicing valuers, calibrated against current CBRE research, deployed by you.
          </p>

          {/* ExecuteBar CTA */}
          <div data-morph>
            <ExecuteBar onComplete={onEnter}/>
            <div style={{marginTop:14,fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
              color:TERM_FG_MUTE,letterSpacing:"1.8px",textTransform:"uppercase",fontWeight:500}}>
              ↳ press &amp; hold the bar above to initiate
            </div>
          </div>

          {/* Stats row */}
          <div data-morph style={{marginTop:24,paddingTop:18,borderTop:`1px solid ${TERM_BORDER}`,
            display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0}}>
            {[
              ["Categories","04"],
              ["Workbooks","29"],
              ["Format","XLSX"],
              ["Region","MY"],
            ].map(([k,v],i,a)=>(
              <div key={k} className="lp-stat" style={{
                borderRight:i<a.length-1?`1px solid ${TERM_BORDER}`:"none",
                padding:i===0?"6px 14px 6px 0":"6px 14px",margin:"-6px 0"}}>
                <div className="lp-stat-label" style={{fontFamily:"'JetBrains Mono', monospace",
                  fontSize:9,color:TERM_FG_MUTE,letterSpacing:"1.8px",
                  textTransform:"uppercase",fontWeight:500,marginBottom:6,
                  transition:"color .2s ease"}}>
                  {k}
                </div>
                <div className="lp-stat-num" style={{fontFamily:"'JetBrains Mono', monospace",
                  fontSize:22,color:TERM_FG,fontWeight:600,
                  fontVariantNumeric:"tabular-nums",letterSpacing:"-.5px",
                  transition:"color .2s ease,text-shadow .2s ease"}}>
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — DCF viewport */}
        <div data-morph style={{position:"relative"}}>
          <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
            color:TERM_FG_MUTE,letterSpacing:"2px",fontWeight:500,
            marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",
            textTransform:"uppercase"}}>
            <span>—— sample workbook · live</span>
            <span>OPEN · KL · MYT</span>
          </div>
          <DCFViewport/>
          <div style={{marginTop:12,fontFamily:"'JetBrains Mono', monospace",fontSize:9,
            color:TERM_FG_MUTE,letterSpacing:"1.5px",textTransform:"uppercase",fontWeight:500,
            display:"flex",justifyContent:"space-between"}}>
            <span>↳ illustrative · not for direct use</span>
            <span>REF · DCF.WKB.014</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── S01 Mechanics — cash flow waterfall ── */
function WaterfallSection(){
  const wide=useIsWide(900);
  const[ref,v]=useInView(.12);
  const years=DCF_MODEL.noi.map((noi,i)=>{
    const t=i+1,df=1/Math.pow(1+DCF_MODEL.wacc,t),pv=noi*df;
    return{t,noi,df,pv};
  });
  const maxNOI=Math.max(...years.map(y=>y.noi));
  const npv=years.reduce((s,r)=>s+r.pv,0);
  const tvPv=DCF_MODEL.terminal/Math.pow(1+DCF_MODEL.wacc,5);
  const totalPv=npv+tvPv;

  return(
    <section ref={ref} style={{background:TERM_BG,padding:wide?"40px 36px":"32px 24px",
      position:"relative",borderBottom:`1px solid ${TERM_BORDER}`,overflow:"hidden"}}>
      <ScanLines/>
      <div style={{maxWidth:1320,margin:"0 auto",width:"100%",position:"relative",zIndex:1}}>
        {/* Section header */}
        <div data-morph style={{display:wide?"grid":"block",
          gridTemplateColumns:wide?"180px 1fr 240px":"1fr",
          gap:0,marginBottom:wide?28:22}}>
          <div style={{paddingRight:wide?28:0,marginBottom:wide?0:18}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10.5,
              color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,
              textTransform:"uppercase"}}>S01</div>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
              color:TERM_FG_DIM,letterSpacing:"1.5px",fontWeight:500,
              marginTop:6,textTransform:"uppercase"}}>Mechanics</div>
          </div>
          <div style={{padding:wide?"0 56px":"0"}}>
            <h2 style={{fontFamily:"'Onest', sans-serif",
              fontSize:"clamp(28px,3.6vw,48px)",fontWeight:600,
              lineHeight:1.02,letterSpacing:"-.025em",
              color:TERM_FG,margin:"0 0 12px"}}>
              Five years of cash,<br/>
              <span style={{color:PHOSPHOR}}>discounted to today.</span>
            </h2>
            <p style={{fontFamily:"'Onest', sans-serif",fontSize:14,lineHeight:1.5,
              color:TERM_FG_DIM,maxWidth:520,margin:0}}>
              Each year's net operating income is discounted by the WACC factor. Terminal value at exit caps the model. The present-value sum is your NPV.
            </p>
          </div>
          {wide && <div/>}
        </div>

        {/* Waterfall chart panel */}
        <div data-morph style={{background:TERM_PANEL_S,border:`1px solid ${TERM_BORDER}`,
          padding:wide?"24px 28px 22px":"20px 16px 20px",position:"relative"}}>
          <ScanLines opacity={.5}/>

          {/* Legend */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",
            marginBottom:18,flexWrap:"wrap",gap:14,position:"relative",zIndex:1,
            fontFamily:"'JetBrains Mono', monospace",fontSize:10,
            letterSpacing:"1.5px",textTransform:"uppercase"}}>
            <div style={{display:"flex",gap:18,color:TERM_FG_DIM,fontWeight:500,flexWrap:"wrap"}}>
              <span><span style={{display:"inline-block",width:10,height:10,
                border:`1px dashed ${TERM_FG_DIM}`,marginRight:6,verticalAlign:"middle"}}/>NOI</span>
              <span><span style={{display:"inline-block",width:10,height:10,
                background:PHOSPHOR,marginRight:6,verticalAlign:"middle"}}/>PV · discounted</span>
              <span><span style={{display:"inline-block",width:10,height:10,
                background:AMBER,marginRight:6,verticalAlign:"middle"}}/>Terminal PV</span>
            </div>
            <span style={{color:TERM_FG_MUTE,fontWeight:500}}>RM '000 · WACC 8.00%</span>
          </div>

          {/* Bar chart */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:wide?16:6,
            alignItems:"flex-end",height:wide?"min(32vh,250px)":160,position:"relative",zIndex:1}}>
            {years.map((y,i)=>{
              const noiH=(y.noi/maxNOI)*100;
              const pvH=(y.pv/maxNOI)*100;
              return(
                <div key={y.t} className="lp-bar" style={{position:"relative",height:"100%"}}>
                  {/* NOI outline (full height) */}
                  <div className="lp-bar-noi" style={{position:"absolute",bottom:0,left:0,right:0,
                    height:`${noiH}%`,
                    border:`1px dashed ${TERM_BORDER}`,borderBottom:"none",
                    transformOrigin:"bottom",
                    transform:v?"scaleY(1)":"scaleY(0)",
                    transition:`transform .8s cubic-bezier(.22,1,.36,1) ${i*.1}s,border-color .2s ease,background .2s ease`}}/>
                  {/* PV fill */}
                  <div className="lp-bar-pv" style={{position:"absolute",bottom:0,left:0,right:0,
                    height:`${pvH}%`,
                    background:`linear-gradient(180deg,${PHOSPHOR} 0%,${PHOSPHOR_DIM} 100%)`,
                    transformOrigin:"bottom",
                    transform:v?"scaleY(1)":"scaleY(0)",
                    transition:`transform .9s cubic-bezier(.22,1,.36,1) ${.15+i*.1}s,filter .2s ease,box-shadow .2s ease`,
                    boxShadow:`inset 0 1px 0 rgba(56,239,166,.45)`}}/>
                  {wide && (
                    <div className="lp-bar-label" style={{position:"absolute",
                      top:`${100-noiH}%`,marginTop:-22,
                      left:0,right:0,textAlign:"center",pointerEvents:"none",
                      fontFamily:"'JetBrains Mono', monospace",fontSize:10,
                      color:TERM_FG,letterSpacing:".5px",fontWeight:600,
                      fontVariantNumeric:"tabular-nums",
                      transition:"color .2s ease,text-shadow .2s ease"}}>
                      {Math.round(y.noi).toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Terminal value bar */}
            <div className="lp-bar" style={{position:"relative",height:"100%"}}>
              <div className="lp-bar-pv" style={{position:"absolute",bottom:0,left:0,right:0,
                height:`${Math.min(98,(tvPv/maxNOI)*100*.5)}%`,
                background:`linear-gradient(180deg,${AMBER} 0%,#9F7A1A 100%)`,
                transformOrigin:"bottom",
                transform:v?"scaleY(1)":"scaleY(0)",
                transition:`transform 1s cubic-bezier(.22,1,.36,1) .65s,filter .2s ease,box-shadow .2s ease`,
                boxShadow:`inset 0 1px 0 rgba(255,198,64,.5)`}}/>
              {wide && (
                <div className="lp-bar-label" style={{position:"absolute",
                  top:`${100-Math.min(98,(tvPv/maxNOI)*100*.5)}%`,marginTop:-22,
                  left:0,right:0,textAlign:"center",pointerEvents:"none",
                  fontFamily:"'JetBrains Mono', monospace",fontSize:10,
                  color:AMBER,letterSpacing:".5px",fontWeight:600,
                  fontVariantNumeric:"tabular-nums",
                  transition:"color .2s ease,text-shadow .2s ease"}}>
                  {Math.round(tvPv).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* X-axis */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:wide?16:6,
            marginTop:10,borderTop:`1px solid ${TERM_BORDER}`,paddingTop:10,
            position:"relative",zIndex:1}}>
            {years.map(y=>(
              <div key={y.t} style={{textAlign:"center",
                fontFamily:"'JetBrains Mono', monospace",fontSize:10,
                color:TERM_FG_DIM,letterSpacing:"1.5px",fontWeight:600,
                textTransform:"uppercase"}}>
                Y{y.t}<br/>
                <span style={{color:TERM_FG_MUTE,fontWeight:500,fontSize:9}}>
                  DF {y.df.toFixed(3)}
                </span>
              </div>
            ))}
            <div style={{textAlign:"center",
              fontFamily:"'JetBrains Mono', monospace",fontSize:10,
              color:AMBER,letterSpacing:"1.5px",fontWeight:600,
              textTransform:"uppercase"}}>
              TV<br/>
              <span style={{color:"#9F7A1A",fontWeight:500,fontSize:9}}>EXIT</span>
            </div>
          </div>

          {/* Result */}
          <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${TERM_BORDER}`,
            display:"flex",justifyContent:"space-between",alignItems:"baseline",
            flexWrap:"wrap",gap:18,position:"relative",zIndex:1}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10,
              color:TERM_FG_DIM,letterSpacing:"2px",textTransform:"uppercase",fontWeight:500,
              maxWidth:320}}>
              ↳ Σ Operating-PV + Terminal-PV = present-value sum
            </div>
            <div style={{display:"flex",alignItems:"baseline",gap:16,
              fontFamily:"'JetBrains Mono', monospace"}}>
              <span style={{fontSize:10,color:TERM_FG_DIM,letterSpacing:"2px",
                textTransform:"uppercase",fontWeight:600}}>NPV →</span>
              <span style={{fontSize:30,color:PHOSPHOR,fontWeight:600,
                fontVariantNumeric:"tabular-nums",letterSpacing:"-.5px"}}>
                {totalPv.toLocaleString("en-MY",{maximumFractionDigits:0})}
              </span>
              <span style={{fontSize:11,color:TERM_FG_MUTE,letterSpacing:"1.5px",
                textTransform:"uppercase",fontWeight:500}}>RM '000</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── S02 Index — workbook catalog grid ── */
function IndexSection(){
  const wide=useIsWide(800);
  const[ref,v]=useInView(.08);
  const[opened,setOpened]=useState(null);
  return(
    <section ref={ref} style={{background:TERM_BG,padding:wide?"40px 36px":"32px 24px",
      borderBottom:`1px solid ${TERM_BORDER}`,position:"relative",overflow:"hidden"}}>
      <ScanLines/>
      <div style={{maxWidth:1320,margin:"0 auto",width:"100%",position:"relative",zIndex:1}}>
        <div data-morph style={{display:wide?"grid":"block",
          gridTemplateColumns:wide?"180px 1fr 240px":"1fr",gap:0,marginBottom:wide?28:22}}>
          <div style={{paddingRight:wide?28:0,marginBottom:wide?0:18}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10.5,
              color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,
              textTransform:"uppercase"}}>S02</div>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
              color:TERM_FG_DIM,letterSpacing:"1.5px",fontWeight:500,
              marginTop:6,textTransform:"uppercase"}}>Index · <span style={{color:PHOSPHOR}}>Tap a row</span></div>
          </div>
          <div style={{padding:wide?"0 56px":"0"}}>
            <h2 style={{fontFamily:"'Onest', sans-serif",
              fontSize:"clamp(28px,3.6vw,48px)",fontWeight:600,
              lineHeight:1.02,letterSpacing:"-.025em",
              color:TERM_FG,margin:0}}>
              Four classes,<br/>
              <span style={{color:PHOSPHOR}}>twenty-nine workbooks.</span>
            </h2>
          </div>
        </div>

        <div style={{display:"grid",
          gridTemplateColumns:wide?"repeat(2,1fr)":"1fr",gap:0,
          border:`1px solid ${TERM_BORDER}`,background:TERM_PANEL_S}}>
          {CATEGORIES.map((c,i)=>{
            const isOpen=opened===c.code;
            const fullTypes=(TMPLS.find(t=>t.id===c.id)?.types)||[];
            return(
            <div key={c.code} className="lp-card" data-morph
              onClick={e=>{e.stopPropagation();setOpened(isOpen?null:c.code);}}
              style={{
                padding:wide?"24px 28px":"20px 18px",
                borderRight:wide&&i%2===0?`1px solid ${TERM_BORDER}`:"none",
                borderBottom:wide?(i<CATEGORIES.length-2?`1px solid ${TERM_BORDER}`:"none"):(i<CATEGORIES.length-1?`1px solid ${TERM_BORDER}`:"none"),
                position:"relative",cursor:"pointer",
                background:isOpen?"rgba(0,200,150,.05)":undefined,
                opacity:v?1:0,transform:v?"translateY(0)":"translateY(14px)",
                transition:`opacity .6s ease ${i*.1}s,transform .6s cubic-bezier(.22,1,.36,1) ${i*.1}s,border-color .22s ease,background .22s ease,box-shadow .25s ease`}}>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",
                marginBottom:10}}>
                <div style={{display:"flex",alignItems:"baseline",gap:12}}>
                  <span className="lp-card-num" style={{fontFamily:"'JetBrains Mono', monospace",fontSize:11,
                    color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,
                    textTransform:"uppercase",
                    transition:"color .2s ease,text-shadow .2s ease"}}>{c.n}</span>
                  <span style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
                    color:TERM_FG_MUTE,letterSpacing:"2px",fontWeight:500,
                    textTransform:"uppercase"}}>[{c.code}]</span>
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:8,
                  fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
                  color:TERM_FG_DIM,letterSpacing:"1.5px",
                  textTransform:"uppercase",fontWeight:500}}>
                  <span style={{color:TERM_FG,fontSize:14,fontWeight:600,
                    fontVariantNumeric:"tabular-nums"}}>{c.types}</span>
                  <span>WKB</span>
                </div>
              </div>

              <h3 className="lp-card-name" style={{fontFamily:"'Onest', sans-serif",fontSize:22,
                fontWeight:600,letterSpacing:"-.02em",lineHeight:1.05,
                color:TERM_FG,margin:"0 0 4px",
                transition:"color .2s ease",
                display:"flex",alignItems:"center",gap:14}}>
                {c.name}
                <span className="lp-card-arrow" style={{
                  fontFamily:"'JetBrains Mono', monospace",fontSize:18,fontWeight:500,
                  color:TERM_FG_MUTE,
                  opacity:isOpen?1:0,
                  transform:isOpen?"rotate(90deg)":"translateX(-8px)",
                  transition:"opacity .25s ease,transform .25s ease,color .2s ease"}}>→</span>
              </h3>

              <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10,
                color:TERM_FG_DIM,letterSpacing:"1.2px",fontWeight:500,
                marginBottom:12,textTransform:"uppercase"}}>{c.subtitle}</div>

              {!isOpen && (
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {c.sample.map(s=>(
                    <span key={s} className="lp-chip" style={{
                      fontFamily:"'JetBrains Mono', monospace",fontSize:10,
                      padding:"4px 10px",border:`1px solid ${TERM_BORDER}`,
                      color:TERM_FG_DIM,letterSpacing:".5px",
                      background:"rgba(0,200,150,.02)"}}>
                      {s}
                    </span>
                  ))}
                  <span className="lp-expand-link"
                    onClick={e=>{e.stopPropagation();setOpened(c.code);}}>
                    + {c.types-c.sample.length} more →
                  </span>
                </div>
              )}

              {isOpen && (
                <div className="lp-expand-grid">
                  <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",
                    paddingBottom:10,marginBottom:10,
                    borderBottom:`1px solid ${TERM_BORDER}`}}>
                    <span style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10,
                      color:PHOSPHOR,letterSpacing:"2px",fontWeight:600,
                      textTransform:"uppercase"}}>All {c.types} workbooks</span>
                    <span className="lp-expand-link"
                      onClick={e=>{e.stopPropagation();setOpened(null);}}
                      style={{fontSize:9.5,padding:"3px 8px"}}>× Collapse</span>
                  </div>
                  <div style={{display:"grid",
                    gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:6}}>
                    {fullTypes.map((pt,ti)=>(
                      <div key={pt.id} style={{
                        padding:"8px 10px",
                        border:`1px solid ${TERM_BORDER}`,
                        background:"rgba(0,200,150,.03)",
                        transition:"border-color .15s ease,background .15s ease",
                        opacity:0,animation:`inkFade .4s ease ${ti*.02}s forwards`}}>
                        <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:2}}>
                          <span style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9,
                            color:TERM_FG_MUTE,letterSpacing:"1px",fontWeight:500}}>
                            {String(ti+1).padStart(2,"0")}
                          </span>
                          <span style={{fontFamily:"'Onest',sans-serif",fontSize:12,
                            color:TERM_FG,fontWeight:600,letterSpacing:"-.005em"}}>
                            {pt.label}
                          </span>
                        </div>
                        <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9,
                          color:TERM_FG_DIM,letterSpacing:".3px",
                          textTransform:"uppercase",fontWeight:500}}>
                          {pt.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );})}
        </div>
      </div>
    </section>
  );
}

/* ── S03 Methodology — formula notation ── */
function MethodologySection(){
  const wide=useIsWide(900);
  const[ref,v]=useInView(.1);
  return(
    <section ref={ref} style={{background:"#080B0A",padding:wide?"40px 36px":"32px 24px",
      borderBottom:`1px solid ${TERM_BORDER}`,position:"relative",overflow:"hidden"}}>
      <ScanLines/>
      <div style={{maxWidth:1320,margin:"0 auto",width:"100%",position:"relative",zIndex:1}}>
        <div data-morph style={{display:wide?"grid":"block",
          gridTemplateColumns:wide?"180px 1fr 240px":"1fr",gap:0,marginBottom:wide?24:20}}>
          <div style={{paddingRight:wide?28:0,marginBottom:wide?0:18}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10.5,
              color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,
              textTransform:"uppercase"}}>S03</div>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
              color:TERM_FG_DIM,letterSpacing:"1.5px",fontWeight:500,
              marginTop:6,textTransform:"uppercase"}}>Methodology</div>
          </div>
          <div style={{padding:wide?"0 56px":"0"}}>
            <h2 style={{fontFamily:"'Onest', sans-serif",
              fontSize:"clamp(28px,3.6vw,48px)",fontWeight:600,
              lineHeight:1.02,letterSpacing:"-.025em",
              color:TERM_FG,margin:0}}>
              The maths,<br/>
              <span style={{color:PHOSPHOR}}>made transparent.</span>
            </h2>
          </div>
        </div>

        <div style={{display:"grid",
          gridTemplateColumns:wide?"repeat(3,1fr)":"1fr",gap:0,
          border:`1px solid ${TERM_BORDER}`,background:TERM_PANEL_S}}>
          {FORMULAS.map((f,i)=>(
            <div key={f.key} className="lp-formula" data-morph style={{
              padding:wide?"22px 22px":"20px 16px",
              borderRight:wide&&i<FORMULAS.length-1?`1px solid ${TERM_BORDER}`:"none",
              borderBottom:!wide&&i<FORMULAS.length-1?`1px solid ${TERM_BORDER}`:"none",
              opacity:v?1:0,transform:v?"translateY(0)":"translateY(12px)",
              transition:`opacity .6s ease ${i*.12}s,transform .6s cubic-bezier(.22,1,.36,1) ${i*.12}s,border-color .2s ease,background .2s ease,box-shadow .2s ease`}}>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",
                marginBottom:14}}>
                <span className="lp-formula-key" style={{fontFamily:"'JetBrains Mono', monospace",fontSize:11,
                  color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,
                  textTransform:"uppercase",
                  transition:"color .2s ease,text-shadow .2s ease"}}>{f.key}</span>
                <span style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
                  color:TERM_FG_MUTE,letterSpacing:"1.5px",fontWeight:500,
                  textTransform:"uppercase"}}>F · 0{i+1}</span>
              </div>

              <h3 style={{fontFamily:"'Onest', sans-serif",fontSize:17,
                fontWeight:600,letterSpacing:"-.015em",
                color:TERM_FG,margin:"0 0 12px"}}>{f.label}</h3>

              <div className="lp-formula-eq" style={{padding:"12px 14px",background:TERM_BG,
                border:`1px solid ${TERM_BORDER}`,marginBottom:12,
                fontFamily:"'JetBrains Mono', monospace",fontSize:13,
                color:TERM_FG,letterSpacing:".3px",fontWeight:500,
                wordBreak:"break-word",lineHeight:1.55,
                transition:"border-color .2s ease,background .2s ease,color .2s ease"}}>
                {f.eq}
              </div>

              <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
                color:TERM_FG_MUTE,letterSpacing:"2px",fontWeight:600,
                textTransform:"uppercase",marginBottom:6}}>
                where
              </div>

              {f.where.map(([sym,def])=>(
                <div key={sym} style={{display:"flex",alignItems:"baseline",
                  gap:14,padding:"4px 0",borderBottom:`1px solid ${TERM_GRID}`,
                  fontSize:11.5,color:TERM_FG_DIM,lineHeight:1.35}}>
                  <span style={{fontFamily:"'JetBrains Mono', monospace",
                    color:TERM_FG,fontWeight:600,minWidth:62,letterSpacing:".5px"}}>
                    {sym}
                  </span>
                  <span style={{fontFamily:"'Onest', sans-serif"}}>{def}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{marginTop:12,display:"flex",justifyContent:"space-between",
          fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
          color:TERM_FG_MUTE,letterSpacing:"1.5px",fontWeight:500,
          textTransform:"uppercase",flexWrap:"wrap",gap:8}}>
          <span>↳ References · Damodaran 2024 · CBRE Research · RICS</span>
          <span>P · 03</span>
        </div>
      </div>
    </section>
  );
}

/* ── S04 Sensitivity — interactive WACC × Terminal-growth heatmap ── */
const SENS_NOI=[1000,1050,1100,1155,1212];      // RM '000 · 5-year forecast
const SENS_WACC=[7.0,7.5,8.0,8.5,9.0,9.5,10.0]; // % discount rate axis
const SENS_G   =[1.0,2.0,3.0,4.0,5.0];          // % terminal-growth axis
const SENS_BASE={wacc:8.5,g:3.0};

function sensCompute(waccPct,gPct){
  const wacc=waccPct/100,g=gPct/100;
  let opPv=0;
  for(let i=0;i<SENS_NOI.length;i++) opPv+=SENS_NOI[i]/Math.pow(1+wacc,i+1);
  const noi6=SENS_NOI[SENS_NOI.length-1]*(1+g);
  const tv=noi6/Math.max(wacc-g,0.0001);
  const tvPv=tv/Math.pow(1+wacc,SENS_NOI.length);
  return{opPv,tvPv,total:opPv+tvPv};
}

function DeploySection(){
  const wide=useIsWide(900);
  const[ref,v]=useInView(.12);
  const[sel,setSel]=useState(SENS_BASE);
  const[hover,setHover]=useState(null);

  const grid=SENS_G.map(g=>SENS_WACC.map(w=>({w,g,...sensCompute(w,g)})));
  const flat=grid.flat();
  const min=Math.min(...flat.map(c=>c.total));
  const max=Math.max(...flat.map(c=>c.total));
  const base=sensCompute(SENS_BASE.wacc,SENS_BASE.g);
  const selR=sensCompute(sel.wacc,sel.g);
  const delta=((selR.total-base.total)/base.total)*100;

  const cellFor=(w,g)=>grid[SENS_G.indexOf(g)][SENS_WACC.indexOf(w)];
  const cellBg=(npv)=>{
    const t=(npv-min)/(max-min||1);
    if(t<.5){
      const k=t/.5;
      return `rgba(255,198,64,${0.05+(1-k)*0.18})`;
    }
    const k=(t-.5)/.5;
    return `rgba(0,200,150,${0.06+k*0.32})`;
  };
  const cellFg=(npv)=>{
    const t=(npv-min)/(max-min||1);
    if(t<.35)return AMBER;
    if(t>.7)return PHOSPHOR;
    return TERM_FG;
  };

  return(
    <section ref={ref} style={{background:TERM_BG,padding:wide?"40px 36px":"32px 24px",
      borderTop:`1px solid ${TERM_BORDER}`,position:"relative",overflow:"hidden"}}>
      <ScanLines/>
      <div aria-hidden style={{position:"absolute",inset:0,zIndex:0,
        backgroundImage:`linear-gradient(${TERM_GRID} 1px,transparent 1px),linear-gradient(90deg,${TERM_GRID} 1px,transparent 1px)`,
        backgroundSize:"56px 56px",
        maskImage:"radial-gradient(ellipse 55% 65% at 50% 50%,#000 0%,transparent 75%)",
        WebkitMaskImage:"radial-gradient(ellipse 55% 65% at 50% 50%,#000 0%,transparent 75%)",
        opacity:.7,pointerEvents:"none"}}/>

      <div style={{maxWidth:1320,margin:"0 auto",width:"100%",position:"relative",zIndex:1}}>
        {/* Header */}
        <div data-morph style={{display:wide?"grid":"block",
          gridTemplateColumns:wide?"180px 1fr 240px":"1fr",gap:0,marginBottom:wide?22:18}}>
          <div style={{paddingRight:wide?28:0,marginBottom:wide?0:18}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10.5,
              color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,
              textTransform:"uppercase"}}>S04</div>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
              color:TERM_FG_DIM,letterSpacing:"1.5px",fontWeight:500,
              marginTop:6,textTransform:"uppercase"}}>Sensitivity · <span style={{color:PHOSPHOR}}>Tap a cell</span></div>
          </div>
          <div style={{padding:wide?"0 56px":"0"}}>
            <h2 style={{fontFamily:"'Onest', sans-serif",
              fontSize:"clamp(28px,3.6vw,48px)",fontWeight:600,
              lineHeight:1.02,letterSpacing:"-.025em",
              color:TERM_FG,margin:"0 0 10px"}}>
              WACC × Terminal g, <br/>
              <span style={{color:PHOSPHOR}}>see the swing.</span>
            </h2>
            <p style={{fontFamily:"'Onest', sans-serif",fontSize:13.5,lineHeight:1.5,
              color:TERM_FG_DIM,maxWidth:520,margin:0}}>
              The same 5-year NOI forecast across every discount rate and terminal-growth assumption. Pick a cell to lock the scenario and watch operating PV and terminal PV recompose.
            </p>
          </div>
        </div>

        {/* Heatmap + detail */}
        <div data-morph style={{display:"grid",
          gridTemplateColumns:wide?"1fr 280px":"1fr",gap:wide?20:14,
          alignItems:"start"}}>

          {/* Heatmap panel */}
          <div style={{background:TERM_PANEL_S,border:`1px solid ${TERM_BORDER}`,
            padding:wide?"18px 18px 14px":"14px 12px 10px",position:"relative",overflow:"hidden"}}>
            <ScanLines opacity={.45}/>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",
              marginBottom:14,position:"relative",zIndex:1,
              fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
              color:TERM_FG_MUTE,letterSpacing:"1.8px",textTransform:"uppercase",fontWeight:500,
              flexWrap:"wrap",gap:8}}>
              <span>↓ Terminal g · → WACC discount</span>
              <span>NPV · RM '000 · Σ 5-yr + TV</span>
            </div>

            <div style={{position:"relative",zIndex:1,overflowX:"auto"}}>
              <div style={{display:"grid",
                gridTemplateColumns:`56px repeat(${SENS_WACC.length},minmax(0,1fr))`,
                gap:2,minWidth:wide?"auto":520}}>

                <div/>
                {SENS_WACC.map(w=>(
                  <div key={w} style={{textAlign:"center",padding:"6px 0 8px",
                    fontFamily:"'JetBrains Mono', monospace",fontSize:10,
                    color:hover?.w===w||sel.wacc===w?PHOSPHOR:TERM_FG_DIM,
                    letterSpacing:"1px",fontWeight:600,fontVariantNumeric:"tabular-nums",
                    transition:"color .15s ease,text-shadow .15s ease",
                    textShadow:sel.wacc===w?`0 0 6px ${PHOSPHOR}`:"none"}}>
                    {w.toFixed(1)}%
                  </div>
                ))}

                {SENS_G.map(g=>(
                  <Fragment key={g}>
                    <div style={{textAlign:"right",padding:"0 10px 0 0",
                      display:"flex",alignItems:"center",justifyContent:"flex-end",
                      fontFamily:"'JetBrains Mono', monospace",fontSize:10,
                      color:hover?.g===g||sel.g===g?PHOSPHOR:TERM_FG_DIM,
                      letterSpacing:"1px",fontWeight:600,fontVariantNumeric:"tabular-nums",
                      transition:"color .15s ease,text-shadow .15s ease",
                      textShadow:sel.g===g?`0 0 6px ${PHOSPHOR}`:"none"}}>
                      g {g.toFixed(1)}%
                    </div>
                    {SENS_WACC.map(w=>{
                      const c=cellFor(w,g);
                      const isSel=sel.wacc===w&&sel.g===g;
                      const isHov=hover?.w===w&&hover?.g===g;
                      return(
                        <button key={w} type="button"
                          onClick={()=>setSel({wacc:w,g})}
                          onMouseEnter={()=>setHover({w,g})}
                          onMouseLeave={()=>setHover(null)}
                          style={{
                            background:cellBg(c.total),
                            border:isSel?`1px solid ${PHOSPHOR}`:`1px solid ${TERM_BORDER}`,
                            padding:"10px 4px",cursor:"pointer",
                            fontFamily:"'JetBrains Mono', monospace",fontSize:11.5,
                            color:cellFg(c.total),
                            fontWeight:isSel?700:500,fontVariantNumeric:"tabular-nums",
                            letterSpacing:"-.2px",
                            outline:"none",
                            transition:"background .15s ease,border-color .15s ease,transform .12s ease,box-shadow .15s ease",
                            transform:isHov?"scale(1.04)":"scale(1)",
                            boxShadow:isSel?`inset 0 0 0 1px ${PHOSPHOR}, 0 0 14px rgba(0,200,150,.35)`:isHov?`0 0 10px rgba(0,200,150,.18)`:"none",
                            zIndex:isSel?2:isHov?1:0,
                            position:"relative"}}>
                          {Math.round(c.total).toLocaleString()}
                        </button>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>

            <div style={{marginTop:14,paddingTop:10,borderTop:`1px solid ${TERM_BORDER}`,
              display:"flex",justifyContent:"space-between",alignItems:"center",
              flexWrap:"wrap",gap:10,position:"relative",zIndex:1,
              fontFamily:"'JetBrains Mono', monospace",fontSize:9,
              color:TERM_FG_MUTE,letterSpacing:"1.5px",textTransform:"uppercase",fontWeight:500}}>
              <span>Lower NPV</span>
              <div style={{flex:1,maxWidth:280,height:6,
                background:`linear-gradient(90deg,rgba(255,198,64,.5),rgba(40,49,41,.5),rgba(0,200,150,.55))`,
                border:`1px solid ${TERM_BORDER}`}}/>
              <span style={{color:PHOSPHOR}}>Higher NPV</span>
            </div>
          </div>

          {/* Selected scenario panel */}
          <div style={{background:TERM_PANEL_S,border:`1px solid ${TERM_BORDER}`,
            padding:wide?"18px 18px":"16px 16px",position:"relative",overflow:"hidden"}}>
            <ScanLines opacity={.45}/>
            <div style={{position:"relative",zIndex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",
                marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${TERM_BORDER}`,
                fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
                color:TERM_FG_MUTE,letterSpacing:"2px",textTransform:"uppercase",fontWeight:600}}>
                <span style={{color:PHOSPHOR}}>Selected</span>
                <span>SCN · {String(SENS_G.indexOf(sel.g)*SENS_WACC.length+SENS_WACC.indexOf(sel.wacc)+1).padStart(2,"0")}</span>
              </div>

              <div style={{display:"flex",gap:18,marginBottom:16,
                fontFamily:"'JetBrains Mono', monospace"}}>
                <div>
                  <div style={{fontSize:9,color:TERM_FG_MUTE,letterSpacing:"1.8px",
                    textTransform:"uppercase",fontWeight:600,marginBottom:4}}>WACC</div>
                  <div style={{fontSize:20,color:PHOSPHOR,fontWeight:600,
                    fontVariantNumeric:"tabular-nums",letterSpacing:"-.5px"}}>
                    {sel.wacc.toFixed(1)}%
                  </div>
                </div>
                <div style={{width:1,background:TERM_BORDER}}/>
                <div>
                  <div style={{fontSize:9,color:TERM_FG_MUTE,letterSpacing:"1.8px",
                    textTransform:"uppercase",fontWeight:600,marginBottom:4}}>Term · g</div>
                  <div style={{fontSize:20,color:AMBER,fontWeight:600,
                    fontVariantNumeric:"tabular-nums",letterSpacing:"-.5px"}}>
                    {sel.g.toFixed(1)}%
                  </div>
                </div>
              </div>

              {[
                ["5-yr Op PV",selR.opPv,TERM_FG],
                ["Terminal PV",selR.tvPv,AMBER],
              ].map(([k,val,col])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",
                  alignItems:"baseline",padding:"7px 0",
                  borderBottom:`1px solid ${TERM_GRID}`,
                  fontFamily:"'JetBrains Mono', monospace"}}>
                  <span style={{fontSize:10,color:TERM_FG_DIM,letterSpacing:"1.5px",
                    textTransform:"uppercase",fontWeight:500}}>{k}</span>
                  <span style={{fontSize:13,color:col,fontWeight:600,
                    fontVariantNumeric:"tabular-nums",letterSpacing:"-.3px"}}>
                    {Math.round(val).toLocaleString()}
                  </span>
                </div>
              ))}

              <div style={{marginTop:14,padding:"12px 12px",
                background:"rgba(0,200,150,.06)",
                border:`1px solid ${PHOSPHOR_DIM}`}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"baseline",marginBottom:6,
                  fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
                  color:PHOSPHOR,letterSpacing:"2px",textTransform:"uppercase",fontWeight:600}}>
                  <span>NPV →</span>
                  <span style={{color:TERM_FG_MUTE,fontWeight:500}}>RM '000</span>
                </div>
                <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:28,
                  color:PHOSPHOR,fontWeight:600,fontVariantNumeric:"tabular-nums",
                  letterSpacing:"-.8px",lineHeight:1,
                  textShadow:`0 0 18px rgba(0,200,150,.4)`}}>
                  {Math.round(selR.total).toLocaleString()}
                </div>
              </div>

              <div style={{marginTop:10,display:"flex",justifyContent:"space-between",
                alignItems:"baseline",
                fontFamily:"'JetBrains Mono', monospace",fontSize:10,
                color:TERM_FG_MUTE,letterSpacing:"1.5px",textTransform:"uppercase",fontWeight:500}}>
                <span>vs base ({SENS_BASE.wacc.toFixed(1)} · {SENS_BASE.g.toFixed(1)})</span>
                <span style={{color:delta>=0?SIG_UP:SIG_DOWN,fontWeight:600,
                  fontVariantNumeric:"tabular-nums",fontSize:12}}>
                  {delta>=0?"+":""}{delta.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div data-morph style={{marginTop:12,display:"flex",justifyContent:"space-between",
          flexWrap:"wrap",gap:14,opacity:v?1:0,
          transition:"opacity .5s ease .25s",
          fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
          color:TERM_FG_MUTE,letterSpacing:"1.5px",fontWeight:500,
          textTransform:"uppercase"}}>
          <span>↳ Σ Operating-PV + Terminal-PV · 5-yr horizon · Gordon-growth TV</span>
          <span>P · 04</span>
        </div>
      </div>
    </section>
  );
}

/* ── Section morph — elements within each section morph in/out per piece ── */
const LP_SECTIONS=[
  {id:"lp-sec-0",num:"S00",label:"ACCESS"},
  {id:"lp-sec-1",num:"S01",label:"MECHANICS"},
  {id:"lp-sec-2",num:"S02",label:"INDEX"},
  {id:"lp-sec-3",num:"S03",label:"METHOD"},
  {id:"lp-sec-4",num:"S04",label:"SENSITIVITY"},
];
const SCATTER_DUR=520;
const ASSEMBLE_DUR=620;
const SCROLL_DUR=720;

function getMorphBlocks(secWrap){
  if(!secWrap)return [];
  // explicit per-section morph targets, ordered top→bottom of the DOM
  return Array.from(secWrap.querySelectorAll("[data-morph]")).slice(0,12);
}

function clearMorph(el){
  el.style.transition="";
  el.style.transform="";
  el.style.opacity="";
  el.style.filter="";
  el.style.willChange="";
}

function LandingPage({onEnter,scrollRef,active}){
  const[pinned,setPinned]=useState(null);
  const[hint,setHint]=useState(true);
  const busyRef=useRef(false);
  const trackedRef=useRef([]);

  const jump=useCallback(dir=>{
    if(busyRef.current)return;
    const cont=scrollRef?.current;if(!cont)return;
    const cTop=cont.getBoundingClientRect().top;
    // nearest-by-top so wrap-around S04→S00 always detects S04 correctly,
    // even when the last section can't scroll its top fully to the container top.
    let cur=0,bestD=Infinity;
    LP_SECTIONS.forEach((s,i)=>{
      const el=document.getElementById(s.id);
      if(!el)return;
      const d=Math.abs(el.getBoundingClientRect().top-cTop);
      if(d<bestD){bestD=d;cur=i;}
    });
    const next=(cur+dir+LP_SECTIONS.length)%LP_SECTIONS.length;
    const srcWrap=document.getElementById(LP_SECTIONS[cur].id);
    const dstWrap=document.getElementById(LP_SECTIONS[next].id);
    if(!dstWrap)return;
    const dest=next===0?0
      :(dstWrap.getBoundingClientRect().top-cTop+cont.scrollTop-54);

    busyRef.current=true;
    setHint(false);

    const srcBlocks=getMorphBlocks(srcWrap);
    const dstBlocks=getMorphBlocks(dstWrap);
    const vh=cont.clientHeight;
    const vc=cTop+vh/2; // viewport center (page coords)
    const dirSign=dir>0?1:-1;

    // ── PHASE 1: scatter source · pre-hide destination ──
    srcBlocks.forEach((el,i)=>{
      const r=el.getBoundingClientRect();
      const ecy=r.top+r.height/2;
      const dy=ecy-vc;
      // direction of flight — opposite to travel direction so they "fall away"
      const flyY=(dy<0?-1:1)*140 - dirSign*40;
      const flyX=((i%2)?1:-1)*(60+i*4);
      const delay=Math.min(120,i*22);
      el.style.willChange="transform,opacity,filter";
      el.style.transition=`transform ${SCATTER_DUR}ms cubic-bezier(.55,0,.4,1) ${delay}ms,opacity ${SCATTER_DUR-80}ms ease ${delay}ms,filter ${SCATTER_DUR-100}ms ease ${delay}ms`;
      el.style.transform=`translate(${flyX}px,${flyY}px) scale(.92)`;
      el.style.opacity="0";
      el.style.filter="blur(8px)";
    });
    // hide destination items until assembly
    dstBlocks.forEach(el=>{
      el.style.willChange="transform,opacity,filter";
      el.style.transition="none";
      el.style.opacity="0";
    });
    trackedRef.current=[...srcBlocks,...dstBlocks];

    // ── PHASE 2: scroll-tween ──
    const start=cont.scrollTop;
    const delta=dest-start;
    const t0=performance.now();
    const easeIO=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
    const tweenScroll=now=>{
      const p=Math.min(1,(now-t0)/SCROLL_DUR);
      cont.scrollTop=start+delta*easeIO(p);
      if(p<1)requestAnimationFrame(tweenScroll);
    };
    requestAnimationFrame(tweenScroll);

    // ── PHASE 3: assemble destination (overlaps the tail of scatter/scroll) ──
    const assembleAt=Math.max(SCATTER_DUR-120,SCROLL_DUR-200);
    setTimeout(()=>{
      dstBlocks.forEach((el,i)=>{
        const r=el.getBoundingClientRect();
        const ecy=r.top+r.height/2;
        const dy=ecy-(cTop+vh/2);
        // arrive from the leading edge — opposite of how source left
        const flyY=(dy<0?-1:1)*110 + dirSign*30;
        const flyX=((i%2)?-1:1)*(50+i*4);
        el.style.transition="none";
        el.style.transform=`translate(${flyX}px,${flyY}px) scale(.93)`;
        el.style.opacity="0";
        el.style.filter="blur(8px)";
        // force a reflow per element so the start state lands before the transition
        void el.offsetHeight;
        const delay=Math.min(180,i*40);
        el.style.transition=`transform ${ASSEMBLE_DUR}ms cubic-bezier(.18,1.05,.32,1) ${delay}ms,opacity ${ASSEMBLE_DUR-80}ms ease ${delay}ms,filter ${ASSEMBLE_DUR-120}ms ease ${delay}ms`;
        el.style.transform="";
        el.style.opacity="";
        el.style.filter="";
      });
    },assembleAt);

    // ── CLEANUP ──
    const total=assembleAt+ASSEMBLE_DUR+220;
    setTimeout(()=>{
      trackedRef.current.forEach(clearMorph);
      trackedRef.current=[];
      busyRef.current=false;
    },total);
  },[scrollRef]);

  useEffect(()=>()=>{ trackedRef.current.forEach(clearMorph); },[]);

  useEffect(()=>{
    if(!active)return;
    const onKey=e=>{
      if(e.code!=="Space"&&e.key!==" ")return;
      const tag=(e.target&&e.target.tagName)||"";
      if(tag==="INPUT"||tag==="TEXTAREA"||e.target?.isContentEditable)return;
      e.preventDefault();
      jump(e.shiftKey?-1:1);
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[active,jump]);

  return(
    <div style={{background:TERM_BG}}>
      <div aria-hidden style={{height:56,background:TERM_BG}}/>
      <LiveYieldTicker pinnedCode={pinned?.code} onPin={setPinned}/>
      {pinned&&<PinnedTickerPanel item={pinned} onClose={()=>setPinned(null)}/>}
      <div id="lp-sec-0" className="lp-fit"><Hero onEnter={onEnter}/></div>
      <div id="lp-sec-1" className="lp-fit"><WaterfallSection/></div>
      <div id="lp-sec-2" className="lp-fit"><IndexSection/></div>
      <div id="lp-sec-3" className="lp-fit"><MethodologySection/></div>
      <div id="lp-sec-4" className="lp-fit"><DeploySection/></div>

      {/* spacebar affordance */}
      {active&&hint&&(
        <div style={{position:"fixed",bottom:22,left:"50%",transform:"translateX(-50%)",
          zIndex:280,pointerEvents:"none",
          display:"flex",alignItems:"center",gap:12,
          background:"rgba(11,15,13,.82)",backdropFilter:"blur(10px)",
          border:`1px solid ${TERM_BORDER}`,padding:"8px 16px",
          fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
          letterSpacing:"1.8px",textTransform:"uppercase",fontWeight:500,
          color:TERM_FG_DIM,animation:"hintFloat 2.4s ease infinite"}}>
          <span style={{width:6,height:6,background:PHOSPHOR,
            boxShadow:`0 0 6px ${PHOSPHOR}`,animation:"phosphorPulse 1.6s ease infinite"}}/>
          <span style={{color:TERM_FG,fontWeight:600,
            border:`1px solid ${TERM_BORDER}`,padding:"2px 7px"}}>SPACE</span>
          <span>morph section</span>
          <span style={{color:TERM_FG_MUTE}}>·</span>
          <span style={{color:TERM_FG,fontWeight:600,
            border:`1px solid ${TERM_BORDER}`,padding:"2px 7px"}}>⇧ SPACE</span>
          <span>back</span>
        </div>
      )}
    </div>
  );
}

/* ── TemplateCard — workbook tile, terminal styled ── */
const CAT_CODES={residential:"RES",commercial:"COM",industrial:"IND",land:"LND"};

function TemplateCard({t,onDownload,downloading,uploads,stats,idx=0}){
  const[ref,v]=useInView(.04);
  const[sel,setSel]=useState(null);
  const busy=downloading===t.id+(sel||"");
  const selectedType=t.types.find(x=>x.id===sel);
  const uploadInfo=sel?uploads[`${t.id}__${sel}`]:null;
  const hasFile=!!(uploadInfo?.url);
  const cs=computeCatStats(t.id,stats);
  const code=CAT_CODES[t.id]||t.id.slice(0,3).toUpperCase();
  const catNum=String(["residential","commercial","industrial","land"].indexOf(t.id)+1).padStart(2,"0");

  return(
    <div ref={ref} className="vf-card"
      style={{background:TERM_PANEL_S,border:`1px solid ${TERM_BORDER}`,
        overflow:"hidden",position:"relative",
        opacity:v?1:0,transform:v?"translateY(0)":"translateY(20px)",
        transition:`opacity .55s ease,transform .55s cubic-bezier(.22,1,.36,1)`,
        display:"flex",flexDirection:"column",height:"100%",
        fontFamily:"'Onest',sans-serif"}}>
      <ScanLines opacity={.4}/>

      {/* Header band */}
      <div style={{padding:"18px 22px 16px",borderBottom:`1px solid ${TERM_BORDER}`,
        background:"rgba(0,200,150,.04)",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",
          marginBottom:12,fontFamily:"'JetBrains Mono',monospace",fontSize:10,
          color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,textTransform:"uppercase"}}>
          <span style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:PHOSPHOR}}>{catNum}</span>
            <span style={{color:TERM_FG_MUTE}}>[{code}]</span>
          </span>
          <span style={{color:TERM_FG_DIM,fontSize:9.5,fontWeight:500,letterSpacing:"1.5px"}}>
            {cs.version} · {cs.updated}
          </span>
        </div>
        <h2 style={{fontFamily:"'Onest',sans-serif",fontSize:22,fontWeight:600,
          letterSpacing:"-.02em",color:TERM_FG,margin:"0 0 4px",lineHeight:1.1}}>
          {t.title}
        </h2>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
          color:TERM_FG_DIM,letterSpacing:"1.2px",fontWeight:500,
          textTransform:"uppercase"}}>{t.sub}</div>
      </div>

      <div style={{padding:"18px 22px 22px",display:"flex",flexDirection:"column",flex:1,
        position:"relative",zIndex:1}}>
        <p style={{color:TERM_FG_DIM,fontSize:13.5,lineHeight:1.65,marginBottom:18,
          marginTop:2,fontWeight:400}}>{t.desc}</p>

        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
          color:TERM_FG_MUTE,fontWeight:600,letterSpacing:"2px",
          textTransform:"uppercase",marginBottom:12,
          display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:PHOSPHOR}}>—</span> Select Property Type
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",
          gap:6,marginBottom:18}}>
          {t.types.map(pt=>{
            const active=sel===pt.id;
            const hasUpload=uploads[`${t.id}__${pt.id}`];
            return(
              <div key={pt.id} className="prop-card" onClick={()=>setSel(active?null:pt.id)}
                style={{
                  background:active?"rgba(0,200,150,.12)":TERM_BG,
                  border:`1px solid ${active?PHOSPHOR:TERM_BORDER}`,
                  padding:"10px 11px",position:"relative",minHeight:74,
                  display:"flex",flexDirection:"column",justifyContent:"flex-start"}}>
                {hasUpload&&<div style={{position:"absolute",top:7,right:7,width:6,height:6,
                  background:hasUpload.url?PHOSPHOR:AMBER,
                  boxShadow:hasUpload.url?`0 0 6px ${PHOSPHOR}`:"none"}}/>}
                <div style={{fontFamily:"'Onest',sans-serif",fontSize:12.5,fontWeight:600,
                  color:active?PHOSPHOR:TERM_FG,marginBottom:3,lineHeight:1.25,
                  paddingRight:hasUpload?12:0,letterSpacing:"-.005em"}}>
                  {pt.label}
                </div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
                  color:active?"rgba(0,200,150,.65)":TERM_FG_MUTE,
                  letterSpacing:".3px",lineHeight:1.4,fontWeight:500}}>{pt.note}</div>
              </div>
            );
          })}
        </div>

        {selectedType&&(
          <div style={{background:"rgba(0,200,150,.06)",border:`1px solid ${PHOSPHOR}`,
            padding:"11px 14px",marginBottom:14,display:"flex",alignItems:"center",
            justifyContent:"space-between",animation:"expandIn .25s ease"}}>
            <div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                color:PHOSPHOR,letterSpacing:"2px",fontWeight:600,
                textTransform:"uppercase",marginBottom:2}}>SELECTED</div>
              <div style={{fontFamily:"'Onest',sans-serif",fontSize:13.5,
                fontWeight:600,color:TERM_FG}}>{selectedType.label}</div>
              {!hasFile&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
                color:AMBER,marginTop:3,letterSpacing:"1.5px",textTransform:"uppercase",fontWeight:500}}>! pending upload</div>}
            </div>
            <div onClick={()=>setSel(null)} style={{color:TERM_FG_DIM,cursor:"pointer",
              fontSize:14,lineHeight:1,padding:"0 4px",
              fontFamily:"'JetBrains Mono',monospace"}}>×</div>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:0,
          marginTop:"auto",marginBottom:14,
          border:`1px solid ${TERM_BORDER}`,background:TERM_BG}}>
          {[["Downloads",cs.downloads],["Version",cs.version],["Updated",cs.updated]].map(([k,v],i)=>(
            <div key={k} style={{padding:"9px 12px",
              borderRight:i<2?`1px solid ${TERM_BORDER}`:"none"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,
                color:TERM_FG_MUTE,letterSpacing:"1.5px",
                textTransform:"uppercase",fontWeight:500}}>{k}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,
                fontWeight:600,color:TERM_FG,marginTop:3,
                fontVariantNumeric:"tabular-nums",letterSpacing:".3px"}}>{v}</div>
            </div>
          ))}
        </div>

        <div className="dl-btn"
          onClick={()=>sel&&hasFile&&!downloading&&onDownload({id:t.id+sel,title:`${t.title} — ${selectedType?.label}`,url:uploadInfo.url,filename:uploadInfo.name,catId:t.id,typeId:sel})}
          style={{
            background:sel&&hasFile?PHOSPHOR:sel&&!hasFile?"rgba(255,198,64,.1)":TERM_BG,
            color:sel&&hasFile?TERM_BG:sel&&!hasFile?AMBER:TERM_FG_MUTE,
            border:`1px solid ${sel&&hasFile?PHOSPHOR:sel&&!hasFile?AMBER:TERM_BORDER}`,
            padding:"13px 18px",
            fontFamily:"'JetBrains Mono',monospace",
            fontWeight:600,fontSize:11.5,letterSpacing:"1.5px",
            textTransform:"uppercase",
            display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,
            userSelect:"none",
            cursor:sel&&hasFile&&!downloading?"pointer":"default"}}>
          <span style={{display:"flex",alignItems:"center",gap:10}}>
            {busy
              ?<><div style={{width:11,height:11,
                  border:`2px solid rgba(11,15,13,.3)`,borderTopColor:TERM_BG,
                  animation:"spin .8s linear infinite"}}/> Preparing</>
              :sel&&hasFile?<>$ download <span style={{opacity:.7}}>--{selectedType?.id}</span></>
              :sel&&!hasFile?<>! workbook pending</>
              :<>↳ select a property type</>}
          </span>
          {sel&&hasFile&&!busy&&<span>EXEC ▶</span>}
          {!sel&&<span style={{opacity:.6}}>IDLE</span>}
        </div>
      </div>
    </div>
  );
}

function Dashboard({onDownload,downloading,uploads,stats}){
  const[search,setSrc]=useState("");
  const[filter,setFilter]=useState("all");
  const filters=["all","residential","commercial","industrial","land"];
  const filtered=TMPLS.filter(t=>{
    const q=search.trim().toLowerCase();
    const ms=q===""||t.types.some(pt=>
      pt.label.toLowerCase().includes(q)||pt.note.toLowerCase().includes(q));
    return ms&&(filter==="all"||t.id===filter);
  });
  const totalUp=Object.keys(uploads).filter(k=>uploads[k]?.url).length;
  const totalDl=Object.values(stats?.downloads||{}).reduce((s,v)=>s+(v||0),0).toLocaleString();
  return(
    <div style={{background:TERM_BG,minHeight:"100vh",paddingTop:56,position:"relative"}}>
      <ScanLines opacity={.35}/>

      {/* Status strip — like Hero's stats grid */}
      <div style={{borderBottom:`1px solid ${TERM_BORDER}`,
        background:"rgba(0,200,150,.025)",position:"relative",zIndex:1}}>
        <div style={{maxWidth:1280,margin:"0 auto",
          display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
          {[
            ["Templates","04","unit",null],
            ["Downloads",totalDl,"sum","up"],
            ["Types","29","unit",null],
            ["Available",`${totalUp}/29`,"frac",totalUp>0?"up":null],
          ].map(([l,v,_,trend],i,a)=>(
            <div key={i} style={{padding:"16px 24px",
              borderRight:i<a.length-1?`1px solid ${TERM_BORDER}`:"none",
              display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
              <div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
                  color:TERM_FG_MUTE,letterSpacing:"2px",fontWeight:500,
                  textTransform:"uppercase",marginBottom:5}}>{l}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,
                  color:TERM_FG,fontWeight:600,fontVariantNumeric:"tabular-nums",
                  letterSpacing:"-.3px"}}>{v}</div>
              </div>
              {trend==="up"&&<span style={{width:5,height:5,background:SIG_UP,
                boxShadow:`0 0 4px ${SIG_UP}`,
                animation:"phosphorPulse 1.8s ease infinite"}}/>}
            </div>
          ))}
        </div>
      </div>

      <div style={{maxWidth:1280,margin:"0 auto",padding:"56px 32px 40px",
        position:"relative",zIndex:1}}>
        {/* Section eyebrow */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24,
          fontFamily:"'JetBrains Mono',monospace",fontSize:10,
          color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,textTransform:"uppercase"}}>
          <span style={{color:PHOSPHOR}}>[</span>
          <span>DCF/04 · MODEL LIBRARY</span>
          <span style={{color:PHOSPHOR}}>]</span>
          <span style={{flex:1,height:1,background:TERM_BORDER}}/>
          <span style={{color:TERM_FG_MUTE}}>v01.4</span>
        </div>

        <h1 style={{fontFamily:"'Onest',sans-serif",
          fontSize:"clamp(32px,4.6vw,52px)",fontWeight:600,
          letterSpacing:"-.03em",margin:"0 0 14px",
          color:TERM_FG,lineHeight:1.02}}>
          DCF Template <span style={{color:PHOSPHOR}}>Library</span>
        </h1>
        <p style={{color:TERM_FG_DIM,fontSize:15.5,marginBottom:32,
          maxWidth:620,lineHeight:1.6}}>
          Pick a property category, drill down to your asset type, and download the workbook. Each entry is calibrated against current CBRE Research data.
        </p>

        {/* Filter bar — terminal command + tabs */}
        <div style={{marginBottom:28,
          border:`1px solid ${TERM_BORDER}`,background:TERM_PANEL_S,
          display:"flex",flexWrap:"wrap",alignItems:"stretch"}}>
          <div style={{display:"flex",alignItems:"center",flex:"1 1 240px",minWidth:200,
            borderRight:`1px solid ${TERM_BORDER}`,padding:"0 16px"}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,
              color:PHOSPHOR,fontWeight:700,marginRight:10}}>$</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
              color:TERM_FG_MUTE,letterSpacing:"1.5px",
              textTransform:"uppercase",marginRight:12,whiteSpace:"nowrap"}}>filter --type=</span>
            <input value={search} onChange={e=>setSrc(e.target.value)}
              placeholder="condo, warehouse, ..."
              style={{flex:1,minWidth:80,background:"transparent",border:"none",
                padding:"13px 0",color:TERM_FG,fontSize:13,
                fontFamily:"'JetBrains Mono',monospace",letterSpacing:".5px",
                boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",flexWrap:"wrap"}}>
            {filters.map((f,i)=>(
              <button key={f} onClick={()=>setFilter(f)} className="fltr"
                style={{padding:"13px 18px",borderRadius:0,
                  borderLeft:i>0?`1px solid ${TERM_BORDER}`:"none",
                  fontWeight:filter===f?600:500,fontSize:10.5,
                  textTransform:"uppercase",letterSpacing:"2px",
                  background:filter===f?PHOSPHOR:"transparent",
                  color:filter===f?TERM_BG:TERM_FG_DIM,
                  fontFamily:"'JetBrains Mono',monospace"}}>
                {f==="all"?"[ALL]":`[${(CAT_CODES[f]||f.slice(0,3)).toUpperCase()}]`}
              </button>
            ))}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(440px,1fr))",
          gap:18,alignItems:"stretch"}}>
          {filtered.map((t,i)=>(
            <TemplateCard key={t.id} t={t} idx={i} onDownload={onDownload} downloading={downloading} uploads={uploads} stats={stats}/>
          ))}
        </div>

        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"72px 16px",
            border:`1px dashed ${TERM_BORDER}`,
            color:TERM_FG_DIM}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,
              letterSpacing:"2.5px",color:AMBER,fontWeight:600,
              textTransform:"uppercase",marginBottom:8}}>! No matches</div>
            <p style={{fontSize:13.5,margin:0}}>No workbooks match your filter.</p>
          </div>
        )}
      </div>

      <footer style={{borderTop:`1px solid ${TERM_BORDER}`,
        padding:"22px 32px",background:"rgba(0,0,0,.3)",
        position:"relative",zIndex:1,
        display:"flex",justifyContent:"space-between",alignItems:"center",
        flexWrap:"wrap",gap:14,
        fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
        color:TERM_FG_MUTE,letterSpacing:"1.5px",
        textTransform:"uppercase",fontWeight:500}}>
        <span>↳ VALOREM · CBRE Malaysia · MMXXVI</span>
        <span style={{color:PHOSPHOR}}>SYS:OK · SRC:CBRE.RES</span>
        <span>For professional property valuation use</span>
      </footer>
    </div>
  );
}

/* ── BootScreen — themed terminal boot sequence ── */
const BOOT_SEQ=[
  ["INIT","kernel · valorem.core","OK"],
  ["CHK","system integrity","VERIFIED"],
  ["NET","uplink · cbre.res","ONLINE"],
  ["MKT","yield feed · kl / pj / jb","CONNECTED"],
  ["DCF","valuation engine · v01.4","LOADED"],
  ["IDX","29 workbooks · 4 classes","INDEXED"],
  ["GFX","terminal renderer","OK"],
  ["AUTH","session · guest","GRANTED"],
];

function BootScreen({onDone}){
  const[revealed,setRevealed]=useState(0);
  const[pct,setPct]=useState(0);
  const[leaving,setLeaving]=useState(false);
  const finishedRef=useRef(false);
  const rafRef=useRef(0);
  const targetRef=useRef(0);

  const finish=useCallback(()=>{
    if(finishedRef.current)return;
    finishedRef.current=true;
    setRevealed(BOOT_SEQ.length);
    targetRef.current=100;
    setLeaving(true);
    setTimeout(onDone,640);
  },[onDone]);

  // Reveal log lines one at a time
  useEffect(()=>{
    if(finishedRef.current)return;
    let i=0;
    const id=setInterval(()=>{
      if(finishedRef.current){clearInterval(id);return;}
      i++;
      setRevealed(i);
      targetRef.current=(i/BOOT_SEQ.length)*100;
      if(i>=BOOT_SEQ.length){
        clearInterval(id);
        setTimeout(finish,480);
      }
    },265);
    return()=>clearInterval(id);
  },[finish]);

  // Smoothly ease the progress bar toward target
  useEffect(()=>{
    const tick=()=>{
      setPct(p=>{
        const t=targetRef.current;
        const np=p+(t-p)*0.12;
        return Math.abs(t-np)<0.4?t:np;
      });
      rafRef.current=requestAnimationFrame(tick);
    };
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  // Skip on key
  useEffect(()=>{
    const onKey=()=>finish();
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[finish]);

  const shown=Math.floor(pct);

  return(
    <div onClick={finish}
      style={{position:"fixed",inset:0,zIndex:9000,background:TERM_BG,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        cursor:"pointer",overflow:"hidden",
        fontFamily:"'JetBrains Mono', monospace",
        animation:leaving?"bootFadeOut .6s ease forwards":"none"}}>

      {/* grid backdrop */}
      <div aria-hidden style={{position:"absolute",inset:0,zIndex:0,
        backgroundImage:`linear-gradient(${TERM_GRID} 1px,transparent 1px),linear-gradient(90deg,${TERM_GRID} 1px,transparent 1px)`,
        backgroundSize:"56px 56px",
        maskImage:"radial-gradient(ellipse 55% 60% at 50% 50%,#000 0%,transparent 72%)",
        WebkitMaskImage:"radial-gradient(ellipse 55% 60% at 50% 50%,#000 0%,transparent 72%)",
        opacity:.5,pointerEvents:"none"}}/>
      <ScanLines opacity={.5}/>
      {/* travelling scan band */}
      <div aria-hidden style={{position:"absolute",left:0,right:0,height:"38%",zIndex:0,
        background:"linear-gradient(180deg,transparent,rgba(0,200,150,.04),transparent)",
        animation:"bootScan 3.2s linear infinite",pointerEvents:"none"}}/>

      {/* Core emblem — concentric rings + throbbing V */}
      <div style={{position:"relative",width:132,height:132,marginBottom:40,zIndex:1,
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",
          border:`1px solid ${TERM_BORDER}`,
          borderTopColor:PHOSPHOR,borderRightColor:"rgba(0,200,150,.35)",
          animation:"bootRingSpin 2.4s linear infinite"}}/>
        <div style={{position:"absolute",inset:16,borderRadius:"50%",
          border:`1px solid ${TERM_BORDER}`,
          borderBottomColor:PHOSPHOR,borderLeftColor:"rgba(0,200,150,.3)",
          animation:"bootRingSpinR 3.1s linear infinite"}}/>
        <div style={{position:"absolute",inset:33,borderRadius:"50%",
          border:`1px dashed rgba(0,200,150,.25)`,
          animation:"bootRingSpin 5s linear infinite"}}/>
        <div style={{width:52,height:52,borderRadius:"50%",
          background:"radial-gradient(circle at 38% 34%,#0F5239,#08130E)",
          border:`1px solid ${PHOSPHOR}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          animation:"bootCoreThrob 1.9s ease-in-out infinite"}}>
          <span style={{fontFamily:"'Onest', sans-serif",fontSize:26,fontWeight:800,
            color:PHOSPHOR,letterSpacing:"-1px",lineHeight:1,
            textShadow:`0 0 12px rgba(0,200,150,.7)`}}>V</span>
        </div>
      </div>

      {/* Wordmark */}
      <div style={{zIndex:1,textAlign:"center",marginBottom:30,
        animation:"bootFlicker 4s linear infinite"}}>
        <div style={{fontSize:15,letterSpacing:"7px",color:TERM_FG,fontWeight:700,
          textTransform:"uppercase",marginBottom:7,paddingLeft:7}}>
          VALOREM
        </div>
        <div style={{fontSize:9,letterSpacing:"3px",color:TERM_FG_MUTE,fontWeight:500,
          textTransform:"uppercase"}}>
          DCF Terminal · CBRE Malaysia
        </div>
      </div>

      {/* Boot log */}
      <div style={{zIndex:1,width:"min(420px,86vw)",minHeight:150,marginBottom:24}}>
        {BOOT_SEQ.slice(0,revealed).map(([tag,label,status],i)=>(
          <div key={tag} style={{display:"flex",alignItems:"baseline",gap:10,
            padding:"4px 0",fontSize:11,letterSpacing:".5px",
            animation:"bootLineIn .28s ease both"}}>
            <span style={{color:PHOSPHOR,fontWeight:600,width:34,flexShrink:0}}>{tag}</span>
            <span style={{color:TERM_FG_DIM,whiteSpace:"nowrap",overflow:"hidden",
              textOverflow:"ellipsis"}}>{label}</span>
            <span style={{flex:1,borderBottom:`1px dotted ${TERM_BORDER}`,
              transform:"translateY(-3px)",minWidth:14}}/>
            <span style={{color:PHOSPHOR,fontWeight:600,flexShrink:0,
              display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:5,height:5,background:PHOSPHOR,
                boxShadow:`0 0 6px ${PHOSPHOR}`}}/>
              {status}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{zIndex:1,width:"min(420px,86vw)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",
          marginBottom:8,fontSize:9.5,letterSpacing:"2px",
          color:TERM_FG_MUTE,textTransform:"uppercase",fontWeight:500}}>
          <span>{leaving?"BOOT COMPLETE":"INITIALISING"}</span>
          <span style={{color:TERM_FG,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>
            {String(shown).padStart(3," ")}%
          </span>
        </div>
        <div style={{height:6,background:TERM_PANEL_S,border:`1px solid ${TERM_BORDER}`,
          position:"relative",overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,
            background:`linear-gradient(90deg,${PHOSPHOR_DIM},${PHOSPHOR})`,
            boxShadow:`0 0 12px rgba(0,200,150,.5)`,
            transition:"width .08s linear",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,bottom:0,width:40,
              background:"linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent)",
              animation:"bootGlowSweep 1.1s linear infinite"}}/>
          </div>
        </div>
      </div>

      {/* Skip hint */}
      <div style={{zIndex:1,marginTop:30,fontSize:9,letterSpacing:"2.5px",
        color:TERM_FG_MUTE,textTransform:"uppercase",fontWeight:500,
        display:"flex",alignItems:"center",gap:8,opacity:leaving?0:.8,
        transition:"opacity .3s ease"}}>
        <span style={{width:5,height:5,background:AMBER,
          animation:"phosphorPulse 1.4s ease infinite"}}/>
        Click or press any key to skip
      </div>
    </div>
  );
}

export default function App(){
  const scrollRef=useRef(null);
  const[booting,setBooting]=useState(()=>{
    if(typeof sessionStorage==="undefined")return true;
    return sessionStorage.getItem("vlrm_booted")!=="1";
  });
  const[scrollY,setSY]=useState(0);
  const[mouse,setMouse]=useState({x:0,y:0});
  const[page,setPage]=useState("landing");
  const[toast,setToast]=useState(null);
  const[downloading,setDL]=useState(null);
  const[showLogin,setShowLogin]=useState(false);
  const[uploads,setUploads]=useState({});
  const[stats,setStats]=useState({downloads:{},uploads:{},lastUpdated:{}});
  const thr=useRef(0);

  useEffect(()=>{
    fetch("/api/templates").then(r=>r.json()).then(setUploads).catch(()=>{});
    fetch("/api/stats").then(r=>r.json()).then(setStats).catch(()=>{});
  },[]);

  const onScroll=useCallback(()=>setSY(scrollRef.current?.scrollTop??0),[]);
  const onMouse=useCallback(e=>{
    const now=Date.now();
    if(now-thr.current<26)return;
    thr.current=now;
    const el=scrollRef.current;if(!el)return;
    const r=el.getBoundingClientRect();
    setMouse({x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5});
  },[]);

  const go=p=>{setPage(p);if(scrollRef.current)scrollRef.current.scrollTop=0;};

  const handleDL=t=>{
    if(downloading)return;
    setDL(t.id);
    setTimeout(()=>{
      setDL(null);
      if(t.url){
        const a=document.createElement("a");
        a.href=t.url;a.download=t.filename||"template.xlsx";
        document.body.appendChild(a);a.click();document.body.removeChild(a);
      }
      if(t.catId&&t.typeId){
        const k=`${t.catId}__${t.typeId}`;
        setStats(prev=>({...prev,
          downloads:{...(prev.downloads||{}),[k]:((prev.downloads||{})[k]||0)+1}}));
        fetch("/api/stats",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({action:"download",catId:t.catId,typeId:t.typeId})}).catch(()=>{});
      }
      setToast(`${t.title} DCF Template downloaded successfully!`);
      setTimeout(()=>setToast(null),3800);
    },1200);
  };

  return(
    <div ref={scrollRef} onScroll={onScroll} onMouseMove={onMouse}
      style={{height:"100vh",overflowY:"auto",overflowX:"hidden",
        background:TERM_BG,
        fontFamily:"'Onest',sans-serif"}}>
      <style>{CSS}</style>
      {booting&&<BootScreen onDone={()=>{
        try{sessionStorage.setItem("vlrm_booted","1");}catch{}
        setBooting(false);
      }}/>}
      <ProgressBar scrollRef={scrollRef}/>
      <Nav page={page} onBack={()=>go("landing")} onAdminClick={()=>setShowLogin(true)}/>
      {page==="landing"&&<LandingPage onEnter={()=>go("dashboard")} scrollRef={scrollRef} active={!booting}/>}
      {page==="dashboard"&&<Dashboard onDownload={handleDL} downloading={downloading} uploads={uploads} stats={stats}/>}
      {page==="admin"&&<AdminPanel onLogout={()=>go("landing")} uploads={uploads} setUploads={setUploads} setStats={setStats}/>}
      {showLogin&&(
        <AdminLoginModal onClose={()=>setShowLogin(false)} onSuccess={()=>{setShowLogin(false);go("admin");}}/>
      )}
      {toast&&<Toast msg={toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}
