const path=require('path').join(__dirname,'..')+'/';  /* Misura quanto rende una partita di N round: node tools/lunghezza.js <round> <giocatori> <partite>  (scrive /tmp/len/rN_pG.json) */
require(path+'js/cards.js');require(path+'js/data.js');require(path+'js/engine.js');require(path+'js/ai.js');require(path+'js/sim.js');
const FF=globalThis.FF, [rounds,np,games]=process.argv.slice(2).map(Number);
const ev=[4,7,10].map(k=>Math.round(rounds*k/12));
const rules={rounds,eventRounds:ev};
const A={n:0,cards:0,hand:0,syms:0,fus:0,pm:0,third:0,acc:0,accPts:0,coer:0,border:0,pat:0,tot:0,objMet:0,obj:0,
  full1:0,fullAll:0,areaFull:{nord:0,centro:0,sud_isole:0},areaTot:{nord:0,centro:0,sud_isole:0},tiers:[0,0,0,0,0],cond:0,condMax:0,
  patBy:{},patAny:{},patAnyAll:0,maxCards:0,cardsHist:{},act:{gioca:0,compra:0,simbolo:0,pm:0,doppia:0,ripetuta:0,sblocca:0},unusedPm:0,wins1:0};
FF.SYMBOLS.forEach(s=>{A.patBy[s]=0;A.patAny[s]=0;});
for(let i=0;i<games;i++){
  const r=FF.Sim.playOne(i,{seed:'len'+rounds+'-'+np,players:np,a:'hard',b:'hard',rules});
  r.res.scores.forEach((sc,q)=>{
    const p=r.g.s.players[q], st=r.g.stats.p[q]; A.n++;
    A.cards+=p.table.length; A.hand+=p.hand.length; A.pm+=p.pm; A.third+=(p.workers>=3?1:0);
    const sy=p.table.reduce((n,e)=>n+e.sym.length,0); A.syms+=sy; A.fus+=p.table.filter(e=>e.fusion).length;
    A.acc+=sc.accRaw; A.accPts+=sc.accPts; A.coer+=sc.coerenza; A.border+=sc.border; A.pat+=sc.pattern; A.tot+=sc.total; A.obj+=sc.objectives; if(sc.objMet)A.objMet++;
    A.maxCards=Math.max(A.maxCards,p.table.length); A.cardsHist[p.table.length]=(A.cardsHist[p.table.length]||0)+1;
    const tier=[0,1,3,5,7].map((f,k)=>sc.accRaw>=f?k:0).reduce((a,b)=>Math.max(a,b),0); A.tiers[tier]++;
    const acc=FF.accuracyScore(p.table,r.g.s.target,r.g.rules); let all=true;
    FF.AREAS.forEach(a=>{const h=acc.hits.filter(x=>x.area===a); A.cond+=h.filter(x=>x.ok).length; A.condMax+=h.length; const full=h.length&&h.every(x=>x.ok); A.areaTot[a]++; if(full)A.areaFull[a]++; else all=false;});
    if(all)A.fullAll++;
    let any=false; FF.SYMBOLS.forEach(s=>{A.patBy[s]+=sc.patternBy[s]; if(sc.patternBy[s]>0){A.patAny[s]++;any=true;}}); if(any)A.patAnyAll++;
    ['gioca','compra','simbolo','pm','doppia','ripetuta','sblocca'].forEach(k=>{A.act[k]+=(st['spazio_'+k]||0);});
  });
}
const o={rounds,np,games:A.n,cards:A.cards/A.n,maxCards:A.maxCards,cardsHist:A.cardsHist,hand:A.hand/A.n,syms:A.syms/A.n,fus:A.fus/A.n,pm:A.pm/A.n,third:A.third/A.n,accRaw:A.acc/A.n,accPts:A.accPts/A.n,coer:A.coer/A.n,border:A.border/A.n,pat:A.pat/A.n,tot:A.tot/A.n,obj:A.obj/A.n,objMet:A.objMet/A.n,
 condHit:A.cond/A.n,condMax:A.condMax/A.n,areaFull:Object.fromEntries(Object.keys(A.areaFull).map(k=>[k,A.areaFull[k]/A.areaTot[k]])),fullAll:A.fullAll/A.n,tiers:A.tiers.map(x=>x/A.n),
 patBy:Object.fromEntries(FF.SYMBOLS.map(s=>[s,A.patBy[s]/A.n])),patAny:Object.fromEntries(FF.SYMBOLS.map(s=>[s,A.patAny[s]/A.n])),patAnyAll:A.patAnyAll/A.n,act:Object.fromEntries(Object.entries(A.act).map(([k,v])=>[k,v/A.n])),events:ev};
require('fs').mkdirSync('/tmp/len',{recursive:true}); require('fs').writeFileSync('/tmp/len/r'+rounds+'_p'+np+'.json',JSON.stringify(o));
