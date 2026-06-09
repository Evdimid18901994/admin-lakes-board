'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { WaterBody, WaterBodyPassport } from '@/types';
import Link from 'next/link';
import { WaterBodyPolygonEditor } from './WaterBodyPolygonEditor';
import * as turf from '@turf/turf';

type WaterBodyForm = {
  name: string;
  district: string;
  locationDesc: string;
  latitude: string;
  longitude: string;
  cadastralNumber: string;
  boundaries?: any;
  passport: {
    area: string;
    maxDepth: string;
    avgDepth: string;
    fisheryType: string;
    ichthyofauna: string;
  };
};

const emptyForm: WaterBodyForm = {
  name: '',
  district: '',
  locationDesc: '',
  latitude: '',
  longitude: '',
  cadastralNumber: '',
  passport: {
    area: '',
    maxDepth: '',
    avgDepth: '',
    fisheryType: '',
    ichthyofauna: '',
  },
};

function toNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

function buildPassport(form: WaterBodyForm): WaterBodyPassport | undefined {
  const passport: WaterBodyPassport = {
    area: toNumber(form.passport.area),
    maxDepth: toNumber(form.passport.maxDepth),
    avgDepth: toNumber(form.passport.avgDepth),
    fisheryType: form.passport.fisheryType.trim() || undefined,
    ichthyofauna: form.passport.ichthyofauna.trim() || undefined,
  };

  const hasAnyValue = Object.values(passport).some(
    (value) => value !== undefined && value !== null && value !== '',
  );

  return hasAnyValue ? passport : undefined;
}

export function WaterBodyManager() {
  const [items, setItems] = useState<WaterBody[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<WaterBodyForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [boundaries, setBoundaries] = useState<any>(null);

  async function load() {
    try {
      setLoading(true);
      setError('');
      const data = await api.getWaterBodies();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load water bodies');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit() {
    try {
      if (!form.name.trim()) {
        alert('Введите название водоёма');
        return;
      }

      const polygon = turf.feature(boundaries);
      const center = turf.pointOnFeature(polygon); 
      const [lng, lat] = center.geometry.coordinates;

      const area = turf.area(polygon);
      console.log(area);

      const payload = {
        name: form.name,
        district: form.district.trim() || undefined,
        locationDesc: form.locationDesc.trim() || undefined,
        latitude: Number(lat.toFixed(6)) || undefined,
        longitude: Number(lng.toFixed(6)) || undefined,
        cadastralNumber: form.cadastralNumber.trim() || undefined,
        passport: buildPassport(form),
        boundaries: boundaries, 
      };

      if (editingId) {
        await api.updateWaterBody(editingId, payload);
      } else {
        await api.createWaterBody(payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Water body save failed');
    }
  }

  async function remove(id: string) {
    if (!confirm('Удалить водоём?')) return;

    try {
      await api.deleteWaterBody(id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  function startEdit(item: WaterBody) {
    setEditingId(item.id);
    setBoundaries(item.boundaries ?? null);
    setForm({
      name: item.name || '',
      district: item.district || '',
      locationDesc: item.locationDesc || '',
      latitude: item.latitude != null ? String(item.latitude) : '',
      longitude: item.longitude != null ? String(item.longitude) : '',
      cadastralNumber: item.cadastralNumber || '',
      passport: {
        area: item.passport?.area != null ? String(item.passport.area) : '',
        maxDepth: item.passport?.maxDepth != null ? String(item.passport.maxDepth) : '',
        avgDepth: item.passport?.avgDepth != null ? String(item.passport.avgDepth) : '',
        fisheryType: item.passport?.fisheryType || '',
        ichthyofauna: item.passport?.ichthyofauna || '',
      },
    });
  }

  return (
    <div className="stack">
      {/* FORM */}
      <div className="card stack">
        <h3>{editingId ? 'Edit water body' : 'Create water body'}</h3>

        <div className="form-grid">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <input placeholder="Location" value={form.locationDesc} onChange={(e) => setForm({ ...form, locationDesc: e.target.value })} />
          <input placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
          <input placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          <input placeholder="Cadastral" value={form.cadastralNumber} onChange={(e) => setForm({ ...form, cadastralNumber: e.target.value })} />
        </div>
        <WaterBodyPolygonEditor
            value={boundaries}
            onChange={setBoundaries}
            items={items}
          />

        <button className="btn" onClick={submit}>
          {editingId ? 'Save' : 'Create'}
        </button>
      </div>

      {/* TABLE */}
      <div className="card">
        <h3>Water bodies</h3>

        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>District</th>
              <th>Location</th>
              <th>Lat</th>
              <th>Lng</th>
              <th>Measurements</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.district || '—'}</td>
                <td>{item.locationDesc || '—'}</td>
                <td>{item.latitude ?? '—'}</td>
                <td>{item.longitude ?? '—'}</td>
                <td>{item.measurements?.length ?? 0}</td>

                <td>
                  <div className="actions">
                    <Link className="btn secondary" href={`/water-bodies/${item.id}`}>
                      Details
                    </Link>

                    <button className="btn secondary" onClick={() => startEdit(item)}>
                      Edit
                    </button>

                    <button className="btn danger" onClick={() => remove(item.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}