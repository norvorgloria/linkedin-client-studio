import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { brief, calendar, postReview, metrics } from './logic.js';

const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'96kb'}));
app.use((req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');next();});
const publicDir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
app.use(express.static(publicDir,{extensions:['html']}));
app.get('/health',(_,res)=>res.json({status:'ok',service:'linkedin-client-studio',version:'1.0.0'}));
// Domain verification token is configured privately as an environment variable.
app.get('/.well-known/openai-apps-challenge',(_req,res)=>{
 const token=process.env.OPENAI_APPS_CHALLENGE_TOKEN;
 if(!token)return res.status(404).type('text/plain').send('Not configured');
 return res.type('text/plain').send(token);
});
function buildMcp(){
 const s=new McpServer({name:'linkedin-client-studio',version:'1.0.0'});
 const result=x=>({content:[{type:'text',text:JSON.stringify(x,null,2)}],structuredContent:x});
 s.registerTool('build_client_brief',{title:'Build client brief',description:'Create a fact-grounded LinkedIn client onboarding brief; no data stored.',annotations:{readOnlyHint:true,openWorldHint:false,destructiveHint:false},inputSchema:{clientName:z.string().min(1).max(150),expertise:z.string().max(2000).optional(),audience:z.string().max(2000).optional(),objective:z.string().max(2000).optional(),evidence:z.array(z.string().max(2000)).max(30).optional(),boundaries:z.array(z.string().max(500)).max(30).optional()}},async a=>result(brief({...a,evidence:a.evidence||[],boundaries:a.boundaries||[]})));
 s.registerTool('plan_content_calendar',{title:'Plan content calendar',description:'Generate dated draft ideas from approved pillars; never schedules or publishes.',annotations:{readOnlyHint:true,openWorldHint:false,destructiveHint:false},inputSchema:{audience:z.string().min(1).max(1000),pillars:z.array(z.string().min(1).max(250)).min(1).max(6),startDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),weeks:z.number().int().min(1).max(8).optional(),postsPerWeek:z.number().int().min(1).max(5).optional()}},async a=>result(calendar(a)));
 s.registerTool('review_linkedin_post',{title:'Review LinkedIn post',description:'Flag numbers and sensitive topics for human review; content is not stored.',annotations:{readOnlyHint:true,openWorldHint:false,destructiveHint:false},inputSchema:{post:z.string().min(1).max(18000),verifiedClaims:z.array(z.string().max(500)).max(50).optional(),bannedTopics:z.array(z.string().max(100)).max(30).optional()}},async a=>result(postReview({...a,verifiedClaims:a.verifiedClaims||[],bannedTopics:a.bannedTopics||[]})));
 s.registerTool('review_linkedin_metrics',{title:'Review LinkedIn metrics',description:'Calculate descriptive engagement and lead ratios from user-supplied metrics.',annotations:{readOnlyHint:true,openWorldHint:false,destructiveHint:false},inputSchema:{period:z.string().min(1).max(100),impressions:z.number().int().nonnegative(),engagements:z.number().int().nonnegative(),profileViews:z.number().int().nonnegative(),followersGained:z.number().int(),leads:z.number().int().nonnegative()}},async a=>result(metrics(a)));
 return s;
}
app.post('/mcp',async(req,res)=>{
 const mcp=buildMcp();
 const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
 try{await mcp.connect(transport);await transport.handleRequest(req,res,req.body);}
 catch(err){console.error('MCP request error:',err?.message);if(!res.headersSent)res.status(500).json({jsonrpc:'2.0',error:{code:-32603,message:'Internal server error'},id:null});}
 res.on('close',()=>{transport.close().catch(()=>{});mcp.close().catch(()=>{});});
});
app.get('/mcp',(_,res)=>res.status(405).set('Allow','POST').send('Use MCP Streamable HTTP POST.'));
app.delete('/mcp',(_,res)=>res.status(405).set('Allow','POST').end());
app.use((err,req,res,next)=>{if(err instanceof SyntaxError&&'body' in err)return res.status(400).json({error:'Invalid JSON'});next(err);});
app.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('LinkedIn Client Studio listening'));
