
export class LevelDeterminationService {
    static readonly LEVELS = {
        MIKRO: 'mikro',
        KECIL: 'kecil',
        MENENGAH: 'menengah'
    };

    static readonly THRESHOLDS = {
        KECIL: 40,
        MENENGAH: 70
    };

    static determineLevel(score: number): string {
        if (score > this.THRESHOLDS.MENENGAH) {
            return this.LEVELS.MENENGAH;
        } else if (score > this.THRESHOLDS.KECIL) {
            return this.LEVELS.KECIL;
        } else {
            return this.LEVELS.MIKRO;
        }
    }

    static getLevelDetails(level: string) {
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
