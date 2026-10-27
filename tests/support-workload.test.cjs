const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../outputs/simpleraise-planner.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const model=script.slice(script.indexOf('function seasonalWork('),script.indexOf('function renderStaffing('));
const calculate=vm.runInNewContext(model+';seasonalWork');
const row={name:'Test program',count:1,start:'2027-04-01',end:'2027-05-31'};
function run(rates,ratio=3,rows=[row],chatMinutes=15){return calculate(rows,[ratio,2,100,30,0],6,60,15,2,4,45,true,chatMinutes,7,rates);}
function reconcile(r){for(const kind of ['contacts','demos','launches','tickets','chat'])assert.equal(r.months.reduce((sum,m)=>sum+m[kind],0),r.totals[kind],kind);}
test('successful program keeps sales demos and launches; fall-short accounts drive support',()=>{const r=run();assert.equal(r.totals.accounts,3);assert.equal(r.totals.demos,6);assert.equal(r.totals.launches,4);assert.equal(r.totals.tickets,14);assert.equal(r.totals.chatSessions,2);assert.equal(r.totals.chat,30);assert.equal(r.totals.successfulTickets,0);reconcile(r);});
test('all accounts successful means no default unplanned support',()=>{const r=run(undefined,1);assert.equal(r.totals.tickets,0);assert.equal(r.totals.chat,0);assert.equal(r.totals.demos,2);assert.equal(r.totals.launches,4);reconcile(r);});
test('editable support rates flow through monthly breakdown and staffing',()=>{const rates={successfulTickets:2,successfulChats:1,unsuccessfulTickets:3,unsuccessfulChats:2};const rows=[{...row,count:20},{...row,name:'Second segment',count:10}];const r=run(rates,3,rows);assert.equal(r.totals.tickets,240);assert.equal(r.totals.chatSessions,150);assert.equal(r.totals.chat,2250);reconcile(r);const heavier=run({...rates,unsuccessfulTickets:300},3,rows);assert(Math.max(...heavier.months.map(m=>m.shared))>Math.max(...r.months.map(m=>m.shared)));});
test('zero-minute chats retain session counts and zero accounts create no work',()=>{const r=run(undefined,3,[row],0);assert.equal(r.totals.chatSessions,2);assert.equal(r.totals.chat,0);const empty=run(undefined,3,[{...row,count:0}]);assert.equal(empty.totals.tickets,0);assert.equal(empty.totals.launches,0);reconcile(empty);});
test('weekly follow-ups cross months separately from initial contacts',()=>{const r=calculate([{...row,start:'2027-05-15',end:'2027-06-30'}],[3,2,100,30,0],6,60,15,1,4,45,true,15,7,undefined,4,4,7);const march=r.months.find(m=>m.key==='2027-03'),april=r.months.find(m=>m.key==='2027-04');assert.equal(march.contacts,20);assert.equal(april.contacts,0);assert(april.emails>0);assert(march.emails>0);assert.equal(r.totals.emails,80);assert.equal(r.months.reduce((sum,m)=>sum+m.emails,0),80);assert.equal(april.demos,6);reconcile(r);});
test('longer email sequences extend calendar into earlier months without misaligning segments',()=>{const rows=[{...row,name:'Winter',start:'2027-01-15',end:'2027-04-30'},row];const r=calculate(rows,[3,2,100,30,0],6,60,15,2,4,45,true,15,7,undefined,2,5,7);assert(r.months[0].key<'2026-11');assert.equal(r.months.reduce((sum,m)=>sum+m.emails,0),r.totals.emails);for(const m of r.months)assert.equal(m.emails,m.audiences.reduce((sum,a)=>sum+a.emails,0));reconcile(r);});
test('email cadence changes monthly distribution while preserving total sends',()=>{const rows=[{...row,start:'2027-05-15',end:'2027-06-30'}];const runCadence=days=>calculate(rows,[3,2,100,30,0],6,60,15,1,4,45,true,15,7,undefined,4,4,days);const weekly=runCadence(7),frequent=runCadence(3);assert.equal(weekly.totals.emails,frequent.totals.emails);assert.notEqual(weekly.months.find(m=>m.key==='2027-03').emails,frequent.months.find(m=>m.key==='2027-03').emails);});
test('invalid demo window is rejected',()=>{assert.throws(()=>calculate([row],[3,2,100,30,0],2,60,15,1,4,45,true,15,7,undefined,3,4,7),/begin earlier/);});
test('preparation precedes outreach and product readiness precedes the season',()=>{const r=run();const actions=r.months.flatMap(m=>m.actions);assert.equal(actions.length,4);const action=kind=>actions.find(a=>a.kind===kind);assert.equal(action('prepare').date,action('outreach').date-14*86400000);assert.equal(action('approve').date,action('outreach').date-7*86400000);assert.equal(action('product').date,Date.parse('2027-03-04T00:00:00Z'));assert.equal(action('product').owners,'Jose, Allan & the product team');assert.equal(action('prepare').owners,'Laura, Allan & Mike');for(const a of actions){assert(![0,6].includes(new Date(a.date).getUTCDay()));const month=r.months.find(m=>m.actions.includes(a));assert.equal(month.key,new Date(a.date).toISOString().slice(0,7));}});
test('editable lead times move preparation earlier without changing workload',()=>{const args=[[row],[3,2,100,30,0],6,60,15,2,4,45,true,15,7,undefined,2,4,7];const a=calculate(...args),b=calculate(...args,4,2,6);assert.equal(a.totals.emails,b.totals.emails);assert.equal(a.totals.tickets,b.totals.tickets);assert(b.months.flatMap(m=>m.actions).find(a=>a.kind==='prepare').date<a.months.flatMap(m=>m.actions).find(a=>a.kind==='prepare').date);assert.throws(()=>calculate(...args,1,2,4),/earlier than approval/);});
test('monthly account and financial-success targets reconcile to annual goals',()=>{const r=run(undefined,3,[{...row,count:20},{...row,name:'Winter',count:5,start:'2027-01-15',end:'2027-04-30'}]);for(const kind of ['accounts','successful'])assert.equal(r.months.reduce((sum,m)=>sum+m[kind],0),r.totals[kind]);assert.equal(r.totals.successful,25);assert.equal(r.months.find(m=>m.key==='2027-05').successful,20);assert.equal(r.months.find(m=>m.key==='2027-04').successful,5);assert.equal(r.months.flatMap(m=>m.actions).length,8);});
test('Band outreach follows all four dates without multiplying annual targets',()=>{
 const band={...row,name:'Band',start:'2027-07-15',end:'2028-07-14',outreach:[{date:'2027-06-01',purpose:'Marching'},{date:'2027-12-01',purpose:'Spring'},{date:'2028-01-01',purpose:'January'},{date:'2028-03-15',purpose:'Banquet'}]};
 const r=run(undefined,3,[band]);reconcile(r);
 assert.equal(r.totals.contacts,20);assert.equal(r.totals.emails,80);
 assert.equal(r.months.reduce((sum,m)=>sum+m.emails,0),80);
 const dates=r.months.flatMap(m=>m.actions).filter(a=>a.kind==='outreach').map(a=>new Date(a.date).toISOString().slice(0,10));
 assert.deepEqual(Array.from(dates),band.outreach.map(o=>o.date));
 for(const key of ['2027-06','2027-12','2028-01','2028-03'])assert.equal(r.months.find(m=>m.key===key).contacts,5);
 assert.equal(r.months.at(-1).key,'2028-07');assert.equal(r.months.at(-1).successful,1);
 const combined=run(undefined,3,[band,row]);reconcile(combined);
 for(const m of combined.months)assert.equal(m.emails,m.audiences.reduce((sum,a)=>sum+a.emails,0));
});
test('updated defaults render and retain the original revenue mix',()=>{
 const elements=new Map();
 for(const match of html.matchAll(/<(?:input|select)\b[^>]*\bid="([^"]+)"[^>]*>/g)){
  const tag=match[0];let value=tag.match(/\bvalue="([^"]*)"/)?.[1]||'';
  if(tag.startsWith('<select')){const options=html.slice(match.index+tag.length).split('</select>')[0];value=(options.match(/<option value="([^"]+)" selected/)||options.match(/<option value="([^"]+)"/))[1];}
  elements.set(match[1],{value,innerHTML:'',textContent:''});
 }
 const document={getElementById(id){if(!elements.has(id))elements.set(id,{value:'',innerHTML:'',textContent:'',style:{}});return elements.get(id)},addEventListener(){},querySelectorAll(){return []}};
 const context=vm.createContext({document});vm.runInContext(script,context);
 assert.equal(elements.get('seasonError').textContent,'');
 const rows=vm.runInContext('segments',context);
 const band=rows.find(s=>s.name==='Band'),choir=rows.find(s=>s.name==='Choir');
 assert.equal(band.count,0);assert.equal(band.end,'2028-07-14');
 assert.equal(choir.start,'2027-01-01');assert.equal(choir.end,'2027-12-31');
 assert.equal(rows.find(s=>s.name==='Marching band').start,'2027-07-15');
 assert.equal(rows.find(s=>s.name==='Winter guard').end,'2028-04-15');
 assert.equal(rows.find(s=>s.name==='Concert / symphonic band').end,'2027-05-30');
 assert.equal(rows.reduce((n,s)=>n+s.count,0),188);
 assert.equal(rows.reduce((n,s)=>n+s.count*s.rate,4228000),10000000);
 band.count=4;vm.runInContext('render()',context);assert.equal(elements.get('seasonError').textContent,'');
 assert.match(elements.get('executionMonths').innerHTML,/July 2028/);
});

