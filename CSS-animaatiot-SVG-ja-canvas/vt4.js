'use strict';
//@ts-check 

const varit = [
  "#ff0000", "#00ff00", 
  "#0000ff", "#ff00ff", 
  "#ffff00","#00ff00", 
  "#00ffff", "#ffffff"
];
const palkkienLukumaara = 10;
const viiveenEro = 175;
const aikayksikko = 'ms';

// Vertikaaliset väriliukupalkit SVG-kuvina.

// Luo stop-elementin annetulla offsetilla ja värillä.
const luoStop = function luoStopGradientille(sijainti, vari) {
  const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  
  stop.setAttribute('offset', sijainti);
  stop.setAttribute('stop-color', vari);

  return stop;
};

// Luo yksinkertaisen lineaarisen gradientin annetulla id:llä ja värillä.
const luoGradient = function luoGradientVarilla(id, vari) {
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', id);

  const alku = luoStop('0%', 'black');
  const keskella = luoStop('50%', vari);
  const loppu = luoStop('100%', 'black');

  gradient.appendChild(alku);
  gradient.appendChild(keskella);
  gradient.appendChild(loppu);

  return gradient;
};

// Luo gradientit annetuista väreistä. Paremitrina annetut värit ovat taulukossa.
const luoGradientit = function luoGradientitVareilla(varit) {
  const gradientit = varit.map((vari, i) =>  
    luoGradient(`Gradient${i}`, vari)
  );
  return gradientit;
};

// Luo ja lisää gradientit DOM-puuhun defs-lohkon sisälle.
const lisaaGradientit = function lisaaGradientitDokumenttiin() {
  const defs = document.getElementById('defs');
  const gradientit = luoGradientit(varit);
  gradientit.forEach((gradient) => defs.appendChild(gradient));
};
window.addEventListener('load', lisaaGradientit);

// Tapahtumankäsittelijä palkkien värien muuttumiselle.
const muutaVaria = function muutaPalkinVaria(e) {
  const palkki = e.target.firstChild;
  const varienLkm = varit.length;
  const indeksi = (palkki.variIndeksi + 1) % varienLkm;
  
  palkki.variIndeksi = indeksi;
  palkki.setAttribute('fill', `url(#Gradient${indeksi})`);
};

// Luodaan SVG-elementti, jonka sisälle yksittäinen palkki laitetaan.
const luoSVG = function luoSVGElementti(leveys, korkeus) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('version', '1.1');
  svg.setAttribute('width', leveys);
  svg.setAttribute('height', korkeus);
  
  return svg;
};

// Luodaan itse palkki.
const luoPalkki = function luoSVGPalkki(leveys, korkeus, gradient = 'url(#Gradient0)') {
  const svg = luoSVG(leveys, korkeus);

  const palkki = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  palkki.setAttribute("x", "0");
  palkki.setAttribute("y", "0");
  palkki.setAttribute("width", "100%");
  palkki.setAttribute("height", "100%");
  palkki.setAttribute('fill', gradient);

  // Tallennetaan myös käytettävän värin taulukon indeksi, jotta värin muuttaminen kävisi helposti.
  palkki.variIndeksi = 0;
  
  svg.appendChild(palkki);

  return svg;
};

/**
 * Luo halutun määrän palkkeja. Parametreina annetaan palkkien lukumäärä,
 * animaatioviiveen ero kahde peräkkäisen palkin välillä ja viiveen aikayksikkö.
 * Palautetaan taulukko, jossa kaikki palkit ovat.
 */
const luoPalkkeja = function luoPalkkejaAnimaatioviiveErolla(palkkienLkm, ero, aikayksikko) {
  const palkit = [];

  for (let i = 0; i < palkkienLkm; i++) {
    const viive = i * ero;
    const palkki = luoPalkki('10%', '100%');

    palkki.style.animationDelay = `${viive}${aikayksikko}`;
    palkki.setAttribute('class', 'palkkienAnimaatio');
    palkki.addEventListener('animationiteration', muutaVaria);

    palkit.push(palkki);
  }

  return palkit;
};

// Lisätään palkit DOM-puuhun.
const palkitPaikalleen = function palkitHTMLDokumenttiin() {
  const palkit = luoPalkkeja(palkkienLukumaara, viiveenEro, aikayksikko);
  palkit.forEach((palkki) => document.body.appendChild(palkki));
};
window.addEventListener('load', palkitPaikalleen);

