// The scripted fallback game. When Muse is unreachable, every step (build, publish pass, v2, import)
// still produces a real, playable game by swapping this config, so the demo never dead-ends.
// Live Muse writes its own HTML against the same contract (see GAME_CONTRACT in ai.ts).

export interface GameConfig {
  title: string;
  subtitle: string;
  vessel: string; // emoji the player moves
  vesselLabel: string;
  goods: { e: string; pts: number }[];
  bonus: { e: string; pts: number; name: string };
  bad: { text: string; name: string }; // a stamp that costs points
  hard: boolean;
  bg: [string, string];
  accent: string;
  endLines: [string, string, string]; // low, mid, high score lines
}

export const RAMEN_PRIVATE: GameConfig = {
  title: "Slurp Rush",
  subtitle: "Catch toppings for Arun's Tatsu-ya bowl. Dodge Jay's \"mid\" stamps.",
  vessel: "🍜",
  vesselLabel: "TATSU-YA",
  goods: [
    { e: "🥚", pts: 10 },
    { e: "🍥", pts: 10 },
    { e: "🌿", pts: 5 },
    { e: "🥩", pts: 15 },
    { e: "🌽", pts: 5 },
  ],
  bonus: { e: "🌟", pts: 50, name: "Priya's 11/10 egg" },
  bad: { text: "mid", name: "Jay's mid stamp" },
  hard: false,
  bg: ["#FFF4E6", "#FFE0C2"],
  accent: "#E8590C",
  endLines: ["Jay rates this run: mid.", "Solid. Mia would still order the spicy one.", "11/10. Priya is crying."],
};

export const RAMEN_PUBLIC: GameConfig = {
  ...RAMEN_PRIVATE,
  title: "Slurp Rush",
  subtitle: "Catch toppings for your ramen bowl. Dodge the \"mid\" stamps.",
  vesselLabel: "YOUR BOWL",
  bonus: { e: "🌟", pts: 50, name: "golden egg" },
  bad: { text: "mid", name: "mid stamp" },
  endLines: ["Critics say: mid.", "Solid bowl. Your regulars approve.", "11/10. A perfect bowl."],
};

export const RAMEN_HARD: GameConfig = { ...RAMEN_PRIVATE, hard: true, subtitle: "HARD MODE: faster toppings, twice the mid stamps. Jay is watching." };
export const RAMEN_PUBLIC_HARD: GameConfig = { ...RAMEN_PUBLIC, hard: true, subtitle: "HARD MODE: faster toppings, twice the mid stamps." };

export const TACO_IMPORT: GameConfig = {
  title: "Taco Tuesday Rush",
  subtitle: "Load Diego's taco. Dodge Kenji's cilantro-tastes-like-soap stamps.",
  vessel: "🌮",
  vesselLabel: "VERACRUZ",
  goods: [
    { e: "🥑", pts: 10 },
    { e: "🧀", pts: 5 },
    { e: "🍅", pts: 5 },
    { e: "🥩", pts: 15 },
    { e: "🧅", pts: 5 },
  ],
  bonus: { e: "🌶️", pts: 50, name: "Ellie's habanero salsa" },
  bad: { text: "soap", name: "Kenji's soap stamp" },
  hard: false,
  bg: ["#F1FAE6", "#DCF2C4"],
  accent: "#2F9E44",
  endLines: ["Kenji says: tastes like soap.", "Amara would order two more.", "Veracruz should hire you."],
};

