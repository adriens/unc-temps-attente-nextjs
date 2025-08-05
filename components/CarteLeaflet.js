import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icônes pour Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

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

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png', // Par ex. un marqueur rouge
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});



function RecenterMap({ position }) {
    const map = useMap();
    useEffect(() => {
      if (Array.isArray(position) && position.length === 2 && position[0] && position[1]) {
      map.setView(position, 14);
    }
    }, [position, map]);
    return null;
}

export default function CarteLeaflet({ agences, userPosition, position, selectedAgence, onSelectAgence }) {

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

  return (
    <MapContainer 
      center={position} 
      zoom={12} 
      style={{ height: '100%', width: '100%' }}
      >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap position={userPosition} />

      <Marker position={position} icon={userIcon}>
        <Popup>Vous êtes ici</Popup>
      </Marker>

      {(agences || []).map((a) => (
        <Marker
          key={a.idAgence}
          position={{ lat: a.position.lat, lng: a.position.lon }}
          eventHandlers={{
            click: () => {
              if (onSelectAgence) {
                onSelectAgence(a);
              }
            }
          }}
        >
          <Popup>
            <strong>{a.designation}</strong><br />
            {a.commune}
          </Popup>
        </Marker>
      ))}
      {selectedAgence && (
        <aside className="sidebar">
          <h1>{selectedAgence.designation}</h1>

          <p><strong>Commune :</strong> {selectedAgence.commune}</p>
          <p><strong>Adresse : </strong><span>{adresse || "Chargement..."}</span><br/></p>
          <p><strong>Tél : </strong><span>{telephonesAgences[selectedAgence.designation] || "Non disponible"}</span></p>
          <p><strong>E-mail : </strong><span>{emailAgences[selectedAgence.designation] || "Non disponible"}</span></p>
          <p><strong>Temps d'attente estimé : </strong>{selectedAgence.estimatedAvgWaitingTimeMs/1000}s</p>

          <h2>Horaires</h2>
          <p><strong>Lundi à Vendredi : </strong>07:45 - 15:30</p>
          
          <h2>Services (contacter l'agence pour plus d'infos)</h2>
          <p><strong>Boîtes postales</strong></p>
          <p><strong>Conseillers</strong></p>
          <p><strong>Guichets automatique de billets</strong></p>
          <p><strong>Guichets Spécialisés</strong></p>

          <button onClick={() => onSelectAgence(null)}>Fermer</button>
        </aside>
      )}
    </MapContainer>
  );
}

