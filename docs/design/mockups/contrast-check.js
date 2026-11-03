// GitHeddle contrast check (ux-design §3.3). Usage: node contrast-check.js [tokens.css]
// Prints the §3.3 table as markdown; exits 1 if any pair is below its threshold. This pair list is the CI contrast test.
const fs=require('fs');const src=fs.readFileSync(process.argv[2]||require('path').join(__dirname,'tokens.css'),'utf8');
function block(sel){const i=src.indexOf(sel+' {');const j=src.indexOf('\n}',i);const d={};for(const m of src.slice(i,j).matchAll(/--gh-([a-z0-9-]+):\s*([^;]+);/g))d[m[1]]=m[2].trim();return d;}
const L=block('[data-theme="light"]'),D=block('[data-theme="dark"]');
const res=(t,k)=>{const v=t[k];if(!v)throw new Error('missing '+k);const m=v.match(/^var\(--gh-([a-z0-9-]+)\)$/);return m?res(t,m[1]):v};
const lum=h=>{h=h.replace('#','');const c=[0,2,4].map(i=>parseInt(h.substr(i,2),16)/255).map(c=>c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const cr=(a,b)=>{let x=lum(a),y=lum(b);if(x<y)[x,y]=[y,x];return (x+.05)/(y+.05)};
const S=['surface-base','surface-raised','surface-sunken','surface-overlay','surface-hover','surface-selected','surface-selected-inactive'];
const soft=['success-soft','warning-soft','danger-soft','info-soft'];const fb=['success','warning','danger','info'];
const diff=['diff-inserted-line','diff-deleted-line','diff-inserted-word','diff-deleted-word','diff-gutter','diff-spacer-1','diff-spacer-2'];
const merge=['merge-incoming','merge-current','merge-auto-applied','merge-unresolved','merge-edited'];
const ed=['surface-sunken','editor-selection','editor-active-line','editor-search-match',...diff.slice(0,4),...merge];
const st=['status-modified','status-added','status-deleted','status-renamed','status-untracked','status-conflicted'];
const edges=merge.map(m=>m+'-edge');
const syn=['keyword','string','number','comment','type','function','tag','attribute'].map(k=>'syntax-'+k);
const rows=[
['`text-primary` on surfaces',['text-primary'],S,4.5],
['`text-secondary` on surfaces',['text-secondary'],S,4.5],
['`text-secondary` on soft, diff and merge bgs',['text-secondary'],[...soft,...diff,...merge],4.5],
['`text-link` on surfaces',['text-link'],S,4.5],
['`text-on-accent` on `accent` / `accent-hover`',['text-on-accent'],['accent','accent-hover'],4.5,true],
['`text-on-accent` on `danger-action` / hover',['text-on-accent'],['danger-action','danger-action-hover'],4.5,true],
['feedback fg on its own soft bg (worst of 4)',null,null,4.5,'own'],
['feedback fg on surfaces (worst of 4)',fb,S,4.5],
['`text-primary` on any soft bg',['text-primary'],soft,4.5],
['Status letters on surfaces',st,S,4.5],
['`!` on `merge-unresolved` (badge)',['status-conflicted'],['merge-unresolved'],4.5],
['`text-primary` on diff bgs (lines, words, gutter, spacer)',['text-primary'],diff,4.5],
['Line numbers on diff line bgs and gutter',['text-secondary'],['diff-inserted-line','diff-deleted-line','diff-gutter'],4.5],
['`+` on inserted line and word / `−` on deleted line and word',null,null,4.5,'sign'],
['`text-primary` on merge bgs',['text-primary'],merge,4.5],
['Merge edges on `surface-sunken`, `surface-raised` and their own bg',null,null,3,'edge'],
['Syntax roles on every editor bg (incl. selection, active line, search match)',syn,ed,4.5],
['`text-primary` on `editor-selection` / `editor-search-match`',['text-primary'],['editor-selection','editor-search-match'],4.5],
['`border-strong` on surfaces and soft bgs',['border-strong'],[...S,...soft],3],
['`focus-ring` on surfaces',['focus-ring'],S,3],
['`focus-ring` on soft, diff and merge bgs',['focus-ring'],[...soft,...diff,...merge],3],
['`accent-indicator` on surfaces (row bar, checked radio and switch)',['accent-indicator'],S,3],
['`accent-indicator` on merge bgs (`merge-active`)',['accent-indicator'],merge,3],
['Run-waiting icon on surfaces',['run-waiting'],S,3],
['Check on `accent` checkbox (`text-on-accent`)',['text-on-accent'],['accent'],3],
['Check on merge checkboxes, knob on switch (`indicator-glyph` on incoming / current edge, `accent-indicator`)',['indicator-glyph'],['merge-incoming-edge','merge-current-edge','accent-indicator'],3],
['Logo threads on tile',['logo-thread'],['logo-tile'],3],
];
function worst(t,fgs,bgs){let w=null;for(const f of fgs)for(const b of bgs){const c=cr(res(t,f),res(t,b));if(!w||c<w.c)w={c,f,b};}return w;}
const out=[];let fail=0;
for(const [lab,fgs,bgs,th,mode] of rows){const cell=[];for(const t of [L,D]){let w;
 if(mode==='own'){w=null;fb.forEach((f,i)=>{const c=cr(res(t,f),res(t,soft[i]));if(!w||c<w.c)w={c,f,b:soft[i]}});}
 else if(mode==='sign'){const a=worst(t,['success'],['diff-inserted-line','diff-inserted-word']),b=worst(t,['danger'],['diff-deleted-line','diff-deleted-word']);w=a.c<b.c?a:b;cell.push(a.c.toFixed(2)+' / '+b.c.toFixed(2));if(Math.min(a.c,b.c)<th)fail++;continue;}
 else if(mode==='edge'){w=null;for(const m of merge){for(const b of ['surface-sunken','surface-raised',m]){const c=cr(res(t,m+'-edge'),res(t,b));if(!w||c<w.c)w={c,f:m+'-edge',b};}}}
 else if(mode===true){cell.push(bgs.map(b=>cr(res(t,fgs[0]),res(t,b)).toFixed(2)).join(' / '));const m=Math.min(...bgs.map(b=>cr(res(t,fgs[0]),res(t,b))));if(m<th)fail++;continue;}
 else w=worst(t,fgs,bgs);
 if(w.c<th)fail++;cell.push(w.c.toFixed(2)+' ('+w.b.replace('surface-','')+(fgs&&fgs.length>1?', '+w.f.replace(/^(syntax|status)-/,''):'')+')');}
 out.push(`| ${lab} | ${th}:1 | ${cell[0]} | ${cell[1]} |`);}
console.log('| Pair | Needs | Light min | Dark min |\n|---|---|---|---|\n'+out.join('\n'));
// text-disabled report
for(const [n,t] of [['L',L],['D',D]]){const w=worst(t,['text-disabled'],[...S,...soft]);console.error(n,'text-disabled worst',w.c.toFixed(2),w.b);}
console.error('FAILS',fail);process.exitCode=fail?1:0;
