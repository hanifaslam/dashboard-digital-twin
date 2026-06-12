import { create } from "zustand";

interface MapboxCameraState {
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  setViewState: (viewState: Partial<MapboxCameraState["viewState"]>) => void;
}

export const useMapboxCamera = create<MapboxCameraState>((set) => ({
  viewState: {
    longitude: 110.43436293386422,
    latitude: -7.052528631105904,
    zoom: 17,
    pitch: 45,
    bearing: 0,
  },
  setViewState: (newState) =>
    set((state) => ({
      viewState: { ...state.viewState, ...newState },
    })),
}));
