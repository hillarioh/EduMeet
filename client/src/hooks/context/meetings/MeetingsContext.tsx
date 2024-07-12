import { createContext, useContext, useEffect, useState } from "react";
import {
  ICreateMeetingRoomResponse,
  IMeetingData,
  IMeetingsResponse,
} from "../../../types/meetings.interface";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";
import { IMeetingInvite } from "../types";
import { socket } from "../../../lib/socket";
import { IUser } from "../../../types/users.interface";

export const MeetingsContext = createContext<any>(null);

export const MeetingsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useContext(UserContext);
  const [meetings, setMeetings] = useState<IMeetingsResponse>({
    count: 0,
    data: [],
    status: "",
  });
  const [selectedMeeting, setSelectedMeeting] = useState<IMeetingsResponse["data"][0] | null>(null);
  const [accessRoom, setAccessRoom] = useState<ICreateMeetingRoomResponse | null>(null);
  const [requestedUsers, setRequestedUsers] = useState<IMeetingInvite[]>([]);
  const navigate = useNavigate();

  const updateMeetings = (data: IMeetingsResponse) => {
    setMeetings(data);
    setSelectedMeeting(data.data[0]);
  };

  const selectMeetingHandler = (meeting: IMeetingData) => {
    setSelectedMeeting(meeting);
  };

  const requestJoinMeeting = (meeting: IMeetingData) => {
    socket.emit("request-join-meeting-room", { meeting, user });
  };

  const acceptJoinRequestHandler = ({ meetingId }: { meetingId: number }) => {
    navigate(`/rooms/${meetingId}`);
  };

  const rejectJoinRequestHandler = () => {
    setAccessRoom({
      join_request_rejected: true,
    });
  };

  const joinMeetingInviteHandler = ({
    meetingRoomId,
    sender,
  }: {
    meetingRoomId: string;
    user: IUser;
    sender: IUser;
  }) => {
    setRequestedUsers((prev) => {
      return [
        ...prev,
        {
          title: "Invite Request",
          message: `${sender.full_name} has invited you to join a meeting.`,
          user: sender,
          sender: "host",
          meetingRoomId,
        },
      ];
    });
  };

  const removeRequestedUser = (requestedUser: IMeetingInvite["user"]) => {
    setRequestedUsers((prev: IMeetingInvite[]) =>
      prev.filter((req) => req.user._id !== requestedUser._id)
    );
  };

  const userAcceptHostInvitation = (invitation: IMeetingInvite) => {
    removeRequestedUser(invitation.user);
    navigate(`/rooms/${invitation.meetingRoomId}`);
    setAccessRoom(null);
  };

  const userRejectHostInvitation = (invitation: IMeetingInvite) => {
    removeRequestedUser(invitation.user);
    setAccessRoom(null);
  };

  useEffect(() => {
    if (accessRoom && accessRoom.require_confirm) {
      if (accessRoom.meeting) requestJoinMeeting(accessRoom.meeting);
    }
  }, [accessRoom]);

  useEffect(() => {
    if (user) socket.emit("join-user-to-socket", user._id);
    socket.on("join-request-accepted", acceptJoinRequestHandler);
    socket.on("join-request-rejected", rejectJoinRequestHandler);
    socket.on("invited-to-meeting-room", joinMeetingInviteHandler);
    return () => {
      socket.off("join-request-accepted", acceptJoinRequestHandler);
      socket.off("join-request-rejected", rejectJoinRequestHandler);
      socket.off("invited-to-meeting-room", joinMeetingInviteHandler);
    };
  }, []);

  return (
    <MeetingsContext.Provider
      value={{
        meetings,
        updateMeetings,
        selectedMeeting,
        selectMeetingHandler,
        accessRoom,
        setAccessRoom,
        requestJoinMeeting,
        requestedUsers,
        setRequestedUsers,
        removeRequestedUser,
        userAcceptHostInvitation,
        userRejectHostInvitation,
      }}
    >
      {children}
    </MeetingsContext.Provider>
  );
};
