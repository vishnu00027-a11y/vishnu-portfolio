(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,85676,e=>{"use strict";var t=e.i(90072),a=e.i(8560);let n=[.9,.89,.86],o=[.95,.46,.15],i=[.84,.24,.1],r=[.06,.06,.07],l=[.95,.71,.27],s=[.8,.81,.83],h=[.66,.7,.67],u=(e,t)=>e+Math.random()*(t-e),c=e=>Math.min(1,Math.max(0,e)),f=e=>Math.atan2(Math.sin(e),Math.cos(e)),d=`
  uniform vec4 uSpine[24];
  uniform float uLength;
  uniform float uZ;
  uniform vec2 uFlap;
  uniform vec4 uTail;
  uniform vec3 uTailShape;
  attribute vec3 aLocal;
  attribute vec3 aNorm;
  attribute vec2 aCoord;
  attribute float aKind;
  attribute vec3 aFin;
  varying vec3 vN;
  varying vec2 vCoord;
  varying float vKind;
  varying float vSheen;
  void main() {
    vec3 loc = aLocal;
    vSheen = 0.0;
    if (aKind > 0.5 && aKind < 1.5) {
      // The tail: a fan of rays from the root of the tail, two rounded lobes and a
      // shallow fork. It spreads or narrows (uTail.y), trails behind the body's swing
      // and curls more toward its edge (uTail.x), and a ripple runs out along the
      // rays (phase uTail.z, angle uTail.w).
      float a = aFin.x;
      float rn = aFin.y;
      float aa = abs(a);
      float reach = uTailShape.x * (0.68 + 0.4 * sin(aa * 1.95)) * sqrt(max(0.0, 1.0 - pow(aa, 8.0)));
      float r = reach * rn;
      float wave = uTail.z - rn * 5.0 + a * 1.4;
      float th = a * uTailShape.z * uTail.y + uTail.x * rn * (0.55 + 0.45 * rn) + uTail.w * rn * rn * sin(wave);
      loc.x += cos(th) * r / uLength;
      loc.y += a * uTailShape.y + sin(th) * r;
      vSheen = cos(wave) * rn;
    } else if (aKind > 1.5 && aKind < 2.5) {
      // A paired fin, sculling about its root.
      float sgn = aFin.z;
      float flap = sgn > 0.0 ? uFlap.x : uFlap.y;
      float phi = aFin.x + flap;
      float r = aFin.y * (0.86 + 0.14 * cos(flap * 2.0));
      loc.x += cos(phi) * r / uLength;
      loc.y += sgn * sin(phi) * r;
    }
    float f = clamp(loc.x, 0.0, 1.0) * 23.0;
    float fi = min(floor(f), 22.0);
    int i = int(fi);
    float t = f - fi;
    vec4 a = uSpine[i];
    vec4 b = uSpine[i + 1];
    vec2 T = normalize(mix(a.zw, b.zw, t));
    vec2 P = mix(a.xy, b.xy, t) - T * (loc.x - clamp(loc.x, 0.0, 1.0)) * uLength;
    vec2 N = vec2(-T.y, T.x);
    vN = vec3(-T * aNorm.x + N * aNorm.y, aNorm.z);
    vCoord = aCoord;
    vKind = aKind;
    gl_Position = projectionMatrix * viewMatrix * vec4(P + N * loc.y, uZ + loc.z, 1.0);
  }
`,v=`
  uniform vec3 uBase;
  uniform vec4 uPatch[6];
  uniform vec3 uPatchCol[6];
  uniform float uSeed;
  uniform float uClarity;
  uniform float uLength;
  uniform float uWidth;
  uniform float uSheen;
  uniform float uBack;
  uniform float uEye;
  uniform vec3 uTailRoot;
  varying vec3 vN;
  varying vec2 vCoord;
  varying float vKind;
  varying float vSheen;
  const vec3 WATER = vec3(0.024, 0.031, 0.043);
  const vec3 L = vec3(-0.46, 0.56, 0.69);
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
  }
  void main() {
    vec2 c = vCoord;
    if (vKind < 0.5) {
      // The coat: the base, then each patch, with ragged edges.
      vec3 col = uBase;
      col = mix(col * 0.5, col, mix(1.0, smoothstep(0.05, 0.65, abs(c.y)), uBack));
      for (int i = 0; i < 6; i++) {
        vec4 p = uPatch[i];
        if (p.z <= 0.0) continue;
        vec2 d = vec2((c.x - p.x) / p.z, (c.y - p.y) / p.w);
        float n = 0.5 * noise(c * vec2(16.0, 4.0) + uSeed + float(i) * 7.0) + 0.3 * noise(c * vec2(42.0, 10.0) + uSeed * 1.7);
        float m = smoothstep(0.06, -0.06, dot(d, d) - (0.62 + n));
        col = mix(col, uPatchCol[i], m);
      }
      // Scales: a fine net over the body, behind the head. The net is where the two
      // diagonal waves cross zero, drawn as hairlines about a pixel wide (darkening
      // the cells between them instead reads as a checkerboard, coarse on a phone).
      // Where the scales get finer than a few pixels the net fades out rather than
      // shimmer.
      float k = uLength * 0.42;
      float sa = sin(c.x * k + c.y * 7.0);
      float sb = sin(c.x * k - c.y * 7.0);
      float onA = 1.0 - smoothstep(0.0, 1.0, abs(sa) / max(fwidth(sa), 1e-4));
      float onB = 1.0 - smoothstep(0.0, 1.0, abs(sb) / max(fwidth(sb), 1e-4));
      float fine = 1.0 - smoothstep(0.35, 0.9, fwidth(c.x * k));
      col *= 1.0 - 0.1 * max(onA, onB) * fine * smoothstep(0.14, 0.24, c.x);
      // The eyes, with a glint.
      vec2 e = vec2((c.x - 0.075) * uLength, (abs(c.y) - 0.72) * uWidth);
      float eye = 1.0 - smoothstep(uWidth * uEye * 0.8, uWidth * uEye, length(e));
      col = mix(col, vec3(0.02), eye);
      vec3 n = normalize(vN);
      vec3 h = normalize(L + vec3(0.0, 0.0, 1.0));
      float dif = 0.4 + 0.6 * max(dot(n, L), 0.0);
      float spec = pow(max(dot(n, h), 0.0), 26.0) * uSheen;
      vec3 lit = col * dif + spec * vec3(1.0, 0.98, 0.95) + eye * pow(max(dot(n, h), 0.0), 60.0) * 0.8;
      lit *= 0.55 + 0.45 * n.z;
      gl_FragColor = vec4(mix(WATER, lit, uClarity), 1.0);
    } else if (vKind < 1.5) {
      // The tail: fine rays in a thin membrane, densest at the root and nearly clear
      // at the edge, which frays a little between the rays. Tinted by the body where
      // it joins, the colour running out along the rays; a sheen on the ripple.
      float rn = c.x;
      float a = c.y;
      float x = a * 9.0;
      float fw = fwidth(x);
      float dRay = abs(fract(x + 0.5) - 0.5);
      float ray = (1.0 - smoothstep(0.045, 0.045 + fw, dRay)) * (1.0 - smoothstep(0.22, 0.45, fw)) * smoothstep(90.0, 160.0, uLength);
      float fray = noise(vec2(a * 40.0, uSeed)) * 0.06 + noise(vec2(a * 110.0, uSeed * 1.3)) * 0.03;
      float limit = 1.0 - fray * 0.6 - 0.008 * (1.0 - ray);
      float ew = max(fwidth(rn) * 1.5, 0.015);
      float edge = 1.0 - smoothstep(limit - ew, limit, rn);
      float grow = smoothstep(0.0, 0.16, rn);
      float alpha = (mix(0.74, 0.36, smoothstep(0.0, 0.95, rn)) + 0.14 * ray) * grow * edge;
      float away = smoothstep(0.05, 0.75, rn);
      vec3 col = mix(uTailRoot, vec3(0.86, 0.9, 0.94), away * 0.8);
      col = mix(col, uTailRoot * 0.9 + 0.08, ray * 0.3 * (1.0 - away * 0.4));
      // The membrane folds a little between the rays: faintly lighter on one side.
      col *= 0.95 + 0.07 * sin(x * 6.2832);
      col *= 0.8 + 0.28 * (1.0 - rn);
      col += vec3(1.0, 0.98, 0.95) * pow(max(vSheen, 0.0), 3.0) * 0.4 * uSheen;
      alpha *= mix(0.6, 1.0, uClarity);
      col = mix(WATER, col, uClarity);
      gl_FragColor = vec4(col * alpha, alpha);
    } else {
      // The fins: thin and translucent, ribbed with rays.
      float t = c.x;
      float u = c.y;
      float a;
      vec3 fc = mix(uBase, vec3(0.95), 0.35);
      if (vKind < 2.5) {
        a = 0.46 * (0.72 + 0.28 * sin(u * 22.0)) * (1.0 - smoothstep(0.8, 1.0, t)) * (1.0 - smoothstep(0.8, 1.0, abs(u)));
      } else {
        // The dorsal fin, seen edge on along the back.
        fc *= 0.55;
        a = 0.6 * (1.0 - smoothstep(0.5, 1.0, abs(u))) * smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.85, 1.0, t));
      }
      a *= mix(0.6, 1.0, uClarity);
      vec3 col = mix(WATER, fc * 0.85, uClarity);
      gl_FragColor = vec4(col * a, a);
    }
  }
`,p=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,m=`
  uniform sampler2D tPrev;
  uniform vec2 uTexel;
  uniform vec2 uSize;
  uniform vec4 uDrops[24];
  uniform int uCount;
  varying vec2 vUv;
  void main() {
    vec4 info = texture2D(tPrev, vUv);
    vec2 px = vUv * uSize;
    for (int i = 0; i < 24; i++) {
      if (i >= uCount) break;
      vec4 d = uDrops[i];
      float k = max(0.0, 1.0 - length(px - d.xy) / d.z);
      info.r += (0.5 - cos(k * 3.14159) * 0.5) * d.w;
    }
    float avg = (
      texture2D(tPrev, vUv - vec2(uTexel.x, 0.0)).r +
      texture2D(tPrev, vUv + vec2(uTexel.x, 0.0)).r +
      texture2D(tPrev, vUv - vec2(0.0, uTexel.y)).r +
      texture2D(tPrev, vUv + vec2(0.0, uTexel.y)).r
    ) * 0.25;
    info.g += (avg - info.r) * 2.0;
    info.g *= 0.994;
    info.r += info.g;
    info.r *= 0.999;
    gl_FragColor = info;
  }
`,x=`
  uniform sampler2D tFish;
  uniform sampler2D tWater;
  uniform vec2 uRes;
  uniform vec2 uTexel;
  uniform float uDpr;
  uniform float uColumn;
  varying vec2 vUv;
  const vec3 BG = vec3(6.0, 8.0, 11.0) / 255.0;
  const vec3 DOT = vec3(18.0, 20.0, 24.0) / 255.0;
  void main() {
    vec2 px = vec2(vUv.x * uRes.x, (1.0 - vUv.y) * uRes.y);
    float h = texture2D(tWater, vUv).r;
    float hl = texture2D(tWater, vUv - vec2(uTexel.x, 0.0)).r;
    float hr = texture2D(tWater, vUv + vec2(uTexel.x, 0.0)).r;
    float hd = texture2D(tWater, vUv - vec2(0.0, uTexel.y)).r;
    float hu = texture2D(tWater, vUv + vec2(0.0, uTexel.y)).r;
    vec2 g = vec2(hr - hl, hu - hd);
    vec2 off = g * 18.0;
    // The page's dot grid on the pond floor, bent by the surface.
    vec2 q = px + vec2(off.x, -off.y) * 0.7;
    vec2 m = mod(q, 16.0) - 8.0;
    float aa = 0.6 / uDpr;
    vec3 col = mix(BG, DOT, 1.0 - smoothstep(1.0 - aa, 1.0 + aa, length(m)));
    // The fish, bent the same way; light gathers under the crests.
    vec4 fish = texture2D(tFish, vUv + off / uRes);
    float lap = hl + hr + hu + hd - 4.0 * h;
    fish.rgb *= 1.0 + clamp(-lap * 6.0, -0.15, 0.4);
    // Deeper under the reading column, so the words stay clear.
    float colm = 1.0 - smoothstep(uColumn, uColumn + 170.0, abs(px.x - uRes.x * 0.5));
    fish *= 1.0 - 0.48 * colm;
    col = col * (1.0 - fish.a) + fish.rgb;
    // The surface: light on the slopes facing it, shade on the others.
    float band = dot(g, vec2(-0.55, 0.835));
    col += vec3(0.6, 0.66, 0.75) * clamp(band * 0.9, 0.0, 0.16);
    col *= 1.0 - clamp(-band * 0.7, 0.0, 0.22);
    gl_FragColor = vec4(col, 1.0);
  }
`;function g(e){if(e<0)return 0;if(e<.16){let t=(.16-e)/.16;return .9*Math.sqrt(Math.max(0,1-t*t))}return e<.32?.9+.1*Math.sin((e-.16)/.16*(Math.PI/2)):Math.max(.02,1-.86*Math.pow((e-.32)/.54,1.7))}class M{local=[];norm=[];coord=[];kind=[];fin=[];index=[];v(e,t,a,n,o=[0,0,0]){return this.local.push(...e),this.norm.push(...t),this.coord.push(...a),this.kind.push(n),this.fin.push(...o),this.kind.length-1}build(){let e=new t.ld;return e.setAttribute("position",new t.ki(this.local,3)),e.setAttribute("aLocal",new t.ki(this.local,3)),e.setAttribute("aNorm",new t.ki(this.norm,3)),e.setAttribute("aCoord",new t.ki(this.coord,2)),e.setAttribute("aKind",new t.ki(this.kind,1)),e.setAttribute("aFin",new t.ki(this.fin,3)),e.setIndex(this.index),e}}let y={koi:.3,fry:.25};function b(e,t,a,n,o,i,r){for(let n of[-1,1]){let l=[t,n*a*g(t)*.82,-2],s=e.v(l,[0,0,1],[0,0],2,[0,0,n]),h=[];for(let t=0;t<=10;t++){let a=t/10,s=i+(r-i)*a,u=o*(.55+.45*Math.sin(Math.PI*Math.min(1,1.15*a)));h.push(e.v(l,[0,0,1],[1,2*a-1],2,[s,u,n]))}let u=[];for(let t=0;t<=10;t++){let a=t/10,s=i+(r-i)*a,h=.5*o*(.55+.45*Math.sin(Math.PI*Math.min(1,1.15*a)));u.push(e.v(l,[0,0,1],[.5,2*a-1],2,[s,h,n]))}for(let t=0;t<10;t++)e.index.push(s,u[t],u[t+1]),e.index.push(u[t],h[t],u[t+1],u[t+1],h[t],h[t+1])}}let w={koi:{turn:1.1,meander:1,vb:[24,40],glide:[1.6,3.4],stroke:[1.8,4],burst:7,react:1600,R:360,amp:.045,beat:.45,beatK:1/75,edge:.35,band:260,bend:.4},fry:{turn:3.4,meander:2.4,vb:[42,64],glide:[.3,1],stroke:[.4,1.3],burst:6,react:3200,R:440,amp:.075,beat:1.4,beatK:1/28,edge:.15,band:130,bend:.6}};e.s(["canRunPond",0,function(){try{return!!document.createElement("canvas").getContext("webgl2")}catch{return!1}},"mountPond",0,function(e){let T=document.documentElement,k=matchMedia("(prefers-reduced-motion: reduce)").matches,S=new a.T({canvas:e,antialias:!1,alpha:!1,powerPreference:"low-power"});S.autoClear=!1;let L=Math.min(devicePixelRatio||1,2);S.setPixelRatio(L);let C=innerWidth,P=innerHeight,E=new t.P6,R=new t.Sc(0,C,0,-P,1,5e3);R.position.z=2500;let F=new t.qL(1,1,{samples:4}),W=new t.Sc(-1,1,1,-1,0,1),A=new t.CQ(2,2),D={type:t.HN,format:t.W1,minFilter:t.VV,magFilter:t.VV,depthBuffer:!1},z=new t.qL(1,1,D),U=new t.qL(1,1,D),K=new t.Zg({vertexShader:p,fragmentShader:m,uniforms:{tPrev:{value:null},uTexel:{value:new t.wq},uSize:{value:new t.wq},uDrops:{value:Array.from({length:24},()=>new t.$h)},uCount:{value:0}},depthTest:!1,depthWrite:!1}),q=new t.P6;q.add(new t.kE(A,K));let N=new t.Zg({vertexShader:p,fragmentShader:x,uniforms:{tFish:{value:F.texture},tWater:{value:z.texture},uRes:{value:new t.wq},uTexel:{value:new t.wq},uDpr:{value:L},uColumn:{value:280}},depthTest:!1,depthWrite:!1}),B=new t.P6;function I(){C=innerWidth,P=innerHeight,L=Math.min(devicePixelRatio||1,2),S.setPixelRatio(L),S.setSize(C,P,!1),R.right=C,R.bottom=-P,R.updateProjectionMatrix(),F.setSize(Math.round(C*L),Math.round(P*L));let e=Math.ceil(C/3),a=Math.ceil(P/3);for(let n of(z.dispose(),U.dispose(),z=new t.qL(e,a,D),U=new t.qL(e,a,D),[z,U]))S.setRenderTarget(n),S.setClearColor(0,0),S.clear();S.setRenderTarget(null),K.uniforms.uTexel.value.set(1/e,1/a),K.uniforms.uSize.value.set(C,P),N.uniforms.uTexel.value.set(1/e,1/a),N.uniforms.uRes.value.set(C,P),N.uniforms.uDpr.value=L,N.uniforms.uColumn.value=Math.min(560,C-32)/2}B.add(new t.kE(A,N));let V=[],Z=[],X=[],Y={x:0,y:0,a:u(0,6.28),w:[u(0,6.28),u(0,6.28)]};function O(e,a,c,f,p){let m,x,T,k=w[e],S="koi"===e?Math.random():1,L="koi"===e?u(188,272)*p*(.86+.2*S):u(20,29)*Math.max(.8,p),C=L*("koi"===e?.145:.12),P=C*("koi"===e?.85:.8),R="koi"===e?(m=[],x=(e,t,a,n,o,i)=>{for(let r=0;r<e&&m.length<6;r++)m.push({s:u(a,n),a:u(-.4,.4),rs:u(...o),ra:u(...i),c:t})},(T=Math.random())<.3?(x(Math.round(u(2,4)),.6>Math.random()?i:o,.06,.72,[.07,.14],[.6,1.4]),{base:n,patches:m,sheen:.32}):T<.42?(m.push({s:.1,a:0,rs:.055,ra:.45,c:i}),{base:n,patches:m,sheen:.32}):T<.62?(x(Math.round(u(2,3)),o,.08,.7,[.07,.13],[.6,1.3]),x(Math.round(u(2,3)),r,.22,.78,[.025,.05],[.25,.45]),{base:n,patches:m,sheen:.32}):T<.76?(x(Math.round(u(0,2)),n,.3,.75,[.05,.1],[.4,.9]),{base:o,patches:m,sheen:.38}):T<.86?{base:l,patches:m,sheen:.6}:T<.94?(x(2,n,.1,.7,[.07,.12],[.6,1.2]),x(2,i,.05,.6,[.05,.1],[.5,1]),{base:r,patches:m,sheen:.45}):{base:s,patches:m,sheen:.7}):{base:h,patches:[],sheen:.75},F=(function(e,t,a,n,o){let i=new M;for(let r=0;r<=n;r++){let l=.86*(1-Math.cos(r/n*(Math.PI/2)))**.85,s=Math.max(.3,t*g(l)),h=Math.max(.3,a*g(l)),u=(g(l+.004)-g(l-.004))/.008*(t/e);for(let e=0;e<=o;e++){let t=Math.PI*e/o,a=Math.cos(t)*h,n=Math.sin(t)*s,r=Math.hypot(a,n)||1,c=[-(.8*u),a/r,n/r],f=Math.hypot(...c);i.v([l,Math.cos(t)*s,Math.sin(t)*h],[c[0]/f,c[1]/f,c[2]/f],[l,Math.cos(t)],0)}}for(let e=0;e<n;e++)for(let t=0;t<o;t++){let a=e*(o+1)+t,n=a+o+1;i.index.push(a,n,a+1,a+1,n,n+1)}return i})(L,C,P,"koi"===e?40:16,"koi"===e?16:8).build(),W=new M;!function(e){let t=e.kind.length;for(let t=0;t<=28;t++){let a=t/28*2-1;for(let t=0;t<=16;t++){let n=t/16;e.v([.8,0,-1],[0,0,1],[n,a],1,[a,n,0])}}for(let a=0;a<28;a++)for(let n=0;n<16;n++){let o=t+17*a+n,i=o+16+1;e.index.push(o,i,o+1,o+1,i,i+1)}}(W),"koi"===e?(b(W,.22,C,P,.15*L,.32,1.25),b(W,.5,C,P,.075*L,.25,.85),function(e,t,a){let n=e.kind.length;for(let n=0;n<=12;n++){let o=n/12,i=.3+.36*o;for(let n of[-1,1])e.v([i,n*t*.07,a*g(i)+1.2],[0,0,1],[o,n],3)}for(let t=0;t<12;t++){let a=n+2*t;e.index.push(a,a+2,a+1,a+1,a+2,a+3)}}(W,C,P)):b(W,.24,C,P,.1*L,.4,1.1);let A=Array.from({length:6},(e,a)=>{let n=R.patches[a];return n?new t.$h(n.s,n.a,n.rs,n.ra):new t.$h(0,0,0,0)}),D=Array.from({length:6},(e,a)=>new t.cE(...R.patches[a]?.c??n)),z={uSpine:{value:Array.from({length:24},()=>new t.$h)},uLength:{value:L},uWidth:{value:C},uZ:{value:0},uFlap:{value:new t.wq},uBase:{value:new t.cE(...R.base)},uPatch:{value:A},uPatchCol:{value:D},uSeed:{value:u(0,100)},uClarity:{value:"koi"===e?.5+.38*S:u(.62,.8)},uSheen:{value:R.sheen},uBack:{value:+("fry"===e)},uEye:{value:"fry"===e?.2:.12},uTail:{value:new t.$h(0,1,u(0,6.28),.05)},uTailShape:{value:new t.cE(L*y[e],C*g(.8)*.9,.6)},uTailRoot:{value:new t.cE(...R.patches.find(e=>Math.abs(e.s-.76)<1.4*e.rs)?.c??R.base)}},U=new t.kE(F,new t.Zg({vertexShader:d,fragmentShader:v,uniforms:z})),K=new t.kE(W.build(),new t.Zg({vertexShader:d,fragmentShader:v,uniforms:z,transparent:!0,depthWrite:!1,side:t.Vs,blending:t.UM,blendSrc:t.Vt,blendDst:t.oL}));for(let e of[U,K])e.frustumCulled=!1,E.add(e);let q=L/23,N=new Float32Array(48);for(let e=0;e<24;e++)N[2*e]=a-Math.cos(f)*q*e,N[2*e+1]=c-Math.sin(f)*q*e;let B=u(k.vb[0],k.vb[1])*(.8+.2*p),I=k.meander;return{kind:e,L,W:C,depth:S,seg:q,p:N,a:f,v:B,vb:B,beat:u(0,6.28),amp:k.amp,flap:u(0,6.28),wander:[u(.05,.09)*I,u(0,6.28),u(.13,.2)*I,u(0,6.28),u(.27,.4)*I,u(0,6.28)],gliding:!1,rhythm:u(.5,2),startle:0,boost:.2,flee:0,pending:null,travel:0,tail:{bend:0,bendV:0,spread:1,phase:u(0,6.28),lat:0/0},uniforms:z,meshes:[U,K]}}let _=0,j={x:-1e4,y:-1e4,still:0,mouse:!1},$=[],H=[],G=(e,t,a,n)=>{$.length<96&&$.push(e,t,a,n)};function Q(e,t){let a=w[e.kind],n=e.p[0],o=e.p[1];e.pending&&_>=e.pending.at&&(e.flee=e.pending.dir,e.startle=Math.max(e.startle,e.pending.strength),e.boost=Math.max(e.boost,e.pending.strength),e.gliding=!1,e.rhythm=u(1,2),e.pending=null);let i=Math.cos(e.a),r=Math.sin(e.a),l=-e.L*a.edge,s=e=>{let t=c((a.band-e)/a.band);return t*t*2.4};if(i+=s(n-l)-s(C-l-n),r+=s(o-l)-s(P-l-o),"koi"===e.kind){for(let t of Z){if(t===e)continue;let a=.35+.65*(1-Math.abs(t.depth-e.depth)),l=3.6*Math.max(e.W,t.W);for(let e=0;e<24;e+=3){let s=n-t.p[2*e],h=o-t.p[2*e+1],u=Math.hypot(s,h);if(u>1&&u<l){let e=(1-u/l)**2*2.4*a;i+=s/u*e,r+=h/u*e}}}if(j.mouse&&j.still>1.2&&e.startle<.05){let t=j.x-n,a=j.y-o,l=Math.hypot(t,a);if(l<440&&l>.2*e.L){let e=.55*(1-l/440)*c((j.still-1.2)/1.5);i+=t/l*e,r+=a/l*e}}}else{let t=0,a=0,l=0,s=0,h=0;for(let u of X){if(u===e)continue;let c=u.p[0]-n,f=u.p[1]-o,d=Math.hypot(c,f);!(d>150)&&(t+=c,a+=f,l+=Math.cos(u.a),s+=Math.sin(u.a),h++,d<24&&d>.01&&(i-=c/d*((24-d)/24)*3,r-=f/d*((24-d)/24)*3))}h&&(i+=t/h/150*1.4+l/h*.9,r+=a/h/150*1.4+s/h*.9);let u=Y.x-n,c=Y.y-o,f=Math.hypot(u,c)||1;for(let e of(i+=u/f*.45,r+=c/f*.45,Z))for(let t=0;t<24;t+=3){let a=n-e.p[2*t],l=o-e.p[2*t+1],s=Math.hypot(a,l),h=2.4*e.W;s>.01&&s<h&&(i+=a/s*(1-s/h)*3,r+=l/s*(1-s/h)*3)}}e.startle>.02&&(i+=7*Math.cos(e.flee)*e.startle,r+=7*Math.sin(e.flee)*e.startle);let h=e.wander,d=.42*Math.sin(_*h[0]*6.28+h[1])+.26*Math.sin(_*h[2]*6.28+h[3])+.12*Math.sin(_*h[4]*6.28+h[5]),v=a.turn+9*e.startle,p=d*("fry"===e.kind?1.4:1)*(1-e.startle)+f(Math.atan2(r,i)-e.a)*(1.6+6*e.startle);p=Math.max(-v,Math.min(v,p)),e.a=f(e.a+p*t),e.rhythm-=t,e.rhythm<=0&&(e.gliding=!e.gliding,e.rhythm=e.gliding?u(a.glide[0],a.glide[1]):u(a.stroke[0],a.stroke[1]));let m=e.vb*((e.gliding?.55:1.15)+a.burst*e.boost);e.v+=(m-e.v)*(1-Math.exp(-t/(m>e.v?e.boost>.1?.07:.28:1.5)));let x=e.gliding&&e.boost<.05?.3*a.amp:a.amp+.07*e.boost;e.amp+=(x-e.amp)*(1-Math.exp(-t/.4)),e.beat+=6.28*t*(a.beat+Math.min(e.v,260)*a.beatK),e.flap+=6.28*t*(e.gliding?.35:.6)*("fry"===e.kind?2:1),e.startle*=Math.exp(-t/.9),e.boost*=Math.exp(-t/.75);let g=e.v*t;e.p[0]=n+Math.cos(e.a)*g,e.p[1]=o+Math.sin(e.a)*g;let M=e.a;for(let t=1;t<24;t++){let n=e.p[(t-1)*2]-e.p[2*t],o=Math.atan2(e.p[(t-1)*2+1]-e.p[2*t+1],n),i=f(o-M);i>a.bend?o=M+a.bend:i<-a.bend&&(o=M-a.bend),e.p[2*t]=e.p[(t-1)*2]-Math.cos(o)*e.seg,e.p[2*t+1]=e.p[(t-1)*2+1]-Math.sin(o)*e.seg,M=o}"koi"===e.kind&&e.depth>.45&&(e.travel+=g,e.travel>22&&(e.travel=0,G(n-Math.cos(e.a)*e.L*.1,o-Math.sin(e.a)*e.L*.1,.5*e.W,.012*(e.depth-.3)*Math.min(3,e.v/e.vb))))}function J(e,t,a){for(let n of V){let o=w[n.kind],i=1/0,r=0,l=0;for(let a=0;a<24;a+=2){let o=n.p[2*a],s=n.p[2*a+1],h=Math.hypot(o-e,s-t);h<i&&([i,r,l]=[h,o,s])}let s=o.R*a;if(i>1.8*s)continue;let h=(i<s?.55+.45*(1-i/s):.3*(1-(i-s)/(.8*s)))*Math.min(1,a+.2),c=Math.atan2(n.p[1]-t+(n.p[1]-l)*.5,n.p[0]-e+(n.p[0]-r)*.5);c+=u(-.35,.35),(!n.pending||n.pending.strength<h)&&(n.pending={at:_+.03+i/o.react+u(0,.05),dir:c,strength:h})}let n=Math.atan2(Y.y-t,Y.x-e);Y.x=Math.min(.85*C,Math.max(.15*C,e+380*Math.cos(n))),Y.y=Math.min(.85*P,Math.max(.15*P,t+380*Math.sin(n)))}let ee=u(1.5,3.5),et=u(6,11),ea=new Float32Array(48);function en(e=0){for(let t of V)!function(e,t){for(let t=0;t<24;t++){let a=Math.min(t,22),n=e.p[2*a]-e.p[(a+1)*2],o=e.p[2*a+1]-e.p[(a+1)*2+1],i=Math.hypot(n,o)||1,r=t/23,l=e.L*e.amp*(Math.pow(r,1.6)*Math.sin(e.beat-5*r)-.12*(1-r)*Math.sin(e.beat));ea[2*t]=e.p[2*t]-o/i*l,ea[2*t+1]=e.p[2*t+1]+n/i*l}let a=e.uniforms.uSpine.value;for(let e=0;e<24;e++){let t=Math.max(0,e-1),n=Math.min(23,e+1),o=ea[2*t]-ea[2*n],i=ea[2*t+1]-ea[2*n+1],r=Math.hypot(o,i)||1;a[e].set(ea[2*e],-ea[2*e+1],o/r,-i/r)}e.uniforms.uFlap.value.set(.3*Math.sin(e.flap),.3*Math.sin(e.flap+Math.PI));let n=e.tail,o=a[Math.round(.8*23)],i=a[23],r=-((i.x-o.x)*o.w)+(i.y-o.y)*o.z;if(t>0&&!Number.isNaN(n.lat)){let a=e.L*y[e.kind],o=Math.max(-.7,Math.min(.7,-.28*(r-n.lat)/t/a));n.bendV+=(70*(o-n.bend)-7*n.bendV)*t,n.bend+=n.bendV*t;let i=e.v/e.vb,l=e.boost>.15?.78:e.gliding?1.08:1;n.spread+=(l-n.spread)*(1-Math.exp(-t/.35)),n.phase+=6.283*t*(1.1+.5*Math.min(i,4))}n.lat=r;let l=.04+.03*Math.min(1,e.v/e.vb)+.05*e.boost;e.uniforms.uTail.value.set(n.bend,n.spread,n.phase,l)}(t,e);S.setRenderTarget(F),S.setClearColor(0,0),S.clear(),S.render(E,R),S.setRenderTarget(null),N.uniforms.tWater.value=z.texture,S.render(B,W)}let eo=0,ei=0,er=()=>"on"!==T.dataset.intro&&!document.hidden,el=()=>er()&&"open"!==T.dataset.project;function es(e){let t,a,n,o;if((!el()||void 0!==T.dataset.sliding)&&ei&&e-ei<30){eo=er()?requestAnimationFrame(es):0;return}let i=ei?Math.min((e-ei)/1e3,1/30):1/60;for(let r of(ei=e,_+=i,j.mouse&&el()&&(j.still+=i),Y.a+=i*(.5*Math.sin(.21*_+Y.w[0])+.3*Math.sin(.53*_+Y.w[1])),t=.15*C,a=.15*P,n=Math.cos(Y.a),o=Math.sin(Y.a),Y.x<t&&(n+=1.5),Y.x>C-t&&(n-=1.5),Y.y<a&&(o+=1.5),Y.y>P-a&&(o-=1.5),Y.a=Math.atan2(o,n),Y.x+=46*Math.cos(Y.a)*i,Y.y+=46*Math.sin(Y.a)*i,V))Q(r,i);if((ee-=i)<=0&&X.length){ee=u(1.2,4);let e=X[Math.random()*X.length|0];G(e.p[0],e.p[1],4,.22)}if((et-=i)<=0&&Z.length){et=u(7,14);let e=[...Z].sort((e,t)=>t.depth-e.depth)[Math.random()*Math.min(2,Z.length)|0],t=e.p[0]+4*Math.cos(e.a),a=e.p[1]+4*Math.sin(e.a);G(t,a,8,.35),H.push({at:_+.35,x:t,y:a,r:7,s:.25})}for(let e=H.length-1;e>=0;e--){let t=H[e];_>=t.at&&(G(t.x,t.y,t.r,t.s),H.splice(e,1))}!function(e){let t=K.uniforms.uDrops.value,a=Math.min(24,$.length/4);for(let e=0;e<a;e++)t[e].set($[4*e],P-$[4*e+1],$[4*e+2],$[4*e+3]);$.length=0;for(let t=0;t<e;t++)K.uniforms.uCount.value=0===t?a:0,K.uniforms.tPrev.value=z.texture,S.setRenderTarget(U),S.render(q,W),[z,U]=[U,z]}(Math.max(1,Math.min(4,Math.round(120*i)))),en(i),eo=er()?requestAnimationFrame(es):0}function eh(){!k&&!eo&&er()&&(ei=0,eo=requestAnimationFrame(es))}let eu=!1,ec=0,ef=0,ed=e=>{k||!el()||e.target instanceof Element&&e.target.closest("a, button, [role='slider'], [data-card], .contact, .rs")||(eu=!0,ec=e.clientX,ef=e.clientY,function(e,t){G(e,t,20,.85);let a=u(0,6.28);for(let n=0;n<6;n++){let o=a+n/6*6.28+u(-.3,.3),i=u(28,64);H.push({at:_+u(.12,.32),x:e+Math.cos(o)*i,y:t+Math.sin(o)*i,r:u(4,6),s:u(.18,.3)})}H.push({at:_+.42,x:e,y:t,r:9,s:.4}),J(e,t,1)}(e.clientX,e.clientY))},ev=e=>{j.mouse="mouse"===e.pointerType,Math.hypot(e.clientX-j.x,e.clientY-j.y)>3&&(j.still=0),j.x=e.clientX,j.y=e.clientY,!eu||k||!el()||Math.hypot(e.clientX-ec,e.clientY-ef)>14&&(G(e.clientX,e.clientY,9,.28),J(e.clientX,e.clientY,.45),ec=e.clientX,ef=e.clientY)},ep=()=>eu=!1,em=()=>j.mouse=!1,ex=0,eg=()=>{clearTimeout(ex),ex=window.setTimeout(()=>{I(),k&&en()},120)},eM=t=>{t.preventDefault(),cancelAnimationFrame(eo),eo=0,e.removeAttribute("data-ready")};if(I(),!function(e){let t=Math.min(1,Math.max(.62,Math.min(C,1.4*P)/1150)),a=Math.round(Math.min(6,Math.max(3,C*P/26e4))),n=4*Math.random()|0,o=(e,t,a)=>[0===e?-a:1===e?C+a:(.1+.8*t)*C,2===e?-a:3===e?P+a:(.15+.7*t)*P];for(let i=0;i<a;i++){let[r,l]=e?[u(.1,.9)*C,u(.15,.85)*P]:o((n+i)%4,(i+u(.2,.8))/a,u(0,90)+30*i),s=e?u(-Math.PI,Math.PI):Math.atan2(P*u(.3,.7)-l,C*u(.3,.7)-r),h=O("koi",r,l,s,t);Z.push(h)}[...Z].sort((e,t)=>e.depth-t.depth).forEach((e,t)=>{e.uniforms.uZ.value=100+140*t,e.meshes.forEach(a=>a.renderOrder=2*t+ +(a===e.meshes[1]))});let i=C<700?9:15,[r,l]=e?[.7*C,.3*P]:o((n+2)%4,u(.3,.7),60);Y.x=C*u(.3,.7),Y.y=P*u(.3,.7);let s=Math.atan2(Y.y-l,Y.x-r);for(let e=0;e<i;e++){let a=O("fry",r+u(-70,70),l+u(-70,70),s+u(-.3,.3),t);a.uniforms.uZ.value=1220+10*e,a.meshes.forEach(t=>t.renderOrder=100+2*e+ +(t===a.meshes[1])),X.push(a)}V.push(...Z,...X)}(k),k){for(let e=0;e<40;e++)for(let e of V)Q(e,1/30);for(let e of V)e.amp=.4*w[e.kind].amp;en()}e.dataset.ready="";let ey=new MutationObserver(eh);return ey.observe(T,{attributes:!0,attributeFilter:["data-intro","data-project"]}),document.addEventListener("visibilitychange",eh),addEventListener("pointerdown",ed,{passive:!0,capture:!0}),addEventListener("pointermove",ev,{passive:!0}),addEventListener("pointerup",ep,{passive:!0}),addEventListener("pointercancel",ep,{passive:!0}),T.addEventListener("pointerleave",em),addEventListener("resize",eg),e.addEventListener("webglcontextlost",eM),eh(),()=>{for(let t of(cancelAnimationFrame(eo),ey.disconnect(),document.removeEventListener("visibilitychange",eh),removeEventListener("pointerdown",ed,{capture:!0}),removeEventListener("pointermove",ev),removeEventListener("pointerup",ep),removeEventListener("pointercancel",ep),T.removeEventListener("pointerleave",em),removeEventListener("resize",eg),e.removeEventListener("webglcontextlost",eM),V))for(let e of t.meshes)e.geometry.dispose(),e.material.dispose();A.dispose(),K.dispose(),N.dispose(),F.dispose(),z.dispose(),U.dispose(),S.dispose()}}])}]);