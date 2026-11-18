import type { ImageMetadata } from 'astro';
import seaThumb from '../assets/life/sea-06.jpg';

export type Icon = 'database' | 'video' | 'grid' | 'doc' | 'wave';
export interface Project {
  name: string;
  desc: string;
  icon: Icon;
  href?: string;
  thumb?: ImageMetadata;
}

export const projectGroups: { label: string; ghost: string; items: Project[] }[] = [
  {
    label: '在做',
    ghost: 'Now',
    items: [
      { name: 'CloudQuery', desc: '数据库一体化操作平台', icon: 'database' },
      { name: '海边', desc: '这个博客 · WebGPU 海面', icon: 'wave', href: '/', thumb: seaThumb },
    ],
  },
  {
    label: '做过',
    ghost: 'Built',
    items: [
      { name: 'StreamFusion', desc: 'WebRTC 全栈直播平台', icon: 'video' },
      { name: 'Multi-Mode Selection', desc: 'AG Grid 多模式选择', icon: 'grid' },
      { name: 'markdown-flow', desc: '流式渲染 Markdown 的 npm 包', icon: 'doc' },
    ],
  },
];
