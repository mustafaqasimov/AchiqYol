import {test} from 'node:test';
import assert from 'node:assert/strict';
import {POST} from '../app/api/accessibility/route.ts';
const auth='Basic '+Buffer.from('admin:test-password').toString('base64');
const image='data:image/jpeg;base64,'+Buffer.from([255,216,255,0]).toString('base64');
const result={color:'GREEN',confidence:'high',summary:'Giriş görünür.',observations:['Pilləkən görünmür'],unknowns:['Daxili məkan yoxlanmalıdır']};
function req(body={image},authorization=auth){return new Request('http://localhost/api/accessibility',{method:'POST',headers:{'Content-Type':'application/json',Authorization:authorization},body:JSON.stringify(body)})}
test('vision endpoint rejects invalid input, protects credentials, and handles provider outcomes',async t=>{
 const oldFetch=global.fetch;const old={...process.env};process.env.ADMIN_USER='admin';process.env.ADMIN_PASSWORD='test-password';process.env.OPENAI_API_KEY='test-only-not-a-real-key';
 try{
 await t.test('unauthenticated request never calls AI',async()=>{global.fetch=()=>{throw Error('Must not call provider')};assert.equal((await POST(req({},''))).status,401)});
 await t.test('missing API key returns unavailable',async()=>{delete process.env.OPENAI_API_KEY;assert.equal((await POST(req())).status,503);process.env.OPENAI_API_KEY='test-only-not-a-real-key'});
 await t.test('reject invalid image signature',async()=>{assert.equal((await POST(req({image:'data:image/jpeg;base64,YWJj'}))).status,400)});
 await t.test('reject oversized body before provider',async()=>{assert.equal((await POST(req({image:'x'.repeat(1500001)}))).status,413)});
 await t.test('valid provider response and server-only authentication',async()=>{global.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/chat/completions');assert.equal(options.headers.Authorization,'Bearer test-only-not-a-real-key');return Response.json({choices:[{message:{content:JSON.stringify(result)}}]})};const response=await POST(req());assert.equal(response.status,200);assert.deepEqual(await response.json(),result)});
 await t.test('low confidence forced to grey',async()=>{global.fetch=async()=>Response.json({choices:[{message:{content:JSON.stringify({...result,confidence:'low'})}}]});assert.equal((await (await POST(req())).json()).color,'GREY')});
 await t.test('provider failures not exposed or fabricated',async()=>{global.fetch=async()=>new Response('sensitive provider error',{status:401});const r=await POST(req());assert.equal(r.status,502);assert.ok(!(await r.text()).includes('sensitive'))});
 await t.test('refusal and malformed output handled',async()=>{global.fetch=async()=>Response.json({choices:[{message:{refusal:'no'}}]});assert.equal((await POST(req())).status,422);global.fetch=async()=>Response.json({choices:[{message:{content:'{}'}}]});assert.equal((await POST(req())).status,502)});
 }finally{global.fetch=oldFetch;for(const key of ['ADMIN_USER','ADMIN_PASSWORD','OPENAI_API_KEY']){if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key]}}
});
