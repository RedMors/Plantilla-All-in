'use client'

import { useEffect, useState } from 'react'

const POSITION: [number, number] = [13.7034, -89.2182]
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=13.7034,-89.2182'

export default function MapWidget() {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import('react-leaflet')['MapContainer']
    TileLayer: typeof import('react-leaflet')['TileLayer']
    Marker: typeof import('react-leaflet')['Marker']
    Popup: typeof import('react-leaflet')['Popup']
    L: typeof import('leaflet')
  } | null>(null)

  useEffect(() => {
    Promise.all([import('react-leaflet'), import('leaflet'), import('leaflet/dist/leaflet.css')]).then(
      ([rl, L]) => {
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })
        setMapComponents({
          MapContainer: rl.MapContainer,
          TileLayer: rl.TileLayer,
          Marker: rl.Marker,
          Popup: rl.Popup,
          L,
        })
      }
    )
  }, [])

  if (!MapComponents) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F5EFE8]">
        <div className="w-5 h-5 border-2 border-[#C4965A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={POSITION}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={POSITION}>
          <Popup>
            <strong>Nails by Mariela</strong><br />
            Col. Escalón, San Salvador
          </Popup>
        </Marker>
      </MapContainer>
      <a
        href={MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-[1000] bg-white text-[11px] font-semibold tracking-wide px-3 py-1.5 border border-[#EDE9E3] hover:border-[#C4965A] transition-colors"
        style={{ color: '#C4965A' }}
      >
        Abrir en Maps ↗
      </a>
    </div>
  )
}
