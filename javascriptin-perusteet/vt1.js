"use strict";
//@ts-check 
// Joukkueen sarja on viite data.sarjat-taulukossa lueteltuihin sarjoihin
// Joukkueen leimaamat rastit ovat viitteitä data.rastit-taulukossa lueteltuihin rasteihin
// voit vapaasti luoda data-rakenteen pohjalta omia aputietorakenteita

// Kirjoita tästä eteenpäin oma ohjelmakoodisi

// Taso 1

// Tulostaa joukkueet joukkueiden nimien mukaan aakkosjärjestyksessä.
function tulostaJoukkueet(data) { // Mieti, jos on aikaa!
    let joukkueet = Array.from(data.joukkueet);
    joukkueet.sort(vertaaNimia);
    for (const joukkue of joukkueet) {
        log(joukkue.nimi.trim() + " " + joukkue.sarja.nimi.trim());
    }
}

/**
 * Vertailufunktio nimien vertaamista varten. Merkkijonon alun ja lopun
 * välilyönneillä ei ole väliä. Myöskään kirjainten koolla ei ole väliä. 
 */ 
function vertaaNimia(a, b) {
    let nimiA = a.nimi.trim().toUpperCase();
    let nimiB = b.nimi.trim().toUpperCase();
    if (nimiA < nimiB) {
        return -1;
    }
    if (nimiA > nimiB) {
        return 1;
    }
    return 0;
}

/**
 * Lisää joukkueen parametrina tuotuun sarjaan. Jos kaikkia parametreja
 * ei anneta tai annettua sarjaa ei löydy datasta, funktio ei tee mitään.
 * @param {Object} data 
 * @param {Object} joukkue 
 * @param {Object} sarja - Sarjan on löydyttävä datasta.
 */
function lisaaJoukkue(data, joukkue, sarja) {
    if (!data || !joukkue || !sarja) {
        return;
    }
    let sarjat = data.sarjat;
    let loytyi = sarjat.find(i => i === sarja);
    if (loytyi) {
        joukkue.sarja = sarja;
        data.joukkueet.push(joukkue);
    }
}

/**
 * Muuttaa sarjan nimen. Jos vanhaa sarjaa ei löydy, funktio ei tee mitään.
 * @param {Object} data 
 * @param {string} vanhanimi - Muokattavan sarjan nimi.
 * @param {string} uusinimi - Uuden sarjan nimi.
 */
function muutaSarjanNimi(data, vanhanimi, uusinimi) {
    let sarjat = data.sarjat;
    for (let sarja of sarjat) {
        if (sarja.nimi === vanhanimi) {
            sarja.nimi = uusinimi;
            break;
        }
    }
}

// Tulostaa rastien koodit aakkosjärjestyksessä ';':lla eroteltuna.
function tulostaRastit(data) {
    let rastit = Array.from(data.rastit, rasti => rasti.koodi);
    let alkaaNumerolla = /\b\d/; // Ensimmäisen merkin on oltava numero.
    rastit = rastit.filter(rasti => alkaaNumerolla.test(rasti));
    rastit.sort();
    log(rastit.join(';') + ";");
}

// Etsii sarjan nimen perusteella. Palauttaa undefined, jos ei löydy.
function etsiSarja(sarjat, nimi) {
    let kaikkiSarjat = sarjat;
    let loytyi;
    for (const sarja of kaikkiSarjat) {
        if (sarja.nimi == nimi) {
            loytyi = sarja;
            return loytyi;
        }
    }
}

let malliJoukkue = { 
    "nimi": "Mallijoukkue",
        "jasenet": [
            "Lammi Tohtonen",
            "Matti Meikäläinen"
        ],
        "leimaustapa": [0,2],
        "rastit": [],
        "sarja": {},
        "id": 99999
    };
let sarja8h = etsiSarja(data.sarjat, "8h");
lisaaJoukkue(data, malliJoukkue, sarja8h);
muutaSarjanNimi(data, "8h", "10h");
tulostaJoukkueet(data);
log("");
tulostaRastit(data);

// Taso 3

log("");
log("----------");
log("Taso 3");
log("----------");
log("");

/**
 * Poistaa annettua nimeä vastaavan joukkueen datasta. Jos vastaavaa nimeä ei
 * löydy, funktio ei tee mitään.
 * @param {Object} data 
 * @param {string} nimi - Poistettavan joukkueen nimi.
 */
function poistaJoukkue(data, nimi) {
    let joukkueet = data.joukkueet;
    for (let i = 0; i < joukkueet.length; i++) {
        if (nimi === joukkueet[i].nimi) {
            joukkueet.splice(i, 1);
            break;
        }
    }
}

/**
 * Vaihtaa pyydetyn rastileimauksen sijalle uuden rastin.
 * @param {Object} joukkue
 * @param {number} rastinIdx - rastin paikka joukkue.rastit-taulukossa
 * @param {Object} uusirasti
 * @param {string} Aika - Rastileimauksen aika. Jos tätä ei anneta, käytetään samaa aikaa kuin vanhassa korvattavassa leimauksessa
 */
