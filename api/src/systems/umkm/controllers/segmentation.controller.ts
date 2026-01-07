import { Request, Response } from 'express';
import { segmentationService } from '../services/segmentation.service';
import { regionService } from '../services/region.service';

export class SegmentationController {
    /**
     * GET /api/umkm/segmentation/stats
     * Get comprehensive segmentation statistics
     */
    static async getStats(req: Request, res: Response) {
        try {
            const stats = await segmentationService.getStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            console.error('Error getting segmentation stats:', error);
            res.status(500).json({ success: false, error: 'Failed to get statistics' });
        }
    }

    /**
     * GET /api/umkm/segmentation/list
     * Get UMKM list filtered by segmentation
     */
    static async getList(req: Request, res: Response) {
        try {
            const {
                segmentation,
                level,
                province,
                city,
                page,
                limit,
                search,
            } = req.query;

            const result = await segmentationService.getBySegmentation({
                segmentation: segmentation as string,
                level: level as string,
                province: province as string,
                city: city as string,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                search: search as string,
            });

            res.json({ success: true, ...result });
        } catch (error) {
            console.error('Error getting segmentation list:', error);
            res.status(500).json({ success: false, error: 'Failed to get list' });
        }
    }

    /**
     * POST /api/umkm/:id/recalculate-segmentation
     * Recalculate segmentation for a single UMKM
     */
    static async recalculate(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updated = await segmentationService.recalculateSegmentation(id);
            res.json({
                success: true,
                data: updated,
                message: 'Segmentation recalculated successfully',
            });
        } catch (error) {
            console.error('Error recalculating segmentation:', error);
            res.status(500).json({ success: false, error: 'Failed to recalculate' });
        }
    }

    /**
     * POST /api/umkm/segmentation/bulk-recalculate
     * Bulk recalculate segmentation for all UMKM
     */
    static async bulkRecalculate(req: Request, res: Response) {
        try {
            const result = await segmentationService.bulkRecalculateSegmentation();
            res.json({
                success: true,
                data: result,
                message: `Processed ${result.processed} UMKM, updated ${result.updated}`,
            });
        } catch (error) {
            console.error('Error bulk recalculating:', error);
            res.status(500).json({ success: false, error: 'Failed to bulk recalculate' });
        }
    }

    /**
     * POST /api/umkm/calculate-segmentation
     * Calculate segmentation without saving (preview)
     */
    static async calculatePreview(req: Request, res: Response) {
        try {
            const { turnover, assets, employees, selfAssessmentScore } = req.body;

            const result = segmentationService.calculateSegmentation({
                turnover,
                assets,
                employees,
                selfAssessmentScore,
            });

            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error calculating segmentation:', error);
            res.status(500).json({ success: false, error: 'Failed to calculate' });
        }
    }
}

export class RegionController {
    /**
     * GET /api/umkm/regions
     * Get all provinces with UMKM count
     */
    static async getProvinces(req: Request, res: Response) {
        try {
            const provinces = await regionService.getProvinces();
            res.json({ success: true, data: provinces });
        } catch (error) {
            console.error('Error getting provinces:', error);
            res.status(500).json({ success: false, error: 'Failed to get provinces' });
        }
    }

    /**
     * GET /api/umkm/regions/:province
     * Get province details with stats
     */
    static async getProvinceStats(req: Request, res: Response) {
        try {
            const { province } = req.params;
            const stats = await regionService.getProvinceStats(province);
            res.json({ success: true, data: stats });
        } catch (error) {
            console.error('Error getting province stats:', error);
            res.status(500).json({ success: false, error: 'Failed to get province stats' });
        }
    }

    /**
     * GET /api/umkm/regions/:province/cities
     * Get cities in a province with UMKM count
     */
    static async getCities(req: Request, res: Response) {
        try {
            const { province } = req.params;
            const cities = await regionService.getCitiesByProvince(province);
            res.json({ success: true, data: cities });
        } catch (error) {
            console.error('Error getting cities:', error);
            res.status(500).json({ success: false, error: 'Failed to get cities' });
        }
    }

    /**
     * GET /api/umkm/regions/:province/:city
     * Get city-level stats
     */
    static async getCityStats(req: Request, res: Response) {
        try {
            const { province, city } = req.params;
            const stats = await regionService.getCityStats(province, city);
            res.json({ success: true, data: stats });
        } catch (error) {
            console.error('Error getting city stats:', error);
            res.status(500).json({ success: false, error: 'Failed to get city stats' });
        }
    }

    /**
     * GET /api/umkm/map-data
     * Get GeoJSON-compatible data for map visualization
     */
    static async getMapData(req: Request, res: Response) {
        try {
            const { province, city, segmentation, level, limit } = req.query;

            const data = await regionService.getMapData({
                province: province as string,
                city: city as string,
                segmentation: segmentation as string,
                level: level as string,
                limit: limit ? parseInt(limit as string) : undefined,
            });

            res.json({ success: true, data });
        } catch (error) {
            console.error('Error getting map data:', error);
            res.status(500).json({ success: false, error: 'Failed to get map data' });
        }
    }

    /**
     * GET /api/umkm/heatmap
     * Get heatmap data
     */
    static async getHeatmap(req: Request, res: Response) {
        try {
            const data = await regionService.getHeatmapData();
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error getting heatmap:', error);
            res.status(500).json({ success: false, error: 'Failed to get heatmap' });
        }
    }
}
