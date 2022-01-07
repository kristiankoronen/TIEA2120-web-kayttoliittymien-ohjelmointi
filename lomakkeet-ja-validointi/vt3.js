"use strict";  // pidä tämä ensimmäisenä rivinä
//@ts-check 

console.log(data);

// Apufunktio järjestämiseen.
function aakkosjarjestykseen(a, b) {
  const nimiA = a.nimi.trim().toUpperCase();
  const nimiB = b.nimi.trim().toUpperCase();
  if (nimiA < nimiB) {
    return -1;
  }
  if (nimiA > nimiB) {
      return 1;
  }
  return 0;
}

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

// Etsii taulukon suurimman id:n ja palauttaa yhden suuremman luvun.
function uusiId(taulukko) {
  let suurinId = Number.MIN_SAFE_INTEGER;
  for (let alkio of taulukko) {
      if (alkio.id > suurinId) {
          suurinId = alkio.id;
      }
  }
  return suurinId + 1;
}

class Joukkue {
  constructor(id, jasenet, leimaustapa, nimi, rastit, sarja) {
    this.id = id;
    this.jasenet = [...jasenet];
    this.leimaustapa = [...leimaustapa];
    this.nimi = nimi;
    this.rastit = [...rastit];
    this.sarja = sarja;
  }

  // Luo listaelementin, jossa on esitetty joukkueen tiedot.
  htmlListaelementissa() {
    const li = document.createElement('li');
    const a = document.createElement('a');
    
    a.setAttribute('href', '#lisaaJoukkueLomake');
    a.textContent = (`${this.nimi} `);
    a.joukkue = this;

    li.appendChild(a);
    
    const strong = document.createElement('strong');
    strong.textContent = sarjat[this.sarja].nimi;
    li.appendChild(strong);
    
    const ul = document.createElement('ul');
    
    this.jasenet.forEach((jasen) => {
      const jasenLi = document.createElement('li');
      jasenLi.textContent = jasen;
      ul.appendChild(jasenLi);
    });
    
    li.appendChild(ul);
    

    return li;
  }

  aakkosjarjestykseen() {
    this.jasenet.sort((a, b) => {
      const nimiA = a.trim().toUpperCase(); 
      const nimiB = b.trim().toUpperCase(); 
      if (nimiA < nimiB) {
        return -1;
      }
      if (nimiA > nimiB) {
        return 1;
      }
      return 0;
    });
  }
}

class Joukkueet {
  constructor(joukkueet) {
    this.joukkueet = [];
    joukkueet.forEach((joukkue) => {
      const { id, jasenet, leimaustapa, nimi, rastit, sarja } = joukkue;
      this.joukkueet.push(new Joukkue(id, jasenet, leimaustapa, nimi, rastit, sarja));
    });
  }

  paivita(joukkue) {
    const i = data.joukkueet.findIndex((x) => x.id === joukkue.id);
    data.joukkueet[i] = joukkue;
  }

  // Järjestää joukkueet aakkosjärjestykseen.
  aakkosjarjestykseen() {
    this.joukkueet.sort(aakkosjarjestykseen);
    this.joukkueet.forEach((joukkue) => (joukkue.aakkosjarjestykseen()));
  }

  // Listaa kaikki joukkueet html-listassa.
  luoListaus() {
    const listaus = document.createElement('ul');
    
    this.joukkueet.forEach((joukkue) => {
      const li = joukkue.htmlListaelementissa();
      listaus.appendChild(li);
    });

    return listaus;
  }

  /**
   * Lisää joukkueen omaan joukkueet attribuuttiin ja alkuperäiseen dataan.
   * Lisäys ylläpitää joukkeiden järjestyksen.
   */
  lisaa(joukkue) {
    this.joukkueet.push(joukkue);
    data.joukkueet.push(joukkue);
    this.aakkosjarjestykseen();
  }

  // Tarkistaa löytyykö annetulla nimellä joukkuetta.
  loytyyko(nimi, lomake) {
    // Kun muokataan joukkuetta, ei huomioida sen omaa vanhaa nimeä.
    if (lomake.muokataan) {
      return this.joukkueet.find((joukkue) => (
        joukkue.nimi.trim().toUpperCase() === nimi.trim().toUpperCase() && 
        lomake.muokattava.nimi.trim().toUpperCase() !== nimi.trim().toUpperCase()
      ));
    }
    return this.joukkueet.find((joukkue) => (  
      joukkue.nimi.trim().toUpperCase() === nimi.trim().toUpperCase()
      ));
  }

