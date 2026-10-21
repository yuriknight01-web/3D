export const angleDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export function turnPlan(a,b){const d=angleDelta(a,b);return Math.abs(d)<.025?null:{start:a,end:a+Math.max(-.20,Math.min(.20,d)),age:0};}
