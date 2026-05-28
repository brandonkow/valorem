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
  body{margin:0;font-family:'Instrument Sans',sans-serif;font-feature-settings:"ss01","cv11";color:#0A0A08;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
  .btn-p{transition:all .2s ease;cursor:pointer;border:none;font-family:inherit}
  .btn-p:hover{opacity:.88;transform:translateY(-2px)}
  .btn-o{transition:all .2s ease;cursor:pointer;font-family:inherit;border:none}
  .vf-card{transition:transform .28s cubic-bezier(.34,1.3,.64,1),box-shadow .28s ease}
  .vf-card:hover{transform:translateY(-4px);box-shadow:0 20px 48px rgba(0,63,45,.13)}
  .dl-btn{transition:opacity .2s ease,transform .2s ease;cursor:pointer}
  .dl-btn:hover{opacity:.88;transform:translateY(-1px)}
  .prop-card{transition:all .2s ease;cursor:pointer;user-select:none}
  .prop-card:hover{transform:translateY(-3px);}
  .fltr{cursor:pointer;font-family:inherit;border:none;transition:all .18s ease}
  .adm-row{transition:background .15s ease}
  .adm-row:hover{background:rgba(0,63,45,.03)!important}
  .upload-zone{transition:all .2s ease;cursor:pointer}
  .upload-zone:hover{border-color:#003F2D!important;background:rgba(0,63,45,.04)!important}
  input:focus{outline:none;border-color:rgba(0,63,45,.5)!important}
  .ed-link{position:relative;display:inline-block}
  .ed-link::after{content:"";position:absolute;left:0;right:0;bottom:-2px;height:1px;background:currentColor;transform:scaleX(0);transform-origin:left center;transition:transform .35s cubic-bezier(.22,1,.36,1)}
  .ed-link:hover::after{transform:scaleX(1)}
  ::-webkit-scrollbar{width:6px}
  ::-webkit-scrollbar-track{background:#E8E1D2}
  ::-webkit-scrollbar-thumb{background:#A8A095;border-radius:0}
`;

const BG="#F2EDE4";
const D="#003F2D",M="#006A4D",BR="#1DB87B",PL="#EEF6F2",PLR="#F7FBF9",W="#FFF",MU="#587066",BD="rgba(0,63,45,.1)";
const INK="#0A0A08",PAPER="#F2EDE4",PAPER_2="#FAF6EE",HAIR="#C9C2B5",MUTED_INK="#5C5750",OXBLOOD="#6B1F28";
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
    <div style={{position:"fixed",top:0,left:0,right:0,height:3,zIndex:9999,background:"rgba(0,63,45,.1)"}}>
      <div style={{height:"100%",width:`${p}%`,background:`linear-gradient(90deg,${D},${BR})`,transition:"width .08s linear"}}/>
    </div>
  );
}

/* ── Nav: editorial masthead on landing, white card on dashboard/admin ── */
function Nav({page,onBack,onAdminClick}){
  const onLanding = page==="landing";
  const onDash    = page==="dashboard";
  const onAdmin   = page==="admin";

  return(
    <nav style={{
      position:"fixed",top:3,left:0,right:0,zIndex:300,height:56,
      background: onLanding ? "transparent" : "rgba(255,255,255,.97)",
      backdropFilter: onLanding ? "none" : "blur(18px)",
      borderBottom: onLanding ? "none" : `1px solid ${BD}`,
      display:"flex",alignItems:"center",justifyContent:"space-between",
      padding: onLanding ? "0 56px" : "0 36px",
    }}>
      <div>
        {onLanding ? (
          <>
            <div style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontWeight:500,
              fontSize:22,letterSpacing:"-.01em",color:INK,lineHeight:1,
              fontVariationSettings:"'opsz' 72"}}>Valorem</div>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:8.5,
              letterSpacing:"2.5px",marginTop:3,color:MUTED_INK,fontWeight:500,
              textTransform:"uppercase"}}>Published · CBRE Malaysia</div>
          </>
        ) : (
          <>
            <div style={{fontWeight:800,fontSize:14,letterSpacing:"-.2px",color:D}}>CBRE <span style={{fontWeight:300,opacity:.6}}>|</span> Valorem</div>
            <div style={{fontSize:9,letterSpacing:"1.2px",marginTop:-1,color:MU}}>DCF VALUATION PLATFORM</div>
          </>
        )}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {(onDash||onAdmin)&&(
          <button className="btn-o" onClick={onBack}
            style={{background:"transparent",color:D,border:`1.5px solid ${BD}`,
              padding:"8px 20px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer"}}>
            ← Home
          </button>
        )}
        {onLanding&&(
          <button className="btn-o" onClick={onAdminClick}
            style={{background:"transparent",color:INK,
              border:`1px solid ${INK}`,fontFamily:"'JetBrains Mono', monospace",
              padding:"8px 18px",borderRadius:0,fontWeight:500,fontSize:10.5,
              cursor:"pointer",letterSpacing:"2.5px",textTransform:"uppercase"}}>
            Admin
          </button>
        )}
      </div>
    </nav>
  );
}

function Toast({msg,onClose}){
  useEffect(()=>{const t=setTimeout(onClose,3600);return()=>clearTimeout(t);},[]);
  return(
    <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,background:W,
      border:`2px solid ${D}`,borderRadius:12,padding:"14px 18px",
      display:"flex",alignItems:"center",gap:12,
      boxShadow:"0 12px 40px rgba(0,63,45,.2)",
      animation:"toastIn .4s cubic-bezier(.34,1.4,.64,1) forwards",maxWidth:310}}>
      <div style={{flex:1}}>
        <div style={{color:D,fontWeight:700,fontSize:13}}>Download Ready</div>
        <div style={{color:MU,fontSize:12,marginTop:3,lineHeight:1.4}}>{msg}</div>
      </div>
      <div onClick={onClose} style={{color:MU,cursor:"pointer",fontSize:20,lineHeight:1}}>×</div>
    </div>
  );
}

function AdminLoginModal({onClose,onSuccess}){
  const[u,su]=useState(""),[p,sp]=useState(""),[err,se]=useState(""),[loading,sl]=useState(false);
  const submit=()=>{
    sl(true);se("");
    setTimeout(()=>{
      if(u===ADMIN_USER&&p===ADMIN_PASS){onSuccess();}
      else{se("Invalid credentials. Please try again.");sl(false);}
    },900);
  };
  return(
    <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,20,12,.6)",
      backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",
      animation:"fadeIn .2s ease"}}>
      <div style={{background:W,borderRadius:20,padding:"40px 40px 36px",width:360,maxWidth:"90vw",
        boxShadow:"0 24px 64px rgba(0,63,45,.22)",animation:"modalIn .3s cubic-bezier(.22,1,.36,1)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:48,height:48,borderRadius:14,background:PL,
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",
            border:`1px solid ${BD}`,fontSize:22}}>🔐</div>
          <h2 style={{fontSize:20,fontWeight:900,color:D,margin:"0 0 6px",letterSpacing:"-.4px"}}>Admin Sign In</h2>
          <p style={{color:MU,fontSize:13,margin:0}}>Restricted access · CBRE administrators only</p>
        </div>
        {[["USERNAME","text",u,su,"Enter username"],["PASSWORD","password",p,sp,"Enter password"]].map(([lbl,type,val,set,ph])=>(
          <div key={lbl} style={{marginBottom:14}}>
            <div style={{fontSize:11,color:M,fontWeight:700,letterSpacing:".5px",marginBottom:6}}>{lbl}</div>
            <input type={type} value={val} onChange={e=>set(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()} placeholder={ph}
              style={{width:"100%",boxSizing:"border-box",background:PLR,border:`1px solid ${BD}`,
                borderRadius:9,padding:"11px 14px",fontSize:14,color:D,fontFamily:"inherit"}}/>
          </div>
        ))}
        {err&&<div style={{background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:8,
          padding:"9px 13px",marginBottom:14,fontSize:12,color:"#B91C1C"}}>{err}</div>}
        <button onClick={submit} className="btn-p"
          style={{width:"100%",background:D,color:W,padding:"13px",borderRadius:10,
            fontWeight:700,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {loading?<><div style={{width:13,height:13,borderRadius:"50%",border:"2px solid rgba(255,255,255,.4)",
            borderTopColor:W,animation:"spin .8s linear infinite"}}/> Signing in...</>:"Sign In"}
        </button>
        <button onClick={onClose} className="btn-o"
          style={{width:"100%",marginTop:10,background:"transparent",color:MU,
            padding:"10px",borderRadius:10,fontWeight:500,fontSize:13,cursor:"pointer"}}>Cancel</button>
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
    <div style={{background:PLR,minHeight:"100vh",paddingTop:59}}>
      <div style={{background:D}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"20px 36px",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:"rgba(255,255,255,.5)",fontSize:10,letterSpacing:"1px",marginBottom:4}}>ADMIN PORTAL</div>
            <h1 style={{color:W,fontSize:22,fontWeight:900,margin:0,letterSpacing:"-.5px"}}>Template Management</h1>
            <p style={{color:"rgba(255,255,255,.5)",fontSize:12,margin:"4px 0 0"}}>Upload and manage DCF templates for end users</p>
          </div>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <div style={{textAlign:"right"}}>
              <div style={{color:"rgba(255,255,255,.5)",fontSize:10,letterSpacing:".4px"}}>UPLOADED</div>
              <div style={{color:BR,fontWeight:800,fontSize:20}}>{totalUploaded} / 29</div>
            </div>
            <button onClick={onLogout} className="btn-o"
              style={{background:"rgba(255,255,255,.1)",color:W,border:"1px solid rgba(255,255,255,.2)",
                padding:"9px 18px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"30px 36px"}}>
        <p style={{color:MU,fontSize:13,marginBottom:24}}>
          Expand each property category to upload the corresponding Excel DCF template for each property type.
        </p>
        {TMPLS.map(cat=>{
          const catUploads=cat.types.filter(pt=>uploads[`${cat.id}__${pt.id}`]).length;
          const isOpen=expandedCat===cat.id;
          return(
            <div key={cat.id} style={{background:W,border:`1px solid ${BD}`,borderRadius:16,
              marginBottom:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,63,45,.06)"}}>
              <div onClick={()=>setExp(isOpen?null:cat.id)}
                style={{padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",
                  cursor:"pointer",background:isOpen?PL:W,borderBottom:isOpen?`1px solid ${BD}`:"none",transition:"background .2s"}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{background:isOpen?D:PLR,border:`1px solid ${BD}`,borderRadius:10,
                    width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",
                    fontWeight:800,fontSize:12,color:isOpen?W:D,transition:"all .2s"}}>{cat.title[0]}</div>
                  <div>
                    <div style={{fontWeight:800,fontSize:15,color:D}}>{cat.title}</div>
                    <div style={{fontSize:12,color:MU,marginTop:1}}>{cat.sub}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{background:catUploads===cat.types.length?D:catUploads>0?M:PLR,
                    color:catUploads>0?W:MU,borderRadius:100,padding:"3px 12px",fontSize:11,fontWeight:700}}>
                    {catUploads} / {cat.types.length} uploaded
                  </div>
                  <div style={{color:MU,fontSize:18,transition:"transform .2s",transform:isOpen?"rotate(180deg)":"none"}}>▾</div>
                </div>
              </div>
              {isOpen&&(
                <div style={{animation:"expandIn .25s ease"}}>
                  {cat.types.map((pt,i)=>{
                    const key=`${cat.id}__${pt.id}`;
                    const uploaded=uploads[key];
                    return(
                      <div key={pt.id} className="adm-row"
                        style={{padding:"14px 24px",borderBottom:i<cat.types.length-1?`1px solid ${BD}`:"none",
                          display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,background:W}}>
                        <div style={{flex:"1 1 180px"}}>
                          <div style={{fontWeight:700,fontSize:13,color:D}}>{pt.label}</div>
                          <div style={{fontSize:11,color:MU,marginTop:2}}>{pt.note}</div>
                        </div>
                        {uploaded?.loading?(
                          <div style={{display:"flex",alignItems:"center",gap:10,minWidth:220,flex:"1 1 auto",justifyContent:"flex-end"}}>
                            <div style={{flex:"0 1 180px"}}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:MU,marginBottom:5}}>
                                <span style={{display:"flex",alignItems:"center",gap:6}}>
                                  <div style={{width:11,height:11,borderRadius:"50%",border:`2px solid ${BD}`,
                                    borderTopColor:M,animation:"spin .8s linear infinite"}}/>
                                  Uploading
                                </span>
                                <span style={{fontWeight:700,color:D}}>{uploaded.progress??0}%</span>
                              </div>
                              <div style={{height:5,background:PL,borderRadius:3,overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${uploaded.progress??0}%`,
                                  background:`linear-gradient(90deg,${M},${BR})`,
                                  transition:"width .2s ease",borderRadius:3}}/>
                              </div>
                            </div>
                            <div onClick={()=>handleCancel(key)}
                              style={{background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:8,
                                padding:"6px 12px",fontSize:11,fontWeight:600,color:"#B91C1C",cursor:"pointer",whiteSpace:"nowrap"}}>
                              Cancel
                            </div>
                          </div>
                        ):uploaded?(
                          <div style={{display:"flex",alignItems:"center",gap:10,flex:"1 1 auto",justifyContent:"flex-end",flexWrap:"wrap"}}>
                            <div style={{background:"#F0FDF4",border:"1px solid #86EFAC",borderRadius:8,padding:"6px 12px",fontSize:11}}>
                              <div style={{color:"#15803D",fontWeight:700}}>{uploaded.name}</div>
                              <div style={{color:"#4ADE80",marginTop:1}}>{uploaded.size} · {uploaded.date}</div>
                            </div>
                            <label style={{cursor:"pointer"}}>
                              <input type="file" accept=".xlsx,.xls" style={{display:"none"}}
                                onChange={e=>handleFileChange(cat.id,pt.id,pt.label,e)}/>
                              <div style={{background:PLR,border:`1px solid ${BD}`,borderRadius:8,
                                padding:"7px 13px",fontSize:11,fontWeight:600,color:M,cursor:"pointer"}}>Replace</div>
                            </label>
                            <div onClick={()=>handleRemove(key)}
                              style={{background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:8,
                                padding:"7px 13px",fontSize:11,fontWeight:600,color:"#B91C1C",cursor:"pointer"}}>Remove</div>
                          </div>
                        ):(
                          <label style={{cursor:"pointer",flex:"0 0 auto"}}>
                            <input type="file" accept=".xlsx,.xls" style={{display:"none"}}
                              onChange={e=>handleFileChange(cat.id,pt.id,pt.label,e)}/>
                            <div className="upload-zone"
                              style={{border:`1.5px dashed ${BD}`,borderRadius:9,padding:"9px 18px",
                                display:"flex",alignItems:"center",gap:8,fontSize:12,fontWeight:600,color:M}}>
                              <span style={{fontSize:15}}>+</span> Upload .xlsx
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
        <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,background:W,
          border:`2px solid ${BR}`,borderRadius:12,padding:"14px 18px",
          display:"flex",alignItems:"center",gap:10,
          boxShadow:"0 12px 40px rgba(0,63,45,.18)",animation:"toastIn .35s ease",maxWidth:320}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:BR,flexShrink:0}}/>
          <div style={{fontSize:13,color:D,fontWeight:600}}>{uploadToast}</div>
        </div>
      )}
    </div>
  );
}

