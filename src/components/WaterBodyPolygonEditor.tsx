'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const DEFAULT_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

type Props = {
    value?: any;
    onChange: (geojson: any) => void;
    items?: any[];
}

export function WaterBodyPolygonEditor({value, onChange, items}: Props) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DEFAULT_STYLE,
      center: [68.0, 48.0],
      zoom: 4,
      attributionControl: false,
    });

    mapRef.current = map;

    const draw = new MapboxDraw({
        displayControlsDefault: false,
    });

    drawRef.current = draw;

    map.addControl(draw as any, 'top-left');

    map.on('draw.create', update);
    map.on('draw.update', update);

    function update(e: any) {
      const feature = e.features?.[0];
      if (!feature) return;

      onChange({
        type: feature.geometry.type,
        coordinates: feature.geometry.coordinates,
      });
    }

    map.on('load', () => {
      isLoadedRef.current = true;

      map.addSource('water-bodies-all', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'water-bodies-all-fill',
        type: 'fill',
        source: 'water-bodies-all',
        paint: {
          'fill-color': '#f0c5f5',
          'fill-opacity': 0.2,
        },
      });

      map.addLayer({
        id: 'water-bodies-all-line',
        type: 'line',
        source: 'water-bodies-all',
        paint: {
          'line-color': '#ab4ebb',
          'line-width': 2,
        },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const draw = drawRef.current;

    if (!draw) return;

    draw.deleteAll();

    if (!value) return;

    draw.add({
      type: 'Feature',
      geometry: value,
      properties: {},
    });
  }, [value]);

  useEffect(() => {
  const map = mapRef.current;
  if (!map) return;

  const source = map.getSource('water-bodies-all') as any;
      if (!source || !items) return;

      const geojson = {
        type: 'FeatureCollection',
        features: items
          .filter((w) => w.boundaries)
          .map((w) => ({
            type: 'Feature',
            geometry: w.boundaries,
            properties: {
              id: w.id,
              name: w.name,
            },
          })),
      };

      source.setData(geojson);
    }, [items]);

    const handleDraw = () => {
        drawRef.current?.changeMode('draw_polygon');
    };

    const handleEdit = () => {
        const draw = drawRef.current;
        if (!draw) return;

        const selected = draw.getSelectedIds?.();

        if (selected?.length) {
            draw.changeMode('direct_select', {
            featureId: selected[0],
            });
        }
    };

    const handleDelete = () => {
      const draw = drawRef.current;
      if (!draw) return;

      draw.deleteAll();
      onChange(null);
    };

  return (
    <div className="relative">
      <div ref={containerRef} className="map-surface" />

      <div className="absolute top-2 left-2 z-10 flex gap-2">
        <button onClick={handleDraw}>Draw</button>
        <button onClick={handleEdit}>Edit</button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}