// Pure stateless helpers. Submitted content is not persisted by application code.
const present = value => typeof value === 'string' && value.trim().length > 0;
export const brief = ({clientName, expertise='', audience='', objective='', evidence=[], boundaries=[]}) => {
  const fields = {expertise, audience, objective};
  const missing = Object.entries(fields).filter(([,v]) => !present(v)).map(([k]) => k);
  if (!evidence.length) missing.push('verified evidence or achievements');
  return {client:clientName,confirmedFacts:{expertise:expertise||null,audience:audience||null,objective:objective||null,evidence},privacyBoundaries:boundaries,openQuestions:missing.map(x=>`Please confirm ${x}.`),suggestedPillars:present(expertise)?[`Practical lessons from ${expertise}`,'Evidence-backed stories and case studies','Audience questions and objections','Professional perspectives and insights']:[],approvalStatus:'draft — client review required',notice:'Suggestions are not verified claims. Do not invent results or publish without approval.'};
};
export const calendar = ({audience,pillars,startDate,weeks=4,postsPerWeek=2}) => {
  const start = new Date(`${startDate}T12:00:00Z`);
  if(Number.isNaN(start.getTime()) || start.toISOString().slice(0,10)!==startDate) throw Error('Invalid date');
  const items=[];
  for(let w=0;w<weeks;w++)for(let p=0;p<postsPerWeek;p++){
    const date=new Date(start);date.setUTCDate(date.getUTCDate()+w*7+p*2);
    const pillar=pillars[(w*postsPerWeek+p)%pillars.length];
    items.push({date:date.toISOString().slice(0,10),pillar,targetAudience:audience,objective:p%3===0?'build credibility':p%3===1?'teach a practical lesson':'invite qualified conversation',hookDirection:`A specific and evidence-backed insight about ${pillar}`,proofNeeded:'Client-approved example, story or verifiable evidence',status:'idea — not scheduled'});
  }
  return {items,disclaimer:'Proposed calendar only. Nothing has been scheduled or published.'};
};
export const postReview=({post,verifiedClaims=[],bannedTopics=[]})=>{
  const words=post.trim().split(/\s+/).filter(Boolean);
  const numbers=[...post.matchAll(/(?:GHS\s*|[$£₵])?\b\d[\d,.]*\s*(?:%|k\b|m\b|million\b|years?\b|clients?\b|followers?\b|impressions?\b)?/gi)].map(m=>m[0]);
  return {wordCount:words.length,opening:post.split(/\n/).find(p=>p.trim())||'',potentiallyUnverifiedNumbers:[...new Set(numbers.filter(m=>!verifiedClaims.some(v=>v.includes(m))))].slice(0,20),restrictedTopicsMentioned:bannedTopics.filter(t=>post.toLowerCase().includes(t.toLowerCase())),checks:{firstLineSpecific:words.slice(0,18).length>=5,hasQuestionOrCTA:/\?|comment|message|connect|follow|download|book/i.test(post),hasParagraphBreaks:post.includes('\n')},status:'review only — human editorial and client approval required',note:'Number detection is heuristic; verify all claims independently.'};
};
export const metrics=({period,impressions,engagements,profileViews,followersGained,leads})=>({period,impressions,engagements,engagementRatePercent:impressions>0?Math.round(engagements/impressions*10000)/100:null,profileViews,followersGained,leads,leadPerThousandImpressions:impressions>0?Math.round(leads/impressions*100000)/100:null,interpretation:'Descriptive only; metrics do not establish causality.',nextExperiments:['Compare story-led versus instructional hooks','Track qualified conversations, not impressions alone','Test one relevant CTA for a full posting cycle']});
