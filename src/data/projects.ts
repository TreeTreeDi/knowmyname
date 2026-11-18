// Migrated from treetreedi.me pages/projects.md.
export type Icon = 'database' | 'video' | 'grid' | 'doc';
export interface Project {
  name: string;
  desc: string;
  icon: Icon;
  href: string;
}

export const projectGroups: { label: string; ghost: string; items: Project[] }[] = [
  {
    label: 'Current Focus',
    ghost: 'Now',
    items: [{ name: 'CloudQuery', desc: '数据库一体化操作平台', icon: 'database', href: 'https://cloudquery.club/' }],
  },
  {
    label: 'Projects',
    ghost: 'Built',
    items: [
      { name: 'StreamFusion', desc: 'WebRTC 全栈直播平台', icon: 'video', href: 'https://github.com/TreeTreeDi/StreamFusion' },
      { name: 'Multi-Mode Selection', desc: 'AG Grid Community 实现自定义的多模式选择', icon: 'grid', href: 'https://github.com/TreeTreeDi/AG-Grid-Multi-Mode-Selection' },
      { name: 'markdown-flow', desc: '流式渲染的 Markdown npm 包', icon: 'doc', href: 'https://github.com/TreeTreeDi/markdown-flow' },
    ],
  },
];
