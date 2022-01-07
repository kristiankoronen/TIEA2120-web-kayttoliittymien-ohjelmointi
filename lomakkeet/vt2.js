"use strict";
//@ts-check 
// data-muuttuja on lähes sama kuin viikkotehtävässä 1.
console.log(data);

// Luo objektin sarjoista, jossa avaimena kyseisen sarjan id
// ja arvona sarja-objekti itse.
function haeSarjat() {
    let objSarjoille = {};
    
    let dataSarjat = data.sarjat;
    for (let sarja of dataSarjat) {
        let id = sarja.id;
        objSarjoille[id] = sarja;
    }

    return objSarjoille;
}
let sarjat = haeSarjat();

// Luo objektin rasteista, jossa avaimena kyseisen rastin id
// ja arvona rasti-objekti itse.
function haeRastit() {
    let objRasteille = {};

    let dataRastit = data.rastit;
    for (let rasti of dataRastit) {
        let id = rasti.id;
        objRasteille[id] = rasti;
    }

    return objRasteille;
}
let rastit = haeRastit();

window.addEventListener("load", function() {
    let taulukko = this.document.getElementsByTagName("table")[0];
    let otsikot = taulukko.firstChild.nextElementSibling.nextElementSibling;
    let otsikkoPisteet = document.createElement("th");
    otsikkoPisteet.textContent = "Pisteet";
    otsikot.appendChild(otsikkoPisteet);

    // Luo rivi-elementin, jossa solut joukkueen sarjalle, nimelle, jasenille ja pisteille.
    function luoTaulukkoRivi(joukkueviite, sarja, joukkue, jasenet, pisteet) {
        let rivi = document.createElement("tr");
        let soluSarja = document.createElement("td");
        soluSarja.textContent = sarja;

        let soluJoukkue = document.createElement("td");
        let joukkueenNimi = document.createElement("a");
        joukkueenNimi.setAttribute("href", "#joukkuelomake");
        joukkueenNimi.textContent = joukkue;
        joukkueenNimi.joukkueviite = joukkueviite;
        joukkueenNimi.addEventListener("click", muokkaaJoukkuetta);

        let br = document.createElement("br");

        let jasentenNimet = document.createTextNode(jasenet.join(', '));

        soluJoukkue.appendChild(joukkueenNimi);
        soluJoukkue.appendChild(br);
        soluJoukkue.appendChild(jasentenNimet);

        let soluPisteet = document.createElement("td");
        soluPisteet.textContent = pisteet + " p";

        rivi.appendChild(soluSarja);
        rivi.appendChild(soluJoukkue);
        rivi.appendChild(soluPisteet);

        return rivi;
    }

    // Lisää taulukkoon rivit parametrina annetun taulukon mukaisessa
    // järjestyksessä.
    function luoTaulukkoRivit(joukkueet) {
        for (let joukkue of joukkueet) {
            let rivi = luoTaulukkoRivi(joukkue.viite, joukkue.sarja, joukkue.nimi, joukkue.jasenet, joukkue.pisteet);
            taulukko.appendChild(rivi);
        }
    }
    luoTaulukkoRivit(tuloslistaus());

    // Päivittää tulokset.
    function tuloksetUudestaan() {
        let rivit = taulukko.rows;
        for (let i = rivit.length - 1; i >= 1; i--) {
            taulukko.deleteRow(i);
        }
        luoTaulukkoRivit(tuloslistaus());
    }

    let rastilomake = document.getElementsByTagName("form")[0];
    
    // Luo lomakkeen rastien lisäystä varten.
    function luoRastiLomake() {
        let rastifieldset = document.createElement("fieldset");
        rastilomake.appendChild(rastifieldset);

        let otsikko = document.createElement("legend");
        otsikko.textContent = "Rastin tiedot";
        rastifieldset.appendChild(otsikko);

        let lat = luoJasenKentta("Lat");
        rastifieldset.appendChild(lat);
        let lon = luoJasenKentta("Lon");
        rastifieldset.appendChild(lon);
        let koodi = luoJasenKentta("Koodi");
        rastifieldset.appendChild(koodi);

        let painike = document.createElement("button");
        painike.setAttribute("id", "rasti");
        painike.textContent = "Lisää rasti";
        rastifieldset.appendChild(painike);
    }
    luoRastiLomake();

    // Lisaa rastin tietorakenteeseen, jos tiedot on annettu oikein.
    function lisaaRasti(e) {
        e.preventDefault();
        if (tarkistaRastinTiedot()) {
            let tiedot = rastilomake.getElementsByTagName("input");
            let koodi = tiedot[2].value.trim(), lon = tiedot[1].value, lat = tiedot[0].value;
            let uusi = { 
                        "lon": lon,
                        "koodi": koodi,
                        "lat": lat,
                        "id": uusiId(data.rastit)
                       };
            data.rastit.push(uusi);
            rastilomake.reset();
            tulostaRastit();
            rastit = haeRastit();
        }
    }

    // Tarkistaa annetut tiedot ja palauttaa true, jos ok tai false jos ei.
    function tarkistaRastinTiedot() {
        let rastinTiedot = rastilomake.getElementsByTagName("input");
        let latOk = Number(rastinTiedot[0].value);
        let lonOk = Number(rastinTiedot[1].value);
        let koodiOk = rastinTiedot[2].value.trim() !== "";
        if (latOk && lonOk && koodiOk) {
            return true;
        } else {
            return false;
        }
    }

    let lisaaRastiPainike = document.getElementById("rasti");
    lisaaRastiPainike.addEventListener("click", lisaaRasti);

    let joukkuelomake = document.getElementById("joukkuelomake");
    joukkuelomake.joukkueviite = {};

    // Luodaan pohja lomakkeelle, joka käsittelee uuden joukkueen lisäyksen
    // ja vanhan muokkauksen.
    function luoJoukkuelomakePohja() {
        let uusiJoukkue = joukkuelomake.firstElementChild;
        let lisaaPainike = uusiJoukkue.lastElementChild.previousElementSibling; // Haetaan lisää joukkue painike.
    
        let jasenetField = document.createElement("fieldset");
        let otsikko = document.createElement("legend");
        otsikko.textContent = "Jäsenet";
        jasenetField.appendChild(otsikko);
    
        uusiJoukkue.insertBefore(jasenetField, lisaaPainike); // Lisätään jäsenet ennen painikkeita.
    
        let jasen1 = luoJasenKentta("Jäsen 1");
        jasenetField.appendChild(jasen1);
    
        let jasen2 = luoJasenKentta("Jäsen 2");
        jasenetField.appendChild(jasen2);
    }    
    luoJoukkuelomakePohja();

    let joukkueFieldset = joukkuelomake.getElementsByTagName("fieldset")[0];
    let lomakeotsikko = joukkueFieldset.firstElementChild;
    let joukkueenNimi = joukkueFieldset.getElementsByTagName("input")[0];
    joukkueenNimi.addEventListener("input", lisaaUusiJasenKentta);
    
    let jasenet = joukkuelomake.getElementsByTagName("fieldset")[1];
    let inputit = jasenet.getElementsByTagName("input");
    for (let input of inputit) {
        input.addEventListener("input", lisaaUusiJasenKentta);
    }

    // Kopion tämän malliesimerkistä! (Tietty hieman muokaten)
    function lisaaUusiJasenKentta() {
        let tyhja = false;

        for (let i = inputit.length - 1; i >= 0; i--) { // Jäseniä on oltava aina vähintään 2.
            let input = inputit[i];                     // Siksi lopetetaan i >= 1.
            if (input.value.trim() == "" && tyhja && inputit.length > 2) {
                inputit[i].parentNode.remove();
            }
            if (input.value.trim() == "") {
                    tyhja = true;
            }
        }

        if (!tyhja) {
            let uusi = luoJasenKentta("Jäsen");
            let input = uusi.lastChild;
            input.addEventListener("input", lisaaUusiJasenKentta);
            jasenet.appendChild(uusi);
        }

        // tehdään kenttiin numerointi
        for (let i = 0; i < inputit.length; i++) {
                let label = inputit[i].parentNode;
                label.firstChild.textContent = "Jäsen " + (i + 1);
        }

        // Painike käytettävissä, jos kentät ok.
        let nimi = joukkueenNimi.value.trim();
        if (inputit.length > 2 && nimi !== "") {
            lisaaJoukkuePainike.disabled = false;
        } else {
            lisaaJoukkuePainike.disabled = true;
        }
    }

    // Lisää joukkueen dataan.
    function lisaaJoukkue(e) {
        e.preventDefault();
        let nimi = joukkueenNimi.value.trim();

        if (inputit.length > 2 && nimi !== "") {
            let jasenet = [];
            for (let input of inputit) {
                jasenet.push(input.value);
            }
            jasenet.pop(); // viimeinen tyhjä kenttä pois
            
            let uusiJoukkue = {
                "nimi": nimi,
                "id": uusiId(data.joukkueet),
                "sarja": etsiSarjaId("8h"),
                "rastit": [],
                "leimaustapa": ["GPS"],
                "jasenet": jasenet
            };
            data.joukkueet.push(uusiJoukkue);

            joukkuelomake.reset();
            tuloksetUudestaan();
            lisaaUusiJasenKentta();
        }
    }

    // Täyttää lomakkeen joukkueen muokkausta varten.
    function muokkaaJoukkuetta(e) {
        lomakeotsikko.textContent = "Tallenna muutokset";
        joukkuelomake.reset();
        
        lisaaJoukkuePainike.hidden = true;
        tallennaPainike.hidden = false;
        
        let joukkue = e.target.joukkueviite;
        joukkuelomake.joukkueviite = joukkue;
        joukkueenNimi.value = joukkue.nimi;

        let memberit = joukkue.jasenet;
        for (let i = 0; i < memberit.length; i++) {
            inputit[i].value = memberit[i];
            lisaaUusiJasenKentta();
        }
    } 

    // Tallentaa joukkueeseen tehdyt muutokset.
    function tallennaMuutokset(e) {
        e.preventDefault();

        let kohdejoukkue = joukkuelomake.joukkueviite;
        console.log(kohdejoukkue);
        kohdejoukkue.nimi = joukkueenNimi.value;

        let uudetJasenet = [];
        for (let input of inputit) {
            uudetJasenet.push(input.value.trim());
        }
        uudetJasenet.pop(); // Viimeinen tyhjä kenttä pois.
        kohdejoukkue.jasenet = uudetJasenet;

        joukkuelomake.reset();
        lisaaUusiJasenKentta();
        tuloksetUudestaan();

        lisaaJoukkuePainike.hidden = false;
        tallennaPainike.hidden = true;
        lomakeotsikko.textContent = "Uusi joukkue";
    }

    let lisaaJoukkuePainike = joukkueFieldset.lastElementChild.previousElementSibling.lastChild;
    lisaaJoukkuePainike.addEventListener("click", lisaaJoukkue);
    lisaaJoukkuePainike.disabled = true;

    let tallennaPainike = joukkueFieldset.lastElementChild.lastChild;
    tallennaPainike.addEventListener("click", tallennaMuutokset);
    tallennaPainike.hidden = true;
});