// Pöllön halkaisu.

// Luo canvaksen annetulla id:llä, leveydellä ja korkeudella.
const luoCanvas = function luoCanvasPolloaVarten(id, leveys, korkeus) {
  const canvas = document.createElement('canvas');

  canvas.setAttribute('id', id);
  canvas.setAttribute('width', leveys);
  canvas.setAttribute('height', korkeus);
  document.body.appendChild(canvas);

  return canvas;
};

// Piirtää halutun osan kuvasta samankokoiselle canvakselle.
const piirraOsa = function piirraOsaKuvastaOmalleCanvakselle(id, kuva, leveys, korkeus, sx, sy) {
  const canvas = luoCanvas(id, leveys, korkeus);
  const context = canvas.getContext('2d');
  context.drawImage(kuva, sx, sy, leveys, korkeus, 0, 0, leveys, korkeus);
};

// Jakaa kuvan neljään eri osaan ja piirtää niistä jokaisen omaan canvakseen.
const jaaKuvaOsiin = function jaaKuvaNeljaanOsaan(id, kuva) {
  const leveys = kuva.naturalWidth;
  const korkeus = kuva.naturalHeight;
  const puoletLeveydesta = Math.floor(leveys / 2);
  const puoletKorkeudesta = Math.floor(korkeus / 2);

  let numero = 1;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      let sx = j * puoletLeveydesta;
      let sy = i * puoletKorkeudesta;
      piirraOsa(`${id}${numero}`, kuva, puoletLeveydesta, puoletKorkeudesta, sx, sy);
      numero += 1;
    }
  }
};

/**
 * Haetaan kuva pöllöstä ja halkaistaan se neljään osaan. 
 * Jokaisella osalla on oma id, jonka avulla asetetaan niille CSS-animaatiot.
 */
const polloLiikkeelle = function polloHalkiPoikkiJaLiikkeelle() {
  const pollo = document.getElementById('pollo');
  jaaKuvaOsiin('pollo', pollo);
};
window.addEventListener('load', polloLiikkeelle);

// Tekstiskrolleri

// Laitetaan tänne canvakselle piirrettävät teksit.
const kalevalaTekstit = [];

// Lisää kolme lausetta taulukkoon, josta haetaan skrolleriin tekstit.
const lisaaLauseita = function lisaa3LausettaKalevalasta(taulukko) {
  taulukko.unshift(kalevala().trim());
  taulukko.unshift(kalevala().trim());
  taulukko.unshift(kalevala().trim());

  // Taulukossa voi olla max 9 lausetta. Poistetaan vanhimmat.
  if (taulukko.length > 9) {
    taulukko.splice(9, 3);
  }
};

// Kirjoittaa canvakselle annettuun kontekstiin ja paikkaan x,y.
const kirjoitaCanvakselle = function kirjoitaCanvakselleTekstia(context, x, y, teksti) {
  context.save();

  context.font = '48px arial';
  context.textAlign = 'center';
  context.textBaseline = 'top';
  context.fillStyle = 'white';
  context.fillText(teksti, x, y);

  context.restore();
};

// Kirjoita canvakselle kaikki näytettävät tekstit.
const kalevaaCanvakselle = function kirjoitaKaikkiKalevalatCanvakselle(canvas, rivit) {
  const context = canvas.getContext('2d');
  const keskellaX = Math.floor(canvas.width / 2);
  const yhdeksasosaY = Math.floor(canvas.height / 9);

  // Poistetaan aluksi vanhat kirjoitukset.
  context.clearRect(0, 0, canvas.width, canvas.height);

  rivit.forEach((rivi, i) => {
    kirjoitaCanvakselle(
      context,
      keskellaX,
      canvas.height - ((i + 1) * yhdeksasosaY),
      rivi
    );
  });
};

// Päivittää tekstit oikeaan paikkaan.
const paivitaTekstit = function paivitaTekstit(e) {
  const canvas = e.target;

  lisaaLauseita(kalevalaTekstit);
  kalevaaCanvakselle(canvas, kalevalaTekstit);
};

// Luodaan canvas, joka toimii skrollerinamme.
const luoSkrolleri = function luoCanvasSkrolleriTekstille() {
  const canvas = luoCanvas('skrolleri', '0', '0');
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  
  canvas.width = displayWidth;
  canvas.height = displayHeight;

  // Siirretään tekstit oikeaan paikkaan
  canvas.addEventListener('animationiteration', paivitaTekstit);
};
window.addEventListener('load', luoSkrolleri);

