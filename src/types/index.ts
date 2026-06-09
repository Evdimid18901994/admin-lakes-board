export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: string;
  login: string;
  email: string;
  avatarUrl?: string | null;
  role: UserRole;
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface WaterBodyPassport {
  area?: number;
  overgrowthArea?: number;
  altitude?: number;
  length?: number;
  maxWidth?: number;
  coastlineLength?: number;
  coastlineDev?: number;
  catchmentArea?: number;
  currentDepth?: number;
  maxDepth?: number;
  avgDepth?: number;
  volume?: number;

  fisheryType?: string;
  fishProductivity?: number;
  economicDesc?: string;
  waterProtectionZone?: string;
  waterProtectionStrip?: string;

  ichthyofauna?: string;
  mammals?: string;
  invertebrates?: string;
}

export type Position = [number, number];

export type GeoJSONPolygon = {
  type: 'Polygon';
  coordinates: Position[][];
};

export type GeoJSONFeature = {
  type: 'Feature';
  geometry: GeoJSONPolygon;
  properties?: Record<string, unknown>;
};

export interface WaterBody {
  id: string;
  name: string;
  district?: string | null;
  locationDesc?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  boundaries?: GeoJSONPolygon | null;
  cadastralNumber?: string | null;
  passport?: WaterBodyPassport | null;
  measurements?: Measurement[];
}

export interface Measurement {
  id: string;
  waterBodyId: string;
  recordDate?: string | null;

  ph?: number | null;
  turbidity?: number | null;
  dissolvedGases?: string | null;
  biogenicCompounds?: string | null;
  permanganateOxid?: number | null;

  mineralization?: number | null;
  salinity?: number | null;
  hardness?: number | null;
  calcium?: number | null;
  magnesium?: number | null;
  chlorides?: number | null;
  sulfates?: number | null;
  hydrocarbonates?: number | null;
  potassiumSodium?: number | null;

  overgrowthPercent?: number | null;
  overgrowthDegree?: string | null;

  phytoplanktonDev?: string | null;
  zooplanktonTaxa?: string | null;
  zooplanktonGroups?: string | null;
  zoobenthosTaxa?: string | null;
  zoobenthosGroups?: string | null;
  trophicStatus?: string | null;
}