test('prospecting calendars reconcile signup targets and keep three weekly emails ahead of signup',()=>{
 const source=script.slice(script.indexOf('function prospectCampaigns('),script.indexOf('function renderProspecting('));
 const context=vm.createContext({});vm.runInContext(source,context);
 const defaults=vm.runInNewContext(script.slice(script.indexOf('const segments='),script.indexOf("const $="))+';segments');
 const seasonDefaults=[['2027-07-15','2027-11-30'],['2027-08-01','2027-11-30'],['2027-11-01','2028-04-15'],['2027-01-01','2027-05-30'],['2027-01-01','2027-12-31']];
 defaults.forEach((r,i)=>{if(i<5){[r.start,r.end]=seasonDefaults[i];if(i===4)r.outreach=[{date:'2026-12-01',purpose:'Spring'},{date:'2027-03-15',purpose:'Late-year'},{date:'2027-08-01',purpose:'Fall'}];}});
 const rows=context.prospectCampaigns(defaults,3,2,30);
 assert.equal(rows.reduce((n,r)=>n+r.accounts,0),564);assert.equal(rows.reduce((n,r)=>n+r.contacts,0),3760);
 assert.equal(rows[0].campaigns[0].dates[0],'2027-06-10');assert.equal(rows[0].campaigns[0].deadline,'2027-07-01');
 assert.equal(rows[1].campaigns[0].deadline,'2027-07-16');assert.equal(rows[3].campaigns[0].dates[0],'2026-11-27');
 assert.equal(rows[4].campaigns[2].dates[0],'2027-08-02');
 for(const row of rows){assert.equal(row.campaigns.reduce((n,c)=>n+c.accounts,0),row.accounts);assert.equal(row.campaigns.reduce((n,c)=>n+c.contacts,0),row.contacts);for(const c of row.campaigns){assert.equal(c.dates.length,3);for(let i=1;i<3;i++)assert.equal(Date.parse(c.dates[i])-Date.parse(c.dates[i-1]),7*86400000);assert.equal(Date.parse(c.deadline)-Date.parse(c.dates[2]),7*86400000);assert.equal(context.prospectEmails(row.name,c.purpose).length,3);}}
 const adjusted=context.prospectCampaigns(defaults,4,2,30);assert.equal(adjusted.reduce((n,r)=>n+r.accounts,0),752);
 assert.throws(()=>context.prospectCampaigns(defaults,3,2,0),/valid sales funnel/);
 assert.equal(context.prospectCampaigns(defaults.map(r=>({...r,count:0})),3,2,30).length,0);
});