// Korjaa canvaksen koon ikkunan koon muuttuessa.
// Sain vastauksen seuraavasta artikkelista: https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
const korjaaCanvaksenKoko = function korjaaCanvaksenKoko() {
  const canvas = document.getElementById('skrolleri');
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  canvas.width = displayWidth;
  canvas.height = displayHeight;

  // Piirretään canvakselle uudestaan.
  kalevaaCanvakselle(canvas, kalevalaTekstit);
};
window.addEventListener('resize', korjaaCanvaksenKoko);

// // Lainehtivat liukuväripalkit

// // Laitoin tämän kommentteihin, koska kaikki muut animaatiot menevät jumiiin, kun tämän
// // efektin laittaa päälle. En saanut myöskään lainehtivia palkkeja skaalautumaan
// // ikkunan koon muuttuessa. Erityisesti skrolleri alkaa lagaamaan todella pahasti.

// // Luodaan ikkunan kokoinen palkki toisista pienemmistä palkeista.
// const lainehtivaPalkki = function lainehtivaSVGPalkki(x) {
//   const referenssi = document.querySelector('.palkkienAnimaatio');
//   const ikkunanPikselit = referenssi.clientHeight;

//   const kokoPalkki = [];

//   for (let i = 0; i < ikkunanPikselit; i++) {
//     const osaPalkki = luoPalkki('5%', '1px', 'url(#Gradient4)');

//     osaPalkki.setAttribute('class', 'lainehtivaPalkki');
//     osaPalkki.style.animationDelay = `${i * 10}ms`;
//     osaPalkki.style.top = `${i}px`;
//     osaPalkki.style.left = `${x * 5}%`;

//     kokoPalkki.push(osaPalkki);
//   }

//   return kokoPalkki;
// };

// // Luodaan kaikki lainehtivat palkit.
// const lainehtivatPalkit = function luoLainehtivatPalkit() {
//   const palkit = [];

//   for (let i = 0; i < 10; i++) {
//     palkit.push(lainehtivaPalkki(i));
//   }

//   return palkit;
// };

// // Lisätään lainehtivat palkit ikkunaan.
// const palkitSivulle = function palkitDOMPuuhun() {
//   const kaikkiLainehtivatPalkit = lainehtivatPalkit();

//   kaikkiLainehtivatPalkit.forEach((lainehtivaPalkki) => {
//     lainehtivaPalkki.forEach((pikkupalkki) => document.body.appendChild(pikkupalkki));
//   });
// };
// window.addEventListener('load', palkitSivulle);

// Palkkien koon korjaus ikkunan koon muuttuessa jäis kesken.
// 
// const korjaaPalkkienKoko = function korjaaPalkkienKoko() {
//   const referenssi = document.querySelector('.palkkienAnimaatio');
//   const ikkunanPikselit = referenssi.clientHeight;

//   const nakyvissa = document.querySelectorAll('.palkkienAnimaatio');
//   const piilossa = document.querySelectorAll('.piilossa');
//   const yhteensa = nakyvissa.length + piilossa.length;

//   if (ikkunanPikselit < nakyvissa) {
//     for (let i = ikkunanPikselit; i < nakyvissa.length; i++) {
//       nakyvissa[i].setAttribute('class', 'piilossa');
//     }
//     return;
//   }

//   if (
//     ikkunanPikselit >= nakyvissa &&
//     ikkunanPikselit <= yhteensa
//   ) {
//     const nakyviin = ikkunanPikselit - nakyvissa.length;
//     for (let i = 0; i < nakyviin; i++) {
//       piilossa[i].setAttribute('class', 'palkkienAnimaatio');
//     }
//     return;
//   }

//   const uudetLkm = ikkunanPikselit - yhteensa;
//   piilossa.forEach((osa) => osa.setAttribute('class', 'palkkienAnimaatio'));
//   for (let i = 0; i <= uudetLkm; i++) {
//     const osaPalkki = luoPalkki('5%', '1px', 'url(#Gradient4)');

//     osaPalkki.setAttribute('class', 'palkkienAnimaatio');
//     osaPalkki.style.top = `${yhteensa + i}px`;
//     osaPalkki.style.left = `${0}%`;

//     document.body.appendChild(osaPalkki);
//   }
// };
// window.addEventListener('resize', korjaaPalkkienKoko);
