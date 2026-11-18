import type { ImageMetadata } from 'astro';
import bike from '../assets/life/bike.jpg';
import coffee from '../assets/life/coffee.jpg';
import desk from '../assets/life/desk.jpg';
import lighthouse from '../assets/life/lighthouse.jpg';
import noodles from '../assets/life/noodles.jpg';
import tidepool from '../assets/life/tidepool.jpg';
import s1 from '../assets/life/sea-01.jpg';
import s2 from '../assets/life/sea-02.jpg';
import s3 from '../assets/life/sea-03.jpg';
import s4 from '../assets/life/sea-04.jpg';
import s5 from '../assets/life/sea-05.jpg';
import s6 from '../assets/life/sea-06.jpg';

/** Placeholder photos (AI-generated) until real ones go in. Notes stay short on purpose. */
export interface Moment { img: ImageMetadata; alt: string; date: string; note?: string }

export const moments: Moment[] = [
  { img: s6, alt: '冬日黄昏的卵石海滩', date: '2026-11-17', note: '16:55' },
  { img: desk, alt: '夜里窗边的笔记本电脑和咖啡', date: '2026-11-12' },
  { img: noodles, alt: '海边小店的一碗面', date: '2026-11-02', note: '收工' },
  { img: lighthouse, alt: '蓝调时刻亮起的灯塔', date: '2026-10-26' },
  { img: coffee, alt: '海堤上的一杯冰咖啡', date: '2026-10-19' },
  { img: s2, alt: '退潮后的沙滩倒映粉色天空', date: '2026-10-08', note: '退潮' },
  { img: bike, alt: '海边栏杆旁的自行车', date: '2026-09-27' },
  { img: tidepool, alt: '礁石间的潮池', date: '2026-09-14' },
  { img: s3, alt: '夜里防波堤上的灯塔', date: '2026-08-30' },
  { img: s1, alt: '窗边木桌上的刊物和茶', date: '2026-08-11' },
  { img: s4, alt: '沙滩上装着纸卷的玻璃瓶', date: '2026-07-20' },
  { img: s5, alt: '木制字盘里的金属活字', date: '2026-06-28' },
];
