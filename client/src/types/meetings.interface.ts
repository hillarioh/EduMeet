import { IUser } from "./users.interface";

export interface IMeetingData {
  _id?: string;
  title: string;
  description: string;
  session_id?: number | string;
  status?: string;
  start_time?: Date | string;
  end_time?: Date | string;
  isInstant?: boolean;
  host: string;
  passcode_required?: boolean;
  waiting_room?: boolean;
  require_confirm?: boolean;
  passcode?: string;
  participants?: IUser[];
  video?: {
    host: string;
    participants: string;
  };
}

export interface IMeetingsResponse {
  count: number;
  data: IMeetingData[];
  status: string;
}
