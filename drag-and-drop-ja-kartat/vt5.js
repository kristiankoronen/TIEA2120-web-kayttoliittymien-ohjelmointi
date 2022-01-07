"use strict";
// seuraavat estävät jshintin narinat jqueryn ja leafletin objekteista
/* jshint jquery: true */
/* globals L */

// kirjoita tänne oma ohjelmakoodisi

// Asteet radiaaneiksi.
const deg2rad = function deg2rad(deg) {
  return deg * (Math.PI/180);
};

// Laskee matkan pituuden annettujen koordinaattien perusteella.
const laskeMatkaKoordinaateista = function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);  // deg2rad below
  const dLon = deg2rad(lon2-lon1); 
  const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
};

// Laskee kuljetun matkan pituuden kilometreinä yhden desimaalin tarkkuudella.
const laskeKokoMatka = function laskeKuljetunReitinMatkanPituusKm(leimaukset) {
  let matkanPituusKm = 0;

  for (let i = 0; i < leimaukset.length - 1; i++) {
    matkanPituusKm += laskeMatkaKoordinaateista(
      leimaukset[i].lat, leimaukset[i].lon, 
      leimaukset[i + 1].lat, leimaukset[i + 1].lon
    );
  }
  // Billy Moon Sep 8 '11 at 4:06 & Kaspar Lee Mar 4 '20 at 23:34 
  // https://stackoverflow.com/questions/7342957/how-do-you-round-to-1-decimal-place-in-javascript
  return Math.round(matkanPituusKm * 10) / 10;
};

// This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
// Adam Cole, 2011-Sept-14
// HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
const sateenkaari = function rainbow(numOfSteps, step) {
  let r, g, b;
  let h = step / numOfSteps;
  let i = ~~(h * 6);
  let f = h * 6 - i;
  let q = 1 - f;
  switch(i % 6){
      case 0: r = 1; g = f; b = 0; break;
      case 1: r = q; g = 1; b = 0; break;
      case 2: r = 0; g = 1; b = f; break;
      case 3: r = 0; g = q; b = 1; break;
      case 4: r = f; g = 0; b = 1; break;
      case 5: r = 1; g = 0; b = q; break;
  }
  let c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
  return (c);
};

// Apufunktio joukkueiden järjestämiseen aakkosjärjestykseen nimien mukaan.
const aakkosjarjestykseen = function nimenMukaanAakkosjarjestykseen(a, b) {
  const nimiA = a.nimi.trim().toUpperCase();
  const nimiB = b.nimi.trim().toUpperCase();
  
  if (nimiA < nimiB) { 
    return -1;
  }
  if (nimiA > nimiB) {
    return 1;
  }
  return 0;
};

// Apufunktio rastien järjestämiseen käänteiseen aakkosjärjestykseen niiden koodien mukaan.
const kaanteiseenAakkosjarjestykseen = function koodinMukaanKaanteiseenAakkosjarjestykseen(a, b) {
  const koodiA = a.koodi.trim().toUpperCase();
  const koodiB = b.koodi.trim().toUpperCase();
  
  if (koodiA > koodiB) {
    return -1;
  }
  if (koodiA < koodiB) {
    return 1;
  }
  return 0;
};

// Haetaan kaikki rastit talteen ja laitetaan ne käänteiseen aakkosjärjestykseen.
const rastit = [...data.rastit];
rastit.sort(kaanteiseenAakkosjarjestykseen);

// Luo objektin rasteista, jossa avaimena kyseisen rastin id
// ja arvona rasti-objekti itse.
const luoRastiIdObjekti = function luoRastiIdObjekti(rastit) {
  const objRasteille = {};
  for (let rasti of rastit) { 
    objRasteille[rasti.id] = rasti;
  }
  return objRasteille;
};

// Tästä löytyy rastin id:tä vastaava rastiobjekti.
const rastitJaId = luoRastiIdObjekti(rastit);