  indeksi(joukkue1) {
    return this.joukkueet.findIndex((joukkue2) => (joukkue1 === joukkue2));
  }
}

const joukkueet = new Joukkueet(data.joukkueet);

/**
 * Funktiolle annetaan parametrina sarja-objekti, jonka pohjalta luodaan 
 * radiobutton labelin sisään. Tallennetaan myös annetun sarjan id, koska
 * joukkueille tallennetaan sarja sen id:n perusteella.
 */
function luoSarjaButton(sarja) {
  const label = document.createElement('label');
  label.appendChild(document.createTextNode(sarja.nimi));
  
  const radiobutton = document.createElement('input');
  radiobutton.setAttribute('type', 'radio');
  radiobutton.setAttribute('name', 'sarja');
  radiobutton.setAttribute('required', 'required');

  // Joukkueille tallennetaan sarja sen id:n perusteella, joten laitetaan se talteeen.
  radiobutton.setAttribute('value', sarja.id);
  label.appendChild(radiobutton);
  
  return label;
}

// Luodaan sarjabuttonit div-elementin sisälle.
function luoSarjaButtonit() {
  const sarjat = [...data.sarjat];
  sarjat.sort(aakkosjarjestykseen);

  const div = document.createElement('div');
  div.setAttribute('id', 'sarjat');
  
  sarjat.forEach(sarja => {
    const button = luoSarjaButton(sarja);
    div.appendChild(button);
  });

  // Asetetaan ensimmäinen radiobutton oletuksena valituksi.
  const input1 = div.firstChild.lastChild;
  input1.setAttribute('checked', 'checked');

  return div;
}

// Luodaan checkbox labelin sisälle leimaustapaa varten.
function luoCheckboxLeimaustavalle(leimaustapa, indeksi) {
  const label = document.createElement('label');
  label.appendChild(document.createTextNode(leimaustapa));

  const checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('name', 'leimaustavat');
  checkbox.setAttribute('value', indeksi);

  label.appendChild(checkbox);

  return label;
}

// Luodaan kaikki checkboxit divin sisälle. Tallennetaan indeksit myös.
function luoCheckboxit() {
  const leimaustavat = data.leimaustapa.map((tapa, i) => ({ leimaustapa: tapa, indeksi: i }));

  leimaustavat.sort((a,b) => {
    const nimiA = a.leimaustapa.trim().toUpperCase();
    const nimiB = b.leimaustapa.trim().toUpperCase();
    if (nimiA < nimiB) {
      return -1;
    }
    if (nimiA > nimiB) {
      return 1;
    }
    return 0;
  });

  const div = document.createElement('div');
  div.setAttribute('id', 'kaikkileimaustavat');

  leimaustavat.forEach((alkio) => {
    const { leimaustapa, indeksi } = alkio;
    const label = luoCheckboxLeimaustavalle(leimaustapa, indeksi);
    div.appendChild(label);
  });

  return div;
}

// Luodaan jäsenkenttä labelin sisälle.
function luoJasenKentta(nimi) {
  let label = document.createElement("label");
  label.textContent = nimi;

  let input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("value", "");
  label.appendChild(input);

  return label;
}