test('monthly and program views share one set of dated acquisition events',()=>{
 const source=script.slice(script.indexOf('function executionEvents('),script.indexOf('function setExecutionView('));
 const build=vm.runInNewContext(source+';executionEvents');
 const rows=[{name:'Band',start:'2027-07-15',end:'2027-11-30',campaigns:[{purpose:'Fall',dates:['2027-06-10','2027-06-17','2027-06-24'],deadline:'2027-07-01',accounts:282,contacts:1880}]},{name:'Guard',start:'2027-08-01',end:'2027-11-30',campaigns:[{purpose:'Fall',dates:['2027-06-25','2027-07-02','2027-07-09'],deadline:'2027-07-16',accounts:81,contacts:540}]}];
 const events=build(rows);
 assert.equal(events.reduce((n,e)=>n+e.goal,0),363);assert.equal(events.reduce((n,e)=>n+e.contacts,0),2420);
 const june=events.filter(e=>e.date.startsWith('2027-06'));assert.equal(june.filter(e=>e.kind==='email').length,4);
 for(let i=0;i<rows.length;i++){const program=events.filter(e=>e.program===i);assert.equal(program.filter(e=>e.kind==='signup').length,1);assert.equal(program.filter(e=>e.kind==='email').length,3);assert.equal(program.reduce((n,e)=>n+e.goal,0),rows[i].campaigns[0].accounts);}
 const shifted=build(rows,3,2,5);assert(shifted.find(e=>e.kind==='prepare').date<events.find(e=>e.kind==='prepare').date);
 assert.throws(()=>build(rows,1,2),/Preparation/);
});
