"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const level_service_1 = require("../level.service");
(0, vitest_1.describe)('LevelDeterminationService', () => {
    (0, vitest_1.describe)('determineLevel', () => {
        (0, vitest_1.it)('should return MIKRO for scores <= 40', () => {
            (0, vitest_1.expect)(level_service_1.LevelDeterminationService.determineLevel(0)).toBe('mikro');
            (0, vitest_1.expect)(level_service_1.LevelDeterminationService.determineLevel(20)).toBe('mikro');
            (0, vitest_1.expect)(level_service_1.LevelDeterminationService.determineLevel(40)).toBe('mikro');
        });
        (0, vitest_1.it)('should return KECIL for scores > 40 and <= 70', () => {
            (0, vitest_1.expect)(level_service_1.LevelDeterminationService.determineLevel(41)).toBe('kecil');
            (0, vitest_1.expect)(level_service_1.LevelDeterminationService.determineLevel(55)).toBe('kecil');
            (0, vitest_1.expect)(level_service_1.LevelDeterminationService.determineLevel(70)).toBe('kecil');
        });
        (0, vitest_1.it)('should return MENENGAH for scores > 70', () => {
            (0, vitest_1.expect)(level_service_1.LevelDeterminationService.determineLevel(71)).toBe('menengah');
            (0, vitest_1.expect)(level_service_1.LevelDeterminationService.determineLevel(85)).toBe('menengah');
            (0, vitest_1.expect)(level_service_1.LevelDeterminationService.determineLevel(100)).toBe('menengah');
        });
    });
    (0, vitest_1.describe)('getLevelDetails', () => {
        (0, vitest_1.it)('should return correct details for MIKRO', () => {
            const details = level_service_1.LevelDeterminationService.getLevelDetails('mikro');
            (0, vitest_1.expect)(details.name).toBe('Mikro');
            (0, vitest_1.expect)(details.range).toBe('0 - 40');
        });
        (0, vitest_1.it)('should return correct details for KECIL', () => {
            const details = level_service_1.LevelDeterminationService.getLevelDetails('kecil');
            (0, vitest_1.expect)(details.name).toBe('Kecil');
            (0, vitest_1.expect)(details.range).toBe('41 - 70');
        });
        (0, vitest_1.it)('should return correct details for MENENGAH', () => {
            const details = level_service_1.LevelDeterminationService.getLevelDetails('menengah');
            (0, vitest_1.expect)(details.name).toBe('Menengah');
            (0, vitest_1.expect)(details.range).toBe('71 - 100');
        });
        (0, vitest_1.it)('should return unknown for invalid level', () => {
            const details = level_service_1.LevelDeterminationService.getLevelDetails('invalid');
            (0, vitest_1.expect)(details.name).toBe('Unknown');
        });
    });
});
