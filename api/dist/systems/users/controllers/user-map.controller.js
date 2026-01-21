"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapController = void 0;
const user_map_service_1 = require("../services/user-map.service");
class UserMapController {
    constructor() {
        this.getDistribution = async (req, res) => {
            try {
                const data = await this.userMapService.getDistributionData();
                return res.status(200).json({
                    success: true,
                    data,
                    message: 'User distribution data fetched successfully',
                });
            }
            catch (error) {
                console.error('Error fetching user distribution:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch user distribution data',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        };
        this.userMapService = new user_map_service_1.UserMapService();
    }
}
exports.UserMapController = UserMapController;