// Haetaan joukkueen kaikki validit rastileimaukset.
const haeValiditLeimaukset = function haeValiditRastileimaukset(kaikkiLeimaukset) {
  const validitRastit = kaikkiLeimaukset.filter(({rasti}) => rastitJaId[rasti]);
  const leimauksetRasteina = validitRastit.map(({rasti}) => rastitJaId[rasti]);
  const lahtorasti = rastit.find(({koodi}) => koodi === 'LAHTO');
  const maalirasti = rastit.find(({koodi}) => koodi === 'MAALI');

  const lahtoindeksi = leimauksetRasteina.lastIndexOf(lahtorasti);
  leimauksetRasteina.splice(0, lahtoindeksi);

  const maaliindeksi = leimauksetRasteina.indexOf(maalirasti);
  leimauksetRasteina.splice(maaliindeksi + 1);
  
  return [...new Set(leimauksetRasteina)];
};

// Haetaan kaikki joukkueet talteen ja laitetaan ne aakkosjärjestykseen.
const joukkueet = [...data.joukkueet];
joukkueet.sort(aakkosjarjestykseen);

// Luodaan li-elementti annetulla tekstillä ja värillä.
const luoListaelementti = function luoHTMLListaelementtiTekstilla(teksti, vari, datatyyppi, id) {
  const li = document.createElement('li');
  
  li.textContent = teksti;
  li.style.backgroundColor = vari;
  li.setAttribute('id', id);
  li.setAttribute('draggable', 'true');
  li.addEventListener('dragstart', (e) => e.dataTransfer.setData(datatyyppi, id));

  return li;
};

// Summaryssa joukkueen nimi ja kulkema matka, alavetovalikossa kuljetut rastit omassa listassaan.
const luoNextLevelListaelementti = function luoListaelementtiDetailssienJaSummarynKanssa(
  nimiJaMatka, vari, indeksi, validitLeimaukset
) {
  const li = document.createElement('li');
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  const leimauksetUl = document.createElement('ul');

  validitLeimaukset.forEach((rasti, i) => {
    const { koodi } = rasti;
    const leimaus = document.createElement('li');
    
    leimaus.textContent = koodi;
    leimaus.vastaavaRasti = rasti;

    leimaus.setAttribute('draggable', 'true');
    leimaus.setAttribute('id', `leimaus${i}_joukkue${indeksi}`);
    leimaus.addEventListener(
      'dragstart',
      (e) => e.dataTransfer.setData(`joukkue${indeksi}_leimaukset`, `leimaus${i}_joukkue${indeksi}`)
    );
  
    leimauksetUl.appendChild(leimaus);
  });

  // Sallitaan vain joukkueen omien leimausten raahaus.
  const leimauksetDragover = function dragoverTapahtumankasittelijaLeimauslistaukselle(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!e.dataTransfer.types.includes(`joukkue${indeksi}_leimaukset`)) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }
  
    e.dataTransfer.dropEffect = 'move';
  };

  // Siirretään raahattu leimaus uuteen paikkaan ja päivitetään matkaa ja piirrettyä reittiä.
  const leimauksetDrop = function dropTapahtumankasittelijaLeimauslistaukselle(e) {
    e.preventDefault();
    e.stopPropagation();
  
    const data = e.dataTransfer.getData(`joukkue${indeksi}_leimaukset`);
    const siirrettavaListaelementti = document.getElementById(data);
    
    if (e.target.id.match(/^joukkueenLeimaukset/)) {
      e.target.appendChild(siirrettavaListaelementti);
      
    } else {
      e.target.insertAdjacentElement('beforebegin', siirrettavaListaelementti);
    }
    
    const li = siirrettavaListaelementti.parentElement.parentElement.parentElement;
    const leimauksetUudessaJarjestyksessa = (
      [...siirrettavaListaelementti.parentElement.children]
        .map(({ vastaavaRasti }) => vastaavaRasti)
    );
    const koordinaatit = leimauksetUudessaJarjestyksessa.map(({lat, lon}) => L.latLng(lat, lon));
    const summary = siirrettavaListaelementti.parentElement.previousElementSibling;
    const { piirrettyReitti, joukkue } = li;

    summary.textContent = `${joukkue.nimi} (${laskeKokoMatka(leimauksetUudessaJarjestyksessa)}) km`;
    if (piirrettyReitti) {
      piirrettyReitti.setLatLngs(koordinaatit);
    }
  };

  leimauksetUl.addEventListener('dragover', leimauksetDragover);
  leimauksetUl.addEventListener('drop', leimauksetDrop);

  summary.setAttribute('draggable', 'true');
  summary.addEventListener(
    'dragstart',
    (e) => e.dataTransfer.setData('joukkue', `joukkue${indeksi}`)
  );

  li.style.backgroundColor = vari;
  summary.setAttribute('id', `joukkue${indeksi}`);
  summary.textContent = nimiJaMatka;
  leimauksetUl.setAttribute('class', 'leimaukset');
  leimauksetUl.setAttribute('id', `joukkueenLeimaukset${indeksi}`);

  details.appendChild(summary);
  details.appendChild(leimauksetUl);
  li.appendChild(details);
  
  return li;
};

