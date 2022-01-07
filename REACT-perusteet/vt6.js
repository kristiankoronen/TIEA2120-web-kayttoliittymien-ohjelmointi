"use strict";
/* globals ReactDOM: false */
/* globals React: false */
/* globals data: false */

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

/** 
 * Datarakenteen kopioiminen.
 * Joukkueen leimausten rasti on viite rastitaulukon rasteihin.
 */
function kopioi_kilpailu(data) {
  let kilpailu = {};
  kilpailu.nimi = data.nimi;
  kilpailu.loppuaika = data.loppuaika;
  kilpailu.alkuaika = data.alkuaika;
  kilpailu.kesto = data.kesto;
  kilpailu.leimaustavat = Array.from(data.leimaustavat);
  
  // Tehdään uusille rasteille jemma, josta niiden viitteet on helppo kopioida.
  let uudet_rastit = new Map(); 

  function kopioi_rastit(j) {
    let uusir = {};
    uusir.id = j.id;
    uusir.koodi = j.koodi;
    uusir.lat = j.lat;
    uusir.lon = j.lon;

    // Käytetään vanhaa rastia avaimena ja laitetaan uusi rasti jemmaan.
    uudet_rastit.set(j, uusir); 
    return uusir; 
  }

  kilpailu.rastit = Array.from(data.rastit, kopioi_rastit);
  
  function kopioi_sarjat(j) {
    let uusir = {};
    uusir.id = j.id;
    uusir.nimi = j.nimi;
    uusir.kesto = j.kesto;
    uusir.loppuaika = j.loppuaika;
    uusir.alkuaika = j.alkuaika;

    return uusir; 
  }
  
  kilpailu.sarjat = Array.from(data.sarjat, kopioi_sarjat);
  
  function kopioi_joukkue(j) {
    let uusij = {};
    uusij.nimi = j.nimi;
    uusij.id = j.id;
    uusij.sarja = j.sarja;

    uusij["jasenet"] = Array.from(j["jasenet"]);
    
    function kopioi_leimaukset(j) {
      let uusir = {};
      uusir.aika = j.aika;
      // Haetaan vanhaa rastia vastaavan uuden rastin viite.
      uusir.rasti = uudet_rastit.get(j.rasti); 

      return uusir;
    }

    uusij["rastit"] = Array.from(j["rastit"], kopioi_leimaukset);
    uusij["leimaustapa"] = Array.from(j["leimaustapa"]);

    return uusij;
  }

  kilpailu.joukkueet = Array.from(data.joukkueet, kopioi_joukkue);

	return kilpailu;
}

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    /**
     * Käytetään hieman muunneltua dataa viikkotehtävistä 1 ja 3
     * Alustetaan tämän komponentin tilaksi data.
     * Tee tehtävässä vaaditut lisäykset ja muutokset tämän komponentin tilaan
     * päivitettäessä React-komponentin tilaa on aina vanha tila kopioitava uudeksi
     * kopioimista varten on annettu valmis mallifunktio
     * Objekteja ja taulukoita ei voida kopioida pelkällä sijoitusoperaattorilla
     * kts. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
     */
	  this.state = { 
      kilpailu: data,
      id: NaN,
      nimi: '',
      leimaustapa: [],
      sarja: Array.from(data.sarjat, ({ nimi }) => nimi)
        .sort((a, b) => a.trim().localeCompare(b.trim(), 'fi', { sensitivity: 'base' }))[0],
      jasenet: Array.from({ length: 2 }, () => ''),
      key: Date.now(),
      muokataan: false,
      muokattavaRastikoodi: undefined,
    };

    // Tallennetaan tänne max jäsenien määrä.
    this.JASENET_MAX = 5;
    // Tästä pääsen käsiksi viimeiseen checkboxiin, jolle asetetaan virheilmoitukset.
    this.checkboxVirheilmoitus = undefined;
    // Haetaan talteen oletusvalinta sarjalle.
    this.oletusSarja = Array.from(data.sarjat, ({ nimi }) => nimi)
      .sort((a, b) => a.trim().localeCompare(b.trim(), 'fi', { sensitivity: 'base' }))[0];

    this.setUusiJoukkue = this.setUusiJoukkue.bind(this);
    this.setMuokattuJoukkue = this.setMuokattuJoukkue.bind(this);
    this.setMuokattavaJoukkue = this.setMuokattavaJoukkue.bind(this);
    this.setNimi = this.setNimi.bind(this);
    this.setLeimaustavat = this.setLeimaustavat.bind(this);
    this.setSarja = this.setSarja.bind(this);
    this.setJasenet = this.setJasenet.bind(this);

    this.handleJoukkueenLisays = this.handleJoukkueenLisays.bind(this);
    this.handleJoukkueenMuokkaus = this.handleJoukkueenMuokkaus.bind(this);
    this.handleNimiChange = this.handleNimiChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleRadioButtonChange = this.handleRadioButtonChange.bind(this);
    this.handleJasenChange = this.handleJasenChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAloitaMuokkaus = this.handleAloitaMuokkaus.bind(this);
    this.handleRastikoodinMuokkaus = this.handleRastikoodinMuokkaus.bind(this);

    this.laskePisteet = this.laskePisteet.bind(this);
    this.laskeUusiIdJoukkueelle = this.laskeUusiIdJoukkueelle.bind(this);
    this.luoKopioJoukkueestaLomakkeelle = this.luoKopioJoukkueestaLomakkeelle.bind(this);
    this.muokkaaJoukkuetta = this.muokkaaJoukkuetta.bind(this);
    this.haeValiditLeimaukset = this.haeValiditLeimaukset.bind(this);
    this.haeIdtaVastaavaJoukkue = this.haeIdtaVastaavaJoukkue.bind(this);
    this.haeIndeksiaVastaavaLeimaustapa = this.haeIndeksiaVastaavaLeimaustapa.bind(this);
    this.haeLeimaustapaaVastaavaIndeksi = this.haeLeimaustapaaVastaavaIndeksi.bind(this);
    this.haeSarjaaVastaavaId = this.haeSarjaaVastaavaId.bind(this);
    this.haeIdtaVastaavaSarja = this.haeIdtaVastaavaSarja.bind(this);

    console.log(this.state);
    return;
  }

  // Haetaan joukkueen kaikki validit rastileimaukset.
  haeValiditLeimaukset(kaikkiLeimaukset) {
    // Tässä menee jotain pieleen, kun joukkueen tietoja on muokattu.
    const validitRastit = kaikkiLeimaukset.filter(
      ({ rasti }) => this.state.kilpailu.rastit.indexOf(rasti) + 1
    );
    const leimauksetRasteina = validitRastit.map(({ rasti }) => rasti);

    const lahtorasti = this.state.kilpailu.rastit.find(({ koodi }) => koodi === 'LAHTO');
    const maalirasti = this.state.kilpailu.rastit.find(({ koodi }) => koodi === 'MAALI');

    const lahtoindeksi = leimauksetRasteina.lastIndexOf(lahtorasti);
    leimauksetRasteina.splice(0, lahtoindeksi);

    const maaliindeksi = leimauksetRasteina.indexOf(maalirasti);
    leimauksetRasteina.splice(maaliindeksi + 1);
      
    return [...new Set(leimauksetRasteina)];
  };

  // Laskee joukkueen pisteet.
  laskePisteet(rastikoodit) {
    let kokonaispisteet = rastikoodit.reduce(
      (pisteet, [ensimmainenMerkki]) => {
        return (
          parseInt(ensimmainenMerkki) ? pisteet += parseInt(ensimmainenMerkki) : pisteet
        );
      }, 
      0
    );
    return kokonaispisteet;
  }

  // Lasketaan joukkeelle uusi id, joka on senhetkinen suurin + 1.
  laskeUusiIdJoukkueelle() {
    const joukkueet = this.state.kilpailu.joukkueet;
    const suurin = joukkueet.reduce(
      (suurin, { id }) => id > suurin ? suurin = id : suurin, 
      Number.MIN_SAFE_INTEGER
    );

    return suurin + 1;
  }

  // Hakee annettua id:tä vastaavan joukkueen tilasta.
  haeIdtaVastaavaJoukkue(joukkueenId) {
    const joukkueet = this.state.kilpailu.joukkueet;
    const joukkue = joukkueet.find(({ id }) => id === joukkueenId);
    return joukkue;
  }

  // Luo kopion lomakkeen tarvitsemista tiedoista.
  luoKopioJoukkueestaLomakkeelle({ id, nimi, leimaustapa, sarja, jasenet }) {
    const kopio = {
      id: id,
      nimi: nimi,
      leimaustapa: [...leimaustapa],
      sarja: sarja,
      jasenet: jasenet.length < this.JASENET_MAX ? [...jasenet, ''] : [...jasenet],
    };
    return kopio;
  }
  
  // Hakee annettua indeksia vastaavan leimaustavan nimen tilasta.
  haeIndeksiaVastaavaLeimaustapa(indeksi) {
    const leimaustavat = this.state.kilpailu.leimaustavat;
    return leimaustavat[indeksi];
  }
  
  // Hakee leimaustavan nimeä vastaavan taulukon indeksin tilasta.
  haeLeimaustapaaVastaavaIndeksi(leimaustapa) {
    const leimaustavat = this.state.kilpailu.leimaustavat;
    return leimaustavat.indexOf(leimaustapa);
  }

  // Hakee annettua sarjan nimeä vastaavan sarja-id:n.
  haeSarjaaVastaavaId(sarjanNimi) {
    const sarjat = this.state.kilpailu.sarjat;
    const { id } = sarjat.find(({ nimi }) => nimi === sarjanNimi);
    return id;
  }

  // Hakee annettua sarja-id:tä vastaavan sarjan nimen.
  haeIdtaVastaavaSarja(sarjanId) {
    const sarjat = this.state.kilpailu.sarjat;
    const { nimi } = sarjat.find(({ id }) => id === sarjanId);
    return nimi;
  }

  // Asettaa lomakkeessa muokattavan joukkueen senhetkisen nimen tilaan.
  setNimi({ value }) {
    this.setState({ nimi: value });
  }

  // Asettaa lomakkeessa valitut leimaustavat tilaan.
  setLeimaustavat(leimaustapa) {
    this.setState({ leimaustapa: leimaustapa });
  }

  // Asettaa lomakkeessa valitun sarjan tilaan.
  setSarja({ value }) {
    this.setState({ sarja : value });
  }

  // Asettaa lomakkeessa joukkueelle annetut jasenet tilaan.
  setJasenet(i, { value }) {
    let kopio = [...this.state.jasenet];
    kopio.splice(i, 1, value);
    let kopio2 = kopio.splice(2);
    kopio2 = kopio2.filter(({ length }) => length > 0);

    // Tämä tilan (this.state.jasenet) mukaan lomake tekee dynaamisesti lisää kenttiä.

    // Kun vain pakolliset kentät jäljellä.
    if (kopio2.length === 0) {
      const [pakollinen1, pakollinen2] = kopio;

      // Jos molemmat täytetty, luodaan yksi tyhjä kenttä.
      if (pakollinen1 !== '' && pakollinen2 !== '') {
        kopio.push('');
        this.setState({ jasenet: kopio });
        return;
      }
      // Jos vain toinen täytetty, näytetään vain kaksi kenttää.
      if (pakollinen1 === '' || pakollinen2 === '') {
        this.setState({ jasenet : kopio });
        return;
      }
    }

    // Jos pakollisten lisäksi on kenttiä täytettynä.
    if (kopio2.length > 0) {
      const [pakollinen1, pakollinen2] = kopio;

      // Kun molemmat pakolliset täytetty.
      if (pakollinen1 !== '' && pakollinen2 !== '') {
        // Jos max jäseniä on annettu, päivitetään tila luomatta tai poistamatta kenttiä.
        if (kopio2.length + 2 === this.JASENET_MAX) {
          this.setState({ jasenet: kopio.concat(kopio2) });
          return;
        }
        // Jos mahtuu vielä jäseniä, niin luodaan yksi lisäkenttä.
        if (kopio2.length + 2 < this.JASENET_MAX) {
          kopio2.push('');
          this.setState({ jasenet: kopio.concat(kopio2) });
          return;
        }
      }
      // Kun ensimmäinen pakollinen kenttä on tyhjennetty.
      if (pakollinen1 === '' && pakollinen2 !== '') {
        kopio2.unshift(pakollinen2);
        // Jos täytettyjä kenttiä on vähintään 2, luodaan yksi tyhjä kenttä.
        if (kopio2.length >= 2) {
          kopio2.push('');
        }
        this.setState({ jasenet : kopio2 });
        return;
      }
      // Kun toinen pakollinen kenttä on tyhjennetty.
      if (pakollinen1 !== '' && pakollinen2 === '') {
        kopio2.unshift(pakollinen1);
        if (kopio2.length >= 2) {
          kopio2.push('');
        }
        this.setState({ jasenet : kopio2 });
        return;
      }
      // Kun molemmat pakolliset kentät on täytetty.
      if (pakollinen1 !== '' && pakollinen2 !== '') {
        if (kopio2.length >= 2) {
          kopio2.push('');
        }
        this.setState({ jasenet : kopio2 });
        return;
      }
    }
  }

  // Asettaa uuden joukkueen tilaan.
  setUusiJoukkue(joukkue) {
    const kopio = kopioi_kilpailu(this.state.kilpailu);
    kopio.joukkueet.push(joukkue);
    
    this.setState({ kilpailu: kopio });
  }

  // Asettaa muokattavan joukkueen tiedot tilaan muokkausta varten.
  setMuokattavaJoukkue({ id, nimi, leimaustapa, sarja, jasenet }) {
    this.setState({
      id: id,
      nimi: nimi,
      leimaustapa: Array.from(leimaustapa, (i) => this.haeIndeksiaVastaavaLeimaustapa(i)),
      sarja: this.haeIdtaVastaavaSarja(sarja),
      jasenet: jasenet,
      muokataan: true,
    });
  }

  // Asettaa muokatun joukkueen tiedot tilaan. (siis korvaa vanhat)
  setMuokattuJoukkue(joukkue) {
    const kopio = kopioi_kilpailu(this.state.kilpailu);
    kopio.joukkueet.splice(kopio.joukkueet.findIndex(({ id }) => id === joukkue.id), 1, joukkue);

    this.setState({ kilpailu: kopio });
  }
  
  // Käsittelee lomakkeessa nimen muutoksen.
  handleNimiChange({ target }) {
    this.setNimi(target);
  }

  // Käsittelee lomakkeessa leimaustavan muutoksen.
  handleCheckboxChange({ target }) {
    const { value, checked } = target;
    const kopio = [...this.state.leimaustapa];

    if (checked) {
      kopio.push(value);
    } else {
      kopio.splice(kopio.indexOf(value), 1);
    }

    // Asetetaan virheilmoitus, jos vähintään yksi ei ole valittuna.
    if (kopio.length === 0) {
      /**
       * Virheilmoitus asetetaan aina viimeisimpään checkboxiin, 
       * jottei se oli leimaustapojen tiellä.
       */
      if (this.checkboxVirheilmoitus !== undefined) {
        this.checkboxVirheilmoitus.setCustomValidity('Valitse vähintään yksi leimaustapa.');
      }
    } else if (this.checkboxVirheilmoitus !== undefined) {
      this.checkboxVirheilmoitus.setCustomValidity('');
    }

    this.setLeimaustavat(kopio);
  }

  // Käsittelee sarjan muutoksen.
  handleRadioButtonChange({ target }) {
    this.setSarja(target);
  }

  // Käsittelee jäsenien muutokset.
  handleJasenChange(i) {
    return ({ target }) => {
      this.setJasenet(i, target);
    };
  }

  // Käsittelee joukkueen lisäyksen.
  handleJoukkueenLisays({ nimi, leimaustapa, sarja, jasenet }) {
    const joukkue = {
      id: this.laskeUusiIdJoukkueelle(),
      nimi: nimi,
      leimaustapa: leimaustapa.map((tapa) => this.haeLeimaustapaaVastaavaIndeksi(tapa)),
      sarja: this.haeSarjaaVastaavaId(sarja),
      jasenet: jasenet,
      rastit: [],
    };

    this.setUusiJoukkue(joukkue);
  }

  // Käsittelee joukkueen muokkauksen.
  handleJoukkueenMuokkaus({ id, nimi, leimaustapa, sarja, jasenet }) {
    const alkuperainen = this.haeIdtaVastaavaJoukkue(id);
    const kopio = {
      ...alkuperainen,
      nimi: nimi,
      leimaustapa: leimaustapa.map((tapa) => this.haeLeimaustapaaVastaavaIndeksi(tapa)),
      sarja: this.haeSarjaaVastaavaId(sarja),
      jasenet: jasenet,
    };
    
    this.setMuokattuJoukkue(kopio);
  }

  // Käsittelee lomakkeen submit-tapahtuman.
  handleSubmit(e) {
    e.preventDefault();

    // Haetaan kaikki leimaustapacheckboxit.
    const leimaustavat = [...e.target.leimaustapa];
    const vahintaanYksiValittu = leimaustavat.some(({ checked }) => checked);
    // Tähän asetetaan mahdolliset virheilmoitukset.
    const viimeinenCheckbox = leimaustavat[leimaustavat.length - 1];
    this.checkboxVirheilmoitus = viimeinenCheckbox;

    if (!vahintaanYksiValittu) {
      viimeinenCheckbox.setCustomValidity('Valitse vähintään yksi leimaustapa.');
      viimeinenCheckbox.reportValidity();
      return;
    }

    // Jos olemme muokkaamassa joukkuetta.
    if (this.state.muokataan) {
      const joukkueenTiedot = {
        id: this.state.id,
        nimi: this.state.nimi,
        leimaustapa: [...this.state.leimaustapa],
        sarja: this.state.sarja,
        jasenet: this.state.jasenet.filter(({ length }) => length > 0),
      };

      this.handleJoukkueenMuokkaus(joukkueenTiedot);

      this.setState({
        id: NaN,
        nimi: '',
        leimaustapa: [],
        sarja: this.oletusSarja,
        jasenet: Array.from({ length: 2 }, () => ''),
        key: Date.now(),
        muokataan: false,
      });

      e.target.reset();

      return;
    }

    // Jos ei muokata, niin lisätään.
    const joukkueenTiedot = {
      nimi: this.state.nimi,
      leimaustapa: [...this.state.leimaustapa],
      sarja: this.state.sarja,
      jasenet: this.state.jasenet.filter(({ length }) => length > 0),
    };

    this.handleJoukkueenLisays(joukkueenTiedot);

    this.setState({
      nimi: '',
      leimaustapa: [],
      sarja: this.oletusSarja,
      jasenet: Array.from({ length: 2 }, () => ''),
      key: Date.now(),
    });

    e.target.reset();
  }

  // Aloittaa rastikoodin muokkauksen. (KESKEN)
  handleAloitaMuokkaus({ target }) {
    const { textContent } = target;
    this.setState({ muokattavaRastikoodi: textContent });
  }

  // Ylläpitää senhetkistä muokkausta rastikoodista. (KESKEN)
  handleRastikoodinMuokkaus({ target }) {
    const { value } = target;
    this.setState({ muokattavaRastikoodi: value });
  }
  
  // Asettaa sovelluksen muokkaustilaan.
  muokkaaJoukkuetta({ target }) {
    const { dataset: { joukkueenId } } = target;
    const muokattavaJoukkue = this.haeIdtaVastaavaJoukkue(Number(joukkueenId));
    const kopio = this.luoKopioJoukkueestaLomakkeelle(muokattavaJoukkue);

    this.setMuokattavaJoukkue(kopio);
  }

  render() {
    const { muokataan, nimi, leimaustapa, sarja, jasenet } = this.state;
    const leimaustavat = [...this.state.kilpailu.leimaustavat]
      .sort((a, b) => a.trim().localeCompare(b.trim(), 'fi', { sensitivity: 'base' }));
    const sarjat = Array.from(this.state.kilpailu.sarjat, ({ nimi }) => nimi)
      .sort((a, b) => a.trim().localeCompare(b.trim(), 'fi', { sensitivity: 'base' }));
    const rastit = [...this.state.kilpailu.rastit]
      .sort((a, b) => a.koodi.trim().localeCompare(b.koodi.trim(), 'fi', { sensitivity: 'base' }));
    const joukkueet = Array.from(
      this.state.kilpailu.joukkueet,
      (joukkue) => {
        const kopio = {
          id: joukkue.id,
          nimi: joukkue.nimi,
          sarja: this.haeIdtaVastaavaSarja(joukkue.sarja),
          leimaustavat: Array.from(
            joukkue.leimaustapa,
            (indeksi) => this.haeIndeksiaVastaavaLeimaustapa(indeksi)
          ).sort((a, b) => a.trim().localeCompare(b.trim(), 'fi', { sensitivity: 'base' })),
          jasenet: [...joukkue.jasenet]
            .sort((a, b) => a.trim().localeCompare(b.trim(), 'fi', { sensitivity: 'base' })),
          pisteet: this.laskePisteet(
            Array.from(this.haeValiditLeimaukset(joukkue.rastit), ({ koodi }) => koodi)
          ),
          kuljettuMatka: laskeKokoMatka(
            Array.from(this.haeValiditLeimaukset(joukkue.rastit), ({ lat, lon }) => ({ lat, lon }))
          ),
        };
        return kopio;
      }
    ).sort((a, b) => a.nimi.trim().localeCompare(b.nimi.trim(), 'fi', { sensitivity: 'base' }));

    return (
      // jshint ignore: start
      <div className="wrapper">
	      <LisaaJoukkue 
          muokataan={muokataan}
          leimaustavat={leimaustavat}
          sarjat={sarjat}
          nimi={nimi}
          leimaustapa={leimaustapa}
          sarja={sarja}
          jasenet={jasenet}
          handleSubmit={this.handleSubmit}
          handleNimiChange={this.handleNimiChange}
          handleCheckboxChange={this.handleCheckboxChange}
          handleRadioButtonChange={this.handleRadioButtonChange}
          handleJasenChange={this.handleJasenChange}
        />
	      <ListaaJoukkueet 
          joukkueet={joukkueet}
          muokkaaJoukkuetta={this.muokkaaJoukkuetta}
        />
        <ListaaRastit 
          rastit={rastit}
          muokattavaRastikoodi={this.state.muokattavaRastikoodi}
          handleAloitaMuokkaus={this.handleAloitaMuokkaus}
          handleRastikoodinMuokkaus={this.handleRastikoodinMuokkaus}
          handleTallennaRastikoodi={this.handleTallennaRastikoodi}
          handleAloitaRastinKoordinaattienMuokkaus={this.handleAloitaRastinKoordinaattienMuokkaus}
          handleTallennaKoordinaatit={this.handleTallennaKoordinaatit}
        />
      </div>
      // jshint ignore: end
    );
  }
}

