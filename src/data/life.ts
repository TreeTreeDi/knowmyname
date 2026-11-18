// Migrated from treetreedi.me photos/ (HEIC converted to JPEG, long edge 2000px).
// To add one: drop the photo in src/assets/life/ and add a line here (newest first).
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/life/*.{jpg,jpeg,png,webp}', { eager: true });
const img = (name: string) => files[`../assets/life/${name}`].default;

export interface Moment { img: ImageMetadata; alt: string; date?: string; note?: string }

export const moments: Moment[] = [
  { img: img('1762872069833.jpg'), alt: '楼下开花的桂花' },
  { img: img('1762872069641.jpg'), alt: '街口的路人和共享单车' },
  { img: img('1762872068978.jpg'), alt: '傍晚路灯下的街道' },
  { img: img('1762871351786.jpg'), alt: '楼宇之间的日落' },
  { img: img('1762872068870.jpg'), alt: '一个汉堡' },
  { img: img('1762872068756.jpg'), alt: '一屉青团' },
  { img: img('1762871996072.jpg'), alt: '一碗燕麦' },
  { img: img('1762871352409.jpg'), alt: '一桌饭菜' },
  { img: img('1762871349379.jpg'), alt: '跟在脚边的小猫' },
  { img: img('1762872069418.jpg'), alt: '楼道里的几只猫' },
];
