import type { Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, type LatLng, type MapType } from 'react-native-maps';

import { authColors, metricColors } from '@/theme';

import { darkMapStyle } from './dark-map-style';

const FALLBACK_REGION = { latitude: -23.5505, longitude: -46.6333 };

function routeRegion(coordinates: LatLng[]) {
  const latitudes = coordinates.map(({ latitude }) => latitude);
  const longitudes = coordinates.map(({ longitude }) => longitude);
  const [minLat, maxLat] = [Math.min(...latitudes), Math.max(...latitudes)];
  const [minLon, maxLon] = [Math.min(...longitudes), Math.max(...longitudes)];
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: Math.max(0.002, (maxLat - minLat) * 1.5),
    longitudeDelta: Math.max(0.002, (maxLon - minLon) * 1.5),
  };
}

export function RouteMap({
  coordinates,
  interactive = false,
  mapRef,
  mapType = 'standard',
  onPanDrag,
  zoomDelta = 0.008,
}: {
  coordinates: LatLng[];
  interactive?: boolean;
  mapRef?: Ref<MapView>;
  mapType?: MapType;
  onPanDrag?: () => void;
  zoomDelta?: number;
}) {
  const start = coordinates[0];
  const latest = coordinates.at(-1);
  const center = latest ?? FALLBACK_REGION;

  return (
    <MapView
      ref={mapRef}
      customMapStyle={darkMapStyle}
      initialRegion={
        // Fora da corrida o mapa só ilustra o percurso: enquadra a rota inteira.
        interactive || coordinates.length < 2
          ? { ...center, latitudeDelta: zoomDelta, longitudeDelta: zoomDelta }
          : routeRegion(coordinates)
      }
      loadingBackgroundColor={authColors.background}
      loadingEnabled
      mapType={mapType}
      onPanDrag={onPanDrag}
      pitchEnabled={false}
      rotateEnabled={interactive}
      scrollEnabled={interactive}
      showsCompass={false}
      showsMyLocationButton={false}
      style={StyleSheet.absoluteFill}
      toolbarEnabled={false}
      userInterfaceStyle="dark"
      zoomEnabled={interactive}>
      {coordinates.length > 1 ? (
        <Polyline
          coordinates={coordinates}
          lineCap="round"
          lineJoin="round"
          strokeColor={authColors.primary}
          strokeWidth={5}
        />
      ) : null}
      {start && coordinates.length > 1 ? (
        <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={start}>
          <View
            className="h-4 w-4 rounded-full border-2 border-white"
            style={{ backgroundColor: metricColors.start }}
          />
        </Marker>
      ) : null}
      {latest ? (
        <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={latest}>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-auth-primary/30">
            <View className="h-4 w-4 rounded-full border-2 border-white bg-auth-primary" />
          </View>
        </Marker>
      ) : null}
    </MapView>
  );
}