// Järjestää joukkueet ensin sarjojen ja sitten joukkueiden
// nimien mukaiseen järjestykseen. Palauttaa järjestetyn 
// taulukon.
function tuloslistaus() {
    let sarjatJaJoukkueet = [];
    let joukkueet = data.joukkueet;
    for (let joukkue of joukkueet) {
        let nimi = joukkue.nimi;
        let sarja = sarjat[joukkue.sarja].nimi;
        let jasenet = joukkue.jasenet;
        let pisteet = laskePisteet(joukkue);
        sarjatJaJoukkueet.push({ 
                                "nimi": nimi, 
                                "sarja": sarja,
                                "jasenet": jasenet,
                                "pisteet": pisteet,
                                "viite": joukkue
                                });
    }
    sarjatJaJoukkueet.sort(sarjatPisteetJaNimet);
    return sarjatJaJoukkueet;
}

// Vertailufunktio, joka järjestää ensin sarjan ja sitten
// joukkueen nimen mukaan.
function sarjatJaNimet(a, b) {
    let sarjaA = a.sarja.trim().toUpperCase();
    let sarjaB = b.sarja.trim().toUpperCase();
    let nimiA = a.nimi.trim().toUpperCase();
    let nimiB = b.nimi.trim().toUpperCase();
    if (sarjaA > sarjaB) {
        return 1;
    }
    if (sarjaA < sarjaB) {
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

function sarjatPisteetJaNimet(a, b) {
    let sarjaA = a.sarja;
    let sarjaB = b.sarja;
    let pisteetA = a.pisteet;
    let pisteetB = b.pisteet;
    let nimiA = a.nimi.trim().toUpperCase();
    let nimiB = b.nimi.trim().toUpperCase();
    if (sarjaA < sarjaB) {
        return -1;
    }
    if (sarjaA > sarjaB) {
        return 1;
    }
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

// Luo yhden parametrina annetun nimen mukaisen lomakekentän.
function luoJasenKentta(nimi) {
    let label = document.createElement("label");
    let span = document.createElement("span");
    span.textContent = nimi;
    label.appendChild(span);

    let input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("value", "");
    label.appendChild(input);

    return label;
}

// Etsii taulukon suurimman id:n ja palauttaa tätä yhtä suuremman luvun.
function uusiId(t) {
    let suurinId = Number.MIN_SAFE_INTEGER;
    for (let alkio of t) {
        if (alkio.id > suurinId) {
            suurinId = alkio.id;
        }
    }
    return suurinId + 1;
}

// Tulostaa kaikkien rastien koodit ja koordinaatit rastikoodien
// mukaan aakkosjärjestyksessä.
function tulostaRastit() {
    let rastit = Array.from(data.rastit);
    rastit.sort(rastikoodit);

    console.log("Rasti".padEnd(15) + 
                "Lat".padEnd(13) + 
                "Lon");
    for (let rasti of rastit) {
        console.log(rasti.koodi.padEnd(15) + 
                    rasti.lat.padEnd(13) + 
                    rasti.lon);
    }
}

// Vertailufunktio, joka järjestää rastikoodien mukaan.
function rastikoodit(a, b) {
    let rastiA = a.koodi.trim().toUpperCase();
    let rastiB = b.koodi.trim().toUpperCase();
    if (rastiA > rastiB) {
        return 1;
    }
    if (rastiA < rastiB) {
        return -1;
    }
    return 0;
}

// Laskee joukkueen pisteet.
function laskePisteet(joukkue) {
    rastit = haeRastit();
    let leimaukset = Array.from(joukkue.rastit, leimaus => leimaus.rasti);
    let joukkueenRastit = leimaukset.filter(leimaus => rastit[leimaus]);
    let koodit = Array.from(joukkueenRastit, id => rastit[id].koodi);

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

// Hakee datasta sarjan nimeä vastaavan sarjan id:n.
function etsiSarjaId(nimi) {
    for (let sarja of data.sarjat) {
        if (sarja.nimi == nimi) {
            return sarja.id;
        }
    }
}