/* ── Editorial data — published in this issue ── */
const EDITION={vol:"IV",no:"04",year:"MMXXVI",month:"MAY",loc:"KUALA LUMPUR",iss:"01"};

const TICKER=[
  {seg:"Office Grade A",loc:"KL Central",y:"5.75",d:"-0.12"},
  {seg:"Office Grade B",loc:"KL Fringe",y:"6.40",d:"-0.05"},
  {seg:"Retail Prime",loc:"Bukit Bintang",y:"7.10",d:"+0.08"},
  {seg:"Retail Suburban",loc:"Petaling Jaya",y:"7.85",d:"+0.02"},
  {seg:"Logistics",loc:"Shah Alam",y:"6.20",d:"=0.00"},
  {seg:"Industrial",loc:"Johor Bahru",y:"7.05",d:"-0.03"},
  {seg:"Hotel Upscale",loc:"Penang",y:"8.10",d:"+0.15"},
  {seg:"Residential High-Rise",loc:"Mont Kiara",y:"4.90",d:"-0.08"},
  {seg:"Residential Landed",loc:"Damansara",y:"4.20",d:"-0.04"},
  {seg:"Agricultural",loc:"Pahang",y:"6.80",d:"+0.01"},
  {seg:"Development Land",loc:"Selangor",y:"—",d:"—"},
];

