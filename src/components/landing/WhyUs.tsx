
import whyUsImage from "@/assets/rectangle.jpeg";
import stonkIcon from "@/assets/stonk_graph.png";

const WhyUs = () => {
    return (
        <section className="py-24 bg-[#F7F7F7] font-sans">
            <div className="container max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">

                {/* Headline */}
                <div className="mb-16">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight max-w-4xl">
                        Mengapa para UMKM percaya dengan Semindo?
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left Column: Image */}
                    <div className="relative">
                        <img
                            src={whyUsImage}
                            alt="Mengapa Semindo"
                            className="w-full h-auto rounded-xl object-cover shadow-lg"
                        />
                    </div>

                    {/* Right Column: Content List */}
                    <div className="space-y-8">
                        {/* Item 1 */}
                        <div className="flex gap-6 pb-8 border-b border-slate-200">
                            <div className="flex-shrink-0 pt-1">
                                <div className="w-12 h-12 flex items-center justify-center p-2 border border-slate-100 rounded-xl">
                                    <img src={stonkIcon} alt="Icon" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Pendekatan Berbasis Diagnosis Bisnis</h3>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Semindo menerapkan pendekatan berbasis pemetaan kondisi bisnis yang objektif dan terstruktur, sehingga UMKM dapat memahami posisi usahanya secara menyeluruh. Proses ini membantu pelaku usaha mengidentifikasi kekuatan, kelemahan, serta prioritas pengembangan sebelum mengambil keputusan strategis yang berdampak pada pertumbuhan bisnis.
                                </p>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="flex gap-6 pb-8 border-b border-slate-200">
                            <div className="flex-shrink-0 pt-1">
                                <div className="w-12 h-12 flex items-center justify-center p-2 border border-slate-100 rounded-xl">
                                    <img src={stonkIcon} alt="Icon" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Pendampingan Terarah oleh Mentor dan Expert</h3>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Kami menyediakan pendampingan langsung bersama mentor dan tenaga ahli yang memiliki pengalaman praktis di berbagai sektor usaha. Pendekatan ini memastikan UMKM memperoleh arahan yang relevan, aplikatif, dan sesuai dengan konteks bisnis yang sedang dijalankan, bukan sekadar pembelajaran teoritis umum.
                                </p>
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 pt-1">
                                <div className="w-12 h-12 flex items-center justify-center p-2 border border-slate-100 rounded-xl">
                                    <img src={stonkIcon} alt="Icon" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Akses ke Ekosistem dan Pertumbuhan Berkelanjutan</h3>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Semindo menghubungkan UMKM dengan ekosistem pendukung yang mencakup pembelajaran, konsultasi, legalitas, serta peluang kolaborasi dan pembiayaan. Melalui pendekatan ini, UMKM dipersiapkan untuk membangun bisnis yang berkelanjutan, adaptif, dan siap berkembang dalam jangka panjang.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
};

export default WhyUs;
