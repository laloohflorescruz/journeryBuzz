import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Modal, { modalBtnGhost, modalBtnPrimary } from './Modal';

// Iconos del marcador vía CDN (evita problemas de bundling de los PNG de Leaflet).
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Centro por defecto: Santo Domingo, RD (cuando el local aún no tiene coordenadas).
// Mismo selector que el panel admin (Leaflet + OpenStreetMap, regla de mapas
// para los paneles de socios).
const DEFAULT_CENTER: [number, number] = [18.4861, -69.9312];

interface LocationMapModalProps {
  open: boolean;
  lat: number;
  lng: number;
  name?: string;
  onClose: () => void;
  onChange: (lat: number, lng: number) => void;
}

// Captura clics en el mapa para reposicionar el marcador.
const ClickHandler: React.FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
  useMapEvents({ click: e => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
};

const LocationMapModal: React.FC<LocationMapModalProps> = ({ open, lat, lng, name, onClose, onChange }) => {
  const hasCoords = !!lat && !!lng;
  const [pos, setPos] = useState<[number, number]>(hasCoords ? [lat, lng] : DEFAULT_CENTER);

  if (!open) return null;

  const pick = (la: number, ln: number) => setPos([la, ln]);
  const apply = () => { onChange(pos[0], pos[1]); onClose(); };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Ubicación${name ? ` · ${name}` : ''}`}
      size="lg"
      bodyClassName="p-0"
      footer={(
        <>
          <p className="mr-auto text-xs text-slate-500">
            Haz clic en el mapa o arrastra el marcador.{' '}
            <span className="font-medium text-slate-700">{pos[0].toFixed(5)}, {pos[1].toFixed(5)}</span>
          </p>
          <button type="button" onClick={onClose} className={modalBtnGhost}>Cancelar</button>
          <button type="button" onClick={apply} className={modalBtnPrimary}>Usar esta ubicación</button>
        </>
      )}
    >
      <div className="h-80 w-full">
        <MapContainer center={pos} zoom={hasCoords ? 14 : 9} scrollWheelZoom
          style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onPick={pick} />
          <Marker
            position={pos}
            icon={markerIcon}
            draggable
            eventHandlers={{ dragend: e => { const m = e.target.getLatLng(); pick(m.lat, m.lng); } }} />
        </MapContainer>
      </div>
    </Modal>
  );
};

export default LocationMapModal;
