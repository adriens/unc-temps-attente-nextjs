import { useEffect, useState } from 'react';

export default function ListeAgences() {
  const [agences, setAgences] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgences = async () => {
      try {
        const res = await fetch('https://api.opt.nc/temps-attente-agences/agences', {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
          },
        });

        if (!res.ok) throw new Error(`Erreur ${res.status} : ${res.statusText}`);
        const data = await res.json();
        setAgences(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAgences();
  }, []);

  if (error) return <p>Erreur : {error}</p>;
  if (agences.length === 0) return <p>Chargement...</p>;

  return (
    <div>
      <h1>Liste des agences</h1>
      <ul>
        {agences.map((agence) => (
          <li key={agence.id}>
            {agence.nom} — {agence.adresse}
          </li>
        ))}
      </ul>
    </div>
  );
}