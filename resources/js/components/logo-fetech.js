/* LogoFetech — logo FETECH animado (layout 10 do design system Botânica Aquarela).
   Uso: var logo = LogoFetech.criar(elemento, { loop: true, pausa: 9 });
        logo.tocar()  inicia (em loop, se loop: true)   logo.parar()  para e mostra o logo original
        logo.final()  mostra o logo original parado     logo.em(seg)  mostra um instante (para testes)
   As letras ficam paradas o tempo todo. O casal entra correndo pela direita; o rapaz se ajoelha e oferece as mãos
   como degrau; a moça se pendura no braço do F, sobe, anda até a ponta e se senta com as pernas para fora;
   ele se levanta, volta correndo e empurra o H. No fim, um desfoque suave leva ao logo original (SVG intacto).
   Cores: as letras e os bonecos usam `fill` herdado (defina `color`/`fill` no CSS); o contornozinho dos bonecos
   usa a variável CSS --fx-fundo (a cor de fundo do rodapé). Com prefers-reduced-motion, mostra só o logo original. */
(function () {
  var P = ["M112 528 c-6 -8 -7 -19 -3 -26 14 -23 -6 -134 -27 -151 -11 -9 -23 -34 -27 -59 -4 -26 -15 -48 -28 -58 -17 -13 -18 -15 -4 -10 10 3 20 6 22 6 2 0 9 17 17 38 12 34 13 27 18 -113 4 -124 8 -150 20 -150 12 0 16 18 18 88 l3 87 59 0 c53 0 60 2 60 20 0 18 -7 20 -60 20 l-60 0 0 35 0 35 80 0 c73 0 80 2 80 20 0 18 -7 20 -62 20 l-63 0 0 38 c1 20 4 44 8 53 5 9 7 38 5 65 -2 41 -6 49 -24 52 -11 2 -26 -3 -32 -10z", "M380 165 l0 -166 97 3 c84 3 98 6 101 21 3 15 -6 17 -77 17 l-81 0 0 55 0 55 40 0 c29 0 40 4 40 15 0 11 -11 15 -40 15 l-40 0 0 55 0 55 81 0 c71 0 80 2 77 18 -3 14 -17 17 -101 20 l-97 3 0 -166z", "M682 293 c3 -41 26 -57 35 -24 3 12 13 21 24 21 17 0 19 -11 21 -142 3 -119 5 -143 18 -143 13 0 15 24 18 143 2 136 3 142 23 142 13 0 23 -8 26 -20 9 -32 28 -17 31 23 l3 37 -101 0 -101 0 3 -37z", "M980 165 l0 -165 100 0 c93 0 100 1 100 20 0 18 -7 20 -80 20 l-80 0 0 55 0 55 40 0 c29 0 40 4 40 15 0 11 -11 15 -40 15 l-40 0 0 55 0 55 80 0 c73 0 80 2 80 20 0 19 -7 20 -100 20 l-100 0 0 -165z", "M1359 320 c-9 -5 -30 -41 -49 -80 l-32 -72 28 -70 c15 -38 37 -76 48 -84 11 -8 44 -14 73 -14 46 0 53 3 53 19 0 17 -8 20 -52 23 -52 3 -53 4 -80 53 -15 28 -28 59 -28 70 0 11 13 43 28 70 27 49 28 50 80 53 44 3 52 6 52 23 0 16 -7 19 -52 19 -29 0 -60 -5 -69 -10z", "M1585 318 c-3 -8 -4 -81 -3 -163 3 -125 5 -150 18 -150 11 0 16 17 20 70 l5 70 60 0 60 0 3 -73 c2 -55 6 -72 17 -72 13 0 15 27 15 165 0 138 -2 165 -15 165 -11 0 -15 -17 -17 -72 l-3 -73 -62 -3 -62 -3 -3 72 c-2 47 -7 74 -15 77 -7 2 -15 -3 -18 -10z", "M1822 299 c-11 -17 -11 -23 -2 -29 16 -10 4 -47 -18 -54 -9 -3 -5 -4 10 -2 15 2 25 -1 22 -6 -3 -4 4 -23 15 -42 11 -18 18 -36 14 -39 -3 -4 0 -7 9 -7 8 0 38 -26 66 -57 54 -60 70 -61 27 -2 -13 19 -33 50 -44 70 -11 19 -27 41 -35 48 -9 8 -16 21 -16 30 0 9 -6 23 -12 29 -10 10 -10 15 0 21 18 11 11 55 -8 59 -8 1 -21 -7 -28 -19z", "M1831 127 c-8 -10 -7 -26 5 -62 14 -40 14 -49 3 -56 -16 -10 -8 -12 14 -3 11 4 12 14 6 49 -4 24 -6 53 -4 64 4 24 -7 27 -24 8z"];   // 8 caminhos do SVG original: [0] moça+F, [1..5] E T E C H, [6..7] rapaz
  var F_LIMPO = 'M9.6,22 L25.8,22 C27.6,22.1 28.3,23.6 27.9,24.4 C27.6,25.4 26.6,25.9 24.6,25.95 L12.3,26 L12,26.8 L12,32.4 L12.6,33 L22.6,33.2 C24,33.4 24.4,35.6 23.3,36.6 C22.8,36.95 22.4,37 21.5,37 L12.1,37.1 L11.9,42.7 L11.6,50.5 C11.4,52.8 11,54.1 10.1,54.5 C9.3,54.4 8.8,53 8.6,50.6 L8,40.5 L7.7,30 C7.6,27 7.8,22.3 9.6,22 Z';
  var NS = 'http://www.w3.org/2000/svg', D2R = Math.PI / 180, cont = 0;
  function el(tag, at, pai) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (pai) pai.appendChild(e); return e; }
  function rot(x, y, a) { a *= D2R; return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerp2(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }
  function cl(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function eio(t) { t = cl(t); return t * t * t * (t * (t * 6 - 15) + 10); }   // smootherstep: começa e termina parado
  function fase(t, a) { return eio((t - a[0]) / (a[1] - a[0])); }
  function mix(p, q, t) { var r = {}; for (var k in p) r[k] = lerp(p[k], q[k] == null ? p[k] : q[k], t); return r; }
  function copia(p) { return mix(p, {}, 0); }
  // curva suave por quadros-chave (Hermite): passa por todos os pontos sem trancos; aceita número ou [x, y]
  function curva(K, t) {
    var n = K.length, i = 0;
    if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
    while (t > K[i + 1][0]) i++;
    var t0 = K[i][0], t1 = K[i + 1][0], h = t1 - t0, u = (t - t0) / h;
    var a = 2 * u * u * u - 3 * u * u + 1, b = u * u * u - 2 * u * u + u, c = -2 * u * u * u + 3 * u * u, d = u * u * u - u * u;
    function tg(j, e) { if (j <= 0 || j >= n - 1) return 0; var p = K[j - 1][1], q = K[j + 1][1]; return ((e == null ? q : q[e]) - (e == null ? p : p[e])) / (K[j + 1][0] - K[j - 1][0]); }
    function v(e) { var p = K[i][1], q = K[i + 1][1]; p = e == null ? p : p[e]; q = e == null ? q : q[e]; return a * p + b * h * tg(i, e) + c * q + d * h * tg(i + 1, e); }
    return typeof K[0][1] === 'number' ? v() : [v(0), v(1)];
  }
  // perfil de velocidade trapezoidal: acelera em ua, corre, desacelera em ud (sem tranco)
  function viagem(t, t0, t1, x0, x1, ua, ud) {
    var u = cl((t - t0) / (t1 - t0)), vm = 1 / (1 - ua / 2 - ud / 2), f, v;
    if (ua > 0 && u < ua) { f = vm * u * u / (2 * ua); v = u / ua; }
    else if (u <= 1 - ud) { f = vm * (ua / 2 + (u - ua)); v = 1; }
    else { var r = 1 - u; f = 1 - vm * r * r / (2 * ud); v = r / ud; }
    if (t <= t0) v = ua > 0 ? 0 : 1; if (t >= t1) v = 0;
    v = v * v * (3 - 2 * v);                                    // amplitude do passo entra e sai suave
    return { x: lerp(x0, x1, f), amp: v };
  }
  function ik(L1, L2, dx, dy, sinal) {   // ângulos (graus) de um membro de 2 segmentos até (dx, dy)
    var D = Math.hypot(dx, dy); D = Math.max(Math.abs(L1 - L2) + 0.01, Math.min(L1 + L2 - 0.001, D));
    var phi = Math.atan2(-dx, dy), al = Math.acos((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D)), ga = Math.acos((L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2));
    return sinal > 0 ? [(phi - al) / D2R, (Math.PI - ga) / D2R] : [(phi + al) / D2R, -(Math.PI - ga) / D2R];
  }

  // ---------- poses (graus; negativo = para a frente, com o boneco virado para a direita) ----------
  // corrida macia: tudo em senos, sem quinas na curva do joelho nem no sobe-e-desce
  function joelho(x) { var h = (1 + Math.cos(x)) / 2; return h * h; }
  function corrida(f, a) {
    var s = Math.sin(f);
    return { lean: 7 * a, bob: -1.5 * a * s * s, tF: 23 * a * s, tB: -23 * a * s,
      kF: 6 + 62 * a * joelho(f - 2.2), kB: 6 + 62 * a * joelho(f + Math.PI - 2.2),
      aF: -24 * a * s + 4 * (1 - a), aB: 24 * a * s - 4 * (1 - a), fF: -14 - 58 * a, fB: -14 - 58 * a,
      saia: 4 * a * s, rabo: 8 + 16 * a + 5 * a * Math.sin(2 * f), cab: 0 };
  }
  var EM_PE = corrida(0, 0);

  // ---------- bonecos: silhuetas de gente, como no logo (virados para a direita, pés na origem) ----------
  function capsula(w1, w2, L) {
    var a = w1 / 2, b = w2 / 2;
    return 'M' + (-a) + ',0 A' + a + ',' + a + ' 0 0 1 ' + a + ',0 L' + b + ',' + L + ' A' + b + ',' + b + ' 0 0 1 ' + (-b) + ',' + L + ' Z';
  }
  function membro(pai, x, y, w1, w2, L1, w3, w4, L2, ponta, op) {
    var g0 = el('g', { transform: 'translate(' + x + ' ' + y + ')' }, pai);
    if (op) g0.setAttribute('opacity', op);
    var g1 = el('g', {}, g0);
    el('path', { d: capsula(w1, w2, L1) }, g1);
    var g2 = el('g', {}, el('g', { transform: 'translate(0 ' + L1 + ')' }, g1));
    el('path', { d: capsula(w3, w4, L2) }, g2);
    if (ponta) el('path', { d: ponta, transform: 'translate(0 ' + L2 + ')' }, g2);
    return [g1, g2, g0];
  }
  var CFG = {
    mulher: { Q: 48, coxa: 23, canela: 25, ombro: 30, ox: 1, braco: 15, ante: 14, s: 0.35 },
    homem:  { Q: 50, coxa: 24, canela: 26, ombro: 31, ox: 1, braco: 16, ante: 15, s: 0.36 }
  };
  function bola(r, cx, cy) { cx = cx || 0; cy = cy || 0; return 'M' + (cx - r) + ',' + cy + ' A' + r + ',' + r + ' 0 1 0 ' + (cx + r) + ',' + cy + ' A' + r + ',' + r + ' 0 1 0 ' + (cx - r) + ',' + cy + ' Z'; }
  function boneco(pai, tipo) {
    var m = tipo === 'mulher', c = CFG[tipo];
    var raiz = el('g', { class: 'logo-fetech-' + tipo }, pai);
    var corpo = el('g', {}, raiz);
    // pés: ela de sapatilha fina, ele de sapato
    var pe = m ? 'M-1.8,-1.2 C1,-1.8 4.6,-1 6.4,0.9 C4.6,2.1 0,2.2 -1.9,1.6 Z' : 'M-2.8,-1.6 C1,-2.6 5.8,-1.6 7.8,0.9 C7.6,2.4 0,2.8 -2.9,2.2 Z';
    var tronco = el('g', { transform: 'translate(0 ' + (-c.Q) + ')' }), troncoR = el('g', {}, tronco);
    var cabT = null, raboR = null, saiaR = null, bracoT, pernaT, pernaF, bracoF, cabR;
    var coxa1 = m ? 7.4 : 8.6, coxa2 = m ? 5 : 6.2, can1 = m ? 4.8 : 5.8, can2 = m ? 2.8 : 3.8;
    pernaT = membro(corpo, 0, -c.Q, coxa1, coxa2, c.coxa, can1, can2, c.canela, pe, 0.72);
    if (m) {
      pernaF = membro(corpo, 0, -c.Q, coxa1, coxa2, c.coxa, can1, can2, c.canela, pe);
      // vestidinho justo até o meio da coxa
      var saia = el('g', { transform: 'translate(0 ' + (-c.Q) + ')' }, corpo); saiaR = el('g', {}, saia);
      el('path', { d: 'M-5.4,-9 L5.4,-9 C6.8,-2 8.2,5 9,11 Q0,13.4 -8.4,11.4 C-7.6,5 -6.6,-2 -5.4,-9 Z' }, saiaR);
      // rabo de cavalo atrás da cabeça
      cabT = el('g', {}, troncoR);
      raboR = el('g', {}, el('g', { transform: 'translate(-4.6 -48)' }, cabT));
      el('path', { d: 'M2.5,-2.4 C-1.6,-3 -4.4,0 -4.6,4.6 C-4.8,9 -6,12.4 -8,15 C-3.6,14 -1.4,10 -1.2,5.6 C-1,2.4 0.4,0.8 3,0.4 Z' }, raboR);
    }
    corpo.appendChild(tronco);
    bracoT = membro(troncoR, -c.ox, -c.ombro, m ? 4.2 : 5.4, m ? 3.4 : 4.4, c.braco, m ? 3.3 : 4.2, m ? 2.4 : 3.1, c.ante, bola(m ? 1.7 : 2.2, 0, 0.6), 0.72);
    if (m) {
      // tronco fino com cintura marcada
      el('path', { d: 'M-5.2,0 C-5.6,-6 -4.4,-11 -4.4,-15 C-4.4,-20 -6.6,-25 -6.6,-29 Q0,-33.5 6.4,-29 C6.6,-25 5.4,-20 5,-15 C5,-11 6.2,-6 5.6,0 Z' }, troncoR);
      cabR = el('g', {}, troncoR);
      el('path', { d: 'M-1.5,-30 L2.3,-30 L2.4,-36.5 L-1.4,-36.5 Z' }, cabR);
      el('path', { d: 'M-4.6,-43.5 C-4.6,-50.6 2.6,-52.4 6.2,-47.4 C7.6,-45.6 7.6,-43 7.8,-41.4 L6.8,-40.8 C6.6,-38.6 5,-36.6 2.4,-36.4 C-1.6,-36.2 -4.6,-39.2 -4.6,-43.5 Z' }, cabR);
      el('path', { d: 'M-5.4,-44 C-5.6,-51.6 3,-54 7,-48.4 C4.4,-50.2 -0.6,-50.4 -3.2,-46.6 C-3.4,-45.6 -3.8,-44.8 -5.4,-44 Z' }, cabR);
    } else {
      el('path', { d: 'M-6,1 C-6.6,-8 -7.2,-16 -8.4,-23 C-9,-27 -8.4,-30 -7.6,-31.4 Q0,-35 8.6,-31 C9,-28 8.6,-24 8,-20 C7,-13 6.6,-6 6.2,1 Z' }, troncoR);
      cabR = el('g', {}, troncoR);
      el('path', { d: 'M-2.2,-31 L2.6,-31 L2.8,-38 L-2,-38 Z' }, cabR);
      el('path', { d: 'M-5.4,-45 C-5.4,-52.4 2.6,-54.2 6.6,-49.4 C8.2,-47.6 8.2,-45.2 8.6,-43.4 L7.6,-42.6 C7.4,-40 5.6,-37.8 2.6,-37.6 C-2,-37.4 -5.4,-40.4 -5.4,-45 Z' }, cabR);
      el('path', { d: 'M-6.2,-45.6 C-7,-53.4 2.6,-56.2 7.6,-50.8 C8.2,-50 6.4,-49.6 4.4,-50 C1.4,-50.6 -2.4,-49.8 -3.6,-47 C-4.4,-46 -5,-45.2 -6.2,-45.6 Z' }, cabR);
      pernaF = membro(corpo, 0, -c.Q, coxa1, coxa2, c.coxa, can1, can2, c.canela, pe);
    }
    bracoF = membro(troncoR, c.ox, -c.ombro, m ? 4.2 : 5.4, m ? 3.4 : 4.4, c.braco, m ? 3.3 : 4.2, m ? 2.4 : 3.1, c.ante, bola(m ? 1.7 : 2.2, 0, 0.6));
    function R(e, a) { e.setAttribute('transform', 'rotate(' + a.toFixed(1) + ')'); }
    var api = {
      cfg: c, x: 0, y: 55, lado: 1, p: EM_PE,
      pos: function (x, y, lado, p) {
        api.x = x; api.y = y; api.lado = lado; api.p = p;
        raiz.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') scale(' + (c.s * lado).toFixed(4) + ' ' + c.s + ')');
        corpo.setAttribute('transform', 'translate(0 ' + p.bob.toFixed(2) + ')');
        R(troncoR, p.lean); R(pernaF[0], p.tF); R(pernaF[1], p.kF); R(pernaT[0], p.tB); R(pernaT[1], p.kB);
        R(bracoF[0], p.aF); R(bracoF[1], p.fF); R(bracoT[0], p.aB); R(bracoT[1], p.fB);
        var rc = 'rotate(' + (p.cab || 0).toFixed(1) + ' 0 -34)'; cabR.setAttribute('transform', rc); if (cabT) cabT.setAttribute('transform', rc);
        if (raboR) R(raboR, p.rabo);
        if (saiaR) saiaR.setAttribute('transform', 'skewX(' + p.saia.toFixed(1) + ')');
      },
      paraTela: function (x, y, lado, p, lx, ly) { return [x + lado * c.s * lx, y + c.s * (p.bob + ly)]; },
      paraLocal: function (x, y, lado, p, X, Y) { return [(X - x) / (lado * c.s), (Y - y) / c.s - p.bob]; },
      ombro: function (p, frente) { var o = rot(frente ? c.ox : -c.ox, -c.ombro, p.lean); return [o[0], -c.Q + o[1]]; },
      pe: function (p, frente) {
        var t = frente ? p.tF : p.tB, k = frente ? p.kF : p.kB, a = rot(0, c.coxa, t), b = rot(0, c.canela, t + k);
        return [a[0] + b[0], -c.Q + a[1] + b[1]];
      },
      mao: function (p, frente) {
        var o = api.ombro(p, frente), a = frente ? p.aF : p.aB, f = frente ? p.fF : p.fB;
        var e = rot(0, c.braco, p.lean + a), h = rot(0, c.ante, p.lean + a + f);
        return [o[0] + e[0] + h[0], o[1] + e[1] + h[1]];
      },
      peTela: function (x, y, lado, p, frente) { var q = api.pe(p, frente); return api.paraTela(x, y, lado, p, q[0], q[1]); },
      maoTela: function (x, y, lado, p, frente) { var q = api.mao(p, frente); return api.paraTela(x, y, lado, p, q[0], q[1]); },
      perna: function (x, y, lado, p, frente, X, Y) {
        var l = api.paraLocal(x, y, lado, p, X, Y), r = ik(c.coxa, c.canela, l[0], l[1] + c.Q, 1);
        if (frente) { p.tF = r[0]; p.kF = r[1]; } else { p.tB = r[0]; p.kB = r[1]; }
      },
      braco: function (x, y, lado, p, frente, X, Y) {
        var l = api.paraLocal(x, y, lado, p, X, Y), o = api.ombro(p, frente), r = ik(c.braco, c.ante, l[0] - o[0], l[1] - o[1], -1);
        if (frente) { p.aF = r[0] - p.lean; p.fF = r[1]; } else { p.aB = r[0] - p.lean; p.fB = r[1]; }
      },
      juntas: function () {   // pontos do esqueleto na tela (para o pó mágico)
        var p = api.p, T = function (q) { return api.paraTela(api.x, api.y, api.lado, p, q[0], q[1]); };
        var cab = rot(1, -44, p.lean);
        return [T([0, -c.Q]), T(api.pe(p, true)), T(api.pe(p, false)), T(api.ombro(p, true)), T(api.mao(p, true)), T(api.mao(p, false)), T([cab[0], -c.Q + cab[1]])];
      }
    };
    return api;
  }

  function criar(alvo, op) {
    op = op || {};
    var id = 'logo-fetech-' + (++cont), vel = 1.2;
    var svg = el('svg', { viewBox: '0 -12 214 67', class: 'logo-fetech', role: 'img', 'aria-label': 'FETECH', overflow: 'hidden' });
    var defs = el('defs', {}, svg);
    // silhueta lisa (funde braços, pernas e cabeça num só contorno, como no logo) + contorno na cor do fundo
    var fC = el('filter', { id: id + '-c', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '0.32', result: 'bl' }, fC);
    el('feColorMatrix', { in: 'bl', type: 'matrix', values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -7', result: 'sg' }, fC);
    el('feMorphology', { in: 'sg', operator: 'dilate', radius: '0.5', result: 'd' }, fC);
    el('feFlood', { style: 'flood-color: var(--fx-fundo, #2f3130)', result: 'f' }, fC);
    el('feComposite', { in: 'f', in2: 'd', operator: 'in', result: 'o' }, fC);
    var mg = el('feMerge', {}, fC); el('feMergeNode', { in: 'o' }, mg); el('feMergeNode', { in: 'sg' }, mg);
    function filtroBlur(n) { var f = el('filter', { id: id + n, x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs); return el('feGaussianBlur', { stdDeviation: 0 }, f); }
    function caminho(pai, d) { var g = el('g', { transform: 'translate(0,55) scale(0.1,-0.1)' }, pai); return el('path', { d: d }, g); }

    var gL = el('g', {}, svg);                                       // E T E C H: sempre paradas
    for (var i = 1; i <= 5; i++) caminho(gL, P[i]);
    var gF = el('g', {}, svg); el('path', { d: F_LIMPO }, gF);       // F sem a moça (só durante a animação)
    var gO = el('g', {}, svg);                                       // moça + rapaz do logo original
    [0, 6, 7].forEach(function (k) { caminho(gO, P[k]); });
    var gM = el('g', {}, svg), gFig = el('g', { filter: 'url(#' + id + '-c)' }, gM);
    var homem = boneco(gFig, 'homem'), mulher = boneco(gFig, 'mulher');
    [].forEach.call(gFig.querySelectorAll('[opacity]'), function (e) { e.setAttribute('opacity', 1); });
    var bIn = filtroBlur('-bi'), bFig = filtroBlur('-bf'), bOrig = filtroBlur('-bo');
    gM.setAttribute('filter', 'url(#' + id + '-bf)');
    alvo.appendChild(svg);

    // ---------- roteiro (segundos) ----------
    var T = { intro: 0.6, mCorre: [0.3, 3.6], hCorre: [0.9, 3.95], senta: [7.95, 8.95], hVolta: [7.75, 9.95],
      hVira2: [9.9, 10.35], apoio: [10.3, 11.05], forca: [11.05, 11.45], morph: [11.45, 12.6] };
    var PASSADA = [12.5, 13.5, 0.8];                             // passada da moça, do rapaz e intensidade da corrida
    var DUR = T.morph[1] + 0.15;
    var sM = CFG.mulher.s, sH = CFG.homem.s;
    var xM0 = 27, xH0 = 34, xHvolta = 193;
    var POUSO = 16.5;                                          // onde ela termina de andar em cima do F
    // moça sentada na ponta do F, de frente para a esquerda, pernas para fora (como no logo)
    var SENTA = { x: 13.2, quadril: 20.4, peF: [2.4, 32.3], peT: [3.6, 32.9], maoF: [9.6, 21.4], maoT: [15.6, 21.6] };
    var H_FIM = { x: 187, quadril: 42, lean: 12, peF: [183.6, 55], peT: [198.4, 53.2], mF: [179.9, 33.6], mT: [180.7, 34.6] };

    function bobPara(cfg, yQuadril, yRaiz) { return (yQuadril - yRaiz) / cfg.s + cfg.Q; }
    function arco(a, b, k, h) { var q = lerp2(a, b, k); q[1] -= h * Math.sin(Math.PI * k); return q; }

    // ---------- layout 10: ele fica agachado e só dá apoio; ela se pendura no F e sobe sozinha ----------
    var EP_M = function (x) { return { pF: mulher.peTela(x, 55, -1, EM_PE, true), pT: mulher.peTela(x, 55, -1, EM_PE, false), mF: mulher.maoTela(x, 55, -1, EM_PE, true), mT: mulher.maoTela(x, 55, -1, EM_PE, false) }; };
    var EP_H = function (x, l) { return { pF: homem.peTela(x, 55, l, EM_PE, true), pT: homem.peTela(x, 55, l, EM_PE, false), mF: homem.maoTela(x, 55, l, EM_PE, true), mT: homem.maoTela(x, 55, l, EM_PE, false) }; };
    var em0 = EP_M(27), eh0 = EP_H(34, -1), qM = 55 - CFG.mulher.Q * sM, qH = 55 - CFG.homem.Q * sH;
    // quadros-chave da moça: [tempo, valor]
    var KM = {
      quad: [[3.6, [27, qM]], [4.1, [27, qM - 0.8]], [4.35, [26.6, qM - 1.4]], [4.8, [25.9, 35.2]], [5.15, [26, 35]], [5.55, [25.7, 30.2]], [5.95, [25.2, 25.8]], [6.35, [24.8, 19.8]], [6.75, [24.6, 13.6]], [7.2, [24.2, 22 - CFG.mulher.Q * sM]]],
      lean: [[3.6, 0], [4.1, -4], [4.8, 2], [5.15, 4], [5.55, 12], [5.95, 26], [6.35, 30], [6.75, 16], [7.2, 0]],
      cab: [[3.6, 0], [4.1, -16], [4.8, -12], [5.15, 6], [5.6, -6], [6.35, 8], [7.2, 0]],
      pF: [[3.6, em0.pF], [4.1, [em0.pF[0] - 0.4, 54.6]], [4.35, [26, 54.4]], [4.8, [24.4, 52.4]], [5.15, [25, 51.8]], [5.55, [24.6, 46]], [5.95, [24.4, 40.8]], [6.35, [22.6, 21.8]], [6.75, [22.8, 22]], [7.2, [23.3, 22]]],
      pT: [[3.6, em0.pT], [4.35, [27.8, 54.6]], [4.8, [28.6, 51.4]], [5.15, [31.3, 45.3]], [5.95, [30.7, 40.8]], [6.35, [29.4, 33]], [6.75, [26.2, 22]], [7.2, [25, 22]]],
      mF: [[3.6, em0.mF], [4.1, [24.2, 23.4]], [4.35, [23.6, 22.3]], [6.35, [23.6, 22.3]], [6.75, [22.4, 17.5]], [7.2, [23.6, 15]]],
      mT: [[3.6, em0.mT], [4.1, [26.8, 23.6]], [4.35, [26.4, 22.5]], [6.35, [26.4, 22.5]], [6.75, [25.6, 17.8]], [7.2, [24.6, 15.2]]]
    };
    // quadros-chave do rapaz (virado para a esquerda até se levantar)
    var KH = {
      quad: [[3.95, [34, qH]], [4.5, [34.4, 45.6]], [5.15, [34.4, 45.6]], [5.95, [34.3, 44.6]], [6.35, [34.2, 43.8]], [6.85, [34.4, 45.4]], [7.3, [34, qH]]],
      lean: [[3.95, 0], [4.5, 14], [5.15, 14], [5.95, 10], [6.35, 6], [6.85, 12], [7.3, 0]],
      cab: [[3.95, 0], [4.5, -6], [5.15, -10], [5.95, -16], [6.35, -22], [6.85, -16], [7.3, 0]],
      pF: [[3.95, eh0.pF], [4.5, [30.4, 55]], [6.85, [30.4, 55]], [7.3, eh0.pF]],
      pT: [[3.95, eh0.pT], [4.5, [39.2, 55]], [6.85, [39.2, 55]], [7.3, eh0.pT]],
      mF: [[3.95, eh0.mF], [4.5, [31.4, 44.8]], [5.15, [31.4, 44.8]], [5.95, [30.8, 40.4]], [6.35, [29.9, 35.2]], [6.85, [31.6, 46.2]], [7.3, eh0.mF]],
      mT: [[3.95, eh0.mT], [4.5, [31.9, 45.4]], [5.15, [31.9, 45.4]], [5.95, [31.3, 41]], [6.35, [30.4, 35.8]], [6.85, [32.6, 46.6]], [7.3, eh0.mT]]
    };
    function montaPose(fig, K, t, lado, ySolo, extra) {
      var q = curva(K.quad, t), p = copia(EM_PE);
      p.lean = curva(K.lean, t); p.cab = curva(K.cab, t);
      p.bob = bobPara(fig.cfg, q[1], ySolo);
      for (var k in extra) p[k] = extra[k];
      var a = extra && extra.pTx ? extra.pTx : curva(K.pT, t);
      fig.perna(q[0], ySolo, lado, p, true, curva(K.pF, t)[0], curva(K.pF, t)[1]);
      fig.perna(q[0], ySolo, lado, p, false, a[0], a[1]);
      fig.braco(q[0], ySolo, lado, p, true, curva(K.mF, t)[0], curva(K.mF, t)[1]);
      fig.braco(q[0], ySolo, lado, p, false, curva(K.mT, t)[0], curva(K.mT, t)[1]);
      return { x: q[0], y: ySolo, p: p };
    }
    function subidaHomem(t) {
      if (t < 7.3) { var r = montaPose(homem, KH, t, -1, 55, {}); return { x: r.x, lado: -1, p: r.p, maos: curva(KH.mF, t) }; }
      return { x: xH0, lado: -Math.cos(Math.PI * fase(t, [7.3, 7.7])), p: copia(EM_PE), maos: null };
    }
    function subidaMulher(t, maos) {
      if (t < 7.2) {
        var extra = { saia: curva([[3.6, 0], [4.8, 3], [5.95, -3], [7.2, 0]], t), rabo: curva([[3.6, 8], [4.8, 22], [5.95, 30], [7.2, 8]], t) };
        if (maos && t > 5.1 && t < 6.2) {   // o pé de trás acompanha as mãos dele enquanto ela sobe
          var b = Math.min(eio((t - 5.1) / 0.1), 1 - eio((t - 6.0) / 0.2)), a = curva(KM.pT, t);
          extra.pTx = lerp2(a, [maos[0] - 0.1, maos[1] + 0.5], b);
        }
        return montaPose(mulher, KM, t, -1, 55, extra);
      }
      // anda até a ponta do F
      var r = viagem(t, 7.2, T.senta[0], 24.2, POUSO, 0.35, 0.45);
      var p = corrida((24.2 - r.x) / 5.5 * Math.PI, r.amp * 0.42); p.lean *= 0.4;
      return { x: r.x, y: 22, p: p };
    }

    function quadro(tr) {
      var t = tr / vel, r, k;
      // ======================= rapaz =======================
      var xh = xH0, lh = -1, ph, maos = null;
      if (t < T.hCorre[1]) {
        r = viagem(t, T.hCorre[0], T.hCorre[1], 252, xH0, 0, 0.45);
        xh = r.x; ph = corrida((252 - xh) / PASSADA[1] * Math.PI, r.amp * PASSADA[2]);
      } else if (t < T.hVolta[0] + 0.1) {
        var sh = subidaHomem(t); xh = sh.x; lh = sh.lado; ph = sh.p; maos = sh.maos;
      } else if (t < T.hVira2[0]) {
        r = viagem(t, T.hVolta[0] + 0.1, T.hVolta[1], xH0, xHvolta, 0.32, 0.4);
        xh = r.x; lh = 1; ph = corrida((xh - xH0) / PASSADA[1] * Math.PI, r.amp * PASSADA[2]);
      } else if (t < T.apoio[0]) {
        xh = xHvolta; ph = copia(EM_PE); lh = Math.cos(Math.PI * fase(t, T.hVira2));
      } else {
        lh = -1;
        k = fase(t, T.apoio);
        xh = lerp(xHvolta, H_FIM.x, k);
        ph = mix(EM_PE, { lean: H_FIM.lean, cab: -4 }, k);
        ph.bob = lerp(0, bobPara(CFG.homem, H_FIM.quadril, 55), k);
        var fz = t > T.forca[0] ? Math.sin(Math.PI * fase(t, T.forca)) : 0;   // faz força no H (as letras não se mexem)
        ph.lean += 2.5 * fz; ph.bob += 1 * fz;
        var pf0 = homem.peTela(xHvolta, 55, -1, EM_PE, true), pt0 = homem.peTela(xHvolta, 55, -1, EM_PE, false);
        var kpT = eio(k * 1.15), kpF = eio((k - 0.25) / 0.75);                // primeiro recua o pé de trás, depois ajeita o da frente
        homem.perna(xh, 55, -1, ph, false, lerp(pt0[0], H_FIM.peT[0], kpT) + 0.4 * fz, lerp(55, H_FIM.peT[1], kpT) - 1.6 * Math.sin(Math.PI * kpT));
        homem.perna(xh, 55, -1, ph, true, lerp(pf0[0], H_FIM.peF[0], kpF), 55 - 1 * Math.sin(Math.PI * kpF));
        var m0 = homem.maoTela(xHvolta, 55, -1, EM_PE, true), m1 = homem.maoTela(xHvolta, 55, -1, EM_PE, false), e = eio((k - 0.1) / 0.9);
        var mF = arco(m0, H_FIM.mF, e, 2.5), mT = arco(m1, H_FIM.mT, e, 2.5);
        homem.braco(xh, 55, -1, ph, true, mF[0], mF[1]); homem.braco(xh, 55, -1, ph, false, mT[0], mT[1]);
      }
      if (Math.abs(lh) < 0.04) lh = lh < 0 ? -0.04 : 0.04;
      if (t < T.hCorre[0]) xh = 262;
      homem.pos(xh, 55, lh, ph);

      // ======================= moça =======================
      var xm = xM0, ym = 55, pm;
      if (t < T.mCorre[1]) {
        r = viagem(t, T.mCorre[0], T.mCorre[1], 228, xM0, 0, 0.48);
        xm = r.x; pm = corrida((228 - xm) / PASSADA[0] * Math.PI, r.amp * PASSADA[2]);
        pm.cab = -9 * fase(t, [3.1, 3.6]);                                  // olha para o alto do F
      } else if (t < T.senta[0]) {
        var sm = subidaMulher(t, maos); xm = sm.x; ym = sm.y; pm = sm.p;
      } else {                                                                // anda até a ponta e se senta com as pernas para fora
        k = fase(t, T.senta);
        var amortece = 2.4 * Math.sin(Math.PI * cl((t - T.senta[0]) / 0.35)) * (t - T.senta[0] < 0.35 ? 1 : 0);
        pm = mix(EM_PE, { lean: 4, cab: -2, saia: -2, rabo: 6 }, k);
        xm = lerp(POUSO, SENTA.x, eio(k * 1.25)); ym = 22;
        var qy = lerp(22 - CFG.mulher.Q * sM, SENTA.quadril, eio((k - 0.2) / 0.8));
        pm.bob = bobPara(CFG.mulher, qy, 22) + amortece;
        var e0 = mulher.peTela(POUSO, 22, -1, EM_PE, true), e1 = mulher.peTela(POUSO, 22, -1, EM_PE, false);
        // passinhos até a beirada e as pernas passam para fora do F
        var kF2 = eio((k - 0.05) / 0.75), kT2 = eio((k - 0.2) / 0.75);
        var bal = t > T.senta[1] ? Math.sin((t - T.senta[1]) * 2.2) : 0;   // balança as pernas devagar, sentada
        var aF = arco(e0, SENTA.peF, kF2, 3.5), aT = arco(e1, SENTA.peT, kT2, 3.5);
        aF[0] += 0.5 * bal; aT[0] -= 0.5 * bal;
        mulher.perna(xm, ym, -1, pm, true, aF[0], aF[1]);
        mulher.perna(xm, ym, -1, pm, false, aT[0], aT[1]);
        var h0 = mulher.maoTela(POUSO, 22, -1, EM_PE, true), h1 = mulher.maoTela(POUSO, 22, -1, EM_PE, false), km = eio((k - 0.35) / 0.65);
        var hf = lerp2(h0, SENTA.maoF, km), ht = lerp2(h1, SENTA.maoT, km);
        mulher.braco(xm, ym, -1, pm, true, hf[0], hf[1]); mulher.braco(xm, ym, -1, pm, false, ht[0], ht[1]);
        pm.bob += -0.25 * Math.sin(t * 2.3) * k;                              // respiração
      }
      if (t < T.mCorre[0]) xm = 240;
      mulher.pos(xm, ym, -1, pm);

      // ======================= efeitos de abertura e final =======================
      var oi = 1 - eio(t / T.intro);
      var m = cl((t - T.morph[0]) / (T.morph[1] - T.morph[0]));
      var figOp = 1 - eio(m), orOp = eio(m);
      if (t < T.morph[0]) { orOp = oi; figOp = 1; }
      bIn.setAttribute('stdDeviation', ((1 - oi) * 2).toFixed(2));
      gO.setAttribute('filter', t < T.intro ? 'url(#' + id + '-bi)' : '');
      bFig.setAttribute('stdDeviation', (2.6 * eio(m)).toFixed(2));
      bOrig.setAttribute('stdDeviation', (2.2 * (1 - eio(m))).toFixed(2));
      if (t >= T.morph[0]) gO.setAttribute('filter', m < 1 ? 'url(#' + id + '-bo)' : '');
      gM.setAttribute('opacity', cl(figOp).toFixed(3));
      gM.style.display = figOp <= 0.001 ? 'none' : '';
      gO.setAttribute('opacity', cl(orOp).toFixed(3));
      gF.style.display = orOp >= 0.999 ? 'none' : '';
    }

    var PAUSA = op.pausa == null ? 9 : op.pausa, continuo = op.loop !== false, t0 = null, raf = null;
    function passo(ts) {
      if (t0 === null) t0 = ts;
      var t = (ts - t0) / 1000;
      if (continuo) { var ciclo = DUR * vel + PAUSA; quadro(Math.min(t % ciclo, DUR * vel)); raf = requestAnimationFrame(passo); return; }
      quadro(Math.min(t, DUR * vel));
      raf = t < DUR * vel ? requestAnimationFrame(passo) : null;
    }
    var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var api = {
      svg: svg, duracao: DUR * vel,
      tocar: function () { if (reduz) return api.final(); if (raf) cancelAnimationFrame(raf); t0 = null; raf = requestAnimationFrame(passo); },
      parar: function () { api.final(); },
      final: function () { if (raf) cancelAnimationFrame(raf); raf = null; quadro(DUR * vel); },
      em: function (seg) { if (raf) cancelAnimationFrame(raf); raf = null; quadro(seg); },
      tocando: function () { return !!raf; }
    };
    api.final();
    return api;
  }
  window.LogoFetech = { criar: criar };
})();