const LIBRARY=[
  {num:"I",dept:"Methodology",title:"Industry-Standard DCF",
   body:"WACC, IRR, NPV and cap-rate logic, calibrated across asset classes and reviewed by practicing valuers. The mathematics are already proven, the references already documented.",
   quote:"The mathematics already proven."},
  {num:"II",dept:"Geography",title:"Malaysian-Tuned",
   body:"Ringgit currency throughout, local rental tiers, MSC office grades and statutory considerations baked into every workbook — calibrated to our market, not adapted from a US template.",
   quote:"Built for our market, not adapted from another."},
  {num:"III",dept:"Provenance",title:"Continuously Revised",
   body:"New editions reflect the latest yields, rentals and absorption rates as recorded by CBRE Research. Workbooks are dated, versioned, and traceable to source data.",
   quote:"Current with the market as it moves."},
];

const PROCEDURE=[
  {roman:"I",verb:"Select",obj:"a category — Residential, Commercial, Industrial or Land."},
  {roman:"II",verb:"Specify",obj:"a property type — terrace, warehouse, office tower, shophouse."},
  {roman:"III",verb:"Download",obj:"the workbook, plug in your deal, present your numbers."},
];

const NOISE_SVG=`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.04 0 0 0 0 0.04 0 0 0 0 0.03 0 0 0 0.22 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`;
const NOISE_URL=`url("data:image/svg+xml;utf8,${encodeURIComponent(NOISE_SVG)}")`;

