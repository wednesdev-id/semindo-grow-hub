"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelDeterminationService = void 0;
class LevelDeterminationService {
    static determineLevel(score) {
        if (score > this.THRESHOLDS.MENENGAH) {
            return this.LEVELS.MENENGAH;
        }
        else if (score > this.THRESHOLDS.KECIL) {
            return this.LEVELS.KECIL;
        }
        else {
            return this.LEVELS.MIKRO;
        }
    }
    static getLevelDetails(level) {
        switch (level) {
            case this.LEVELS.MIKRO:
                return {
                    name: 'Mikro',
                    description: 'Usaha produktif milik orang perorangan dan/atau badan usaha perorangan yang memenuhi kriteria Usaha Mikro.',
                    range: '0 - 40'
                };
            case this.LEVELS.KECIL:
                return {
                    name: 'Kecil',
                    description: 'Usaha ekonomi produktif yang berdiri sendiri, yang dilakukan oleh orang perorangan atau badan usaha yang bukan merupakan anak perusahaan.',
                    range: '41 - 70'
                };
            case this.LEVELS.MENENGAH:
                return {
                    name: 'Menengah',
                    description: 'Usaha ekonomi produktif yang berdiri sendiri, yang dilakukan oleh orang perorangan atau badan usaha yang bukan merupakan anak perusahaan.',
                    range: '71 - 100'
                };
            default:
                return {
                    name: 'Unknown',
                    description: '-',
                    range: '-'
                };
        }
    }
}
exports.LevelDeterminationService = LevelDeterminationService;
Object.defineProperty(LevelDeterminationService, "LEVELS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        MIKRO: 'mikro',
        KECIL: 'kecil',
        MENENGAH: 'menengah'
    }
});
Object.defineProperty(LevelDeterminationService, "THRESHOLDS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        KECIL: 40,
        MENENGAH: 70
    }
});
