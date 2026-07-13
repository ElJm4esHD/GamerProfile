import type {
  Car,
  CreateCarInput,
  CreateLapInput,
  CreateSetupParamInput,
  CreateTrackInput,
  LapRecord,
  SetupParam,
  SimCatalog,
  Track,
  UpdateLapInput,
} from "@gp/shared";
import { api } from "./client.js";

export const simApi = {
  catalog: () => api.get<SimCatalog>("/sim/catalog"),
  laps: () => api.get<LapRecord[]>("/sim/laps"),

  createLap: (input: CreateLapInput) => api.post<LapRecord>("/sim/laps", input),
  updateLap: (id: string, input: UpdateLapInput) =>
    api.patch<LapRecord>(`/sim/laps/${id}`, input),
  removeLap: (id: string) => api.remove(`/sim/laps/${id}`),

  createTrack: (input: CreateTrackInput) => api.post<Track>("/sim/tracks", input),
  createCar: (input: CreateCarInput) => api.post<Car>("/sim/cars", input),
  createSetupParam: (input: CreateSetupParamInput) =>
    api.post<SetupParam>("/sim/setup-params", input),
};
