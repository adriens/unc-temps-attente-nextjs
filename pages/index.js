import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const CarteLeaflet = dynamic(() => import('../components/CarteLeaflet'), { ssr: false });

export default function Home() {
  const [agences, setAgences] = useState([]);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [service, setService] = useState('');

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

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        (err) => {
          console.error(err);
          setError('Géolocalisation refusée. Position par défaut.');
          setPosition({ lat: -22.2758, lon: 166.4580 });
        }
      );
    } else {
      setPosition({ lat: -22.2758, lon: 166.4580 });
    }
  }, []);

  const agencesFiltrees = agences.filter((a) =>
  (service ? a.services?.includes(service) : true)
  && typeof a.latitude === 'number' && typeof a.longitude === 'number'
  );


  return (
    <main style={{ padding: '2rem' }}>
      <h1>L'OPT près de chez moi, trouver une agence</h1>

      <label htmlFor="service">Choisissez un service :</label>
      <select
        id="service"
        value={service}
        onChange={(e) => setService(e.target.value)}
        style={{ margin: '1rem', padding: '0.5rem' }}
      >
        <option value="">---Tout les services---</option>
        <optgroup label="Conseillers">
          <option value="c_telecom">Télécom</option>
          <option value="c_financier">Financier</option>
        </optgroup>
        <optgroup label="Guichets">
          <option value="billets">Billets</option>
          <option value="dedouanement">Dédouanement</option>
          <option value="d_cheques">Dépôt chèques</option>
          <option value="r_colis">Retrait colis</option>
        </optgroup>
        <option value="bp">Boîtes postales</option>
      </select>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {position ? (
        <div style={{ height: '80vh' }}>
          <CarteLeaflet agences={agencesFiltrees} position={position} />
        </div>
      ) : (
        <p>Chargement de la position…</p>
      )}
    </main>
  );
}