function PaperGrain({opacity=.55}){
  return(
    <div aria-hidden style={{position:"absolute",inset:0,pointerEvents:"none",
      opacity,mixBlendMode:"multiply",zIndex:0,
      backgroundImage:NOISE_URL,backgroundSize:"220px 220px"}}/>
  );
}

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
function WaxSeal({onComplete,size=216,duration=900}){
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

  const fillR=p*36;
  const flipped=p>0.45;
  const trans=holding?"none":"r .35s cubic-bezier(.4,0,.2,1)";

  return(
    <button
      onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      onClick={e=>e.stopPropagation()} onContextMenu={e=>e.preventDefault()}
      aria-label="Press and hold to enter the library"
      style={{position:"relative",width:size,height:size,
        background:"transparent",border:"none",cursor:"pointer",padding:0,
        userSelect:"none",touchAction:"none",fontFamily:"inherit",
        filter:holding?"drop-shadow(0 8px 22px rgba(10,10,8,.22))":"drop-shadow(0 4px 12px rgba(10,10,8,.14))",
        transition:"filter .2s ease,transform .2s ease",
        transform:holding?"scale(.985)":"scale(1)"}}>
      <svg viewBox="-50 -50 100 100" style={{width:"100%",height:"100%",overflow:"visible",display:"block"}}>
        <defs>
          <path id="ws-top" d="M -39 -5 A 39 39 0 0 1 39 -5"/>
          <path id="ws-bot" d="M -33 6 A 33 33 0 0 0 33 6"/>
          <radialGradient id="ws-wax" cx="40%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#0F5239"/>
            <stop offset="55%" stopColor="#003F2D"/>
            <stop offset="100%" stopColor="#012219"/>
          </radialGradient>
        </defs>

        {/* outer rim — double hairline */}
        <circle cx="0" cy="0" r="47" fill="none" stroke={INK} strokeWidth=".7"/>
        <circle cx="0" cy="0" r="45.4" fill="none" stroke={INK} strokeWidth=".25"/>

        {/* curved text on upper arc */}
        <text fontSize="3.4" letterSpacing="2.4" fill={INK}
          style={{fontFamily:"'JetBrains Mono', monospace",textTransform:"uppercase",fontWeight:500}}>
          <textPath href="#ws-top" startOffset="50%" textAnchor="middle">VALOREM · CBRE MALAYSIA</textPath>
        </text>

        {/* curved text on lower arc */}
        <text fontSize="2.9" letterSpacing="2" fill={INK}
          style={{fontFamily:"'JetBrains Mono', monospace",textTransform:"uppercase",fontWeight:500}}>
          <textPath href="#ws-bot" startOffset="50%" textAnchor="middle">EST · MMXXVI</textPath>
        </text>

        {/* ornamental side marks — printer's flourish */}
        <g fill={INK} stroke={INK} strokeWidth=".25">
          <circle cx="-43" cy="0" r=".7" fill={INK}/>
          <circle cx="43" cy="0" r=".7" fill={INK}/>
          <path d="M -47 -2 L -49 0 L -47 2" fill="none"/>
          <path d="M 47 -2 L 49 0 L 47 2" fill="none"/>
        </g>

        {/* inner ring */}
        <circle cx="0" cy="0" r="38" fill="none" stroke={INK} strokeWidth=".32"/>
        <circle cx="0" cy="0" r="36.6" fill="none" stroke={INK} strokeWidth=".15"/>

        {/* wax fill — radial, soaking outward */}
        <circle cx="0" cy="0" r={fillR} fill="url(#ws-wax)" style={{transition:trans}}/>
        {p>0.04 && (
          <circle cx="-5" cy="-6" r={fillR*.38} fill="rgba(255,255,255,.08)" style={{transition:trans}}/>
        )}

        {/* V monogram — Fraunces italic */}
        <text x="0" y="3" textAnchor="middle"
          fontSize="32" fill={flipped?PAPER:INK}
          style={{fontFamily:"'Fraunces', serif",fontWeight:600,fontStyle:"italic",
            transition:"fill .25s ease",fontVariationSettings:"'opsz' 144"}}>V</text>

        {/* instruction */}
        <text x="0" y="20" textAnchor="middle"
          fontSize="3" letterSpacing="2.6" fontWeight="500"
          fill={flipped?"rgba(242,237,228,.8)":MUTED_INK}
          style={{fontFamily:"'JetBrains Mono', monospace",textTransform:"uppercase",
            transition:"fill .25s ease"}}>
          Press · Hold
        </text>
      </svg>
    </button>
  );
}

