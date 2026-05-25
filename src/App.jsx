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
  @keyframes scanLine{0%{transform:translateY(-100%)}100%{transform:translateY(1000%)}}
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
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:#eef6f2}
  ::-webkit-scrollbar-thumb{background:#9fc8b8;border-radius:2px}
`;

const BG="#020D07";
const D="#003F2D",M="#006A4D",BR="#1DB87B",PL="#EEF6F2",PLR="#F7FBF9",W="#FFF",MU="#587066",BD="rgba(0,63,45,.1)";
const ADMIN_USER="admin", ADMIN_PASS="cbre2025";

const TERMS=[
  {t:"IRR",x:7,y:15,sx:.14,mx:22},{t:"NPV",x:83,y:21,sx:.2,mx:18},
  {t:"WACC",x:54,y:7,sx:.09,mx:28},{t:"Cap Rate",x:17,y:71,sx:.24,mx:16},
  {t:"Yield %",x:76,y:65,sx:.17,mx:20},{t:"DCF",x:38,y:84,sx:.11,mx:24},
  {t:"Exit Val",x:90,y:43,sx:.22,mx:15},{t:"PV Factor",x:5,y:49,sx:.18,mx:22},
  {t:"NOI",x:48,y:54,sx:.13,mx:26},{t:"Cash Flow",x:14,y:91,sx:.1,mx:18},
  {t:"Disc.Rate",x:29,y:33,sx:.19,mx:20},{t:"GDV",x:65,y:88,sx:.15,mx:22},
];

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
     {id:"soho",label:"SOHO / SOVO",note:"Small office home office"},
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
     {id:"sofo",label:"SOFO / SOHO",note:"Small office flex units"},
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

/* ── Nav: transparent on landing, white on dashboard/admin ── */
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
      display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 36px",
    }}>
      <div>
        <div style={{fontWeight:800,fontSize:14,letterSpacing:"-.2px",color:onLanding?W:D}}>CBRE <span style={{fontWeight:300,opacity:.6}}>|</span> Valorem</div>
        <div style={{fontSize:9,letterSpacing:"1.2px",marginTop:-1,color:onLanding?"rgba(255,255,255,.45)":MU}}>DCF VALUATION PLATFORM</div>
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
            style={{background:"rgba(255,255,255,.08)",color:W,
              border:"1px solid rgba(255,255,255,.18)",fontFamily:"inherit",
              padding:"8px 20px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer"}}>
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

function AdminPanel({onLogout,uploads,setUploads}){
  const[expandedCat,setExp]=useState(null);
  const[uploadToast,setUT]=useState(null);
  const totalUploaded=Object.keys(uploads).length;

  const handleFileChange=async(catId,typeId,label,e)=>{
    const file=e.target.files[0];if(!file)return;
    const key=`${catId}__${typeId}`;
    e.target.value="";
    setUploads(prev=>({...prev,[key]:{loading:true,progress:0,name:file.name,label,size:"...",date:""}}));
    try{
      const blob=await upload(
        `templates/${catId}/${typeId}/${file.name}`,
        file,
        {access:"public",handleUploadUrl:"/api/upload",
         onUploadProgress:({percentage})=>{
           setUploads(prev=>prev[key]?({...prev,[key]:{...prev[key],progress:Math.round(percentage)}}):prev);
         }}
      );
      setUploads(prev=>({...prev,[key]:{
        url:blob.url,name:file.name,label,
        size:(file.size/1024).toFixed(1)+"KB",
        date:new Date().toLocaleDateString("en-MY",{day:"2-digit",month:"short",year:"numeric"}),
      }}));
      setUT(`"${label}" template uploaded successfully.`);
    }catch(err){
      console.error("Upload failed:",err);
      setUploads(prev=>{const n={...prev};delete n[key];return n;});
      setUT(`Failed to upload "${label}": ${err?.message||"unknown error"}`);
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
                          <div style={{display:"flex",alignItems:"center",gap:12,minWidth:220,flex:"1 1 auto",justifyContent:"flex-end"}}>
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

function HeroBg({mouse,scrollY}){
  const mx=mouse.x,my=mouse.y,sy=scrollY;
  const tiltX=(my*14).toFixed(2);
  const tiltY=(mx*-14).toFixed(2);
  const archLines=[
    {x1:"0%",y1:"30%",x2:"100%",y2:"18%"},
    {x1:"0%",y1:"70%",x2:"100%",y2:"58%"},
    {x1:"25%",y1:"0%",x2:"35%",y2:"100%"},
    {x1:"68%",y1:"0%",x2:"72%",y2:"100%"},
  ];
  return(
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
      {/* Deep glow shift */}
      <div style={{position:"absolute",inset:0,
        background:`radial-gradient(ellipse 80% 70% at ${50+mx*12}% ${50+my*12}%,rgba(0,90,55,.55) 0%,transparent 60%)`,
        transition:"background .6s ease"}}/>
      {/* 3D grid */}
      <div style={{position:"absolute",inset:0,perspective:"600px",
        perspectiveOrigin:`${50+mx*8}% ${50+my*8}%`,transition:"perspective-origin .5s ease"}}>
        <div style={{position:"absolute",inset:"-20%",
          backgroundImage:`linear-gradient(rgba(29,184,123,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(29,184,123,.18) 1px,transparent 1px)`,
          backgroundSize:"60px 60px",
          transform:`rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(-40px) translateY(${sy*.08}px)`,
          transition:"transform .45s cubic-bezier(.22,1,.36,1)"}}/>
      </div>
      {/* Architectural SVG lines */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",
        transform:`translate(${mx*8}px,${my*6}px)`,transition:"transform .7s ease"}}
        viewBox="0 0 100 100" preserveAspectRatio="none">
        {archLines.map((l,i)=>(
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="rgba(255,255,255,.04)" strokeWidth=".15"/>
        ))}
      </svg>
      {/* Concentric rings */}
      <div style={{position:"absolute",top:"50%",left:"50%",width:700,height:700,marginLeft:-350,marginTop:-350,
        transform:`translate(${mx*18}px,${my*14}px)`,transition:"transform .5s ease"}}>
        {[340,270,200,130,70].map((r,i)=>(
          <div key={i} style={{position:"absolute",top:"50%",left:"50%",
            width:r*2,height:r*2,marginLeft:-r,marginTop:-r,borderRadius:"50%",
            border:`${i===2?"1.5px":"1px"} solid rgba(29,184,123,${.04+i*.025})`,
            animation:`${i%2===0?"rotateSlow":"rotateSlowR"} ${60+i*18}s linear infinite`,
            ...(i===2?{boxShadow:"0 0 40px rgba(29,184,123,.06)"}:{})}}/>
        ))}
        <div style={{position:"absolute",top:"50%",left:"50%",width:1,height:130,marginLeft:-.5,marginTop:-65,
          background:"linear-gradient(transparent,rgba(29,184,123,.18),transparent)"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",width:130,height:1,marginTop:-.5,marginLeft:-65,
          background:"linear-gradient(90deg,transparent,rgba(29,184,123,.18),transparent)"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",width:8,height:8,borderRadius:"50%",
          background:"rgba(29,184,123,.5)",marginLeft:-4,marginTop:-4,
          boxShadow:"0 0 12px rgba(29,184,123,.6)",animation:"glowPulse 2.5s ease infinite"}}/>
      </div>
      {/* DCF terms */}
      {TERMS.map((t,i)=>(
        <div key={i} style={{position:"absolute",left:`${t.x}%`,top:`${t.y}%`,
          color:"rgba(255,255,255,.07)",fontSize:9,fontWeight:700,
          letterSpacing:".25em",fontFamily:"monospace",textTransform:"uppercase",
          transform:`translate(${mx*t.mx*.6}px,${my*t.mx*.3+sy*t.sx}px)`,
          transition:"transform .9s ease"}}>{t.t}</div>
      ))}
      {/* Scan line */}
      <div style={{position:"absolute",left:0,right:0,height:1,
        background:"linear-gradient(90deg,transparent,rgba(29,184,123,.12),transparent)",
        animation:"scanLine 9s linear infinite"}}/>
      {/* Cursor spotlight */}
      <div style={{position:"absolute",inset:0,
        background:`radial-gradient(ellipse 28% 28% at ${(mx+.5)*100}% ${(my+.5)*100}%,rgba(29,184,123,.10) 0%,transparent 70%)`,
        transition:"background .08s linear"}}/>
      {/* Lens flare */}
      <div style={{position:"absolute",
        left:`calc(${(mx+.5)*100}% - 60px)`,top:`calc(${(my+.5)*100}% - 60px)`,
        width:120,height:120,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(255,255,255,.04) 0%,transparent 65%)",
        transition:"left .08s linear,top .08s linear"}}/>
      {/* Corner marks */}
      {[{top:20,left:20},{top:20,right:20},{bottom:20,left:20},{bottom:20,right:20}].map((pos,i)=>(
        <div key={i} style={{position:"absolute",...pos,width:20,height:20,
          borderTop:pos.top!==undefined?"1px solid rgba(29,184,123,.25)":"none",
          borderBottom:pos.bottom!==undefined?"1px solid rgba(29,184,123,.25)":"none",
          borderLeft:pos.left!==undefined?"1px solid rgba(29,184,123,.25)":"none",
          borderRight:pos.right!==undefined?"1px solid rgba(29,184,123,.25)":"none",
          transform:`translate(${mx*(i%2===0?-6:6)}px,${my*(i<2?-4:4)}px)`,
          transition:"transform .5s ease"}}/>
      ))}
    </div>
  );
}

function LandingPage({scrollY,mouse,onEnter}){
  const op=Math.max(0,1-scrollY/480);
  return(
    <section style={{position:"relative",height:"100vh",background:BG,
      display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
      <HeroBg mouse={mouse} scrollY={scrollY}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:740,padding:"0 28px",
        opacity:op,transform:`translateY(${-scrollY*.22}px)`}}>
        <div style={{display:"inline-flex",background:"rgba(255,255,255,.07)",
          border:"1px solid rgba(255,255,255,.14)",borderRadius:100,padding:"5px 18px",
          marginBottom:26,fontSize:12,color:"rgba(255,255,255,.7)",fontWeight:600,letterSpacing:".5px"}}>
          Professional DCF Templates · Malaysian Property Market
        </div>
        <h1 style={{fontSize:"clamp(32px,5.5vw,60px)",fontWeight:900,lineHeight:1.1,
          letterSpacing:"-2px",marginBottom:20,color:W}}>
          Stop Rebuilding.<br/>
          <span style={{background:"linear-gradient(90deg,#aee8cc,#ffffff,#1DB87B,#ffffff)",
            backgroundSize:"300% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            animation:"shimmer 5s linear infinite"}}>Start Valuing.</span>
        </h1>
        <p style={{fontSize:16,color:"rgba(255,255,255,.55)",lineHeight:1.78,maxWidth:520,margin:"0 auto 36px"}}>
          Pre-built Discounted Cash Flow templates for Residential, Commercial, Industrial and Land properties. Built for Malaysian valuers. Designed for accuracy.
        </p>
        <button onClick={onEnter} className="btn-p"
          style={{background:W,color:D,padding:"14px 34px",borderRadius:10,fontWeight:800,fontSize:15,
            boxShadow:"0 10px 32px rgba(0,0,0,.4)"}}>
          Access Free Templates
        </button>
      </div>
    </section>
  );
}

function TemplateCard({t,onDownload,downloading,uploads}){
  const[ref,v]=useInView(.04);
  const[sel,setSel]=useState(null);
  const busy=downloading===t.id+(sel||"");
  const selectedType=t.types.find(x=>x.id===sel);
  const uploadInfo=sel?uploads[`${t.id}__${sel}`]:null;
  const hasFile=!!(uploadInfo?.url);

  return(
    <div ref={ref} className="vf-card"
      style={{background:W,border:`1px solid ${BD}`,borderRadius:20,overflow:"hidden",
        boxShadow:"0 4px 22px rgba(0,63,45,.07)",
        opacity:v?1:0,transform:v?"translateY(0)":"translateY(24px)",
        transition:"opacity .55s ease,transform .55s cubic-bezier(.22,1,.36,1)",
        display:"flex",flexDirection:"column"}}>
      <div style={{background:PL,padding:"20px 24px 16px",borderBottom:`1px solid ${BD}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{display:"inline-block",background:D,borderRadius:100,
              padding:"3px 12px",marginBottom:9,fontSize:10,color:W,fontWeight:700,letterSpacing:".4px"}}>{t.tag}</div>
            <h2 style={{fontSize:18,fontWeight:900,letterSpacing:"-.4px",color:D,margin:"0 0 3px"}}>{t.title}</h2>
            <p style={{color:MU,fontSize:12,margin:0}}>{t.sub}</p>
          </div>
          <div style={{textAlign:"right",fontSize:11,color:M,fontWeight:700,flexShrink:0,marginLeft:12}}>
            <div>{t.ver}</div>
            <div style={{color:MU,fontWeight:400,marginTop:2}}>{t.updated}</div>
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
                  borderRadius:10,padding:"10px",position:"relative",
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
          {[["Downloads",t.dl],["Version",t.ver],["Updated",t.updated]].map(([k,v])=>(
            <div key={k} style={{background:PLR,border:`1px solid ${BD}`,borderRadius:7,padding:"5px 12px"}}>
              <div style={{fontSize:8,color:MU,letterSpacing:".4px"}}>{k.toUpperCase()}</div>
              <div style={{fontSize:11,fontWeight:700,color:D,marginTop:1}}>{v}</div>
            </div>
          ))}
        </div>
        <div className="dl-btn"
          onClick={()=>sel&&hasFile&&!downloading&&onDownload({id:t.id+sel,title:`${t.title} — ${selectedType?.label}`,url:uploadInfo.url,filename:uploadInfo.name})}
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

function Dashboard({onDownload,downloading,uploads}){
  const[search,setSrc]=useState("");
  const[filter,setFilter]=useState("all");
  const filters=["all","residential","commercial","industrial","land"];
  const filtered=TMPLS.filter(t=>{
    const ms=t.title.toLowerCase().includes(search.toLowerCase())||t.sub.toLowerCase().includes(search.toLowerCase());
    return ms&&(filter==="all"||t.id===filter);
  });
  const totalUp=Object.keys(uploads).length;
  return(
    <div style={{background:PLR,minHeight:"100vh",paddingTop:59}}>
      <div style={{background:D}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",overflowX:"auto"}}>
          {[["Templates","4"],["Total Downloads","3,196"],["Property Types","29"],["Available",`${totalUp}/29`]].map(([l,v],i)=>(
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
          <input value={search} onChange={e=>setSrc(e.target.value)} placeholder="Search categories..."
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
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(480px,1fr))",gap:20,alignItems:"start"}}>
          {filtered.map(t=>(
            <TemplateCard key={t.id} t={t} onDownload={onDownload} downloading={downloading} uploads={uploads}/>
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
  const thr=useRef(0);

  useEffect(()=>{
    fetch("/api/templates").then(r=>r.json()).then(setUploads).catch(()=>{});
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
      setToast(`${t.title} DCF Template downloaded successfully!`);
      setTimeout(()=>setToast(null),3800);
    },1200);
  };

  return(
    <div ref={scrollRef} onScroll={onScroll} onMouseMove={onMouse}
      style={{height:"100vh",overflowY:"auto",overflowX:"hidden",
        background:page==="landing"?BG:PLR,
        fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif"}}>
      <style>{CSS}</style>
      <ProgressBar scrollRef={scrollRef}/>
      <Nav page={page} onBack={()=>go("landing")} onAdminClick={()=>setShowLogin(true)}/>
      {page==="landing"&&<LandingPage scrollY={scrollY} mouse={mouse} onEnter={()=>go("dashboard")}/>}
      {page==="dashboard"&&<Dashboard onDownload={handleDL} downloading={downloading} uploads={uploads}/>}
      {page==="admin"&&<AdminPanel onLogout={()=>go("landing")} uploads={uploads} setUploads={setUploads}/>}
      {showLogin&&(
        <AdminLoginModal onClose={()=>setShowLogin(false)} onSuccess={()=>{setShowLogin(false);go("admin");}}/>
      )}
      {toast&&<Toast msg={toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}
