import type { MapStyleElement } from 'react-native-maps';

/** Estilo escuro do Google Maps (Android) alinhado ao fundo do app; no iOS usamos o modo escuro nativo. */
export const darkMapStyle: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#0A1628' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6888A8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#030C1B' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1A2B45' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0D1B30' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0E2A26' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#16263F' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0A1628' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1E3354' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#06101F' }] },
];