/* ── Masthead-style hero — editorial cover ── */
function Hero({onEnter}){
  const wide=useIsWide(1100);
  const heroCols=wide?"180px 1fr 240px":"1fr";
  return(
    <section style={{position:"relative",background:PAPER,overflow:"hidden",
      borderBottom:`1px solid ${HAIR}`}}>
      <PaperGrain/>

      {/* Edition strip — between nav and hero body */}
      <div style={{padding:wide?"86px 56px 14px":"82px 28px 12px",
        position:"relative",zIndex:2,borderBottom:`1px solid ${INK}`,
        display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"baseline",gap:18,
        fontFamily:"'JetBrains Mono', monospace",fontSize:10,
        color:INK,letterSpacing:"2px",textTransform:"uppercase",fontWeight:500}}>
        <span><strong style={{letterSpacing:"3px",fontWeight:600}}>Vol · {EDITION.vol}</strong> &nbsp; · &nbsp; No · {EDITION.no}</span>
        <span style={{flex:wide?1:"unset",textAlign:"center",opacity:.55,letterSpacing:"3.5px"}}>
          A Library of DCF Workbooks &nbsp;·&nbsp; Published by CBRE Malaysia
        </span>
        <span>{EDITION.month} · {EDITION.year} &nbsp; · &nbsp; {EDITION.loc}</span>
      </div>

      {/* Hero body — three-column editorial */}
      <div style={{display:"grid",gridTemplateColumns:heroCols,gap:0,
        padding:wide?"68px 56px 96px":"48px 28px 72px",
        position:"relative",zIndex:1,maxWidth:1480,margin:"0 auto"}}>

        {/* Left marginalia */}
        {wide && (
          <aside style={{borderRight:`1px solid ${HAIR}`,paddingRight:28,
            fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
            color:MUTED_INK,letterSpacing:"1.5px",textTransform:"uppercase",
            lineHeight:2.4}}>
            <div style={{color:INK,fontWeight:600,marginBottom:18,fontSize:10.5,letterSpacing:"2px"}}>—— Frontispiece</div>
            <div>Volume — {EDITION.vol}</div>
            <div>Number — {EDITION.no}</div>
            <div>Issue — {EDITION.iss}</div>
            <div>Anno — {EDITION.year}</div>
            <div style={{marginTop:22,color:OXBLOOD,fontWeight:600}}>—— Filed:</div>
            <div>{EDITION.loc}</div>
            <div>{EDITION.month} · {EDITION.year}</div>
          </aside>
        )}

        {/* Main column */}
        <div style={{padding:wide?"0 56px":"0",position:"relative"}}>
          <div style={{fontFamily:"'JetBrains Mono', monospace",
            fontSize:10,color:OXBLOOD,letterSpacing:"3.5px",
            textTransform:"uppercase",marginBottom:34,fontWeight:600,
            display:"flex",alignItems:"center",gap:14,
            animation:"inkSink .8s ease forwards"}}>
            <span style={{width:34,height:1,background:OXBLOOD,display:"inline-block"}}/>
            Department of Property Valuation
          </div>

          <h1 style={{
            fontFamily:"'Fraunces', serif",
            fontSize:"clamp(54px,9vw,128px)",
            fontWeight:300,
            lineHeight:.94,letterSpacing:"-.04em",
            color:INK,margin:"0 0 28px",
            fontVariationSettings:"'opsz' 144"}}>
            Valuation,<br/>
            <em style={{fontWeight:400,fontVariationSettings:"'opsz' 144"}}>without</em>
            <span aria-hidden style={{display:"inline-block",width:18,height:18,
              background:OXBLOOD,borderRadius:"50%",margin:"0 14px 8px 20px",
              verticalAlign:"middle"}}/>
            <br/>
            Reinvention.
          </h1>

          <p style={{
            fontFamily:"'Instrument Sans', sans-serif",
            fontSize:17,lineHeight:1.62,
            color:INK,maxWidth:600,
            margin:"0 0 48px",fontWeight:400}}>
            <span style={{
              fontFamily:"'Fraunces', serif",
              fontSize:80,float:"left",
              lineHeight:.82,marginRight:14,
              marginTop:8,marginBottom:-4,
              fontWeight:600,color:INK,
              fontVariationSettings:"'opsz' 144"}}>P</span>
            re-built Discounted Cash Flow workbooks for the Malaysian property market — residential, commercial, industrial and land. Each model is wired by practicing valuers and reviewed against current CBRE market data. Open the workbook, plug in your deal, present the numbers.
          </p>

          {/* CTA — wax seal + caption */}
          <div style={{display:"flex",alignItems:"center",gap:36,marginTop:4,flexWrap:"wrap"}}>
            <WaxSeal onComplete={onEnter}/>
            <div style={{maxWidth:260}}>
              <div style={{
                fontFamily:"'Fraunces', serif",fontStyle:"italic",
                fontSize:21,color:INK,lineHeight:1.32,
                fontWeight:400,marginBottom:10,
                fontVariationSettings:"'opsz' 36"}}>
                Press &amp; hold the seal to enter the library.
              </div>
              <div style={{
                fontFamily:"'JetBrains Mono', monospace",
                fontSize:9.5,letterSpacing:"1.8px",
                color:MUTED_INK,textTransform:"uppercase",lineHeight:1.7}}>
                ↳ Free · No signup · Always current
              </div>
            </div>
          </div>
        </div>

        {/* Right marginalia — fact card */}
        {wide && (
          <aside style={{borderLeft:`1px solid ${HAIR}`,paddingLeft:28}}>
            <div style={{
              fontFamily:"'JetBrains Mono', monospace",fontSize:10.5,
              color:INK,letterSpacing:"2px",fontWeight:600,marginBottom:14,
              textTransform:"uppercase"}}>—— Catalogue</div>
            {[
              ["Categories","04"],
              ["Property Types","29"],
              ["Format","XLSX"],
              ["Currency","RM"],
              ["Coverage","Peninsular MY"],
              ["Edition","I · MMXXVI"]
            ].map(([k,v],i,a)=>(
              <div key={k} style={{
                padding:"13px 0",
                borderBottom:i<a.length-1?`1px solid ${HAIR}`:"none",
                display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                <span style={{
                  fontFamily:"'JetBrains Mono', monospace",
                  fontSize:9.5,color:MUTED_INK,letterSpacing:"1.2px",
                  textTransform:"uppercase"}}>{k}</span>
                <span style={{
                  fontFamily:"'Fraunces', serif",
                  fontSize:17,color:INK,fontWeight:500,
                  fontVariationSettings:"'opsz' 36"}}>{v}</span>
              </div>
            ))}
          </aside>
        )}
      </div>

      {/* Lower edge marks */}
      <div style={{position:"absolute",bottom:22,left:wide?56:28,
        fontFamily:"'JetBrains Mono', monospace",fontSize:9,
        color:MUTED_INK,letterSpacing:"2px",textTransform:"uppercase",zIndex:2}}>
        — Pg · 01
      </div>
      <div style={{position:"absolute",bottom:22,right:wide?56:28,
        fontFamily:"'JetBrains Mono', monospace",fontSize:9,
        color:MUTED_INK,letterSpacing:"2px",textTransform:"uppercase",zIndex:2}}>
        Scroll ↓
      </div>
    </section>
  );
}

/* ── Market ticker — dark inverted band, Bloomberg-style ── */
function MarketTicker(){
  const seq=[...TICKER,...TICKER];
  return(
    <section style={{background:INK,padding:"24px 0",overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",inset:0,
        background:"linear-gradient(90deg,#0A0A08 0%,transparent 6%,transparent 94%,#0A0A08 100%)",
        zIndex:2,pointerEvents:"none"}}/>
      <div style={{display:"flex",animation:"tickerScroll 95s linear infinite",
        whiteSpace:"nowrap",width:"max-content",willChange:"transform"}}>
        {seq.map((r,i)=>{
          const sign=r.d.startsWith("-")?"down":r.d.startsWith("+")?"up":"flat";
          const arrow=sign==="down"?"↓":sign==="up"?"↑":"→";
          const col=sign==="down"?"#5FB591":sign==="up"?"#D88898":"rgba(242,237,228,.4)";
          return(
            <span key={i} style={{
              display:"inline-flex",alignItems:"baseline",gap:12,
              marginRight:54,
              fontFamily:"'JetBrains Mono', monospace",fontSize:10.5,
              letterSpacing:"1.4px",textTransform:"uppercase"}}>
              <span style={{color:"rgba(242,237,228,.62)",fontWeight:500}}>{r.seg}</span>
              <span style={{color:"rgba(242,237,228,.25)"}}>·</span>
              <span style={{color:"rgba(242,237,228,.45)"}}>{r.loc}</span>
              <span style={{color:"rgba(242,237,228,.25)"}}>·</span>
              <span style={{color:PAPER,fontWeight:600,fontSize:12.5}}>{r.y}{r.y!=="—"?"%":""}</span>
              <span style={{color:col,fontSize:10,letterSpacing:"1px",fontWeight:500}}>
                {arrow} {r.d.replace(/^[-+=]/,'')}
              </span>
            </span>
          );
        })}
      </div>
    </section>
  );
}

/* ── §02 The Library — three editorial entries ── */
function LibraryEntry({num,dept,title,body,quote,idx,last}){
  const[ref,v]=useInView(.12);
  return(
    <article ref={ref} style={{
      padding:"40px 32px 44px",
      borderRight:last?"none":`1px solid ${HAIR}`,
      borderBottom:`1px solid ${INK}`,
      position:"relative",
      opacity:v?1:0,transform:v?"translateY(0)":"translateY(20px)",
      transition:`opacity .7s ease ${idx*.14}s,transform .7s cubic-bezier(.22,1,.36,1) ${idx*.14}s`}}>

      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",
        marginBottom:24}}>
        <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10,
          color:MUTED_INK,letterSpacing:"2px",textTransform:"uppercase",fontWeight:600}}>{dept}</div>
        <div style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",
          fontSize:38,color:OXBLOOD,fontWeight:300,lineHeight:1,
          fontVariationSettings:"'opsz' 144"}}>{num}</div>
      </div>

      <h3 style={{
        fontFamily:"'Fraunces', serif",
        fontSize:26,fontWeight:500,letterSpacing:"-.015em",
        color:INK,margin:"0 0 16px",lineHeight:1.18,
        fontVariationSettings:"'opsz' 72"}}>{title}</h3>

      <p style={{fontFamily:"'Instrument Sans', sans-serif",
        fontSize:14.5,lineHeight:1.65,color:INK,
        margin:"0 0 26px",fontWeight:400}}>{body}</p>

      <blockquote style={{
        fontFamily:"'Fraunces', serif",fontStyle:"italic",
        fontSize:15,color:OXBLOOD,
        margin:0,paddingLeft:14,borderLeft:`1.5px solid ${OXBLOOD}`,
        lineHeight:1.42,letterSpacing:"-.005em",fontWeight:400,
        fontVariationSettings:"'opsz' 36"}}>
        “{quote}”
      </blockquote>
    </article>
  );
}

