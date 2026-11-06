import { describe, expect, it } from 'vitest';
import { hasSectionContent, initial, markdown, parseProjects, type Profile } from '../lib/profile';

const profile = (overrides: Partial<Profile> = {}): Profile => ({
  ...initial,
  banner: { ...initial.banner },
  sections: [...initial.sections],
  hidden: [...initial.hidden],
  ...overrides,
});

describe('parseProjects', () => {
  it('accepts project names without descriptions', () => {
    expect(parseProjects('DevProfile Studio')).toEqual([{ name: 'DevProfile Studio', description: '' }]);
  });
  it('parses optional descriptions and preserves extra pipe characters', () => {
    expect(parseProjects('API | REST service | Spring Boot')).toEqual([
      { name: 'API', description: 'REST service | Spring Boot' },
    ]);
  });
  it('handles Windows newlines, blank lines, and whitespace', () => {
    expect(parseProjects('  One  \r\n\r\n Two | details  \r\n | no name')).toEqual([
      { name: 'One', description: '' },
      { name: 'Two', description: 'details' },
    ]);
  });
  it('returns no projects for empty or unnamed lines', () => {
    expect(parseProjects(' \n | description only \n')).toEqual([]);
  });
});

describe('hasSectionContent', () => {
  it('hides empty projects and skills', () => {
    const p = profile({ projects: ' | ignored', skills: ' , , ' });
    expect(hasSectionContent(p, 'projects')).toBe(false);
    expect(hasSectionContent(p, 'skills')).toBe(false);
  });
  it('shows projects with names even when descriptions are absent', () => {
    expect(hasSectionContent(profile({ projects: 'One' }), 'projects')).toBe(true);
  });
});

describe('markdown', () => {
  it('exports projects with optional descriptions consistently', () => {
    const output = markdown(profile({
      projects: 'test project 0\ntest project 1 | description\ntest project 2 | first | second',
      sections: ['projects'],
    }));
    expect(output).toContain('- **test project 0**\n');
    expect(output).toContain('- **test project 1** — description');
    expect(output).toContain('- **test project 2** — first | second');
    expect(output).not.toContain('Add a project description');
  });
  it('omits empty sections and explicitly hidden sections', () => {
    const output = markdown(profile({
      bio: '', skills: '', projects: '', username: '', linkedin: '',
      sections: ['about', 'skills', 'projects', 'stats', 'connect'],
    }));
    expect(output).not.toContain('## 👋 About me');
    expect(output).not.toContain('## 🛠️ Tech stack');
    expect(output).not.toContain('## 🚀 Featured projects');
    expect(output).not.toContain('## 📊 GitHub statistics');
    expect(output).not.toContain('## 🤝 Connect');
    const hidden = markdown(profile({ sections: ['projects'], hidden: ['projects'] }));
    expect(hidden).not.toContain('## 🚀 Featured projects');
  });
  it('includes nonempty sections in the chosen order', () => {
    const output = markdown(profile({ sections: ['projects', 'about'] }));
    expect(output.indexOf('## 🚀 Featured projects')).toBeLessThan(output.indexOf('## 👋 About me'));
  });
  it('escapes unsafe banner HTML attributes and rejects non-HTTPS banner URLs', () => {
    const unsafe = markdown(profile({
      banner: { enabled: true, source: 'url', url: 'javascript:alert(1)', alt: 'test' },
    }));
    expect(unsafe).not.toContain('<img');
    const safe = markdown(profile({
      banner: { enabled: true, source: 'url', url: 'https://example.com/banner.png', alt: 'A "banner" & more' },
    }));
    expect(safe).toContain('alt="A &quot;banner&quot; &amp; more"');
  });
});
