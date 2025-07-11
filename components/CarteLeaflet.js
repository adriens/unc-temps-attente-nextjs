import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icônes pour Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png', // Par ex. un marqueur rouge
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function CarteLeaflet({ agences, position, onSelectAgence }) {
  return (
    <MapContainer center={position} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

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
    </MapContainer>
  );
}

