import { describe, it, expect } from 'vitest';
import { LevelDeterminationService } from '../level.service';

describe('LevelDeterminationService', () => {
    describe('determineLevel', () => {
        it('should return MIKRO for scores <= 40', () => {
            expect(LevelDeterminationService.determineLevel(0)).toBe('mikro');
            expect(LevelDeterminationService.determineLevel(20)).toBe('mikro');
            expect(LevelDeterminationService.determineLevel(40)).toBe('mikro');
        });

        it('should return KECIL for scores > 40 and <= 70', () => {
            expect(LevelDeterminationService.determineLevel(41)).toBe('kecil');
            expect(LevelDeterminationService.determineLevel(55)).toBe('kecil');
            expect(LevelDeterminationService.determineLevel(70)).toBe('kecil');
        });

        it('should return MENENGAH for scores > 70', () => {
            expect(LevelDeterminationService.determineLevel(71)).toBe('menengah');
            expect(LevelDeterminationService.determineLevel(85)).toBe('menengah');
            expect(LevelDeterminationService.determineLevel(100)).toBe('menengah');
        });
    });

    describe('getLevelDetails', () => {
        it('should return correct details for MIKRO', () => {
            const details = LevelDeterminationService.getLevelDetails('mikro');
            expect(details.name).toBe('Mikro');
            expect(details.range).toBe('0 - 40');
        });

        it('should return correct details for KECIL', () => {
            const details = LevelDeterminationService.getLevelDetails('kecil');
            expect(details.name).toBe('Kecil');
            expect(details.range).toBe('41 - 70');
        });

        it('should return correct details for MENENGAH', () => {
            const details = LevelDeterminationService.getLevelDetails('menengah');
            expect(details.name).toBe('Menengah');
            expect(details.range).toBe('71 - 100');
        });

        it('should return unknown for invalid level', () => {
            const details = LevelDeterminationService.getLevelDetails('invalid');
            expect(details.name).toBe('Unknown');
        });
    });
});
