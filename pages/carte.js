import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const CarteLeaflet = dynamic(() => import('../components/CarteLeaflet'), { ssr: false });

export default function CarteAgences() {
  const [agences, setAgences] = useState([]);
  const [position, setPosition] = useState(null); 
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgences = async () => {
      try {
        const res = await fetch('/api/agences');
        if (!res.ok) throw new Error('Erreur API');
        const data = await res.json();
        setAgences(data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les agences');
      }
    };

    fetchAgences();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.error(err);
          setError('Impossible d’obtenir la position');
          // Fallback : position Nouméa si géoloc refusée
          setPosition({ lat: -22.2758, lng: 166.4580 });
        }
      );
    } else {
      // fallback serveur ou pas de géoloc
      setPosition({ lat: -22.2758, lng: 166.4580 });
    }
  }, []);

  if (!position) return <p>Chargement de la position…</p>;

  return (
    <div style={{ height: '100vh' }}>
      <CarteLeaflet agences={agences} position={position} />

      {error && (
        <div style={{
          position: 'absolute',
          top: 10, left: 10,
          background: 'white',
          padding: '10px',
          borderRadius: '4px',
          color: 'red'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