export function gameHtml(c: GameConfig) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
html,body{margin:0;height:100%;overflow:hidden;font-family:-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;background:${c.bg[0]};touch-action:none;user-select:none;-webkit-user-select:none}
canvas{display:block;width:100%;height:100%}
#ui{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;box-sizing:border-box;background:linear-gradient(${c.bg[0]}ee,${c.bg[1]}ee)}
h1{margin:0 0 6px;font-size:30px;color:#050505;letter-spacing:-.5px}
p{margin:0 0 6px;color:#3a3b3c;font-size:15px;line-height:20px;max-width:300px}
.big{font-size:64px;margin:4px 0 10px}
.score{font-size:44px;font-weight:800;color:${c.accent};margin:6px 0}
button{margin-top:14px;background:${c.accent};color:#fff;border:0;border-radius:10px;font-size:17px;font-weight:700;padding:12px 30px;cursor:pointer}
.hint{font-size:13px;color:#65676b;margin-top:12px}
.tag{display:inline-block;background:#050505;color:#fff;font-size:11px;font-weight:800;letter-spacing:1px;border-radius:6px;padding:3px 8px;margin-bottom:8px}
#hud{position:absolute;top:10px;left:12px;right:12px;display:flex;justify-content:space-between;font-weight:800;font-size:17px;color:#050505;pointer-events:none}
</style></head><body>
<canvas id="c"></canvas>
<div id="hud"><span id="s">0</span><span id="t">30</span></div>
<div id="ui"></div>
<script>
var C=${JSON.stringify(c)};
var cv=document.getElementById("c"),ctx=cv.getContext("2d"),ui=document.getElementById("ui"),hs=document.getElementById("s"),ht=document.getElementById("t");
var W=0,H=0,dpr=Math.max(1,window.devicePixelRatio||1);
function size(){W=window.innerWidth;H=window.innerHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
window.addEventListener("resize",size);size();
var player={name:"you"},best=0,state="menu",items=[],x=0.5,score=0,combo=0,left=30,last=0,spawn=0,shake=0,pops=[];
var speed=C.hard?1.7:1,badRate=C.hard?0.32:0.16;
function menu(){state="menu";ui.style.display="flex";ui.innerHTML=(C.hard?'<span class="tag">HARD MODE</span>':'')+'<div class="big">'+C.vessel+'</div><h1>'+C.title+'</h1><p>'+C.subtitle+'</p><p style="font-size:13px;color:#65676b">'+C.bonus.e+' '+C.bonus.name+' = +'+C.bonus.pts+'</p>'+(best?'<p class="hint">Your best: '+best+'</p>':'')+'<button id="go">Play</button><div class="hint">Drag to move · 30 seconds</div>';document.getElementById("go").onclick=start}
function start(){items=[];score=0;combo=0;left=30;spawn=0;pops=[];state="play";ui.style.display="none";last=performance.now();requestAnimationFrame(loop)}
function end(){state="over";if(score>best)best=score;var line=score<150?C.endLines[0]:score<400?C.endLines[1]:C.endLines[2];
ui.style.display="flex";ui.innerHTML='<div class="big">'+C.vessel+'</div><h1>Time!</h1><div class="score">'+score+'</div><p>'+line+'</p><button id="go">Play again</button>';
document.getElementById("go").onclick=start;try{parent.postMessage({type:"score",score:score},"*")}catch(e){}}
function rnd(a,b){return a+Math.random()*(b-a)}
function add(){var r=Math.random(),it={x:rnd(0.08,0.92),y:-30,v:rnd(150,230)*speed,kind:"good"};
if(r<badRate){it.kind="bad"}else if(r<badRate+0.04){it.kind="bonus";it.e=C.bonus.e;it.pts=C.bonus.pts;it.v*=1.25}else{var g=C.goods[Math.floor(Math.random()*C.goods.length)];it.e=g.e;it.pts=g.pts}
items.push(it)}
function loop(t){if(state!=="play")return;var dt=Math.min(0.05,(t-last)/1000);last=t;left-=dt;if(left<=0){left=0;draw();end();return}
spawn-=dt;if(spawn<=0){add();spawn=rnd(0.32,0.6)/(C.hard?1.45:1)}
var bx=x*W,by=H-70;
for(var i=items.length-1;i>=0;i--){var it=items[i];it.y+=it.v*dt;var ix=it.x*W;
if(it.y>by-34&&it.y<by+20&&Math.abs(ix-bx)<46){items.splice(i,1);
if(it.kind==="bad"){score=Math.max(0,score-25);combo=0;shake=0.3;pops.push({x:ix,y:by-40,t:0.8,s:"-25",c:"#e41e3f"})}
else{combo++;var p=it.pts*(combo>=5?2:1);score+=p;pops.push({x:ix,y:by-40,t:0.7,s:"+"+p+(combo>=5?" x2":""),c:C.accent})}
continue}
if(it.y>H+40)items.splice(i,1)}
for(var j=pops.length-1;j>=0;j--){pops[j].t-=dt;pops[j].y-=40*dt;if(pops[j].t<=0)pops.splice(j,1)}
shake=Math.max(0,shake-dt);draw();requestAnimationFrame(loop)}
function pill(cx,cy,txt){ctx.save();ctx.translate(cx,cy);ctx.rotate(-0.15);ctx.font="900 17px -apple-system,Arial";var w=ctx.measureText(txt).width+22;
ctx.fillStyle="#fff";ctx.strokeStyle="#e41e3f";ctx.lineWidth=3;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(-w/2,-15,w,30,8);else ctx.rect(-w/2,-15,w,30);ctx.fill();ctx.stroke();
ctx.fillStyle="#e41e3f";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(txt.toUpperCase(),0,1);ctx.restore()}
function draw(){var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,C.bg[0]);g.addColorStop(1,C.bg[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.save();if(shake>0)ctx.translate(rnd(-6,6),rnd(-4,4));
ctx.textAlign="center";ctx.textBaseline="middle";
for(var i=0;i<items.length;i++){var it=items[i];if(it.kind==="bad"){pill(it.x*W,it.y,C.bad.text)}else{ctx.font=(it.kind==="bonus"?40:34)+"px serif";ctx.fillText(it.e,it.x*W,it.y)}}
var bx=x*W,by=H-70;ctx.font="64px serif";ctx.fillText(C.vessel,bx,by);
ctx.font="800 10px -apple-system,Arial";ctx.fillStyle="#050505";ctx.globalAlpha=.55;ctx.fillText(C.vesselLabel,bx,by+40);ctx.globalAlpha=1;
for(var j=0;j<pops.length;j++){ctx.font="800 18px -apple-system,Arial";ctx.fillStyle=pops[j].c;ctx.fillText(pops[j].s,pops[j].x,pops[j].y)}
ctx.restore();hs.textContent=score+(combo>=5?"  🔥x2":"");ht.textContent=Math.ceil(left)+"s"}
function move(e){var r=cv.getBoundingClientRect();var cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left;x=Math.max(0.06,Math.min(0.94,cx/r.width))}
window.addEventListener("pointermove",move);window.addEventListener("pointerdown",move);window.addEventListener("touchmove",function(e){move(e);e.preventDefault()},{passive:false});
window.addEventListener("keydown",function(e){if(e.key==="ArrowLeft")x=Math.max(0.06,x-0.07);if(e.key==="ArrowRight")x=Math.min(0.94,x+0.07)});
window.addEventListener("message",function(e){var d=e.data||{};if(d.type==="init"){if(d.player)player=d.player;if(typeof d.best==="number")best=d.best;if(state==="menu")menu()}});
draw();menu();
</script></body></html>`;
}
