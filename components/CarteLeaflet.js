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

export default function CarteLeaflet({ agences, position }) {
  return (
    <MapContainer center={position} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>Vous êtes ici</Popup>
      </Marker>
      {(agences || []).map((a) => (
        <Marker key={a.idAgence} position={{ lat: a.latitude, lng: a.longitude }}>
          <Popup>
            <strong>{a.designation}</strong><br />
            {a.commune}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
