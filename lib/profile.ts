export type TemplateId = 'professional'|'minimal'|'developer'|'creative';
export type Section = 'about'|'skills'|'projects'|'stats'|'connect';
export type Profile = {name:string;username:string;headline:string;bio:string;location:string;skills:string;projects:string;linkedin:string;accent:string;template:TemplateId;sections:Section[];hidden:Section[]};
export const initial:Profile={name:'Mohamed Lamine Rahali',username:'ghabghoub1',headline:'Software Engineer · Java Backend Developer · AI Enthusiast',bio:'I build reliable, scalable backend systems with Java and Spring Boot. Interested in software architecture, automation and AI.',location:'Tunisia',skills:'Java, Spring Boot, PostgreSQL, Docker, Git, REST APIs',projects:'Enterprise API | Secure REST services built with Spring Boot\nAI Experiments | Exploring intelligent developer tools',linkedin:'https://www.linkedin.com/in/mohamed-lamine-rahali/',accent:'#38bdf8',template:'professional',sections:['about','skills','projects','stats','connect'],hidden:[]};
export const labels:Record<Section,string>={about:'About me',skills:'Tech stack',projects:'Featured projects',stats:'GitHub stats',connect:'Connect'};
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const cleanUrl=(s:string)=>/^https:\/\/[\w.-]+(?:[/?#][^\s<>]*)?$/.test(s)?s:'';
export function markdown(p:Profile){
 const title=p.name.replace(/[\r\n#]/g,' ');
 const headline=p.headline.replace(/[\r\n]/g,' ');
 const username=encodeURIComponent(p.username.trim());
 const header=p.template==='minimal'
   ? [`# ${title}`,'',`**${headline}** · ${p.location}`]
   : p.template==='developer'
   ? [`# 👨‍💻 ${title}`,'',`> ${headline}`,'',`📍 ${p.location}`]
   : p.template==='creative'
   ? ['<div align="center">','',`# ✨ ${title}`,'',`### ${headline}`,'',`🌍 ${p.location}`,'','</div>']
   : ['<div align="center">','',`# ${title}`,'',`**${headline}**`,'',`📍 ${p.location}`,'','</div>'];
 const lines=[...header,'','---'];
 for(const s of p.sections){
   if(p.hidden.includes(s))continue;
   lines.push('');
   if(s==='about')lines.push('## 👋 About me','',p.bio);
   if(s==='skills')lines.push('## 🛠️ Tech stack','',p.skills.split(',').filter(x=>x.trim()).map(x=>'`'+x.trim().replace(/`/g,'')+'`').join(' · '));
   if(s==='projects')lines.push('## 🚀 Featured projects','',...p.projects.split('\n').filter(Boolean).map(x=>'- **'+x.split('|')[0].trim().replace(/\*/g,'')+'**'+(x.includes('|')?' — '+x.split('|').slice(1).join('|').trim():'')));
   if(s==='stats')lines.push('## 📊 GitHub statistics','',`![GitHub stats](https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=tokyonight)`,'',`![Top languages](https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=tokyonight)`);
   if(s==='connect')lines.push('## 🤝 Connect','',`[GitHub](https://github.com/${username})${cleanUrl(p.linkedin)?` · [LinkedIn](${cleanUrl(p.linkedin)})`:''}`);
 }
 return lines.join('\n')+'\n';
}