// Laitetaan DOM-puuta käsittelevät operaatiot tänne.
window.addEventListener('load', function() {
  const lomake = document.forms.lisaaJoukkueLomake;
  lomake.muokataan = false;
  lomake.muokattava = {};

  const leimaustapaLomake = document.forms.uusiLeimaustapa;

  // Luodaan listaus kaikista joukkueista lomakkeen perään.
  joukkueet.aakkosjarjestykseen();

  const listaus = joukkueet.luoListaus();
  leimaustapaLomake.insertAdjacentElement('afterend', listaus);


  // Listauksen päivittäminen.
  listaus.lisaa = (joukkue) => {
    const listaelementit = listaus.childNodes;
    const indeksi = joukkueet.indeksi(joukkue);
    const li = joukkue.htmlListaelementissa();

    if (indeksi < listaelementit.length) {
      const elementti = listaelementit[indeksi];
      elementti.insertAdjacentElement('beforebegin', li);
    } else {
      const elementti = listaelementit[listaelementit.length - 1];
      elementti.insertAdjacentElement('afterend', li);
    }
    return li;
  };

  // Poistaa joukkueen listauksesta.
  listaus.poista = (joukkue) => {
    const indeksi = joukkueet.indeksi(joukkue);
    const poistettava = listaus.childNodes[indeksi];
    listaus.removeChild(poistettava);
  };

  // Siirtää joukkueen oikeaan paikkaan listauksessa.
  listaus.siirra = (joukkue) => {
    listaus.poista(joukkue);
    joukkueet.aakkosjarjestykseen();
    return listaus.lisaa(joukkue);
  };

  // Haetaan nimikenttä ja lisätään siihen tapahtumankäsittelijä.
  const joukkueenNimi = document.getElementById('joukkueenNimi');

  // Luodaan tapahtumankäsittelijä nimikentälle. Jos ok, päivitetään lisättävän joukkueen nimeä.
  function tarkistaNimi() {
    const nimi = joukkueenNimi.value.trim();

    // Jos nimi ei ole tarpeeksi pitkä, asetetaan virheilmoitus.
    if (nimi.length < 2) {
      joukkueenNimi.setCustomValidity('Joukkueen nimen on oltava vähintään kaksi merkkiä pitkä!');
      joukkueenNimi.reportValidity();
      return;
    }

    // Jos vastaavalla nimellä löytyy jo toinen joukkue, asetetaan virheilmoitus.
    if (joukkueet.loytyyko(nimi, lomake)) {
      joukkueenNimi.setCustomValidity('Valitsemasi nimi joukkueelle on jo käytössä!');
      joukkueenNimi.reportValidity();
      return;
    }

    // Jos päästään tänne asti, kaikki on ok!
    joukkueenNimi.setCustomValidity('');
  }

  joukkueenNimi.addEventListener('input', tarkistaNimi);

  // Lisätään DOM-puuhun leimaustapojen checkboxit.
  const leimaustapaDiv = document.getElementById('leimaustapa');
  const leimaustapaCheckboxitDiv = luoCheckboxit();
  leimaustapaDiv.insertAdjacentElement('afterend', leimaustapaCheckboxitDiv);
  
  // Hakee valitut leimaus tavat taulukkoon.
  let leimaustapaCheckboxit = document.querySelectorAll('input[name="leimaustavat"]');
  
  function valitut(checkboxit) {
    const leimaustavat = [...checkboxit]
      .filter((input) => input.checked)
        .map((input) => input.value);
    
    return leimaustavat;
  }

  // Asetetaan virheilmoitukset viimeiseen kenttään, jotta checkboxit pysyisivät näkyvissä.
  const viimeinenCheckbox = leimaustapaCheckboxit[leimaustapaCheckboxit.length - 1];
  viimeinenCheckbox.setCustomValidity('Valitse vähintään yksi leimaustapa.');
  
  // Tapahtumankäsittelijä varmistaa, että ainakin yksi leimaustapa on valittu.

  function tarkistaLeimaustapavalinta() {
    leimaustapaCheckboxit = document.querySelectorAll('input[name="leimaustavat"]');
    const boxit = [...leimaustapaCheckboxit];
    const min1Valittu = boxit.some((checkbox) => checkbox.checked);
    
    // Jos yhtäkään ei ole valittu, asetetaan virheilmoitus ja ilmoitetaan siitä.
    if (!min1Valittu) {
      viimeinenCheckbox.setCustomValidity('Valitse vähintään yksi leimaustapa.');
      viimeinenCheckbox.reportValidity();
      return;
    }

    // Jos päästään tänne, kaikki ok.
    viimeinenCheckbox.setCustomValidity('');
  }

  leimaustapaCheckboxitDiv.addEventListener('input', tarkistaLeimaustapavalinta);

  // Lisätään DOM-puuhun sarjabuttonit div-elementin sisällä.
  const sarjaDiv = document.getElementById('sarjadiv');
  const sarjatDiv = luoSarjaButtonit();
  sarjaDiv.appendChild(sarjatDiv);

  const sarjojenRadiobuttonit = lomake.elements['sarja'];

  /**
   * Haetaan DOM-puusta jäseninputit, jotta voimme lisätä niihin tapahtumankäsittelijät
   * myöhemmin, ja joukkueen jäsenetfieldsetin, jotta tapahtumankäsittelijä voi 
   * dynaamisesti lisätä tarpeen tullen uusia jäsenkenttiä rakenteen sisälle.
   */
  const joukkueenJasenet = document.getElementById('jasenet');
  const jasenInputit = joukkueenJasenet.getElementsByTagName('input');

  joukkueenJasenet.varoitusKentta = jasenInputit[0];
  joukkueenJasenet.varoitusKentta.setCustomValidity('Joukkueella on oltava vähintään kaksi jäsentä');

  // Etsii tyhjän jäsenkentän ja palauttaa sen.
  jasenInputit.etsiTyhja = () => {
    for (let i = 0; i < jasenInputit.length; i++) {
      if (jasenInputit[i].value === '') {
        return jasenInputit[i];
      }
    }
  };

  /** 
   * Tarkistaa, että jäseniä on lisätty tarpeeksi ja varoittaa, jos ei ole.
   * Tarkistaa myös ettei jäsenillä ole samoja nimiä.
   */
  function tarkistaJasenet(e) {
    // Tarkistetaan onko annettu vähintään kaksi joukkuetta.
    if (jasenInputit.length <= 2) {
      joukkueenJasenet.varoitusKentta.setCustomValidity('');
      joukkueenJasenet.varoitusKentta = jasenInputit.etsiTyhja();
      joukkueenJasenet.varoitusKentta.setCustomValidity('Joukkueella on oltava vähintään kaksi jäsentä');
      return;
    } 

    // Luodaan annetuista nimistä taulukko ja set. Jos niiden koot eroavat toisistaan 
    // samannimisiä jäseniä löytyy.
    const nimet = Array.from(jasenInputit).map((input) => input.value.trim().toUpperCase());
    const nimetIlmanDublikaatteja = new Set(nimet);
    
    if (nimet.length !== nimetIlmanDublikaatteja.size) {
      joukkueenJasenet.varoitusKentta.setCustomValidity('');
      e.target.setCustomValidity('Antamallasi nimellä löytyy jo jäsen joukkueestasi.');
      e.target.reportValidity();
      return;
    }

    // Jos päästään tänne, kaikki on ok. Voidaan poistaa turhat varoitukset.
    joukkueenJasenet.varoitusKentta.setCustomValidity('');
    for (const input of jasenInputit) {
      input.setCustomValidity('');
    }
  }

  joukkueenJasenet.addEventListener('input', tarkistaJasenet);

  /**
   * Luodaan tapahtumankäsittelijä jäsen kentille. Luo tarvittaessa
   * uusia jäsenkenttiä lomakkeeseen. Jäsenkenttiä on aina vähintään 2.
   * Kopion tämän malliesimerkistä! (Tietty hieman muokaten)
   */
  function lisaaUusiJasenKentta() {
    let tyhja = false;

    // Jäseniä on oltava aina vähintään 2. Siksi lopetetaan i >= 1.
    for (let i = jasenInputit.length - 1; i >= 0; i--) {
      const input = jasenInputit[i];

      if (input.value.trim() === "" && tyhja && jasenInputit.length > 2) {
        jasenInputit[i].parentNode.remove();
      }

      if (input.value.trim() === "") {
        tyhja = true;
      }
    }

    // Luodaan uusi kenttä, jos ei ole tyhjää.
    if (!tyhja) {
      const uusi = luoJasenKentta('Jäsen');
      const input = uusi.lastChild;
      input.addEventListener('input', lisaaUusiJasenKentta);
      joukkueenJasenet.appendChild(uusi);
    }

    // Tehdään kenttiin numerointi.
    for (let i = 0; i < jasenInputit.length; i++) {
      const label = jasenInputit[i].parentNode;
      label.firstChild.textContent = "Jäsen " + (i + 1);
    }
  }

  // Lisätään kaikkiin jäseninputteihin tapahtumankäsittelijät.
  for (const input of jasenInputit) {
    // Poistetaan vanha ensin.
    input.removeEventListener('input', lisaaUusiJasenKentta);
    input.addEventListener('input', lisaaUusiJasenKentta);
  }

  // Tyhjentää lomakkeen.
  function tyhjennaLomake() {
    // Tyhjennetään lomake.
    lomake.reset();
    lisaaUusiJasenKentta();

    // Asetetaan tarpeelliset virheilmoitukset takaisin päälle.
    joukkueenNimi.setCustomValidity('Joukkueen nimen on oltava vähintään kaksi merkkiä pitkä!');
    viimeinenCheckbox.setCustomValidity('Valitse vähintään yksi leimaustapa.');
    joukkueenJasenet.varoitusKentta = jasenInputit[0];
    joukkueenJasenet.varoitusKentta.setCustomValidity('Joukkueella on oltava vähintään kaksi jäsentä');
  }

  // Täyttää lomakkeen joukkueen muokkausta varten.
  function muokkaaJoukkuetta(e) {
    // Tyhjennetään lomake ja poistetaan turhat varoitukset.
    lomake.reset();
    joukkueenNimi.setCustomValidity('');
    joukkueenJasenet.varoitusKentta.setCustomValidity('');
    viimeinenCheckbox.setCustomValidity('');

    const joukkue = e.target.joukkue;
    joukkueenNimi.value = joukkue.nimi;

    // Laitetaan lomakkeeseen oikeat leimaustavat valituksi.
    const leimaustavat = e.target.joukkue.leimaustapa;
    for (const i of leimaustavat) {
      for (const cbox of leimaustapaCheckboxit) {
        if (cbox.value == i) {
          cbox.checked = true;
          break;
        }
      }
    }

    // Valitaan oikea sarja.
    const sarja = e.target.joukkue.sarja;
    for (const button of sarjojenRadiobuttonit) {
      if (button.value == sarja) {
        button.checked = true;
        break;
      }
    }

    // Lisätään joukkueen jäsenet jäsenkenttiin.
    let memberit = e.target.joukkue.jasenet;
    for (let i = 0; i < memberit.length; i++) {
        jasenInputit[i].value = memberit[i];
        lisaaUusiJasenKentta();
    }

    // Lopuksi vaihdetaan lomake muokkaustilaan.
    lomake.muokataan = true;
    lomake.muokattava = joukkue;
  }

  // Hakee jäsenten nimet taulukkoon lomakkeesta.
  function haeJasenet() {    
    // Haetaan jäsenet kentistä.
    let jasenet = [];
    for (let input of jasenInputit) {
        jasenet.push(input.value);
    }
    // Viimeinen kenttä on aina tyhjä, joten jätetään se pois.
    jasenet.pop();

    return jasenet;
  }

  // Käsittelee muutoksien tallentamisen.
  function tallennaMuutokset() {
    const muokattuJoukkue = lomake.muokattava;
    
    // Tallennetaan muutokset muokattavaan joukkueeseen.
    muokattuJoukkue.jasenet = haeJasenet();
    muokattuJoukkue.leimaustapa = valitut(document.querySelectorAll('input[name="leimaustavat"]'));
    muokattuJoukkue.nimi = joukkueenNimi.value;
    muokattuJoukkue.sarja = sarjojenRadiobuttonit.value;
    muokattuJoukkue.aakkosjarjestykseen();
    
    // Päivitetään joukkueita ja siirretään muokatun joukkueen paikkaa listauksessa.
    joukkueet.paivita(muokattuJoukkue);
    listaus.siirra(muokattuJoukkue).firstChild.addEventListener('click', muokkaaJoukkuetta);
    
    // Lopuksi päivitetään lomakkeen tilaa muokkauksesta pois ja tyhjennetään lomake.
    lomake.muokataan = false;
    tyhjennaLomake();
  }

  // Käsittelee uuden joukkueen lisäyksen ja muutoksien tallentamisen.
  function tallennaJoukkue(e) {
    e.preventDefault();
    
    // Tarkistetaan on lomake täytetty oikein.
    if (!lomake.checkValidity()) {
      lomake.reportValidity();
      return;
    }

    // Jos joukkuetta muokataan tallennetaan mahdolliset muokkaukset. 
    // Muuten jatketaan uuden lisäystä.
    if (lomake.muokataan) {
      tallennaMuutokset();
      return;
    }

    // Luodaan uusi joukkue lomakkeen tiedoista.
    const uusiJoukkue = new Joukkue(
      uusiId(data.joukkueet),
      haeJasenet(),
      valitut(document.querySelectorAll('input[name="leimaustavat"]')),
      joukkueenNimi.value,
      [],
      sarjojenRadiobuttonit.value
    );
    
    // Lisätään joukkue tietorakenteisiin ja listaan.
    joukkueet.lisaa(uusiJoukkue);
    listaus.lisaa(uusiJoukkue).firstChild.addEventListener('click', muokkaaJoukkuetta);
    
    // Lopuksi tyhjätään lomake.
    tyhjennaLomake();
  }

  const tallennaJoukkuePainike = document.getElementById('tallennaJoukkue');
  tallennaJoukkuePainike.addEventListener('click', tallennaJoukkue);

  // Tarkistaa onko annettu leimaustapa ok ja kertoo mahdollisista virheistä.
  function tarkistaLeimaustapa(e) {
    const leimaustavat = data.leimaustapa;
    const nimi = e.currentTarget.value.trim().toUpperCase();

    // Jos annetun nimen pituus < 2, niin asetetaan virheilmoitus.
    if (nimi.length < 2) {
      e.currentTarget.setCustomValidity('Nimen on oltava vähintään 2 merkkiä pitkä.');
      return;
    }

    // Jos annettu nimi on jo jollain toisella leimaustavalla, asetetaan virheilmoitus.
    const loytyi = leimaustavat.find((tapa) => tapa.trim().toUpperCase() === nimi);
    if (loytyi) {
      e.currentTarget.setCustomValidity('Leimaustavan nimi on jo käytössä.');
      e.currentTarget.reportValidity();
      return;
    }
    
    // Jos päästään tänne asti, kaikki on ok. Voidaan poistaa virheilmoitukset.
    e.currentTarget.setCustomValidity('');
  }

  const leimaustapaInput = document.getElementById('leimaustavanNimi');
  leimaustapaInput.addEventListener('input', tarkistaLeimaustapa);
  leimaustapaInput.setCustomValidity('Nimen on oltava vähintään 2 merkkiä pitkä.');

  // Käsittelee uuden leimaustavan tallentamisen ja tekee tarvittavat muutokset lomakkeeseen.
  function tallennaLeimaustapa(e) {
    e.preventDefault();

    if (!leimaustapaLomake.checkValidity()) {
      leimaustapaLomake.reportValidity();
      return;
    }

    // Lisätään leimaustapa dataan.
    const nimi = leimaustapaInput.value.trim();
    data.leimaustapa.push(nimi);
    
    // Koska lisäsimme leimaustavan taulukon loppuun sen indeksi on taulukon pituus - 1.
    const i = data.leimaustapa.length - 1;
    const uusiCheckbox = luoCheckboxLeimaustavalle(nimi, i);

    const leimaustavat = [...data.leimaustapa];

    // Järjestetään leimaustavat aakkosjärjestykseen. Kun kaikki leimaustavat ovat
    // valmiiksi aakkosjärjestyksessä, voimme käyttää uuden leimaustavan indeksiä
    // apuna, kun lisäämme sen lomakkeeseen.
    leimaustavat.sort((a,b) => {
      const nimiA = a.trim().toUpperCase();
      const nimiB = b.trim().toUpperCase();
      if (nimiA < nimiB) {
        return -1;
      }
      if (nimiA > nimiB) {
        return 1;
      }
      return 0;
    });

    // Etsitään uudelle leimaustavalle oikea paikka lomakkeessa indeksin perusteella.
    const uusiPaikka = leimaustavat.findIndex((tapa) => tapa === nimi);
    const leimausLabelit = leimaustapaCheckboxitDiv.childNodes;

    if (uusiPaikka < leimausLabelit.length) {
      leimausLabelit[uusiPaikka].insertAdjacentElement('beforebegin', uusiCheckbox);
    } else {
      leimausLabelit[leimausLabelit.length - 1].insertAdjacentElement('afterend', uusiCheckbox);
    }

    // Lopuksi tyhjennetään lomake ja asetetaan virheilmoitukset oikein.
    leimaustapaLomake.reset();
    leimaustapaInput.setCustomValidity('Nimen on oltava vähintään 2 merkkiä pitkä.');
  }

  // Haetaan leimaustapalomakkeen tallennusbutton ja lisätään siihen tapahtumankäsittelijä.
  const tallennaLeimaustapaButton = document.getElementById('tallennaLeimaustapa');
  tallennaLeimaustapaButton.addEventListener('click', tallennaLeimaustapa);

  // Asetetaan listauksen joukkuelinkeille tapahtumankäsittelijät.
  const linkit = listaus.querySelectorAll('a');
  linkit.forEach((a) => a.addEventListener('click', muokkaaJoukkuetta));
});
