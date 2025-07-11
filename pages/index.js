import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const CarteLeaflet = dynamic(() => import('../components/CarteLeaflet'), { ssr: false });

export default function Home() {
  const [agences, setAgences] = useState([]);
  const [position, setPosition] = useState(null);
  const [userPosition, setUserPosition] = useState(null); // position initiale de l’utilisateur
  const [selectedAgence, setSelectedAgence] = useState(null);
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

  return (
    <main>
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {position &&
      typeof position.lat === 'number' &&
      typeof position.lng === 'number' ? (
        <div style={{ position: 'relative', height: '80vh', width: '100%' }}>
          {selectedAgence && (
            <aside>
              <h2>{selectedAgence.designation}</h2>
              <p><strong>Commune :</strong> {selectedAgence.commune}</p>
              {/* Ajouter d'autres infos ici */}
              <button onClick={() => setSelectedAgence(null)}>Fermer</button>
            </aside>
          )}
          <CarteLeaflet
            agences={agencesFiltrees}
            position={position}
            onSelectAgence={setSelectedAgence}
          />
        </div>
      ) : (
        <p>Chargement position…</p>
      )}

      
    </main>
  );
}
