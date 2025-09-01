export interface Planet {
  description: string;
  distInMillionsKM: PlanetDistance;
  imageName?: string;
  imageUrl: string | null;
  planetColor: string;
  planetName: string;
  planetRadiusKM: number;
}

export interface IPlanet extends Planet {
  id: number;
}

export interface PlanetBackendResponse extends Omit<IPlanet, "distInMillionsKM"> {
  distInMillionsKM: string; // not parsed on backend
}

export interface PlanetDistance {
  fromEarth: number;
  fromSun: number;
}

export enum ViewMode {
  LIST = "list",
  GRID = "grid",
}