function vaihdaRasti(joukkue, rastinIdx, uusirasti, aika) {
    const rastit = data.rastit;
    const loytyi = rastit.find(rasti => rasti === uusirasti);
    if (loytyi) {
        const loytyiRastit = Array.isArray(joukkue["rastit"]);
        if (loytyiRastit) {
            let joukkueRastit = joukkue.rastit;
            const indexOk = (1 <= rastinIdx && rastinIdx <= joukkueRastit.length);
            if (indexOk) {
                let rastileimaus = {
                    "aika": "",
                    "rasti": uusirasti
                };
                if (aika) {
                    rastileimaus.aika = aika;
                } else {
                    rastileimaus.aika = joukkueRastit[rastinIdx - 1].aika;
                }
                joukkueRastit.splice(rastinIdx - 1, 1, rastileimaus);
            }
        }
    }
}

/**
 * Etsii annettua nimeä vastaavan joukkueen datasta. Välilyönneillä merkkijonon
 * alussa ja lopussa sekä kirjaiten koolla ei ole merkitystä vastaavaa joukkuetta
 * etsittäessä.
 * @param {Object} data 
 * @param {string} nimi - Etsittävän joukkueen nimi.
 * @returns {Object} joukkue - Palauttaa löydetyn joukkueen tai undefined.
 */
function etsiJoukkue(data, nimi) {
    let joukkueet = data.joukkueet;
    let onSama = new RegExp(nimi.trim().toUpperCase());
    let joukkue = joukkueet.find(i => onSama.test(i.nimi.toUpperCase()));
    return joukkue;
}

/**
 * Etsii datasta annettua koodia vastaavan rastin ja palauttaa sen.
 * @param {Object} data 
 * @param {string} koodi 
 * @returns {Object} rasti - Palauttaa löydetyn rastin tai undefined
 */
function etsiRasti(data, koodi) {
    let rastit = data.rastit;
    let rasti = rastit.find(i => i.koodi == koodi);
    return rasti;
}

/** 
 * Tulostaa joukkueiden nimet ja pisteet pisteiden mukaan laskevassa järjestyksessä.
 * Toissijainen järjestys määräytyy nimen mukaan. 
 */
function tulostaPisteet(data) {
    let joukkueet = data.joukkueet;
    let joukkueetJaPisteet = [];
    for (let joukkue of joukkueet) {
        joukkueetJaPisteet.push([joukkue.nimi, laskePisteet(joukkue)]);
    }
    joukkueetJaPisteet.sort(pisteetJaNimet);
    for (let [joukkue, pisteet] of joukkueetJaPisteet) {
        log(joukkue.trim() + " (" + pisteet + " p)");
    }
}

// Vertailufunktio, joka järjestää ensin pisteiden ja sen jälkeen nimien mukaan.
function pisteetJaNimet(a, b) {
    let pisteetA = a[1];
    let pisteetB = b[1];
    let nimiA = a[0].trim().toUpperCase();
    let nimiB = b[0].trim().toUpperCase();
    if (pisteetA < pisteetB) {
        return 1;
    }
    if (pisteetA > pisteetB) {
        return -1;
    }
    if (nimiA < nimiB) {
        return -1;
    }
    if (nimiA > nimiB) {
        return 1;
    }
    return 0;
}

// Laskee joukkueen pisteet.
function laskePisteet(joukkue) {
    let leimaukset = Array.from(joukkue.rastit, leimaus => leimaus.rasti);
    let rastit = leimaukset.filter(leimaus => {
        if (leimaus) {
            return leimaus.hasOwnProperty('koodi');
        } else {
            return false;
        }
    });
    let koodit = Array.from(rastit, rasti => rasti.koodi);
    let lahto = koodit.lastIndexOf("LAHTO");
    koodit.splice(0, lahto + 1);
    let maali = koodit.indexOf("MAALI");
    koodit.splice(maali);
    
    let pisteet = 0;
    let uniikit = new Set(koodit);
    uniikit.forEach(x => {
        let rastinPisteet = parseInt(x[0]);
        if (rastinPisteet) {
            pisteet += rastinPisteet;
        }
        return;
    });
    return pisteet;
}

poistaJoukkue(data, "Vara 1");
poistaJoukkue(data, "Vara 2");
poistaJoukkue(data, "Vapaat");
let joukkueDD = etsiJoukkue(data, "Dynamic Duo");
let uusirasti = etsiRasti(data, 32);
vaihdaRasti(joukkueDD, 74, uusirasti);
tulostaPisteet(data);

// Taso 5

log("");
log("----------");
log("TASO 5");
log("----------");
log("");

/**
 * Tulostaa joukkueiden nimet, pisteet, kuljetut matkat ja matkoihin käytetyt ajat.
 * Joukkueet ovat ensisijaisesti pisteiden mukaan järjestyksessä. Toissijaiseti
 * ajan mukaan ja lopuksi nimen mukaan aakkosjärjestyksessä.
 */