// Tehdään joukkueista listaus sateenkaaren väreillä.
const joukkueetListaan = function lisaaJoukkueetListaan() {
  const joukkueLista = document.querySelector('.joukkuelistaus');

  const joukkuelistaelementit = joukkueet.map((joukkue, i) => {
    const { nimi, rastit } = joukkue;
    const vari = sateenkaari(joukkueet.length, i);
    const validitLeimaukset = haeValiditLeimaukset(rastit);
    const kuljettuMatka = laskeKokoMatka(validitLeimaukset);
    const li = luoNextLevelListaelementti(
      `${nimi} (${kuljettuMatka} km)`, 
      vari,
      i,
      validitLeimaukset
    );

    li.joukkue = joukkue;
    joukkueLista.appendChild(li);

    return li;
  });

  return joukkuelistaelementit;
};

// Tehdään rasteista listaus sateenkaaren väreillä.
const rastitListaan = function lisaaKaikkiRasitListaan() {
  const rastiLista = document.querySelector('.rastitlistaus');

  rastit.forEach(({ koodi }, i) => {
    const vari = sateenkaari(rastit.length, i);
    const li = luoListaelementti(koodi, vari, 'rasti', `rasti${i}`);

    rastiLista.appendChild(li);
  });
};
window.addEventListener('load', rastitListaan);

/**
 * Tehdään raahauksia vastaanottava kohde annetun luokan nimen
 * perusteella sopivilla dragover- ja dropfunktiolla.
 */ 
const luoPudotusKohde = function luoRaahauksiaVastaanottavaKohde(
  luokanNimi,
  dragoverFunktio,
  dropFunktio
) {
  const vastaanottavaKohde = document.querySelector(`.${luokanNimi}`);

  vastaanottavaKohde.addEventListener('dragover', dragoverFunktio);
  vastaanottavaKohde.addEventListener('drop', dropFunktio);
  
  return vastaanottavaKohde;
};

let valittuRasti;
let markkeri;

