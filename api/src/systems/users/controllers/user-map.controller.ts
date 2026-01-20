import { Request, Response } from 'express';
import { UserMapService } from '../services/user-map.service';

export class UserMapController {
    private userMapService: UserMapService;

    constructor() {
        this.userMapService = new UserMapService();
    }

    getDistribution = async (req: Request, res: Response) => {
        try {
            const data = await this.userMapService.getDistributionData();
            return res.status(200).json({
                success: true,
                data,
                message: 'User distribution data fetched successfully',
            });
        } catch (error) {
            console.error('Error fetching user distribution:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch user distribution data',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };
}