function tulostaTaso5(data) { // nimet, pisteet, kuljettu matka ja käyttämä aika
    let joukkueet = data.joukkueet;
    let nimetPisteetMatkatJaAjat = []; 
    for (const joukkue of joukkueet) {
        nimetPisteetMatkatJaAjat.push([joukkue.nimi, 
                                       laskePisteet(joukkue),
                                       laskeMatka(joukkue), 
                                       laskeAika(joukkue)]);
    }
    nimetPisteetMatkatJaAjat.sort(pisteetAikaJaNimi);
    for (let tiedot of nimetPisteetMatkatJaAjat) {
        log(tiedot[0] + ", " + tiedot[1] + " p, " + tiedot[2] + " km, " + hhmmss(tiedot[3]));
    }
}

// Vertailufunktio, joka järjestää pisteiden, ajan ja nimen perusteella.
function pisteetAikaJaNimi(a, b) {
    let pisteetA = a[1];
    let pisteetB = b[1];
    let aikaA = a[3];
    let aikaB = b[3];
    let nimiA = a[0].trim().toUpperCase();
    let nimiB = b[0].trim().toUpperCase();
    if (pisteetA < pisteetB) {
        return 1;
    }
    if (pisteetA > pisteetB) {
        return -1;
    }
    if (aikaA < aikaB) {
        return -1;
    }
    if (aikaA > aikaB) {
        return 1;
    }
    if (nimiA < nimiB) {
        return -1;
    }
    if (nimiA > nimiB) {
        return 1;
    }
    return 0;
}

// Laskee joukkueen kulkeman matkan kilometreihin pyöristettynä.
function laskeMatka(joukkue) {
    let leimaukset = Array.from(joukkue.rastit, leimaus => leimaus.rasti);
    let rastit = leimaukset.filter(leimaus => {
        if (leimaus) {
            return leimaus.hasOwnProperty('koodi');
        } else {
            return false;
        }
    });
    let lahto = rastit.lastIndexOf(etsiRasti(data,'LAHTO'));
    rastit.splice(0, lahto);
    let maali = rastit.indexOf(etsiRasti(data, "MAALI"));
    rastit.splice(maali + 1);
    
    let matkaKm = 0;
    let uniikit = Array.from(new Set(rastit));
    for (let i = 0; i < uniikit.length - 1; i++) {
        matkaKm += getDistanceFromLatLonInKm(uniikit[i].lat, uniikit[i].lon, uniikit[i+1].lat, uniikit[i+1].lon);
    }
    return Math.round(matkaKm);
}

// Laskee joukkueen käyttämän ajan millisekuntteina.
function laskeAika(joukkue) {
    let leimaukset = Array.from(joukkue.rastit);
    leimaukset = leimaukset.filter(leimaus => {
        if (leimaus.rasti) {
            return leimaus.rasti.hasOwnProperty('koodi');
        } else {
            return false;
        }
    });
    let lahtoleimaus, maalileimaus;
    let lahto; // Otetaan viimeisen lähtöleimauksen indeksi talteen.
    for (let i = leimaukset.length - 1; i >= 0; i--) {
        let leimaus = leimaukset[i];
        let rasti = leimaus.rasti;
        let koodi = rasti.koodi;
        if (koodi == "LAHTO") {
            lahtoleimaus = leimaus;
            lahto = i;
            break;
        }
    }
    for (let i = lahto + 1; i < leimaukset.length; i++) { // Aloitetaan viimeisen lähdön jälkeen.
        let leimaus = leimaukset[i];
        let rasti = leimaus.rasti;
        let koodi = rasti.koodi;
        if (koodi == "MAALI") {
            maalileimaus = leimaus;
            break;
        }
    }
    let aikaMs = 0;
    if (lahtoleimaus && maalileimaus) {
        let lahtoaika = new Date(lahtoleimaus.aika);
        let maaliaika = new Date(maalileimaus.aika);
        aikaMs = maaliaika.getTime() - lahtoaika.getTime();
    }
    return aikaMs;
}

/**
 * Muuntaa millisekuntteina annetun ajan helpommin luettavaan muotoon
 * tunnit:minuutit:sekunnit. Palauttaa stringin.
 */
function hhmmss(aikaMs) {
    let tunnit = Math.floor(aikaMs / (60 * 60 * 1000));
    let minuutit = Math.floor((aikaMs - (tunnit * 60 * 60 * 1000)) / (60 * 1000));
    let sekunnit = Math.floor((aikaMs - (tunnit * 60 * 60 * 1000) - (minuutit * 60 * 1000)) / 1000);
    let hhmmss = tunnit.toString().padStart(2, '0') + ":" + 
                 minuutit.toString().padStart(2, '0') + ":" + 
                 sekunnit.toString().padStart(2, '0'); 
    return hhmmss;
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}
  
function deg2rad(deg) {
    return deg * (Math.PI/180);
}

tulostaTaso5(data);

// Seuraavilla voit tutkia selaimen konsolissa käytössäsi olevaa tietorakennetta. 

console.log(data);
console.dir(data);