function TheLibrary(){
  const wide=useIsWide(1000);
  return(
    <section style={{background:PAPER,padding:wide?"120px 56px":"80px 28px",
      position:"relative",borderBottom:`1px solid ${HAIR}`,overflow:"hidden"}}>
      <PaperGrain/>
      <div style={{maxWidth:1320,margin:"0 auto",position:"relative",zIndex:1}}>
        {/* Section header */}
        <div style={{display:"grid",
          gridTemplateColumns:wide?"180px 1fr 240px":"1fr",gap:0,
          marginBottom:wide?80:48}}>
          <div style={{borderRight:wide?`1px solid ${HAIR}`:"none",
            paddingRight:wide?28:0,marginBottom:wide?0:24}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10.5,
              color:OXBLOOD,letterSpacing:"2.5px",textTransform:"uppercase",fontWeight:600}}>
              §02
            </div>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
              color:MUTED_INK,letterSpacing:"1.5px",textTransform:"uppercase",
              marginTop:8,lineHeight:1.8}}>
              The Library
            </div>
          </div>
          <div style={{padding:wide?"0 56px":"0"}}>
            <h2 style={{
              fontFamily:"'Fraunces', serif",
              fontSize:"clamp(38px,5.4vw,72px)",
              fontWeight:300,
              lineHeight:1.02,letterSpacing:"-.025em",
              color:INK,margin:"0 0 22px",
              fontVariationSettings:"'opsz' 144"}}>
              Three reasons<br/>
              <em style={{fontWeight:400}}>this exists.</em>
            </h2>
            <p style={{fontFamily:"'Instrument Sans', sans-serif",
              fontSize:16,lineHeight:1.62,color:MUTED_INK,maxWidth:520,margin:0}}>
              Every workbook is reviewed by practicing valuers, calibrated to Malaysian market conditions, and kept current as yields move. Below — the working principles.
            </p>
          </div>
          {wide && <div/>}
        </div>

        {/* Three editorial entries */}
        <div style={{display:"grid",
          gridTemplateColumns:wide?"repeat(3,1fr)":"1fr",gap:0,
          borderTop:`1px solid ${INK}`}}>
          {LIBRARY.map((item,i)=>(
            <LibraryEntry key={item.num} {...item} idx={i} last={wide&&i===LIBRARY.length-1}/>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── §03 Procedure — three printed steps ── */
function Procedure(){
  const wide=useIsWide(900);
  const[ref,v]=useInView(.08);
  return(
    <section ref={ref} style={{background:PAPER_2,padding:wide?"110px 56px":"72px 28px",
      position:"relative",borderBottom:`1px solid ${HAIR}`,overflow:"hidden"}}>
      <PaperGrain opacity={.3}/>
      <div style={{maxWidth:1320,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{display:"grid",
          gridTemplateColumns:wide?"180px 1fr":"1fr",gap:0,marginBottom:wide?64:36}}>
          <div style={{borderRight:wide?`1px solid ${HAIR}`:"none",
            paddingRight:wide?28:0,marginBottom:wide?0:24}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10.5,
              color:OXBLOOD,letterSpacing:"2.5px",textTransform:"uppercase",fontWeight:600}}>
              §03
            </div>
            <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
              color:MUTED_INK,letterSpacing:"1.5px",textTransform:"uppercase",
              marginTop:8,lineHeight:1.8}}>
              Procedure
            </div>
          </div>
          <div style={{padding:wide?"0 56px":"0"}}>
            <h2 style={{
              fontFamily:"'Fraunces', serif",
              fontSize:"clamp(34px,4.6vw,64px)",
              fontWeight:300,
              lineHeight:1.02,letterSpacing:"-.025em",
              color:INK,margin:0,
              fontVariationSettings:"'opsz' 144"}}>
              In <em style={{fontWeight:400}}>three steps</em>.
            </h2>
          </div>
        </div>

        {/* Steps */}
        <div style={{display:"grid",
          gridTemplateColumns:wide?"repeat(3,1fr)":"1fr",gap:0,
          borderTop:`1px solid ${INK}`,borderBottom:`1px solid ${INK}`,
          background:PAPER}}>
          {PROCEDURE.map((s,i)=>(
            <div key={s.roman} style={{
              padding:wide?"56px 40px 60px":"40px 28px",
              borderRight:wide&&i<2?`1px solid ${HAIR}`:"none",
              borderBottom:!wide&&i<2?`1px solid ${HAIR}`:"none",
              position:"relative",
              opacity:v?1:0,transform:v?"translateY(0)":"translateY(16px)",
              transition:`opacity .6s ease ${i*.18}s,transform .6s cubic-bezier(.22,1,.36,1) ${i*.18}s`}}>
              <div style={{
                fontFamily:"'Fraunces', serif",fontStyle:"italic",
                fontSize:96,color:HAIR,fontWeight:300,lineHeight:1,
                margin:"0 0 26px",
                fontVariationSettings:"'opsz' 144"}}>{s.roman}</div>
              <div style={{
                fontFamily:"'JetBrains Mono', monospace",fontSize:11,
                color:OXBLOOD,letterSpacing:"3px",fontWeight:600,
                textTransform:"uppercase",marginBottom:14,
                display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:INK}}>—</span>{s.verb}
              </div>
              <div style={{
                fontFamily:"'Fraunces', serif",fontSize:22,
                fontWeight:400,letterSpacing:"-.012em",lineHeight:1.32,
                color:INK,fontVariationSettings:"'opsz' 72"}}>
                {s.obj}
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop:22,display:"flex",justifyContent:"space-between",
          fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
          color:MUTED_INK,letterSpacing:"1.5px",textTransform:"uppercase"}}>
          <span>— Filed under Procedure</span>
          <span>Pg · 03</span>
        </div>
      </div>
    </section>
  );
}

/* ── §04 Colophon — closing CTA + printer's mark ── */
function Colophon({onEnter}){
  const wide=useIsWide(900);
  const[ref,v]=useInView(.15);
  return(
    <section ref={ref} style={{background:PAPER,padding:wide?"140px 56px 96px":"96px 28px 64px",
      position:"relative",borderTop:`1px solid ${INK}`,overflow:"hidden"}}>
      <PaperGrain/>
      <div style={{maxWidth:900,margin:"0 auto",position:"relative",zIndex:1,
        textAlign:"center",
        opacity:v?1:0,transform:v?"translateY(0)":"translateY(20px)",
        transition:"opacity .8s ease,transform .8s cubic-bezier(.22,1,.36,1)"}}>

        <div style={{fontFamily:"'JetBrains Mono', monospace",fontSize:10,
          color:OXBLOOD,letterSpacing:"4px",fontWeight:600,
          textTransform:"uppercase",marginBottom:38,
          display:"inline-flex",alignItems:"center",gap:14}}>
          <span style={{width:48,height:1,background:OXBLOOD}}/>
          §04 · Colophon
          <span style={{width:48,height:1,background:OXBLOOD}}/>
        </div>

        <h2 style={{
          fontFamily:"'Fraunces', serif",
          fontSize:"clamp(46px,7.2vw,96px)",
          fontWeight:300,letterSpacing:"-.032em",lineHeight:.98,
          color:INK,margin:"0 0 30px",
          fontVariationSettings:"'opsz' 144"}}>
          Begin your<br/>
          <em style={{fontWeight:400,color:OXBLOOD,fontVariationSettings:"'opsz' 144"}}>valuation.</em>
        </h2>

        <p style={{fontFamily:"'Instrument Sans', sans-serif",
          fontSize:16,lineHeight:1.64,color:INK,
          maxWidth:540,margin:"0 auto 56px"}}>
          Press and hold the seal below. The library opens. Free, current, and indexed by property class.
        </p>

        <div style={{display:"flex",justifyContent:"center",marginBottom:72}}>
          <WaxSeal onComplete={onEnter}/>
        </div>

        {/* Printer's mark — footer info */}
        <div style={{marginTop:64,paddingTop:34,
          borderTop:`1px solid ${HAIR}`,
          display:"flex",justifyContent:"space-between",alignItems:"baseline",
          flexWrap:"wrap",gap:18,
          fontFamily:"'JetBrains Mono', monospace",fontSize:9.5,
          color:MUTED_INK,letterSpacing:"1.5px",textTransform:"uppercase"}}>
          <span>Valorem · A library of DCF workbooks</span>
          <span style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",
            fontSize:14,color:INK,letterSpacing:"normal",textTransform:"none",fontWeight:400,
            fontVariationSettings:"'opsz' 36"}}>
            Published by CBRE Malaysia
          </span>
          <span>Anno {EDITION.year} · No. {EDITION.no}</span>
        </div>
      </div>
    </section>
  );
}

