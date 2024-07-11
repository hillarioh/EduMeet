"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const meeting_room_controller_1 = require("../controllers/meeting.room.controller");
const express_1 = __importDefault(require("express"));
const meetingRoomRouter = express_1.default.Router();
meetingRoomRouter.route("/").post(meeting_room_controller_1.createMeetingRoom);
exports.default = meetingRoomRouter;