// Luodaan ympyrä parametrina annettuun kohtaan.
const luoYmpyra = function luoYmpyraKohtaan(rasti, koodi, lat, lon, joukkueet, kartalla) {
  const ympyra = L.circle(
    [lat, lon], 
    { color: 'red', fillOpacity: 0, radius: 150 }
  )
  .bindTooltip(
    koodi,
    { direction: 'center', permanent: true, className: 'tooltip' }
  );

  ympyra.rasti = rasti;
  ympyra.joukkueet = joukkueet;
  ympyra.kartalla = kartalla;

  // Ympyrän raahaus kartalla.
  ympyra.addEventListener(
    'mousedown',
    (e) => {
      const valittuRasti = e.target;
      const kartta = valittuRasti._map;
      kartta.dragging.disable();
      
      const liiku = function liikutaRastia(e) {
        valittuRasti.setLatLng(e.latlng);
      };

      valittuRasti.setStyle({ fillOpacity: 0.5 });
      valittuRasti.addEventListener('mousemove', liiku);
    });
    
    ympyra.addEventListener(
      'mouseup',
      (e) => {
        const valittuRasti = e.target;
        const lng = e.latlng.lng.toString();
        const lat = e.latlng.lat.toString();
        const kartta = valittuRasti._map;

        valittuRasti.rasti.lat = lat;
        valittuRasti.rasti.lon = lng;
        valittuRasti.setStyle({ fillOpacity: 0 });
        valittuRasti.removeEventListener('mousemove');
        kartta.dragging.enable();

        valittuRasti.joukkueet.forEach((li) => {
          const validitLeimaukset = [...li.lastChild.lastChild.childNodes]
            .map(({ vastaavaRasti }) => vastaavaRasti);
          const summary = li.firstChild.firstChild;
          const { nimi } = li.joukkue;
          summary.textContent = `${nimi} (${laskeKokoMatka(validitLeimaukset)} km)`;
        });

        let kartalla = [...valittuRasti.kartalla.childNodes];
        // Käsitellään ainoastaan joukkueita.
        kartalla = kartalla.filter((li) => !li.id.startsWith('rasti'));
        kartalla.forEach((li) => {
          const { piirrettyReitti } = li;
          const validitLeimaukset = [...li.lastChild.lastChild.childNodes]
          .map(({ vastaavaRasti }) => vastaavaRasti);
          const koordinaatit = validitLeimaukset
            .map(({lat, lon}) => L.latLng(lat, lon));
          piirrettyReitti.setLatLngs(koordinaatit);
        });
      }
    );

  // Markerin avulla toteutettu raahaus.
  
  // ympyra.addEventListener('click', (e) => {
  //   if (valittuRasti === undefined) {
  //     e.target.setStyle({ fillOpacity: 0.5 });
  //     valittuRasti = e.target;

  //     const lat = valittuRasti._latlng.lat;
  //     const lng = valittuRasti._latlng.lng;

  //     markkeri = L.marker([lat, lng]);
  //     markkeri.options.draggable = true;
  //     markkeri.options.autoPan = true;

  //     markkeri.addTo(valittuRasti._map);
  //     markkeri.addEventListener('dragend', () => {
  //       const koordinaatit = markkeri.getLatLng();
  //       valittuRasti.rasti.lat = koordinaatit.lat.toString();
  //       valittuRasti.rasti.lon = koordinaatit.lng.toString();
  //       valittuRasti.setLatLng(koordinaatit);
  //       valittuRasti.setStyle({ fillOpacity: 0 });
  //       valittuRasti.joukkueet.forEach((li) => {
  //         const summary = li.firstChild.firstChild;
  //         const { nimi, rastit } = li.joukkue;
  //         summary.textContent = `${nimi} (${laskeKokoMatka(haeValiditLeimaukset(rastit))} km)`;
  //       });

  //       const kartalla = [...valittuRasti.kartalla.childNodes];
  //       kartalla.forEach((li) => {
  //         const { piirrettyReitti } = li;
  //         const validitLeimaukset = [...li.lastChild.lastChild.childNodes]
  //           .map(({ vastaavaRasti }) => vastaavaRasti);
  //         const koordinaatit = validitLeimaukset
  //           .map(({lat, lon}) => L.latLng(lat, lon));
  //         piirrettyReitti.setLatLngs(koordinaatit);
  //       });
  //       valittuRasti = undefined;

  //       console.log(markkeri);
  //       markkeri.remove();
  //     });
  //     return;
  //   }
  //   console.log(markkeri);
    
  //   valittuRasti.setStyle({ fillOpacity: 0 });
  //   e.target.setStyle({ fillOpacity: 0.5 });
  //   valittuRasti = e.target;

  //   const lat = valittuRasti._latlng.lat;
  //   const lng = valittuRasti._latlng.lng;
  //   markkeri.setLatLng([lat, lng]);
  // });

  return ympyra;
};

