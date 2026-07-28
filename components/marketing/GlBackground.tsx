"use client";

import { useEffect, useRef } from "react";

// Animated WebGL wave background (three animated sine-noise lines), ported
// verbatim from MarketCatalystUI's landing page. Purely decorative — no
// data, no backend — isolated into its own client-only leaf component so the
// rest of the marketing page can still server-render for SEO.
export function GlBackground() {
  const glbgRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = glbgRef.current;
    if (!cv) return;
    const gl = (cv.getContext("webgl") || cv.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}`;
    const fs = `precision highp float;
    uniform vec2 res; uniform float t; uniform vec3 cA; uniform vec3 cB;
    float hash(float n){return fract(sin(n)*43758.5453);}
    float n1(float x){float i=floor(x);float f=fract(x);float u=f*f*(3.0-2.0*f);return mix(hash(i),hash(i+1.0),u);}
    float fbm(float x){return 0.5*n1(x)+0.25*n1(x*2.0+3.1)+0.125*n1(x*4.0+7.7);}
    void main(){
      vec2 uv=gl_FragCoord.xy/res.xy;
      float vig=smoothstep(1.3,0.1,length(uv-0.5));
      vec3 col=mix(vec3(0.010,0.016,0.034),vec3(0.020,0.038,0.082),vig);
      vec2 cell=fract(uv*vec2(30.0,18.0));
      float gd=min(min(cell.x,1.0-cell.x),min(cell.y,1.0-cell.y));
      float grid=smoothstep(0.026,0.0,gd);
      col+=mix(cA,cB,0.5)*grid*0.05;
      float xA=uv.x*3.2+t*0.06;
      float yA=0.40+0.14*fbm(xA*2.0)+0.04*sin(uv.x*7.0+t*0.25)+uv.x*0.10;
      float lA=smoothstep(0.014,0.0,abs(uv.y-yA));
      float areaA=clamp(yA-uv.y,0.0,1.0)*step(uv.y,yA);
      col+=cB*lA;
      col+=cB*areaA*0.05;
      float xB=uv.x*3.2-t*0.045+13.0;
      float yB=0.58+0.12*fbm(xB*2.0+5.0)-uv.x*0.05;
      float lB=smoothstep(0.012,0.0,abs(uv.y-yB));
      col+=cA*lB*0.8;
      float xC=uv.x*2.4+t*0.03+27.0;
      float yC=0.26+0.08*fbm(xC*2.0+9.0);
      col+=mix(cA,cB,0.5)*smoothstep(0.008,0.0,abs(uv.y-yC))*0.4;
      for(int i=0;i<5;i++){float fi=float(i);vec2 c=vec2(fract(hash(fi*3.1)+t*0.01*(hash(fi*2.0)-0.5)),fract(hash(fi*5.3)+t*0.008));float d=length(uv-c);float g=smoothstep(0.34,0.0,d);col+=mix(cA,cB,hash(fi*7.0))*g*0.045;}
      col=col/(col+0.82);
      gl_FragColor=vec4(col,1.0);
    }`;

    function compileShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }
    const pr = gl.createProgram()!;
    gl.attachShader(pr, compileShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr);
    gl.useProgram(pr);

    const bf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const lp = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(lp);
    gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(pr, "res");
    const uT = gl.getUniformLocation(pr, "t");
    const uA = gl.getUniformLocation(pr, "cA");
    const uB = gl.getUniformLocation(pr, "cB");
    gl.uniform3f(uA, 0.486, 0.424, 0.961);
    gl.uniform3f(uB, 0.204, 0.886, 0.941);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv!.width = Math.floor(window.innerWidth * dpr);
      cv!.height = Math.floor(window.innerHeight * dpr);
      gl!.viewport(0, 0, cv!.width, cv!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    const t0 = performance.now();
    let animId = 0;
    function frame(now: number) {
      gl!.uniform2f(uRes, cv!.width, cv!.height);
      gl!.uniform1f(uT, (now - t0) / 1000);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      animId = requestAnimationFrame(frame);
    }
    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={glbgRef} className="sp-glbg" />;
}
