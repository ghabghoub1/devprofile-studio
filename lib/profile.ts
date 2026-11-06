export type TemplateId = 'professional'|'minimal'|'developer'|'creative';
export type Section = 'about'|'skills'|'projects'|'stats'|'connect';
export type Banner = {enabled:boolean;source:'url'|'upload';url:string;alt:string};
export type Profile = {banner:Banner;name:string;username:string;headline:string;bio:string;location:string;skills:string;projects:string;linkedin:string;accent:string;template:TemplateId;sections:Section[];hidden:Section[]};
export const initial:Profile={banner:{enabled:false,source:'url',url:'',alt:'Profile banner'},name:'Mohamed Lamine Rahali',username:'ghabghoub1',headline:'Software Engineer · Java Backend Developer · AI Enthusiast',bio:'I build reliable, scalable backend systems with Java and Spring Boot. Interested in software architecture, automation and AI.',location:'Tunisia',skills:'Java, Spring Boot, PostgreSQL, Docker, Git, REST APIs',projects:'Enterprise API | Secure REST services built with Spring Boot\nAI Experiments | Exploring intelligent developer tools',linkedin:'https://www.linkedin.com/in/mohamed-lamine-rahali/',accent:'#38bdf8',template:'professional',sections:['about','skills','projects','stats','connect'],hidden:[]};
/** Restore untrusted or older browser data without allowing malformed fields into the editor. */
export function normalizeProfile(value: unknown): Profile {
  const data = value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
  const validSections: Section[] = ['about', 'skills', 'projects', 'stats', 'connect'];
  const sectionList = (input: unknown): Section[] => Array.isArray(input)
    ? [...new Set(input.filter((item): item is Section =>
        typeof item === 'string' && validSections.includes(item as Section)))]
    : [];
  const ordered = sectionList(data.sections);
  const sections = [...ordered, ...validSections.filter(section => !ordered.includes(section))];
  const hidden = sectionList(data.hidden);
  const bannerData = data.banner !== null && typeof data.banner === 'object' && !Array.isArray(data.banner)
    ? data.banner as Record<string, unknown> : {};
  const source = bannerData.source === 'upload' ? 'upload' : 'url';
  const stringField = (key: keyof Profile): string =>
    typeof data[key] === 'string' ? data[key] as string : initial[key] as string;
  const template: TemplateId = ['professional', 'minimal', 'developer', 'creative'].includes(data.template as string)
    ? data.template as TemplateId : initial.template;
  const accent = stringField('accent');
  return {
    name: stringField('name'), username: stringField('username'),
    headline: stringField('headline'), bio: stringField('bio'),
    location: stringField('location'), skills: stringField('skills'),
    projects: stringField('projects'), linkedin: stringField('linkedin'),
    accent: /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : initial.accent,
    template, sections, hidden,
    banner: {
      source,
      // Uploaded File objects are session-only and cannot be restored from localStorage.
      enabled: source === 'url' && bannerData.enabled === true,
      url: typeof bannerData.url === 'string' ? bannerData.url : initial.banner.url,
      alt: typeof bannerData.alt === 'string' ? bannerData.alt : initial.banner.alt,
    },
  };
}
export const labels:Record<Section,string>={about:'About me',skills:'Tech stack',projects:'Featured projects',stats:'GitHub stats',connect:'Connect'};
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const cleanUrl=(s:string)=>/^https:\/\/[\w.-]+(?:[/?#][^\s<>]*)?$/.test(s)?s:'';
/** Parse one project per line: Name | Optional description. */
export type Project = { name: string; description: string };
export function parseProjects(input: string): Project[] {
  return input.split(/\r?\n/).map(line => {
    const [name, ...description] = line.split('|');
    return { name: name.trim(), description: description.join('|').trim() };
  }).filter(project => project.name.length > 0);
}
/** Keep the visual preview and exported README consistent for empty sections. */
export function hasSectionContent(p: Profile, section: Section): boolean {
  switch (section) {
    case 'about': return Boolean(p.bio.trim());
    case 'skills': return p.skills.split(',').some(skill => skill.trim().length > 0);
    case 'projects': return parseProjects(p.projects).length > 0;
    case 'stats': return Boolean(p.username.trim());
    case 'connect': return Boolean(p.username.trim() || cleanUrl(p.linkedin));
  }
}
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
 const bannerUrl=p.banner?.enabled?(p.banner.source==='upload'?'./assets/banner.png':cleanUrl(p.banner.url)):'';
 const banner=bannerUrl?['<p align="center">',`  <img src="${esc(bannerUrl)}" alt="${esc(p.banner.alt||'Profile banner')}" width="100%" />`,'</p>','']:[];
 const lines=[...banner,...header,'','---'];
 for(const s of p.sections){
   if(p.hidden.includes(s)||!hasSectionContent(p,s))continue;
   lines.push('');
   if(s==='about')lines.push('## 👋 About me','',p.bio);
   if(s==='skills')lines.push('## 🛠️ Tech stack','',p.skills.split(',').filter(x=>x.trim()).map(x=>'`'+x.trim().replace(/`/g,'')+'`').join(' · '));
   if(s==='projects')lines.push('## 🚀 Featured projects','',...parseProjects(p.projects).map(project=>'- **'+project.name.replace(/\*/g,'')+'**'+(project.description?' — '+project.description:'')));
   if(s==='stats')lines.push('## 📊 GitHub statistics','',`![GitHub stats](https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=tokyonight)`,'',`![Top languages](https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=tokyonight)`);
   if(s==='connect')lines.push('## 🤝 Connect','',`${p.username.trim()?`[GitHub](https://github.com/${username})`:''}${cleanUrl(p.linkedin)?`${p.username.trim()?' · ':''}[LinkedIn](${cleanUrl(p.linkedin)})`:''}`);
 }
 return lines.join('\n')+'\n';
}
