import { useState, useEffect, useRef, useCallback } from "react";
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
            §/ADMIN
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
              <span style={{color:AMBER}}>RESTRICTED · §/ADMIN</span>
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
  {n:"01",code:"RES",name:"Residential",types:8,subtitle:"Landed & strata title",
   sample:["Condominium","Terrace","Bungalow","SOHO","Affordable"]},
  {n:"02",code:"COM",name:"Commercial",types:7,subtitle:"Office, retail & mixed-use",
   sample:["Office Tower","Retail Mall","Hotel","Shophouse","Med. Centre"]},
  {n:"03",code:"IND",name:"Industrial",types:7,subtitle:"Factory & logistics",
   sample:["Det. Factory","Warehouse","Logistics","Cold Storage","Light Ind."]},
  {n:"04",code:"LND",name:"Land",types:7,subtitle:"Bare land & development",
   sample:["Resi Land","Comm. Land","Industrial","Agricultural","Freehold"]},
];

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
function LiveYieldTicker(){
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
          return(
            <span key={i} className="lp-ticker-item" style={{display:"inline-flex",alignItems:"baseline",gap:10,marginRight:44,
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

/* ── DCFViewport — live calculation panel · the showpiece ── */
function DCFViewport(){
  const[flashCell,setFlashCell]=useState(-1);
  const[tickN,setTickN]=useState(0);

  useEffect(()=>{
    const i1=setInterval(()=>setTickN(n=>n+1),1100);
    const i2=setInterval(()=>{
      setFlashCell(Math.floor(Math.random()*5));
      setTimeout(()=>setFlashCell(-1),400);
    },2400);
    return()=>{clearInterval(i1);clearInterval(i2);};
  },[]);

  const years=DCF_MODEL.noi.map((noi,i)=>{
    const t=i+1;
    const df=1/Math.pow(1+DCF_MODEL.wacc,t);
    const pv=noi*df;
    return{t,noi,df,pv};
  });
  const npv=years.reduce((s,r)=>s+r.pv,0);
  const tvPv=DCF_MODEL.terminal/Math.pow(1+DCF_MODEL.wacc,5);
  const totalPv=npv+tvPv;
  const fmtM=v=>v.toLocaleString("en-MY",{maximumFractionDigits:0});

  return(
    <div style={{background:TERM_PANEL_S,border:`1px solid ${TERM_BORDER}`,
      fontFamily:"'JetBrains Mono', monospace",position:"relative",overflow:"hidden"}}>
      <ScanLines opacity={.55}/>

      {/* Header */}
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${TERM_BORDER}`,
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,
        background:"rgba(0,200,150,.045)",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:10,fontSize:10,
          letterSpacing:"2px",textTransform:"uppercase",fontWeight:600}}>
          <span style={{width:7,height:7,background:PHOSPHOR,
            boxShadow:`0 0 8px ${PHOSPHOR}`,
            animation:"phosphorPulse 1.6s ease infinite"}}/>
          <span style={{color:TERM_FG}}>DCF · WKB {DCF_MODEL.workbook}</span>
          <span style={{color:TERM_FG_MUTE}}>·</span>
          <span style={{color:PHOSPHOR,fontWeight:500}}>LIVE</span>
        </div>
        <div style={{display:"flex",gap:12,fontSize:9.5,color:TERM_FG_DIM,
          letterSpacing:"1.4px",textTransform:"uppercase",fontWeight:500}}>
          <span>WACC <span style={{color:TERM_FG,fontWeight:600}}>{(DCF_MODEL.wacc*100).toFixed(2)}%</span></span>
          <span style={{color:TERM_FG_MUTE}}>·</span>
          <span>g <span style={{color:TERM_FG,fontWeight:600}}>{(DCF_MODEL.growth*100).toFixed(2)}%</span></span>
        </div>
      </div>

      {/* Asset subtitle */}
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${TERM_BORDER}`,
        display:"flex",justifyContent:"space-between",alignItems:"flex-start",
        position:"relative",zIndex:1}}>
        <div>
          <div style={{fontSize:9.5,color:TERM_FG_DIM,letterSpacing:"1.8px",
            textTransform:"uppercase",fontWeight:500,marginBottom:5}}>Asset</div>
          <div style={{fontSize:14,color:TERM_FG,fontWeight:600,
            fontFamily:"'Onest',sans-serif"}}>{DCF_MODEL.asset}</div>
          <div style={{fontSize:11,color:TERM_FG_DIM,marginTop:2,
            fontFamily:"'Onest',sans-serif"}}>{DCF_MODEL.location}</div>
        </div>
        <div style={{textAlign:"right",fontSize:9.5,color:TERM_FG_DIM,
          letterSpacing:"1.5px",textTransform:"uppercase",fontWeight:500,lineHeight:1.8}}>
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
            <span key={i} style={{textAlign:"right",
              fontVariantNumeric:"tabular-nums",
              fontSize:row.highlight?13:12,
              color:row.highlight?PHOSPHOR:row.mute?TERM_FG_DIM:TERM_FG,
              fontWeight:row.highlight?600:500,
              ...(row.highlight&&flashCell===i?{background:"rgba(0,200,150,.18)",animation:"numberTick .4s ease"}:{}),
              transition:"background .25s ease",padding:"3px 6px",margin:"-3px -6px"}}>
              {row.fmt(v)}
            </span>
          ))}
        </div>
      ))}

      {/* Terminal value row */}
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${TERM_BORDER}`,
        display:"flex",justifyContent:"space-between",alignItems:"center",
        background:"rgba(255,198,64,.045)",position:"relative",zIndex:1}}>
        <span style={{fontSize:10,color:AMBER,letterSpacing:"1.7px",
          textTransform:"uppercase",fontWeight:600,display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:5,height:5,background:AMBER}}/>
          Terminal · Y5
        </span>
        <span style={{fontSize:12.5,color:AMBER,fontWeight:600,
          fontVariantNumeric:"tabular-nums",letterSpacing:".5px"}}>
          {fmtM(DCF_MODEL.terminal)} <span style={{color:"rgba(255,198,64,.55)"}}>→ PV</span> {fmtM(tvPv)}
        </span>
      </div>

      {/* Results row */}
      <div style={{padding:"22px 16px 20px",
        display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,
        background:"linear-gradient(180deg,rgba(0,200,150,.06) 0%,transparent 100%)",
        position:"relative",zIndex:1}}>
        {[
          {label:"NPV",sub:"PV + TV",value:fmtM(totalPv),unit:"RM '000",trend:"up",delta:"+2.4%"},
          {label:"IRR",sub:"",value:"8.40%",unit:"",trend:"up",delta:"+12 bps"},
          {label:"CAP",sub:"RATE",value:"5.75%",unit:"",trend:"flat",delta:"flat"},
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
            <div className="lp-dcf-result-val" style={{fontSize:22,fontWeight:600,
              color:r.trend==="flat"?TERM_FG:PHOSPHOR,
              fontVariantNumeric:"tabular-nums",letterSpacing:"-.5px",lineHeight:1,
              transition:"text-shadow .2s ease"}}>
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
          UPDT · {new Date().toLocaleTimeString("en-MY",{hour:"2-digit",minute:"2-digit",hour12:false})} MYT
        </span>
        <span>SRC · CBRE.RES</span>
        <span>VAL.MY/{DCF_MODEL.workbook}</span>
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

      <div style={{maxWidth:1480,margin:"0 auto",
        padding:wide?"72px 36px 80px":"60px 24px 56px",
        position:"relative",zIndex:1,
        display:"grid",
        gridTemplateColumns:wide?"minmax(0,1fr) minmax(0,1fr)":"1fr",
        gap:wide?60:40,alignItems:"start"}}>

        {/* LEFT — command pane */}
        <div>
          {/* Breadcrumb / system path */}
          <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10,
            color:TERM_FG_DIM,letterSpacing:"2.2px",fontWeight:500,
            marginBottom:30,display:"flex",alignItems:"center",gap:10,
            textTransform:"uppercase"}}>
            <span style={{color:PHOSPHOR}}>[</span>
            <span style={{color:PHOSPHOR,fontWeight:600}}>DCF/04</span>
            <span style={{color:TERM_FG_MUTE}}>·</span>
            <span>Model Library</span>
            <span style={{color:PHOSPHOR}}>]</span>
            <span style={{flex:1,height:1,background:TERM_BORDER}}/>
            <span style={{color:TERM_FG_MUTE}}>v01.4</span>
          </div>

          <h1 style={{
            fontFamily:"'Onest', sans-serif",
            fontSize:"clamp(44px,6.5vw,86px)",
            fontWeight:600,
            lineHeight:.98,letterSpacing:"-.035em",
            color:TERM_FG,margin:"0 0 24px"}}>
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

          <p style={{fontFamily:"'Onest', sans-serif",
            fontSize:16.5,lineHeight:1.6,color:TERM_FG_DIM,
            maxWidth:520,margin:"0 0 36px",fontWeight:400}}>
            A precision library of pre-built DCF workbooks for the Malaysian property market. Wired by practicing valuers, calibrated against current CBRE research, deployed by you.
          </p>

          {/* ExecuteBar CTA */}
          <ExecuteBar onComplete={onEnter}/>

          <div style={{marginTop:14,fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
            color:TERM_FG_MUTE,letterSpacing:"1.8px",textTransform:"uppercase",fontWeight:500}}>
            ↳ press &amp; hold the bar above to initiate
          </div>

          {/* Stats row */}
          <div style={{marginTop:36,paddingTop:24,borderTop:`1px solid ${TERM_BORDER}`,
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
        <div style={{position:"relative"}}>
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

/* ── §01 Mechanics — cash flow waterfall ── */
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
    <section ref={ref} style={{background:TERM_BG,padding:wide?"100px 36px":"60px 24px",
      position:"relative",borderBottom:`1px solid ${TERM_BORDER}`,overflow:"hidden"}}>
      <ScanLines/>
      <div style={{maxWidth:1320,margin:"0 auto",position:"relative",zIndex:1}}>
        {/* Section header */}
        <div style={{display:wide?"grid":"block",
          gridTemplateColumns:wide?"180px 1fr 240px":"1fr",
          gap:0,marginBottom:wide?60:36}}>
          <div style={{paddingRight:wide?28:0,marginBottom:wide?0:18}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10.5,
              color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,
              textTransform:"uppercase"}}>§01</div>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
              color:TERM_FG_DIM,letterSpacing:"1.5px",fontWeight:500,
              marginTop:6,textTransform:"uppercase"}}>Mechanics</div>
          </div>
          <div style={{padding:wide?"0 56px":"0"}}>
            <h2 style={{fontFamily:"'Onest', sans-serif",
              fontSize:"clamp(34px,4.6vw,60px)",fontWeight:600,
              lineHeight:1.02,letterSpacing:"-.025em",
              color:TERM_FG,margin:"0 0 16px"}}>
              Five years of cash,<br/>
              <span style={{color:PHOSPHOR}}>discounted to today.</span>
            </h2>
            <p style={{fontFamily:"'Onest', sans-serif",fontSize:15,lineHeight:1.6,
              color:TERM_FG_DIM,maxWidth:520,margin:0}}>
              Each year's net operating income is discounted by the WACC factor. Terminal value at exit caps the model. The present-value sum is your NPV.
            </p>
          </div>
          {wide && <div/>}
        </div>

        {/* Waterfall chart panel */}
        <div style={{background:TERM_PANEL_S,border:`1px solid ${TERM_BORDER}`,
          padding:wide?"36px 32px 28px":"24px 16px 22px",position:"relative"}}>
          <ScanLines opacity={.5}/>

          {/* Legend */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",
            marginBottom:28,flexWrap:"wrap",gap:14,position:"relative",zIndex:1,
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
            alignItems:"flex-end",height:wide?280:200,position:"relative",zIndex:1}}>
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
          <div style={{marginTop:28,paddingTop:22,borderTop:`1px solid ${TERM_BORDER}`,
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

/* ── §02 Index — workbook catalog grid ── */
function IndexSection(){
  const wide=useIsWide(800);
  const[ref,v]=useInView(.08);
  return(
    <section ref={ref} style={{background:TERM_BG,padding:wide?"100px 36px":"60px 24px",
      borderBottom:`1px solid ${TERM_BORDER}`,position:"relative",overflow:"hidden"}}>
      <ScanLines/>
      <div style={{maxWidth:1320,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{display:wide?"grid":"block",
          gridTemplateColumns:wide?"180px 1fr 240px":"1fr",gap:0,marginBottom:wide?56:32}}>
          <div style={{paddingRight:wide?28:0,marginBottom:wide?0:18}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10.5,
              color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,
              textTransform:"uppercase"}}>§02</div>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
              color:TERM_FG_DIM,letterSpacing:"1.5px",fontWeight:500,
              marginTop:6,textTransform:"uppercase"}}>Index</div>
          </div>
          <div style={{padding:wide?"0 56px":"0"}}>
            <h2 style={{fontFamily:"'Onest', sans-serif",
              fontSize:"clamp(34px,4.6vw,60px)",fontWeight:600,
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
          {CATEGORIES.map((c,i)=>(
            <div key={c.code} className="lp-card" style={{
              padding:wide?"36px 30px 36px":"26px 20px",
              borderRight:wide&&i%2===0?`1px solid ${TERM_BORDER}`:"none",
              borderBottom:wide?(i<CATEGORIES.length-2?`1px solid ${TERM_BORDER}`:"none"):(i<CATEGORIES.length-1?`1px solid ${TERM_BORDER}`:"none"),
              position:"relative",
              opacity:v?1:0,transform:v?"translateY(0)":"translateY(14px)",
              transition:`opacity .6s ease ${i*.1}s,transform .6s cubic-bezier(.22,1,.36,1) ${i*.1}s,border-color .22s ease,background .22s ease,box-shadow .25s ease`}}>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",
                marginBottom:16}}>
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

              <h3 className="lp-card-name" style={{fontFamily:"'Onest', sans-serif",fontSize:26,
                fontWeight:600,letterSpacing:"-.02em",lineHeight:1.05,
                color:TERM_FG,margin:"0 0 6px",
                transition:"color .2s ease",
                display:"flex",alignItems:"center",gap:14}}>
                {c.name}
                <span className="lp-card-arrow" style={{
                  fontFamily:"'JetBrains Mono', monospace",fontSize:18,fontWeight:500,
                  color:TERM_FG_MUTE,opacity:0,transform:"translateX(-8px)",
                  transition:"opacity .25s ease,transform .25s ease,color .2s ease"}}>→</span>
              </h3>

              <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10,
                color:TERM_FG_DIM,letterSpacing:"1.2px",fontWeight:500,
                marginBottom:18,textTransform:"uppercase"}}>{c.subtitle}</div>

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
                <span style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10,
                  padding:"4px 10px",color:TERM_FG_MUTE,letterSpacing:".5px"}}>
                  + more
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── §03 Methodology — formula notation ── */
function MethodologySection(){
  const wide=useIsWide(900);
  const[ref,v]=useInView(.1);
  return(
    <section ref={ref} style={{background:"#080B0A",padding:wide?"100px 36px":"60px 24px",
      borderBottom:`1px solid ${TERM_BORDER}`,position:"relative",overflow:"hidden"}}>
      <ScanLines/>
      <div style={{maxWidth:1320,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{display:wide?"grid":"block",
          gridTemplateColumns:wide?"180px 1fr 240px":"1fr",gap:0,marginBottom:wide?48:32}}>
          <div style={{paddingRight:wide?28:0,marginBottom:wide?0:18}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10.5,
              color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,
              textTransform:"uppercase"}}>§03</div>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
              color:TERM_FG_DIM,letterSpacing:"1.5px",fontWeight:500,
              marginTop:6,textTransform:"uppercase"}}>Methodology</div>
          </div>
          <div style={{padding:wide?"0 56px":"0"}}>
            <h2 style={{fontFamily:"'Onest', sans-serif",
              fontSize:"clamp(34px,4.6vw,60px)",fontWeight:600,
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
            <div key={f.key} className="lp-formula" style={{
              padding:wide?"32px 26px":"24px 18px",
              borderRight:wide&&i<FORMULAS.length-1?`1px solid ${TERM_BORDER}`:"none",
              borderBottom:!wide&&i<FORMULAS.length-1?`1px solid ${TERM_BORDER}`:"none",
              opacity:v?1:0,transform:v?"translateY(0)":"translateY(12px)",
              transition:`opacity .6s ease ${i*.12}s,transform .6s cubic-bezier(.22,1,.36,1) ${i*.12}s,border-color .2s ease,background .2s ease,box-shadow .2s ease`}}>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",
                marginBottom:20}}>
                <span className="lp-formula-key" style={{fontFamily:"'JetBrains Mono', monospace",fontSize:11,
                  color:PHOSPHOR,letterSpacing:"2.5px",fontWeight:600,
                  textTransform:"uppercase",
                  transition:"color .2s ease,text-shadow .2s ease"}}>{f.key}</span>
                <span style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
                  color:TERM_FG_MUTE,letterSpacing:"1.5px",fontWeight:500,
                  textTransform:"uppercase"}}>F · 0{i+1}</span>
              </div>

              <h3 style={{fontFamily:"'Onest', sans-serif",fontSize:18,
                fontWeight:600,letterSpacing:"-.015em",
                color:TERM_FG,margin:"0 0 18px"}}>{f.label}</h3>

              <div className="lp-formula-eq" style={{padding:"16px 14px",background:TERM_BG,
                border:`1px solid ${TERM_BORDER}`,marginBottom:18,
                fontFamily:"'JetBrains Mono', monospace",fontSize:13,
                color:TERM_FG,letterSpacing:".3px",fontWeight:500,
                wordBreak:"break-word",lineHeight:1.55,
                transition:"border-color .2s ease,background .2s ease,color .2s ease"}}>
                {f.eq}
              </div>

              <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
                color:TERM_FG_MUTE,letterSpacing:"2px",fontWeight:600,
                textTransform:"uppercase",marginBottom:8}}>
                where
              </div>

              {f.where.map(([sym,def])=>(
                <div key={sym} style={{display:"flex",alignItems:"baseline",
                  gap:14,padding:"6px 0",borderBottom:`1px solid ${TERM_GRID}`,
                  fontSize:12,color:TERM_FG_DIM,lineHeight:1.4}}>
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

        <div style={{marginTop:16,display:"flex",justifyContent:"space-between",
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

/* ── §04 Deploy — closing CTA ── */
function DeploySection({onEnter}){
  const wide=useIsWide(900);
  const[ref,v]=useInView(.15);
  return(
    <section ref={ref} style={{background:TERM_BG,padding:wide?"120px 36px 80px":"72px 24px 56px",
      borderTop:`1px solid ${TERM_BORDER}`,position:"relative",overflow:"hidden"}}>
      <ScanLines/>
      <div aria-hidden style={{position:"absolute",inset:0,zIndex:0,
        backgroundImage:`linear-gradient(${TERM_GRID} 1px,transparent 1px),linear-gradient(90deg,${TERM_GRID} 1px,transparent 1px)`,
        backgroundSize:"56px 56px",
        maskImage:"radial-gradient(ellipse 50% 60% at 50% 50%,#000 0%,transparent 70%)",
        WebkitMaskImage:"radial-gradient(ellipse 50% 60% at 50% 50%,#000 0%,transparent 70%)",
        opacity:.7,pointerEvents:"none"}}/>

      <div style={{maxWidth:1100,margin:"0 auto",position:"relative",zIndex:1,
        opacity:v?1:0,transform:v?"translateY(0)":"translateY(20px)",
        transition:"opacity .8s ease,transform .8s cubic-bezier(.22,1,.36,1)"}}>

        <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10,
          color:PHOSPHOR,letterSpacing:"3.5px",fontWeight:600,
          textTransform:"uppercase",marginBottom:28,
          display:"flex",alignItems:"center",gap:14}}>
          <span style={{width:48,height:1,background:PHOSPHOR,
            boxShadow:`0 0 6px ${PHOSPHOR}`}}/>
          §04 · Deploy
        </div>

        <h2 style={{fontFamily:"'Onest', sans-serif",
          fontSize:"clamp(40px,6vw,80px)",fontWeight:600,
          lineHeight:.98,letterSpacing:"-.032em",
          color:TERM_FG,margin:"0 0 22px",maxWidth:900}}>
          Deploy a workbook<br/>
          to your <span style={{color:PHOSPHOR}}>next valuation</span>.
        </h2>

        <p style={{fontFamily:"'Onest', sans-serif",fontSize:16,lineHeight:1.62,
          color:TERM_FG_DIM,maxWidth:560,margin:"0 0 36px"}}>
          Hold the command bar below to initiate. The library opens — free, current, traceable to CBRE source data.
        </p>

        <ExecuteBar onComplete={onEnter} command="initiate --library --region=MY" width={640}/>

        {/* System metadata strip */}
        <div style={{marginTop:64,paddingTop:24,borderTop:`1px solid ${TERM_BORDER}`,
          display:"grid",gridTemplateColumns:wide?"repeat(5,1fr)":"repeat(2,1fr)",gap:0,
          fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
          letterSpacing:"1.8px",textTransform:"uppercase",fontWeight:500}}>
          {[
            ["SYS","OK","up"],
            ["ENV","PROD","up"],
            ["BLD","01.4",""],
            ["SRC","CBRE.RES",""],
            ["HOST","VAL.MY",""],
          ].map(([k,v,t],i,a)=>(
            <div key={k} className="lp-sys-pill" style={{
              padding:wide?"14px 18px":"14px 12px",
              borderRight:wide?(i<a.length-1?`1px solid ${TERM_BORDER}`:"none"):(i%2===0?`1px solid ${TERM_BORDER}`:"none"),
              borderBottom:!wide&&i<a.length-2?`1px solid ${TERM_BORDER}`:"none",
              display:"flex",alignItems:"baseline",gap:10}}>
              <span style={{color:TERM_FG_MUTE}}>{k}</span>
              <span className="lp-sys-val" style={{color:t==="up"?SIG_UP:TERM_FG,fontWeight:600,
                transition:"text-shadow .2s ease"}}>{v}</span>
              {t==="up"&&<span style={{
                width:5,height:5,background:SIG_UP,
                boxShadow:`0 0 4px ${SIG_UP}`,
                animation:"phosphorPulse 1.6s ease infinite",
                marginLeft:"auto"}}/>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingPage({onEnter}){
  return(
    <div style={{background:TERM_BG}}>
      <div aria-hidden style={{height:56,background:TERM_BG}}/>
      <LiveYieldTicker/>
      <Hero onEnter={onEnter}/>
      <WaterfallSection/>
      <IndexSection/>
      <MethodologySection/>
      <DeploySection onEnter={onEnter}/>
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

export default function App(){
  const scrollRef=useRef(null);
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
      <ProgressBar scrollRef={scrollRef}/>
      <Nav page={page} onBack={()=>go("landing")} onAdminClick={()=>setShowLogin(true)}/>
      {page==="landing"&&<LandingPage onEnter={()=>go("dashboard")}/>}
      {page==="dashboard"&&<Dashboard onDownload={handleDL} downloading={downloading} uploads={uploads} stats={stats}/>}
      {page==="admin"&&<AdminPanel onLogout={()=>go("landing")} uploads={uploads} setUploads={setUploads} setStats={setStats}/>}
      {showLogin&&(
        <AdminLoginModal onClose={()=>setShowLogin(false)} onSuccess={()=>{setShowLogin(false);go("admin");}}/>
      )}
      {toast&&<Toast msg={toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}