// React-komponentti joukkueen lisäys-/muokkauslomaketta varten.
function LisaaJoukkue(props) {
  const { muokataan, leimaustavat, sarjat } = props;
  const { nimi, leimaustapa, sarja, jasenet } = props;
  const { 
    handleSubmit, 
    handleNimiChange,
    handleCheckboxChange,
    handleRadioButtonChange,
    handleJasenChange
  } = props;

  return (
    // jshint ignore: start
    <div className="lisaaJoukkue">
      <h1 id="lomakeotsikko">
        {muokataan ? 'Muokkaa joukkuetta' : 'Lisää joukkue'}
      </h1>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Joukkueen tiedot</legend>         
          <NimiInput 
            nimi={nimi}
            handleNimiChange={handleNimiChange}
          />
          <LeimaustapaCheckboxit 
            kaikkiLeimaustavat={leimaustavat}
            valitutLeimaustavat={leimaustapa}
            handleCheckboxChange={handleCheckboxChange}
          />
          <SarjaButtonit 
            sarjat={sarjat}
            valittuSarja={sarja}
            handleRadioButtonChange={handleRadioButtonChange}
          />
        </fieldset>
        <Jasenet 
          jasenet={jasenet}
          handleJasenChange={handleJasenChange}
        />
        <input type="submit" value="Tallenna" />
      </form>
    </div>
    // jshint ignore: end
  );
}