// Lasketaan rastien viemä alue kartalla.
const laskeRastienAlue = function laskeRastienViemaAlue(rastit) {
  const koordinaatit = rastit.map(({lat, lon}) => L.latLng(lat, lon));
  const alue = L.latLngBounds(koordinaatit);
  return alue;
};

// Luo annetuista rasteista joukko LatLng-pisteitä.
const luoLatLngTaulukko = function luoAnnetuistaRasteistaTaulukkoLatLngPisteita(rastit) {
  return rastit.map(({lat, lon}) => L.latLng(lat, lon));
};

// Funktio lataa karttasovelluksen sivulle.
const lataaKarttasovellus = function lataaKarttasovellus() {
  // Ladataan kartta.
  const mymap = new L.map(
    'map', 
    { crs: L.TileLayer.MML.get3067Proj() }
  ).setView([62.120776, 25.542413], 11);
  mymap.locate({ setView: true, maxZoom: 16 });
  
  L.tileLayer.mml_wmts(
    { 
      layer: 'maastokartta', 
      key : '814cd863-7397-4322-94b2-51b9d2eeaac7'
    }
  ).addTo(mymap);

  // Luodaan dragover-tapahtumankäsittelijä kartalla-listaukselle.
  const kartallaDragover = function dragoverTapahtumankasittelijaKartallalistaukselle(e) {
    e.preventDefault();

    // Sallitaan vain joukkueiden ja rastien raahaus alueelle.
    if (
      !(e.dataTransfer.types.includes('joukkue') || e.dataTransfer.types.includes('rasti'))
    ) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }
    
    // Sallitaan elementtien siirtäminen vain kartallalistauksen lapseksi.
    if (e.target.id !== 'kartalla') { 
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    e.dataTransfer.dropEffect = 'move';
  };
  
  // Luodaan drop-tapahtumankäsittelijä kartalla-listaukselle.
  const kartallaDrop = function dropTapahtumankasittelijaKartallalistaukselle(e) {
    e.preventDefault();
    
    const data = (
      e.dataTransfer.getData('joukkue') ||
      e.dataTransfer.getData('rasti') ||
      e.dataTransfer.getData('leimaus')
    );

    let siirrettavaListaelementti;
    if (data.match(/^rasti/)) {
      siirrettavaListaelementti = document.getElementById(data);
    } else {
      siirrettavaListaelementti = document.getElementById(data).parentElement.parentElement;
    }

    const suhteellinenKorkeus = (e.offsetY / e.target.clientHeight) * 100;
    const suhteellinenLeveys = (e.offsetX / e.target.clientWidth) * 100;
    
    siirrettavaListaelementti.style.left = `${suhteellinenLeveys}%`;
    siirrettavaListaelementti.style.top = `${suhteellinenKorkeus}%`;
    siirrettavaListaelementti.style.width = 'auto';
    
    e.target.appendChild(siirrettavaListaelementti);
    
    // Jos siirrettävä elementti on joukkue, niin piirretään kuljettu reitti karttaan.
    if (/^joukkue/.test(data)) {
      if (siirrettavaListaelementti.piirrettyReitti === undefined) {
        const leimauksetUudessaJarjestyksessa = (
          [...siirrettavaListaelementti.firstChild.lastChild.childNodes]
          .map(({ vastaavaRasti }) => vastaavaRasti)
        );
        const koordinaatit = leimauksetUudessaJarjestyksessa
          .map(({lat, lon}) => L.latLng(lat, lon));
        const vari = siirrettavaListaelementti.style.backgroundColor;
        const kuljettuReitti = L.polyline(koordinaatit, {color: vari})
          .addTo(mymap)
          .bringToFront(); 
        // Laitetaan reitti talteen helppoa poistamista varten.
        siirrettavaListaelementti.piirrettyReitti = kuljettuReitti;
      }
    }
  };

  const kartallalistaus = luoPudotusKohde('kartallalistaus', kartallaDragover, kartallaDrop);
  const joukkuelistaelementit = joukkueetListaan();

  // Lisätään rastit punaisina ympyröinä karttaan.
  rastit.forEach((rasti) => {
    const {koodi, lat, lon} = rasti;
    luoYmpyra(rasti, koodi, lat, lon, joukkuelistaelementit, kartallalistaus).addTo(mymap);
  });

  // Rajataan kartan näyttämä alue rastien viemään alueeseen...
  mymap.fitBounds(laskeRastienAlue(rastit));
  // ...myös ikkunan koon muuttuessa.
  window.addEventListener('resize', () => mymap.fitBounds(laskeRastienAlue(rastit)));

  // Luodaan dragover-tapahtumankäsitteljä joukkuelistaukselle.
  const joukkueetDragover = function dragoverTapahtumankasittelijaJoukkuelistaukselle(e) {
    e.preventDefault();

    // Sallitaan vain joukkueiden raahaaminen alueelle.
    if (!e.dataTransfer.types.includes('joukkue')) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    e.dataTransfer.dropEffect = 'move';
  };

  // Luodaan drop-tapahtumankäsittelijä joukkuelistaukselle.
  const joukkueetDrop = function dropTapahtumankasittelijaJoukkueetlistaukselle(e) {
    e.preventDefault();

    const data = e.dataTransfer.getData('joukkue') || e.dataTransfer;
    const siirrettavaListaelementti = document.getElementById(data).parentElement.parentElement;

    if (e.target.id === 'joukkueet') {
      e.target.appendChild(siirrettavaListaelementti);
    }

    if (e.target.id.match(/^joukkue\d+/) || e.target.id.match(/^joukkueenLeimaukset/)) {
      e.target.parentElement.parentElement
        .insertAdjacentElement('beforebegin', siirrettavaListaelementti);
    }

    if (e.target.id.match(/^leimaus/)) {
      e.target.parentElement.parentElement.parentElement
        .insertAdjacentElement('beforebegin', siirrettavaListaelementti);

    }

    // Poistetaan karttaan piirretty reitti. 
    siirrettavaListaelementti?.piirrettyReitti?.remove();
    siirrettavaListaelementti.piirrettyReitti = undefined;
  };
  luoPudotusKohde('joukkuelistaus', joukkueetDragover, joukkueetDrop);

  // Luodaan dragover-tapahtumankäsitteljä rastitlistaukselle.
  const rastitDragover = function dragoverTapahtumankasittelijaRastitlistaukselle(e) {
    e.preventDefault();

    // Sallitaan vain rastien raahaaminen alueelle.
    if (!e.dataTransfer.types.includes('rasti')) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    e.dataTransfer.dropEffect = 'move';
  };

  // Luodaan drop-tapahtumankäsittelijä rastitlistaukselle.
  const rastitDrop = function dropTapahtumankasittelijaRastitlistaukselle(e) {
    e.preventDefault();

    const data = e.dataTransfer.getData('rasti');
    const siirrettavaListaelementti = document.getElementById(data);

    // Lisätään joukkue listan viimeiseksi, jos elementti on raahattu listan loppuun.
    if (e.target.id === 'rastit') {
      e.target.appendChild(siirrettavaListaelementti);
    } else {
      // Muuten lisätään siihen kohtaan johon se raahattiinkin.
      e.target.insertAdjacentElement('beforebegin', siirrettavaListaelementti);
    }
  };
  luoPudotusKohde('rastitlistaus', rastitDragover, rastitDrop);
};
// Ladataan karttasovellus vasta, kun koko sivu on latautunut.
window.addEventListener('load', lataaKarttasovellus);
