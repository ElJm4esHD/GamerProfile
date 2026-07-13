import type {
  Car,
  CreateCarInput,
  CreateLapInput,
  CreateSetupParamInput,
  CreateTrackInput,
  LapRecord,
  SetupParam,
  SimCatalog,
  StatResult,
  Track,
  UpdateLapInput,
} from "@gp/shared";
import { api } from "./client.js";

export const simApi = {
  catalog: () => api.get<SimCatalog>("/sim/catalog"),
  laps: () => api.get<LapRecord[]>("/sim/laps"),
  stats: () => api.get<StatResult[]>("/sim/stats"),

  createLap: (input: CreateLapInput) => api.post<LapRecord>("/sim/laps", input),
  updateLap: (id: string, input: UpdateLapInput) =>
    api.patch<LapRecord>(`/sim/laps/${id}`, input),
  removeLap: (id: string) => api.remove(`/sim/laps/${id}`),

  createTrack: (input: CreateTrackInput) => api.post<Track>("/sim/tracks", input),
  createCar: (input: CreateCarInput) => api.post<Car>("/sim/cars", input),
  createSetupParam: (input: CreateSetupParamInput) =>
    api.post<SetupParam>("/sim/setup-params", input),

  removeTrack: (id: string) => api.remove(`/sim/tracks/${id}`),
  removeCar: (id: string) => api.remove(`/sim/cars/${id}`),
  removeSetupParam: (id: string) => api.remove(`/sim/setup-params/${id}`),
};
