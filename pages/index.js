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
            placeholder="Rechercher une agence..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            className="search-input"
          />
          {suggestions.length > 0 && (
            <ul className="search-suggestions">
              {suggestions.map((a) => (
                <li
                  key={a.idAgence}
                  onClick={() => handleAgenceSelect(a)}
                >
                  {a.designation}
                </li>
              ))}
            </ul>
          )}
        </header>


          <div className="map-wrapper">
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
