
const WhoWeAre = () => {
    return (
        <section className="py-24 bg-slate-50 font-sans">
            <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl">
                    {/* Label */}
                    <div className="mb-6">
                        <span className="text-primary font-bold tracking-wider uppercase text-sm">
                            (SIAPA KITA?)
                        </span>
                    </div>

                    {/* Headline with Two-Tone Color */}
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] mb-12">
                        <span className="text-slate-900">
                            Mitra Terpercaya untuk Pertumbuhan UMKM,
                        </span>
                        <span className="text-slate-400">
                            {" "}membangun ekosistem bisnis yang tangguh dan berkelanjutan melalui teknologi inklusif.
                        </span>
                    </h2>

                    {/* Body Paragraph */}
                    <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                        Semindo adalah platform ekosistem digital yang didedikasikan untuk memberdayakan UMKM Indonesia. Kami percaya bahwa setiap usaha kecil memiliki potensi besar untuk menjadi tulang punggung ekonomi bangsa. Kami menghubungkan pelaku usaha dengan mentor ahli, akses pembiayaan, dan pasar global.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default WhoWeAre;
