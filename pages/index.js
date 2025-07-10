import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const CarteLeaflet = dynamic(() => import('../components/CarteLeaflet'), { ssr: false });

export default function Home() {
  const [agences, setAgences] = useState([]);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [userPosition, setUserPosition] = useState(null); // position initiale de l’utilisateur

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
        const text = await res.text();
        const data = JSON.parse(text);
        console.log('AGENCES:', data);
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

  // Trouver la plus proche après userPosition + agences chargées
  useEffect(() => {
    if (
      userPosition &&
      typeof userPosition.lat === 'number' &&
      typeof userPosition.lng === 'number' &&
      agences.length > 0
    ) {
      const valides = agences.filter(
        (a) => typeof a.latitude === 'number' && typeof a.longitude === 'number'
      );

      if (valides.length === 0) {
        console.log('Aucune agence valide');
        return;
      }

      let min = Infinity;
      let closest = null;

      valides.forEach((a) => {
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
        console.log('Agence la plus proche:', closest);
        setPosition({ lat: closest.latitude, lng: closest.longitude });
      } else {
        console.log('Pas d’agence la plus proche trouvée');
      }
    }
  }, [userPosition, agences]);

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
        Trouvez votre agence OPT la plus proche en fonction de votre géolocalisation !
      </h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {position &&
      typeof position.lat === 'number' &&
      typeof position.lng === 'number' ? (
        <div style={{ height: '80vh' }}>
          <CarteLeaflet agences={agences} position={position} />
        </div>
      ) : (
        <p>Chargement position…</p>
      )}
    </main>
  );
}