// Input tekstikenttä joukkueen nimen muokkausta varten
function NimiInput({ nimi, handleNimiChange }) {
  return (
    // jshint ignore: start
    <label className="float">
      Nimi
      <input 
        type="text"
        value={nimi}
        required="required"
        onChange={handleNimiChange}
      />
    </label>
    // jshint ignore: end
  );
}

// Checkboxit joukkueen leimaustapojen varten.
function LeimaustapaCheckboxit({ kaikkiLeimaustavat, valitutLeimaustavat, handleCheckboxChange }) {
  const checkboxit = kaikkiLeimaustavat.map((leimaustapa, i) => {
    return (
      // jshint ignore: start
      <label key={`leimaustapa${i}`}>
        {leimaustapa}
        <input
          type="checkbox" 
          name="leimaustapa" 
          value={leimaustapa}
          checked={valitutLeimaustavat.includes(leimaustapa)}
          onChange={handleCheckboxChange}
        />
      </label>
      // jshint ignore: end
    );
  });

  return (
    // jshint ignore: start
    <div>
      <span>Leimaustapa</span>
      <div className="flex">
        {checkboxit}
      </div>
    </div>
    // jshint ignore: end
  );
}

// Radiobuttonit joukkueen sarjaa varten.
function SarjaButtonit({ sarjat, valittuSarja, handleRadioButtonChange}) {
  const radiot = sarjat.map((sarja, i) => {
    return (
      // jshint ignore: start
      <label key={`sarja${i}`}>
        {sarja}
        <input 
          type="radio"
          name="sarja"
          value={sarja}
          checked={sarja === valittuSarja}
          onChange={handleRadioButtonChange}
        />
      </label>
      // jshint ignore: end
    );
  });

  return (
    // jshint ignore: start
    <div>
      <span>Sarja</span>
      <div className="flex">
        {radiot}
      </div>
    </div>
    // jshint ignore: end
  );
}

