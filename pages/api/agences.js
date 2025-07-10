/*Choisir la version à tester en supprimant les commentaires de l'un et en ajoutant dans l'autre :
API normale : Erreur LatLng object, il y'a bien le JSON contenant les infos de l'API temps-attente de l'OPT dans http://localhost:3000/api/agences
Mock API : Version pour seulement tester l'UI de la page web, sans les infos de l'API temps-attente de l'OPT.
*/

//Version API normale
/*
let cache = null;
let last = 0;
const TTL = 1000 * 60 * 5; // 5 min

export default async function handler(req, res) {
  const now = Date.now();
  if (cache && now - last < TTL) {
    return res.status(200).json(cache);
  }
  try {
    const response = await fetch('https://api.opt.nc/temps-attente-agences/agences', {
      headers: {
        'x-apikey': process.env.API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API OPT-NC : ${response.statusText}`);
    }

    const data = await response.json();
    cache = data;
    last = now;
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erreur API Route OPT-NC :', error);
    return res.status(500).json({ message: error.message });
  }
}
  */

//Version MOCK API

export default async function handler(req, res) {
  const agences = [
    { id: 1, nom: "Centre Ville", adresse: "Rue A", latitude: -22.27, longitude: 166.44 },
    { id: 2, nom: "Magenta", adresse: "Rue B", latitude: -22.26, longitude: 166.47 }
  ];
  res.status(200).json(agences);
}
