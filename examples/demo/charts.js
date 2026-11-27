/* Offline-first SVG examples. Data are synthetic. Not an ECharts/D3 implementation. */
(() => {
  "use strict";
  const source = window.FINANCIALS;
  if (!source) throw new Error("Missing financials.js");
  const s = source.series, years = source.periods;
  const NS = "http://www.w3.org/2000/svg", W = 880, H = 420;
  const C = {
    ink:"#243247", muted:"#64748b", grid:"#e3eaf1",
    blue:"#265cbd", teal:"#088b85", amber:"#d99b32",
    purple:"#8161bb", red:"#c65362", sky:"#65aecb", white:"#ffffff"
  };
  const palette = [C.blue,C.teal,C.amber,C.purple,C.sky,C.red];
  const dims = {left:78,right:806,top:66,bottom:337};
  const px = (i,n=years.length) => dims.left + (i+0.5)*(dims.right-dims.left)/n;
  const escapeText = value => String(value); // SVG nodes use textContent, never innerHTML.
  const fmt = (value,d=1) => Number(value).toFixed(d).replace(/\.0$/,"");
  const sum = x => x.reduce((a,b)=>a+b,0);
  const ratio = (x,y) => y > 0 ? x/y*100 : null;
  function el(parent, tag, attrs={}, text) {
    const e=document.createElementNS(NS,tag);
    for (const [k,v] of Object.entries(attrs)) if(v!==null&&v!==undefined) e.setAttribute(k,String(v));
    if(text!==undefined) e.textContent=escapeText(text);
    parent.appendChild(e); return e;
  }
  function rect(g,x,y,w,h,color,tip,rx=3){
    const p=el(g,"rect",{x,y,width:Math.max(0,w),height:Math.max(0,h),fill:color,rx});
    if(tip) el(p,"title",{},tip); return p;
  }
  function text(g,x,y,v,opts={}){
    return el(g,"text",{
      x,y,fill:opts.color||C.muted,"font-size":opts.size||12,
      "text-anchor":opts.anchor||"start","font-weight":opts.bold?700:400
    },v);
  }
  function line(g,x1,y1,x2,y2,color=C.grid,w=1,dash){
    return el(g,"line",{x1,y1,x2,y2,stroke:color,"stroke-width":w,"stroke-dasharray":dash});
  }
  function path(g,d,color,opts={}){
    return el(g,"path",{d,fill:opts.fill||"none",stroke:color||"none",
      "stroke-width":opts.width||1,opacity:opts.opacity===undefined?1:opts.opacity,
      "stroke-linecap":"round","stroke-linejoin":"round"});
  }
  function dot(g,x,y,color,tip,r=5){
    const c=el(g,"circle",{cx:x,cy:y,r,fill:C.white,stroke:color,"stroke-width":2.5,tabindex:"0"});
    el(c,"title",{},tip); return c;
  }
  function svg(section,title,description){
    const stage=section.querySelector(".chart-stage");
    const g=el(stage,"svg",{xmlns:NS,viewBox:"0 0 "+W+" "+H,
      role:"img","aria-labelledby":section.id+"-title "+section.id+"-desc"});
    el(g,"title",{id:section.id+"-title"},title);
    el(g,"desc",{id:section.id+"-desc"},description);
    rect(g,0,0,W,H,C.white);
    return g;
  }
  function axes(g,max,unit="",min=0){
    const f=v=>dims.bottom-(v-min)/(max-min)*(dims.bottom-dims.top);
    for(let k=0;k<=5;k++){
      const v=min+(max-min)*k/5,y=f(v);
      line(g,dims.left,y,dims.right,y,k===0?"#b3bfce":C.grid);
      text(g,dims.left-11,y+4,fmt(v,Number.isInteger(v)?0:1)+unit,{anchor:"end",size:11});
    }
    return f;
  }
  function xlabels(g,labels=years){
    labels.forEach((v,i)=>text(g,px(i,labels.length),dims.bottom+27,v,{anchor:"middle"}));
  }
  function legend(g,items){
    const step=690/Math.max(1,items.length);
    items.forEach(([name,col],i)=>{
      const x=dims.left+i*step;
      rect(g,x,382,12,12,col,null,2);
      text(g,x+18,393,name,{size:12});
    });
  }
  function polyline(g,values,ys,color,label,labels=years,indices){
    const all = indices || values.map((_,i)=>i);
    const good = all.filter(i=>values[i]!==null&&values[i]!==undefined);
    if (!good.length) return;
    path(g,good.map((i,j)=>(j?"L":"M")+px(i,values.length)+","+ys(values[i])).join(" "),color,{width:3});
    good.forEach(i=>dot(g,px(i,values.length),ys(values[i]),color,label+" "+labels[i]+": "+fmt(values[i])+""));
  }
  function draw01(g){
    const f=axes(g,120),names=[["营业收入","revenue"],["毛利润","gross_profit"],["净利润","net_profit"]];
    const bw=(dims.right-dims.left)/years.length;
    names.forEach(([name,key],j)=>s[key].forEach((v,i)=>{
      const x=dims.left+i*bw+(0.15+j*0.245)*bw, y=f(v);
      rect(g,x,y,bw*.20,dims.bottom-y,palette[j],years[i]+" "+name+" "+v+" 亿元");
    }));
    xlabels(g);legend(g,names.map(([name],i)=>[name,palette[i]]));
  }
  function draw02(g){
    const f=axes(g,60,"%");
    [["毛利率",years.map((_,i)=>ratio(s.gross_profit[i],s.revenue[i])),C.blue],
     ["净利率",years.map((_,i)=>ratio(s.net_profit[i],s.revenue[i])),C.teal],
     ["ROE",s.roe_percent,C.amber]].forEach(([name,vals,color])=>polyline(g,vals,f,color,name));
    xlabels(g);legend(g,[["毛利率",C.blue],["净利率",C.teal],["ROE",C.amber]]);
  }
  function draw03(g){
    const f=axes(g,120),ys=v=>dims.bottom-v/40*(dims.bottom-dims.top);
    s.revenue.forEach((v,i)=>{
      const x=px(i)-22,y=f(v);
      rect(g,x,y,44,dims.bottom-y,C.blue,years[i]+" 营收 "+v+" 亿元");
    });
    const yoy=s.revenue.map((v,i)=>i?ratio(v-s.revenue[i-1],s.revenue[i-1]):null);
    polyline(g,yoy,ys,C.amber,"YoY",years);
    for(let k=0;k<=4;k++)text(g,dims.right+10,dims.bottom-k*(dims.bottom-dims.top)/4+4,k*10+"%",{size:11});
    xlabels(g);legend(g,[["收入（亿元，左轴）",C.blue],["同比（%，右轴）",C.amber]]);
  }
  function draw04(g){
    const names=["收入","营业成本","研发费用","销售费用","管理费用","其他净支出","净利润"];
    const i=4,changes=[s.revenue[i],-s.cost_of_revenue[i],-s.rd_expense[i],
      -s.sales_expense[i],-s.admin_expense[i],-s.other_net_expense[i],s.net_profit[i]];
    const f=axes(g,110),bw=(dims.right-dims.left)/changes.length;
    let running=0;
    changes.forEach((v,j)=>{
      const total=j===0||j===changes.length-1;
      const top=total?v:running, next=total?0:running+v, hi=Math.max(top,next),lo=Math.min(top,next);
      const y=f(hi),h=f(lo)-f(hi),x=dims.left+bw*j+bw*.18;
      rect(g,x,y,bw*.64,h,j===0?C.blue:j===6?C.teal:C.red,names[j]+": "+v+" 亿元",3);
      text(g,x+bw*.32,y-8,(j===0||j===6?"":"")+v,{anchor:"middle",color:C.ink,bold:true});
      text(g,x+bw*.32,dims.bottom+24,names[j],{anchor:"middle",size:10.5});
      if(j===0) running=v;
      else if(j!==6) running+=v;
    });
    legend(g,[["收入",C.blue],["费用",C.red],["净利润",C.teal]]);
  }
  function draw05(g){
    const f=axes(g,120),bw=(dims.right-dims.left)/years.length;
    const keys=[["游戏","game"],["平台","platform"],["广告","ads"],["其他","other"]];
    years.forEach((yr,i)=>{
      let running=0;
      keys.forEach(([name,key],j)=>{
        const v=s[key][i],y=f(running+v),h=f(running)-y;
        rect(g,dims.left+(i+.27)*bw,y,bw*.46,h,palette[j],yr+" "+name+" "+v+" 亿元",0);
        running+=v;
      });
      text(g,px(i),f(running)-9,running,{anchor:"middle",color:C.ink,bold:true});
    });
    xlabels(g);legend(g,keys.map(([name],i)=>[name,palette[i]]));
  }
  function ribbon(g,x0,y0,x1,y1,h,color,tip){
    const d="M"+x0+","+y0+" C"+(x0+85)+","+y0+" "+(x1-85)+","+y1+" "+x1+","+y1+
      " L"+x1+","+(y1+h)+" C"+(x1-85)+","+(y1+h)+" "+(x0+85)+","+(y0+h)+
      " "+x0+","+(y0+h)+"Z";
    const p=path(g,d,color,{fill:color,opacity:.23});el(p,"title",{},tip);
  }
  function draw06(g){
    const k=2.25,top=75,src=140,mid=395,right=684;
    const cost=s.cost_of_revenue[4],gross=s.gross_profit[4];
    ribbon(g,src+18,top,mid,top,cost*k,C.red,"收入 → 成本 50");
    ribbon(g,src+18,top+cost*k,mid,top+cost*k+14,gross*k,C.teal,"收入 → 毛利 54");
    const ends=[["研发",16,C.purple],["销售",10,C.amber],["管理",5,C.sky],["其他净支出",3,C.red],["净利润",20,C.teal]];
    let flow=0,ty=60;
    ends.forEach(([name,v,color])=>{
      ribbon(g,mid+18,top+cost*k+14+flow*k,right,ty,v*k,color,"毛利润 → "+name+" "+v);
      rect(g,right,ty,18,v*k,color,name+" "+v);
      text(g,right+27,ty+v*k/2+4,name+" "+v,{color:C.ink,size:12});
      ty+=v*k+11;flow+=v;
    });
    rect(g,src,top,18,104*k,C.blue,"总收入 104");
    rect(g,mid,top,18,cost*k,C.red,"营业成本 50");
    rect(g,mid,top+cost*k+14,18,gross*k,C.teal,"毛利润 54");
    text(g,src-24,top-14,"收入 104",{color:C.ink,bold:true});
    text(g,mid-25,top-14,"营业成本 50",{color:C.ink,bold:true});
    text(g,mid-25,top+cost*k+5,"毛利 54",{color:C.ink,bold:true});
    text(g,src,396,"输入",{color:C.muted});
    text(g,mid,396,"毛利与成本",{color:C.muted});
    text(g,right,396,"毛利分配",{color:C.muted});
  }
  function draw07(g){
    const f=axes(g,120),keys=[["游戏","game"],["平台","platform"],["广告","ads"],["其他","other"]];
    let previous=years.map(()=>0);
    keys.forEach(([name,key],j)=>{
      const next=previous.map((v,i)=>v+s[key][i]);
      let d=next.map((v,i)=>(i?"L":"M")+px(i)+","+f(v)).join(" ");
      d+=previous.slice().reverse().map((v,i)=>" L"+px(previous.length-1-i)+","+f(v)).join("")+" Z";
      const p=path(g,d,palette[j],{fill:palette[j],opacity:.82});
      el(p,"title",{},name+" 2025: "+s[key][4]+" 亿元");
      previous=next;
    });
    xlabels(g);legend(g,keys.map(([name],j)=>[name,palette[j]]));
  }
  function draw08(g){
    const entries=[["游戏",54,C.blue],["平台",34,C.teal],["广告",9,C.amber],["其他",7,C.purple]];
    const x=110,y=66,w=640,h=285;
    const a=entries[0][1]/104*w;
    rect(g,x,y,a-3,h,entries[0][2],"游戏 54 亿元");
    text(g,x+22,y+45,"游戏 · 54",{color:C.white,bold:true,size:19});
    const b=(w-a)*34/50;
    rect(g,x+a,y,b-3,h,entries[1][2],"平台 34 亿元");
    text(g,x+a+16,y+45,"平台 · 34",{color:C.white,bold:true,size:17});
    const w3=w-a-b;
    const h3=h*9/16;
    rect(g,x+a+b,y,w3,h3-3,C.amber,"广告 9 亿元");
    rect(g,x+a+b,y+h3,w3,h-h3,C.purple,"其他 7 亿元");
    text(g,x+a+b+10,y+25,"广告 9",{color:C.ink,size:12,bold:true});
    text(g,x+a+b+10,y+h3+25,"其他 7",{color:C.white,size:12,bold:true});
    text(g,110,388,"面积 ∝ 2025 业务收入；总额 104 亿元",{color:C.muted});
  }
  function draw09(g){
    const entries=[["游戏",54,C.blue],["平台",34,C.teal],["广告",9,C.amber],["其他",7,C.purple]];
    const cx=320,cy=206,r=113,circ=2*Math.PI*r;
    let offset=0;
    entries.forEach(([name,val,col])=>{
      const c=el(g,"circle",{cx,cy,r,fill:"none",stroke:col,"stroke-width":49,
        "stroke-dasharray":circ*val/104+" "+(circ-circ*val/104),
        "stroke-dashoffset":-circ*offset/104,transform:"rotate(-90 "+cx+" "+cy+")"});
      el(c,"title",{},name+" "+val+" 亿元");offset+=val;
    });
    text(g,cx,cy+5,"104 亿元",{color:C.ink,size:26,bold:true,anchor:"middle"});
    entries.forEach(([name,val,col],i)=>{
      rect(g,530,115+i*55,13,13,col);
      text(g,556,127+i*55,name+" "+val+" 亿元 · "+fmt(val/104*100)+"%",{color:C.ink,size:16});
    });
  }
  function draw10(g){
    const f=axes(g,24,"%"),minX=0,maxX=35,
      x=v=>dims.left+(v-minX)/(maxX-minX)*(dims.right-dims.left);
    const peers=[["模拟企业 A",15,18,100,C.blue],["模拟企业 B",25,13,75,C.teal],
      ["模拟企业 C",12,9,44,C.amber],["模拟企业 D",31,20,140,C.purple]];
    peers.forEach(([name,growth,roe,size,col])=>{
      const c=el(g,"circle",{cx:x(growth),cy:f(roe),r:9+size/10,fill:col,opacity:.55,stroke:col,"stroke-width":2,tabindex:0});
      el(c,"title",{},name+" · 增长 "+growth+"% · ROE "+roe+"% · 规模 "+size);
      text(g,x(growth)+15,f(roe)-19,name,{color:C.ink,size:12});
    });
    for(let v=0;v<=35;v+=5)text(g,x(v),dims.bottom+27,v+"%",{anchor:"middle"});
    text(g,440,395,"X = 营收增长率；Y = ROE；气泡 = 模拟规模",{anchor:"middle"});
  }
  function draw11(g){
    const keys=[["游戏","game"],["平台","platform"],["广告","ads"],["其他","other"]];
    const range=[1,2,3,4],cw=139,ch=54,top=83,left=155;
    range.forEach((i,j)=>text(g,left+j*cw+cw/2,65,years[i],{anchor:"middle"}));
    keys.forEach(([name,key],row)=>{
      text(g,left-18,top+row*ch+32,name,{anchor:"end",color:C.ink});
      range.forEach((i,col)=>{
        const v=ratio(s[key][i]-s[key][i-1],s[key][i-1]);
        const color=v>15?"#b2e1d8":v>5?"#dcf0eb":v>=0?"#edf7f4":"#f3cbd0";
        rect(g,left+col*cw,top+row*ch,cw-8,ch-8,color,name+" "+years[i]+" "+fmt(v)+"%");
        text(g,left+col*cw+(cw-8)/2,top+row*ch+30,(v>=0?"+":"")+fmt(v)+"%",{anchor:"middle",color:C.ink,bold:true});
      });
    });
    text(g,left,357,"YoY = 当前完整年度 / 上年完整年度 − 1",{color:C.muted});
  }
  function draw12(g){
    const cx=420,cy=207,rad=130,N=5,labels=["增长","毛利率","净利率","现金转化","ROE"];
    const a=i=>-Math.PI/2+2*Math.PI*i/N;
    function point(i,r){return [cx+r*Math.cos(a(i)),cy+r*Math.sin(a(i))]}
    for(let k=1;k<=4;k++){
      const pts=Array.from({length:N},(_,i)=>point(i,rad*k/4));
      path(g,"M"+pts.map(p=>p.join(",")).join("L")+"Z","#dce5f0",{width:1});
    }
    labels.forEach((name,i)=>{
      const [x,y]=point(i,rad+23),[ax,ay]=point(i,rad);
      line(g,cx,cy,ax,ay,"#d0d9e5");
      text(g,x,y,name,{anchor:"middle",color:C.ink,size:12});
    });
    // Educational normalization: 0..100 values are synthetic rubric scores, NOT original financial ratios.
    [[58,64,61,71,63],[76,80,79,87,77]].forEach((vals,j)=>{
      const pts=vals.map((v,i)=>point(i,rad*v/100));
      path(g,"M"+pts.map(p=>p.join(",")).join("L")+"Z",palette[j],{fill:palette[j],width:2.5,opacity:.31});
      pts.forEach(p=>dot(g,p[0],p[1],palette[j],(j?"2025":"2024")+" · 已归一化示例"));
    });
    legend(g,[["2024 综合归一化演示",C.blue],["2025 综合归一化演示",C.teal]]);
  }
  function draw13(g){
    const rows=[["营业收入",104,100,120],["净利润",20,18,28],["经营现金流",25,22,34]];
    rows.forEach(([name,v,target,cap],i)=>{
      const y=86+i*99,left=210,width=515;
      text(g,75,y+17,name,{color:C.ink,bold:true,size:14});
      rect(g,left,y,width,38,"#e8edf3");
      rect(g,left,y,width*.65,38,"#d0ddf0");
      rect(g,left,y,width*v/cap,22,C.blue,name+": "+v+" 亿元");
      line(g,left+target/cap*width,y-9,left+target/cap*width,y+48,C.red,3);
      text(g,left+width+15,y+18,v+" / 目标 "+target,{color:C.ink,size:12});
    });
    text(g,210,396,"蓝色 = 实际 · 红线 = 假设目标（均为模拟数据）");
  }
  function draw14(g){
    const index=(arr)=>arr.map(v=>100*v/arr[0]);
    const sets=[["营收",index(s.revenue),C.blue],["净利润",index(s.net_profit),C.teal],
      ["经营现金流",index(s.operating_cash_flow),C.amber]];
    const f=axes(g,370),y=v=>f(v);
    sets.forEach(([name,vals,col])=>polyline(g,vals,y,col,name+" 指数"));
    xlabels(g);legend(g,sets.map(([name,,col])=>[name+"（2021=100）",col]));
  }
  function draw15(g){
    const data=[24,21,19,25,23,27,22,26],labels=["Q1'24","Q2'24","Q3'24","Q4'24","Q1'25","Q2'25","Q3'25","Q4'25"];
    const f=axes(g,34,"x",10), x=i=>px(i,8);
    rect(g,dims.left,f(28),dims.right-dims.left,f(18)-f(28),"#e8effb");
    line(g,dims.left,f(18),dims.right,f(18),C.muted,1,"4 4");
    line(g,dims.left,f(28),dims.right,f(28),C.muted,1,"4 4");
    path(g,data.map((v,i)=>(i?"L":"M")+x(i)+","+f(v)).join(" "),C.blue,{width:3.5});
    data.forEach((v,i)=>dot(g,x(i),f(v),C.blue,labels[i]+" · 模拟 PE(TTM) "+v+"x"));
    labels.forEach((v,i)=>text(g,x(i),dims.bottom+25,v,{anchor:"middle",size:11}));
    legend(g,[["模拟 PE(TTM)",C.blue],["18–28x 示意参考区间","#e8effb"]]);
  }
  const charts={
    "01":draw01,"02":draw02,"03":draw03,"04":draw04,"05":draw05,
    "06":draw06,"07":draw07,"08":draw08,"09":draw09,"10":draw10,
    "11":draw11,"12":draw12,"13":draw13,"14":draw14,"15":draw15
  };
  const reportErrors=[];
  Object.entries(charts).forEach(([id,fn])=>{
    const section=document.getElementById("chart-"+id);
    if(!section){reportErrors.push(id+": missing section");return;}
    try{
      const figure=svg(section,section.dataset.title,section.dataset.description);
      fn(figure);
    }catch(err){reportErrors.push(id+": "+err.message);}
  });
  if(reportErrors.length) throw new Error("Chart render errors: "+reportErrors.join("; "));
  document.querySelectorAll(".export-svg").forEach(button=>{
    button.addEventListener("click",()=>{
      const section=button.closest("section"),graphic=section.querySelector("svg");
      const xml=new XMLSerializer().serializeToString(graphic);
      const url=URL.createObjectURL(new Blob([xml],{type:"image/svg+xml;charset=utf-8"}));
      const a=document.createElement("a");
      a.href=url;a.download=section.id+".svg";document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
    });
  });
  document.documentElement.dataset.ready="true";
})();