function LandingPage({onEnter}){
  return(
    <div style={{background:PAPER}}>
      <Hero onEnter={onEnter}/>
      <MarketTicker/>
      <TheLibrary/>
      <Procedure/>
      <Colophon onEnter={onEnter}/>
    </div>
  );
}

function TemplateCard({t,onDownload,downloading,uploads,stats}){
  const[ref,v]=useInView(.04);
  const[sel,setSel]=useState(null);
  const busy=downloading===t.id+(sel||"");
  const selectedType=t.types.find(x=>x.id===sel);
  const uploadInfo=sel?uploads[`${t.id}__${sel}`]:null;
  const hasFile=!!(uploadInfo?.url);
  const cs=computeCatStats(t.id,stats);

  return(
    <div ref={ref} className="vf-card"
      style={{background:W,border:`1px solid ${BD}`,borderRadius:20,overflow:"hidden",
        boxShadow:"0 4px 22px rgba(0,63,45,.07)",
        opacity:v?1:0,transform:v?"translateY(0)":"translateY(24px)",
        transition:"opacity .55s ease,transform .55s cubic-bezier(.22,1,.36,1)",
        display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{background:PL,padding:"20px 24px 16px",borderBottom:`1px solid ${BD}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{display:"inline-block",background:D,borderRadius:100,
              padding:"3px 12px",marginBottom:9,fontSize:10,color:W,fontWeight:700,letterSpacing:".4px"}}>{t.tag}</div>
            <h2 style={{fontSize:18,fontWeight:900,letterSpacing:"-.4px",color:D,margin:"0 0 3px"}}>{t.title}</h2>
            <p style={{color:MU,fontSize:12,margin:0}}>{t.sub}</p>
          </div>
          <div style={{textAlign:"right",fontSize:11,color:M,fontWeight:700,flexShrink:0,marginLeft:12}}>
            <div>{cs.version}</div>
            <div style={{color:MU,fontWeight:400,marginTop:2}}>{cs.updated}</div>
          </div>
        </div>
      </div>
      <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",flex:1}}>
        <p style={{color:MU,fontSize:13,lineHeight:1.75,marginBottom:18}}>{t.desc}</p>
        <div style={{fontSize:9,color:M,fontWeight:700,letterSpacing:"1.2px",textTransform:"uppercase",marginBottom:12}}>
          Select Property Type
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:8,marginBottom:20}}>
          {t.types.map(pt=>{
            const active=sel===pt.id;
            const hasUpload=uploads[`${t.id}__${pt.id}`];
            return(
              <div key={pt.id} className="prop-card" onClick={()=>setSel(active?null:pt.id)}
                style={{background:active?D:PLR,border:`1.5px solid ${active?D:BD}`,
                  borderRadius:10,padding:"10px",position:"relative",minHeight:76,
                  display:"flex",flexDirection:"column",justifyContent:"flex-start",
                  boxShadow:active?"0 4px 14px rgba(0,63,45,.22)":"0 1px 4px rgba(0,63,45,.05)"}}>
                {hasUpload&&<div style={{position:"absolute",top:6,right:6,width:7,height:7,
                  borderRadius:"50%",background:BR}}/>}
                <div style={{fontSize:12,fontWeight:700,color:active?W:D,marginBottom:3,lineHeight:1.3,paddingRight:8}}>
                  {pt.label}
                </div>
                <div style={{fontSize:10,color:active?"rgba(255,255,255,.65)":MU,lineHeight:1.3}}>{pt.note}</div>
              </div>
            );
          })}
        </div>
        {selectedType&&(
          <div style={{background:PL,border:`1px solid ${BD}`,borderRadius:10,
            padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",
            justifyContent:"space-between",animation:"expandIn .25s ease"}}>
            <div>
              <div style={{fontSize:10,color:MU,letterSpacing:".4px",marginBottom:2}}>SELECTED</div>
              <div style={{fontSize:13,fontWeight:700,color:D}}>{selectedType.label}</div>
              {!hasFile&&<div style={{fontSize:11,color:"#B45309",marginTop:2}}>No template uploaded yet</div>}
            </div>
            <div onClick={()=>setSel(null)} style={{color:MU,cursor:"pointer",fontSize:18,lineHeight:1,padding:"0 4px"}}>×</div>
          </div>
        )}
        <div style={{display:"flex",gap:9,marginTop:"auto",marginBottom:16,flexWrap:"wrap"}}>
          {[["Downloads",cs.downloads],["Version",cs.version],["Updated",cs.updated]].map(([k,v])=>(
            <div key={k} style={{background:PLR,border:`1px solid ${BD}`,borderRadius:7,padding:"5px 12px"}}>
              <div style={{fontSize:8,color:MU,letterSpacing:".4px"}}>{k.toUpperCase()}</div>
              <div style={{fontSize:11,fontWeight:700,color:D,marginTop:1}}>{v}</div>
            </div>
          ))}
        </div>
        <div className="dl-btn"
          onClick={()=>sel&&hasFile&&!downloading&&onDownload({id:t.id+sel,title:`${t.title} — ${selectedType?.label}`,url:uploadInfo.url,filename:uploadInfo.name,catId:t.id,typeId:sel})}
          style={{background:sel&&hasFile?"#003F2D":sel&&!hasFile?"#92400E":"rgba(0,63,45,.13)",
            color:sel?"#fff":"rgba(0,63,45,.38)",padding:"14px",borderRadius:10,textAlign:"center",
            fontWeight:700,fontSize:13,boxShadow:sel&&hasFile?"0 4px 14px rgba(0,63,45,.28)":"none",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,userSelect:"none",
            cursor:sel&&hasFile&&!downloading?"pointer":"default",transition:"all .25s ease"}}>
          {busy
            ?<><div style={{width:13,height:13,borderRadius:"50%",
                border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",
                animation:"spin .8s linear infinite"}}/> Preparing download...</>
            :sel&&hasFile?`Download ${selectedType?.label} DCF Template`
            :sel&&!hasFile?"Template not yet available — check back soon"
            :"Select a property type above"}
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
    <div style={{background:PLR,minHeight:"100vh",paddingTop:59}}>
      <div style={{background:D}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",overflowX:"auto"}}>
          {[["Templates","4"],["Total Downloads",totalDl],["Property Types","29"],["Available",`${totalUp}/29`]].map(([l,v],i)=>(
            <div key={i} style={{padding:"16px 30px",borderRight:i<3?"1px solid rgba(255,255,255,.1)":"none",whiteSpace:"nowrap"}}>
              <div style={{color:"rgba(255,255,255,.5)",fontSize:10,letterSpacing:".4px",marginBottom:4}}>{l.toUpperCase()}</div>
              <div style={{fontSize:17,fontWeight:800,color:W}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"36px 36px"}}>
        <h1 style={{fontSize:26,fontWeight:900,letterSpacing:"-1px",marginBottom:6,color:D}}>
          DCF Template <span style={{color:M}}>Library</span>
        </h1>
        <p style={{color:MU,fontSize:14,marginBottom:24}}>
          Select a property category, then choose your specific property type to download the right DCF template.
        </p>
        <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>setSrc(e.target.value)} placeholder="Search property types..."
            style={{flex:"1 1 200px",minWidth:160,background:W,border:`1px solid ${BD}`,borderRadius:8,
              padding:"10px 14px",color:D,fontSize:13,fontFamily:"inherit",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {filters.map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className="fltr"
                style={{padding:"9px 15px",borderRadius:8,fontWeight:filter===f?700:500,fontSize:12,
                  textTransform:"capitalize",background:filter===f?D:W,color:filter===f?W:MU,
                  border:filter===f?"none":`1px solid ${BD}`}}>
                {f==="all"?"All Categories":f}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(480px,1fr))",gap:20,alignItems:"stretch"}}>
          {filtered.map(t=>(
            <TemplateCard key={t.id} t={t} onDownload={onDownload} downloading={downloading} uploads={uploads} stats={stats}/>
          ))}
        </div>
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"72px 0",color:MU}}>
            <p style={{fontSize:14}}>No templates match your search.</p>
          </div>
        )}
      </div>
      <footer style={{borderTop:`1px solid ${BD}`,padding:"22px 36px",textAlign:"center",background:W,marginTop:16}}>
        <p style={{color:MU,fontSize:12}}>CBRE Valorem © 2025 · All templates for professional property valuation use</p>
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
        background:page==="landing"?PAPER:PLR,
        fontFamily:page==="landing"?"'Instrument Sans',sans-serif":"-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif"}}>
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
