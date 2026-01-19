"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramController = void 0;
const program_service_1 = require("../services/program.service");
const programService = new program_service_1.ProgramService();
class ProgramController {
    async getPrograms(req, res) {
        try {
            const { type, status, organizerId } = req.query;
            const programs = await programService.getPrograms({
                type: type,
                status: status,
                organizerId: organizerId,
            });
            res.json(programs);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch programs' });
        }
    }
    async getProgramById(req, res) {
        try {
            const { id } = req.params;
            const program = await programService.getProgramById(id);
            if (!program) {
                return res.status(404).json({ error: 'Program not found' });
            }
            res.json(program);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch program' });
        }
    }
    async createProgram(req, res) {
        try {
            // @ts-ignore - user is attached by auth middleware
            const organizerId = req.user.userId;
            const program = await programService.createProgram({
                ...req.body,
                organizerId,
                startDate: new Date(req.body.startDate),
                endDate: new Date(req.body.endDate),
            });
            res.status(201).json(program);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create program' });
        }
    }
    async createBatch(req, res) {
        try {
            const { id } = req.params;
            const batch = await programService.createBatch(id, {
                ...req.body,
                startDate: new Date(req.body.startDate),
                endDate: new Date(req.body.endDate),
            });
            res.status(201).json(batch);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create batch' });
        }
    }
    async applyToBatch(req, res) {
        try {
            const { batchId } = req.params;
            // @ts-ignore
            const userId = req.user.userId;
            const participant = await programService.applyToBatch(batchId, userId);
            res.status(201).json(participant);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getBatchParticipants(req, res) {
        try {
            const { batchId } = req.params;
            const participants = await programService.getBatchParticipants(batchId);
            res.json(participants);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch participants' });
        }
    }
    async updateParticipantStatus(req, res) {
        try {
            const { participantId } = req.params;
            const { status } = req.body;
            const participant = await programService.updateParticipantStatus(participantId, status);
            res.json(participant);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update status' });
        }
    }
    async getMyParticipations(req, res) {
        try {
            // @ts-ignore
            const userId = req.user.userId;
            const participations = await programService.getMyParticipations(userId);
            res.json(participations);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch my participations' });
        }
    }
    async createMilestone(req, res) {
        try {
            const { id } = req.params;
            const milestone = await programService.createMilestone(id, req.body);
            res.status(201).json(milestone);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create milestone' });
        }
    }
    async getProgramMilestones(req, res) {
        try {
            const { id } = req.params;
            const milestones = await programService.getProgramMilestones(id);
            res.json(milestones);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch milestones' });
        }
    }
}
exports.ProgramController = ProgramController;
