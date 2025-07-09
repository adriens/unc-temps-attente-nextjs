export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const response = await fetch('https://api.opt.nc/temps-attente-agences/agences', {
      headers: {
        'x-apikey': process.env.NEXT_PUBLIC_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API OPT-NC : ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erreur API Route OPT-NC :', error);
    return res.status(500).json({ message: error.message });
  }
}