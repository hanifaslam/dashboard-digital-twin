import { API_ENDPOINT } from "@/types/endpoint";
import { ListDeviceResponse } from "@/types/response/digital-twin/device-response";
import { api } from "@/lib/axios";
import { BaseParams } from "@/types/global";

export interface DeviceListParams extends BaseParams {
  status?: string;
  room_id?: string;
  building_id?: string;
  type?: string;
}

export const DeviceService = {
  list: async (params: DeviceListParams) => {
    return api.get<ListDeviceResponse>(API_ENDPOINT.DIGITAL_TWIN.DEVICE.BASE, {
      params,
    });
  },
  control: async (id: string, command: string) => {
    return api.post<null>(
      API_ENDPOINT.DIGITAL_TWIN.DEVICE.CONTROL.replace(":id", id),
      {
        command,
      }
    );
  },
};
