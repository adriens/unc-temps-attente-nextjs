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
    const agences = data.filter(
      (a) =>
        typeof a.position.lat === 'number' &&
        typeof a.position.lon === 'number'
    );

    console.log(`✅ ${agences.length} agences valides envoyées`);

    cache = agences;
    last = now;
    
    return res.status(200).json(agences);
  } catch (error) {
    console.error('Erreur API Route OPT-NC :', error);
    return res.status(500).json({ message: error.message });
  }
}