"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionController = exports.SegmentationController = void 0;
const segmentation_service_1 = require("../services/segmentation.service");
const region_service_1 = require("../services/region.service");
class SegmentationController {
    /**
     * GET /api/umkm/segmentation/stats
     * Get comprehensive segmentation statistics
     */
    static async getStats(req, res) {
        try {
            const stats = await segmentation_service_1.segmentationService.getStats();
            res.json({ success: true, data: stats });
        }
        catch (error) {
            console.error('Error getting segmentation stats:', error);
            res.status(500).json({ success: false, error: 'Failed to get statistics' });
        }
    }
    /**
     * GET /api/umkm/segmentation/list
     * Get UMKM list filtered by segmentation
     */
    static async getList(req, res) {
        try {
            const { segmentation, level, province, city, page, limit, search, } = req.query;
            const result = await segmentation_service_1.segmentationService.getBySegmentation({
                segmentation: segmentation,
                level: level,
                province: province,
                city: city,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                search: search,
            });
            res.json({ success: true, ...result });
        }
        catch (error) {
            console.error('Error getting segmentation list:', error);
            res.status(500).json({ success: false, error: 'Failed to get list' });
        }
    }
    /**
     * POST /api/umkm/:id/recalculate-segmentation
     * Recalculate segmentation for a single UMKM
     */
    static async recalculate(req, res) {
        try {
            const { id } = req.params;
            const updated = await segmentation_service_1.segmentationService.recalculateSegmentation(id);
            res.json({
                success: true,
                data: updated,
                message: 'Segmentation recalculated successfully',
            });
        }
        catch (error) {
            console.error('Error recalculating segmentation:', error);
            res.status(500).json({ success: false, error: 'Failed to recalculate' });
        }
    }
    /**
     * POST /api/umkm/segmentation/bulk-recalculate
     * Bulk recalculate segmentation for all UMKM
     */
    static async bulkRecalculate(req, res) {
        try {
            const result = await segmentation_service_1.segmentationService.bulkRecalculateSegmentation();
            res.json({
                success: true,
                data: result,
                message: `Processed ${result.processed} UMKM, updated ${result.updated}`,
            });
        }
        catch (error) {
            console.error('Error bulk recalculating:', error);
            res.status(500).json({ success: false, error: 'Failed to bulk recalculate' });
        }
    }
    /**
     * POST /api/umkm/calculate-segmentation
     * Calculate segmentation without saving (preview)
     */
    static async calculatePreview(req, res) {
        try {
            const { turnover, assets, employees, selfAssessmentScore } = req.body;
            const result = segmentation_service_1.segmentationService.calculateSegmentation({
                turnover,
                assets,
                employees,
                selfAssessmentScore,
            });
            res.json({ success: true, data: result });
        }
        catch (error) {
            console.error('Error calculating segmentation:', error);
            res.status(500).json({ success: false, error: 'Failed to calculate' });
        }
    }
}
exports.SegmentationController = SegmentationController;
class RegionController {
    /**
     * GET /api/umkm/regions
     * Get all provinces with UMKM count
     */
    static async getProvinces(req, res) {
        try {
            const provinces = await region_service_1.regionService.getProvinces();
            res.json({ success: true, data: provinces });
        }
        catch (error) {
            console.error('Error getting provinces:', error);
            res.status(500).json({ success: false, error: 'Failed to get provinces' });
        }
    }
    /**
     * GET /api/umkm/regions/:province
     * Get province details with stats
     */
    static async getProvinceStats(req, res) {
        try {
            const { province } = req.params;
            const stats = await region_service_1.regionService.getProvinceStats(province);
            res.json({ success: true, data: stats });
        }
        catch (error) {
            console.error('Error getting province stats:', error);
            res.status(500).json({ success: false, error: 'Failed to get province stats' });
        }
    }
    /**
     * GET /api/umkm/regions/:province/cities
     * Get cities in a province with UMKM count
     */
    static async getCities(req, res) {
        try {
            const { province } = req.params;
            const cities = await region_service_1.regionService.getCitiesByProvince(province);
            res.json({ success: true, data: cities });
        }
        catch (error) {
            console.error('Error getting cities:', error);
            res.status(500).json({ success: false, error: 'Failed to get cities' });
        }
    }
    /**
     * GET /api/umkm/regions/:province/:city
     * Get city-level stats
     */
    static async getCityStats(req, res) {
        try {
            const { province, city } = req.params;
            const stats = await region_service_1.regionService.getCityStats(province, city);
            res.json({ success: true, data: stats });
        }
        catch (error) {
            console.error('Error getting city stats:', error);
            res.status(500).json({ success: false, error: 'Failed to get city stats' });
        }
    }
    /**
     * GET /api/umkm/map-data
     * Get GeoJSON-compatible data for map visualization
     */
    static async getMapData(req, res) {
        try {
            const { province, city, segmentation, level, limit } = req.query;
            const data = await region_service_1.regionService.getMapData({
                province: province,
                city: city,
                segmentation: segmentation,
                level: level,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({ success: true, data });
        }
        catch (error) {
            console.error('Error getting map data:', error);
            res.status(500).json({ success: false, error: 'Failed to get map data' });
        }
    }
    /**
     * GET /api/umkm/heatmap
     * Get heatmap data
     */
    static async getHeatmap(req, res) {
        try {
            const data = await region_service_1.regionService.getHeatmapData();
            res.json({ success: true, data });
        }
        catch (error) {
            console.error('Error getting heatmap:', error);
            res.status(500).json({ success: false, error: 'Failed to get heatmap' });
        }
    }
}
exports.RegionController = RegionController;