// Input tekstikentät jäsenien lisäämistä varten. Kaksi ensimmäistä kenttää pakollisia.
function Jasenet({ jasenet, handleJasenChange }) {
  const jasenInputit = jasenet.map((jasen, i) => {
    if (i < 2) {
      return (
        // jshint ignore: start
        <label key={`jasen${i}`} className="float">
          {`Jäsen${i + 1}`}
          <input 
            type="text"
            value={jasen}
            required="required"
            onChange={handleJasenChange(i)}
          />
        </label>
        // jshint ignore: end
      );  
    }

    return (
      // jshint ignore: start
      <label key={`jasen${i}`} className="float">
        {`Jäsen${i + 1}`}
        <input 
          type="text"
          value={jasen}
          onChange={handleJasenChange(i)}
        />
      </label>
      // jshint ignore: end
    );
  });

  return (
    // jshint ignore: start
    <fieldset className="jasenet">
      <legend>Jäsenet</legend>
      {jasenInputit}
    </fieldset>
    // jshint ignore: end
  );
}

// Listaus joukkueista ja joukkueiden tiedoista.
function ListaaJoukkueet({ joukkueet, muokkaaJoukkuetta }) {
  const listaelementit = joukkueet.map(
    ({ id, nimi, sarja, leimaustavat, jasenet, pisteet, kuljettuMatka }, i) => {
      return (
        // jshint ignore: start
        <ListaelementtiJoukkueenTiedoista
          key={`joukkueenTiedot${i}`}
          joukkueenId={id}
          nimi={nimi}
          pisteet={pisteet}
          kuljettuMatka={kuljettuMatka}
          sarja={sarja}
          leimaustavat={leimaustavat}
          jasenet={jasenet}
          muokkaaJoukkuetta={muokkaaJoukkuetta}
        />
        // jshint ignore: end
      );
    }
  );

  return (
    // jshint ignore: start
    <div className="joukkuelistaus">
      <h1>Joukkuelistaus</h1>
      <ul>
        {listaelementit}
      </ul>
    </div>
    // jshint ignore: end
  );
}

