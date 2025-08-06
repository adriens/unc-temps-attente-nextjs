import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image from 'next/image';

const CarteLeaflet = dynamic(() => import('../components/CarteLeaflet'), { ssr: false });

export default function Home() {
  const [agences, setAgences] = useState([]);
  const [position, setPosition] = useState([-22.2758, 166.4580]);
  const [userPosition, setUserPosition] = useState(null); // position initiale de l’utilisateur
  const [selectedAgence, setSelectedAgence] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState('');

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Charger les agences
  useEffect(() => {
    const fetchAgences = async () => {
      try {
        const res = await fetch('/api/agences');
        if (!res.ok) throw new Error(`Erreur API : ${res.status}`);
        const data = await res.json();
        setAgences(data);
      } catch (err) {
        console.error('ERREUR FETCH:', err);
        setError(`Impossible de charger les agences : ${err.message}`);
      }
    };

    fetchAgences();
  }, []);

  useEffect(() => {
    const fetchAddress = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      setAddress(data.address || 'Adresse non trouvée');
    } catch (err) {
      setAddress('Erreur de récupération');
    }
    setLoading(false);
  };
  }, []);

  // Géolocalisation utilisateur → stockée à part
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          console.log('Position utilisateur :', coords);
          setUserPosition(coords);
          setPosition(coords); // position initiale = position utilisateur
        },
        (err) => {
          console.error(err);
          setError('Position refusée. Fallback Nouméa');
          const fallback = { lat: -22.2758, lng: 166.4580 };
          setUserPosition(fallback);
          setPosition(fallback);
        }
      );
    } else {
      const fallback = { lat: -22.2758, lng: 166.4580 };
      setUserPosition(fallback);
      setPosition(fallback);
    }
  }, []);

  const agencesFiltrees = agences.filter(
      (a) =>
        typeof a.position?.lat === 'number' &&
        typeof a.position?.lon === 'number'
  );

  // Trouver la plus proche après userPosition + agences chargées
  useEffect(() => {
    if (
      userPosition &&
      typeof userPosition.lat === 'number' &&
      typeof userPosition.lng === 'number' &&
      agencesFiltrees.length > 0
    ) {
      let min = Infinity;
      let closest = null;

      agencesFiltrees.forEach((a) => {
        const d = getDistance(userPosition.lat, userPosition.lng, a.latitude, a.longitude);
        if (d < min) {
          min = d;
          closest = a;
        }
      });

      if (
        closest &&
        typeof closest.latitude === 'number' &&
        typeof closest.longitude === 'number'
      ) {
        console.log('Agence la plus proche :', closest);
        setPosition({ lat: closest.latitude, lng: closest.longitude });
      }
    }
  }, [userPosition, agencesFiltrees]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);
    if (value.length > 1) {
      const filtered = agences.filter((a) =>
        a.designation?.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      const first = suggestions[0];
      handleAgenceSelect(first);
    }
  };

  const handleAgenceSelect = (agence) => {
    setSelectedAgence(agence);
    setSearchTerm(agence.designation);
    setSuggestions([]);

    if (agence?.position?.lat && agence?.position?.lon) {
      setUserPosition([agence.position.lat, agence.position.lon]);
    }
  };

  // ✅ Fonction reverse geocoding
  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        {
          headers: {
            'User-Agent': 'opt-nc-demo-app'
          }
        }
      );
      const data = await res.json();
      return data.display_name;
    } catch (err) {
      console.error("Erreur reverse geocoding :", err);
      return "Adresse inconnue";
    }
  };

  const [adresse, setAdresse] = useState(null);
  
    useEffect(() => {
      const fetchAdresse = async () => {
        if (selectedAgence?.position?.lat && selectedAgence?.position?.lon) {
          const result = await reverseGeocode(
            selectedAgence.position.lat,
            selectedAgence.position.lon
          );
          setAdresse(result);
        } else {
          setAdresse(null);
        }
      };
  
      fetchAdresse();
    }, [selectedAgence]);

  // 📞 Mapping des téléphones par agence
  const telephonesAgences = {
    "Agence de NOUMEA SUD": "26.86.50",
    "Agence de NOUMEA AGENCE PRINCIPALE": "26.84.00",
    "Agence de NOUMEA MAGENTA": "26.86.90",
    "Agence de NOUMEA DUCOS CENTRE": "23.13.00",
    "Agence ENTREPRISES": "1016",
    "Agence de NOUMEA VALLEE DU TIR": "27.44.15",
    "Agence de NOUMEA BELLE VIE": "41.36.36",
    "Centre de Traitement Postal": "1000",
    "Agence de MONT-DORE PONT DES FRANCAIS": "43.61.01",
    "Agence de DUMBEA KOUTIO": "41.15.15",
    "Agence de DUMBEA PANDA": "20.61.00",
    "Agence de DUMBEA MAIRIE": "20.65.03",
    "LAVERIE DES SENTEURS": "20.62.50",
    "Agence de MONT-DORE BOULARI": "41.33.33",
    "Agence de MONT-DORE LA COULEE": "35.28.78",
    "Agence de MONT-DORE PLUM": "20.65.04",
    "Agence de YATE": "20.62.70",
    "Agence de L'ILE DES PINS VAO": "46.11.00",
    "Agence de MARE TADINE": "26.71.80",
    "Agence de MARE LA ROCHE": "26.71.96",
    "Agence de LIFOU MOU": "20.65.02",
    "Agence de LIFOU WE": "20.62.80",
    "Agence de LIFOU CHEPENEHE": "20.65.01",
    "Agence de OUVEA FAYAOUE": "20.61.70",
    "Agence de BELEP": "47.64.82",
    "Agence de POUM": "20.65.15",
    "Agence de OUEGOA": "20.65.14",
    "Agence de POUEBO": "20.65.13",
    "Agence de KOUMAC": "20.23.00",
    "Agence de KAALA-GOMEN": "20.65.16",
    "Agence de HIENGHENE": "20.65.12",
    "Agence de TOUHO": "20.65.09",
    "Agence de POINDIMIE": "42.68.00",
    "Agence de PONERIHOUEN": "20.65.08",
    "Agence de HOUAILOU": "20.62.30",
    "Agence de HOUAILOU PORO": "20.65.11",
    "Agence de KOUAOUA": "20.65.10",
    "Agence de CANALA": "20.65.06",
    "Agence de THIO": "20.65.05",
    "Agence de VOH": "20.65.18",
    "Agence de KONE": "20.22.50",
    "Agence de POUEMBOUT": "47.21.02",
    "Agence de POYA NEPOUI": "20.65.17",
    "Agence de POYA": "20.62.40",
    "Agence de BOURAIL": "44.70.50",
    "Agence de MOINDOU": "20.65.07",
    "Agence de LA FOA": "44.31.00",
    "Agence de BOULOUPARIS": "35.17.00",
    "Agence de TONTOUTA": "20.62.90",
    "Agence de PAITA": "20.62.50",

    // Ajouter ici les numéros d'autres agences
  };

  // Mapping des E-mails par agence
  const emailAgences = {
    "Agence de NOUMEA SUD": "noumeasud@opt.nc",
    "AGENCE COMPTABLE - CAVEAU": "dpo-cdcnoumearesponsables@opt.nc",
    "Agence de NOUMEA AGENCE PRINCIPALE": "dpo-cdcnoumearesponsables@opt.nc",
    "Agence de NOUMEA MAGENTA": "amagenta@opt.nc",
    "Agence de NOUMEA DUCOS CENTRE": "ducos@opt.nc",
    "Agence ENTREPRISES": "agence-entreprises@opt.nc",
    "Agence de NOUMEA VALLEE DU TIR": "valleedutir@opt.nc",
    "Agence de NOUMEA BELLE VIE": "bellevie@opt.nc",
    "Centre de Traitement Postal": "opt-agencectp-responsables@opt.nc",
    "Agence de MONT-DORE PONT DES FRANCAIS": "montdore@opt.nc",
    "Agence de DUMBEA KOUTIO": "dumbea@opt.nc",
    "Centre de Distribution du Courrier du GRAND NOUMEA": "dpo-cdcGrandNoumeaEncadrement@opt.nc",
    "Agence de DUMBEA PANDA": "dumbea@opt.nc",
    "Agence de DUMBEA MAIRIE": "dumbea@opt.nc",
    "LAVERIE DES SENTEURS": "paita@opt.nc",
    "Agence de MONT-DORE BOULARI": "montdore@opt.nc",
    "Agence de MONT-DORE LA COULEE": "montdore@opt.nc",
    "Agence de MONT-DORE PLUM": "montdore@opt.nc",
    "Agence de YATE": "yate@opt.nc",
    "Agence de L'ILE DES PINS VAO": "vao@opt.nc",
    "Agence de MARE TADINE": "tadine@opt.nc",
    "Agence de MARE LA ROCHE": "tadine@opt.nc",
    "Agence de LIFOU MOU": "we@opt.nc",
    "Agence de LIFOU WE": "we@opt.nc",
    "Agence de LIFOU CHEPENEHE": "we@opt.nc",
    "Agence de OUVEA FAYAOUE": "fayaoue@opt.nc",
    "Agence de BELEP": "belep@opt.nc",
    "Agence de POUM": "opt-agencepoum-responsables@opt.nc",
    "Agence de OUEGOA": "opt-agenceouegoa-responsables@opt.nc",
    "Agence de POUEBO": "POUEBO@opt.nc",
    "Agence de KOUMAC": "opt-agencekoumac-responsables@opt.nc",
    "Agence de KAALA-GOMEN": "opt-agencekaala-gomen-responsables@opt.nc",
    "Agence de HIENGHENE": "HIENGHENE@opt.nc",
    "Agence de TOUHO": "TOUHO@opt.nc",
    "Agence de POINDIMIE": "POINDIMIE@opt.nc",
    "Agence de PONERIHOUEN": "PONERIHOUEN@opt.nc",
    "Agence de HOUAILOU": "HOUAILOU@opt.nc",
    "Agence de HOUAILOU PORO": "HOUAILOU@opt.nc",
    "Agence de KOUAOUA": "kouaoua@opt.nc",
    "Agence de CANALA": "canala@opt.nc",
    "Agence de THIO": "thio@opt.nc",
    "Agence de VOH": "opt-agencevoh-responsables@opt.nc",
    "Agence de KONE": "kone@opt.nc",
    "Agence de POUEMBOUT": "opt-agencepouembout-responsables@opt.nc",
    "Agence de POYA NEPOUI": "opt-agencepoya-responsables@opt.nc",
    "Agence de POYA": "opt-agencepoya-responsables@opt.nc",
    "Agence de BOURAIL": "bourail@opt.nc",
    "Agence de MOINDOU": "lafoa@opt.nc",
    "Agence de LA FOA": "lafoa@opt.nc",
    "Agence de BOULOUPARIS": "boulouparis@opt.nc",
    "Agence de TONTOUTA": "tontouta@opt.nc",
    "Agence de PAITA": "paita@opt.nc",

    // Ajouter ici les emails d'autres agences
  };
  return (
    <>
      <Head>
        <title>L'OPT près de chez moi, trouver une agence</title>
      </Head>

      <main className="app-container">
        <h1>
        <Image
          priority
          src="/images/opt_logo.svg"
          height={98}
          width={310}
          alt="Logo OPT-nc"
        />L'OPT près de chez moi, trouver une agence
        </h1>
        <h2>
          Trouvez votre agence OPT la plus proche en fonction de votre géolocalisation ! (Vous êtes le point vert)
        </h2>

        <header className="search-header">
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher une agence OPT..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % suggestions.length);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) =>
                  prev <= 0 ? suggestions.length - 1 : prev - 1
                );
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                  const selected = suggestions[selectedIndex];
                  handleAgenceSelect(selected); // déclenche le centrage + sidebar
                }
              }
            }}
          />
          {suggestions.length > 0 && (
            <ul className="search-suggestions">
              {suggestions.map((a, index) => (
                <li
                  key={a.idAgence}
                  className={index === selectedIndex ? 'active' : ''}
                  onMouseDown={() => handleAgenceSelect(a)}
                >
                  {a.designation}
                </li>
              ))}
            </ul>
          )}
        </header>


          <div className="map-wrapper">
            {selectedAgence && (
              <aside className="sidebar">
                <h1>{selectedAgence.designation}</h1>

                <p><strong>Commune :</strong> {selectedAgence.commune}</p>
                <p><strong>Adresse : </strong><span>{adresse || "Chargement..."}</span><br/></p>
                <p><strong>Tél : </strong><span>{telephonesAgences[selectedAgence.designation] || "Non disponible"}</span></p>
                <p><strong>E-mail : </strong><span>{emailAgences[selectedAgence.designation] || "Non disponible"}</span></p>

                <h2>Horaires</h2>
                <p><strong>Lundi à Vendredi : </strong>07:45 - 15:30</p>
                
                <h2>Services possibles (contacter l'agence pour la disponibilité d'un service)</h2>
                <p><strong>Boîtes postales</strong></p>
                <p><strong>Conseillers</strong></p>
                <p><strong>Guichets automatique de billets</strong></p>


                <button onClick={() => setSelectedAgence(null)}>Fermer</button>
              </aside>
            
            )}
            <CarteLeaflet
              agences={agencesFiltrees}
              userPosition={userPosition}
              position={position}
              selectedAgence={selectedAgence}
              onSelectAgence={setSelectedAgence}
            />
          </div>


        
      </main>
    </>
  );
}
