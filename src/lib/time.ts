export const PHASES = ['dawn', 'noon', 'dusk', 'night'] as const;
export type Phase = (typeof PHASES)[number];

export const PHASE_LABEL: Record<Phase, { zh: string; en: string }> = {
  dawn: { zh: '清晨', en: 'Dawn' },
  noon: { zh: '正午', en: 'Noon' },
  dusk: { zh: '日落', en: 'Dusk' },
  night: { zh: '夜晚', en: 'Night' },
};

/**
 * Inline <head> script: sets <html data-time> before first paint.
 * Priority: ?time=… (also remembered for the tab via sessionStorage) > Asia/Shanghai clock.
 * ?time=auto clears the override.
 */
export const TIME_BOOT_SCRIPT = `(()=>{try{var P=['dawn','noon','dusk','night'],q=new URLSearchParams(location.search).get('time'),s=sessionStorage,t=null;if(q==='auto')s.removeItem('seaside-time');else if(P.indexOf(q)>-1){t=q;s.setItem('seaside-time',q)}if(!t){var m=s.getItem('seaside-time');if(P.indexOf(m)>-1)t=m}if(!t){var h=+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'numeric',hourCycle:'h23'}).format(new Date());t=h>=5&&h<8?'dawn':h>=8&&h<16?'noon':h>=16&&h<19?'dusk':'night'}document.documentElement.dataset.time=t}catch(e){document.documentElement.dataset.time='dusk'}})()`;