// Yksittäisen joukkueen tiedot listaelementtinä.
function ListaelementtiJoukkueenTiedoista({ 
  joukkueenId,
  nimi,
  pisteet,
  kuljettuMatka,
  sarja,
  leimaustavat,
  jasenet,
  muokkaaJoukkuetta 
}) {
  return (
    // jshint ignore: start
    <li>
      <a 
        href="#lomakeotsikko"
        data-joukkueen-id={joukkueenId}
        onClick={muokkaaJoukkuetta}
      >
        {nimi}
      </a> ({pisteet} p, {kuljettuMatka} km)
      <br />
      {sarja} ({leimaustavat.join(', ')})
      <JasenListaus jasenet={jasenet} />
    </li>
    // jshint ignore: end
  );
}

// Joukkueen jäsenlistaus.
function JasenListaus({ jasenet }) {
  const jasenListaelementit = jasenet.map((jasen, i) => {
    return (
      // jshint ignore: start
      <li key={`jasenNimi${i}`}>
        {jasen}
      </li>
      // jshint ignore: end
    );
  });

  return (
    // jshint ignore: start
    <ul>
      {jasenListaelementit}
    </ul>
    // jshint ignore: end
  );
}

// Rastien listaus (koodit ja koordinaatit). (KESKEN)
function ListaaRastit(props) {
  const {
    muokattavaRastikoodi,
    handleAloitaMuokkaus,
    handleRastikoodinMuokkaus,
    handleTallennaRastikoodi,
    handleAloitaRastinKoordinaattienMuokkaus,
    handleTallennaKoordinaatit
  } = props;
  const listaelementit = props.rastit.map(({ koodi, lat, lon }, i) => {
    const input = (
      // jshint ignore: start
      <li key={`rastikoodi${i}`}>
        <input 
          type="text"
          value={muokattavaRastikoodi}
          onBlur={handleTallennaRastikoodi}
          onChange={handleRastikoodinMuokkaus}
        />
        <br />
        <span onClick={handleAloitaRastinKoordinaattienMuokkaus}>{lat}, {lon}</span>
        <br />
      </li>
      // jshint ignore: end
    );
    
    if (muokattavaRastikoodi === koodi) {
      return input;
    }

    return (
      // jshint ignore: start
      <li key={`rastikoodi${i}`}>
        <span onClick={handleAloitaMuokkaus}>{koodi}</span>
        <br />
        <span onClick={handleAloitaRastinKoordinaattienMuokkaus}>{lat}, {lon}</span>
        <br />
      </li>
      // jshint ignore: end
    );
  });

  return (
    // jshint ignore: start
    <div>
      <h1>Rastilistaus</h1>
      <ul>
        {listaelementit}
      </ul>
    </div>
    // jshint ignore: end
  );
}

// Kartta rastin muokkaamista varten. (KESKEN)
class Mapbox extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.map();
  }

  map() {
    var map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  }

  render() {
    return <div id="map" onBlur={this.props.handleTallennaKoordinaatit}></div>  
  }
}

ReactDOM.render(
  // jshint ignore: start
  <App />,
  // jshint ignore: end
  document.getElementById('root')
);
