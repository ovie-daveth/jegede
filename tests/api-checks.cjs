const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
let writes=0;const objects=new Map();const DB={prepare(sql){return {bind(){return this},async first(){return {id:'p'}},async run(){writes++;return{}},async all(){return{results:[]}}}},async batch(){writes++;return[]}};
const env={DB,BUCKET:{async put(key,body){objects.set(key,await new Response(body).text())},async delete(key){objects.delete(key)}}};
function moduleFile(file,mocks){const src=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const m={exports:{}};vm.runInNewContext(src,{exports:m.exports,module:m,require:n=>mocks[n],Response,Request,URL,Headers,crypto:globalThis.crypto,console,Date,Number,Set});return m.exports}
const helpers=moduleFile('app/api/helpers.ts',{'cloudflare:workers':{env}});const upload=moduleFile('app/api/upload/route.ts',{'../helpers':helpers});const projects=moduleFile('app/api/projects/route.ts',{'../helpers':helpers});
const auth={'oai-authenticated-user-id':'user','oai-authenticated-user-email':'michealjegede3@gmail.com',origin:'https://test.site'};
(async()=>{
assert.equal((await projects.POST(new Request('https://test.site/api/projects',{method:'POST',body:'{}'}))).status,403);
assert.equal((await projects.POST(new Request('https://test.site/api/projects',{method:'POST',headers:{...auth,'oai-authenticated-user-email':'other@example.com'},body:'{}'}))).status,403);
assert.equal((await projects.POST(new Request('https://test.site/api/projects',{method:'POST',headers:{...auth,origin:'https://evil.site'},body:'{}'}))).status,403);
assert.equal((await projects.POST(new Request('https://test.site/api/projects',{method:'POST',headers:auth,body:'broken'}))).status,400);
assert.equal((await projects.POST(new Request('https://test.site/api/projects',{method:'POST',headers:auth,body:JSON.stringify({title:'Test',year:'invalid',tools:'CAD',description:'Design',category:'Plant design'})}))).status,400);
const saved=await projects.POST(new Request('https://test.site/api/projects',{method:'POST',headers:auth,body:JSON.stringify({title:'AdBlue',year:'2025',tools:'AutoCAD',description:'Model',category:'Plant design',published:false})}));assert.equal(saved.status,200);assert.ok((await saved.json()).id);
assert.equal((await upload.POST(new Request('https://test.site/api/upload?project=p&name=x.html',{method:'POST',headers:{...auth,'content-length':'3'},body:'abc'}))).status,400);
assert.equal((await upload.POST(new Request('https://test.site/api/upload?project=p&name=x.mp4',{method:'POST',headers:{...auth,'content-length':String(100*1024*1024)},body:'abc'}))).status,413);
const uploaded=await upload.POST(new Request('https://test.site/api/upload?project=p&name=model.step',{method:'POST',headers:{...auth,'content-length':'3'},body:'abc'}));assert.equal(uploaded.status,200);assert.equal([...objects.values()][0],'abc');assert.equal(writes,2);
console.log('9 API checks passed: admin access, origin protection, validation, format/size limits, project persistence and streamed file upload.');
})().catch(e=>{console.error(e);process.exit(1)});
