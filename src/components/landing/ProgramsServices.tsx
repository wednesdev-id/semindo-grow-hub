
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
// Import images
import assessmentImg from "@/assets/image 47.png";
import learningImg from "@/assets/image 48.png";
import pendampinganImg from "@/assets/image 49.png";
import konsultasiImg from "@/assets/image 50.png";
import sertifikasiImg from "@/assets/image 51.png";

const ProgramsServices = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden font-sans">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-left max-w-3xl mb-16 animate-fade-in">
                    <span className="text-primary font-bold tracking-wider uppercase text-sm mb-4 inline-block">
                        (PROGRAM & LAYANAN KAMI)
                    </span>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1]">
                        Bagaimana kami membantu UMKM-mu tumbuh
                    </h2>
                </div>

                {/* Top Grid: Intro + Assessment + Learning */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Col 1: Text Intro */}
                    <div className="flex flex-col justify-end pb-8 lg:pb-0 space-y-8 animate-slide-up">
                        <p className="text-xl text-slate-600 leading-relaxed max-w-md">
                            Mulai ketahui permasalahan bisnismu dengan mengikuti self assessment dan temukan solusi bersama kami.
                        </p>
                        <div>
                            <Button className="bg-primary hover:bg-primary-hover text-white rounded-lg px-8 h-12 text-base font-medium shadow-lg shadow-primary/20">
                                Mulai Self Assessment
                            </Button>
                        </div>
                    </div>

                    {/* Col 2: Assessment Card */}
                    <div className="bg-white group animate-slide-up delay-100">
                        <div className="mb-4">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Cek kesehatan bisnis</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Bantu kamu analisis kesehatan bisnismu dengan metode self assessment.
                            </p>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <img
                                src={assessmentImg}
                                alt="Cek kesehatan bisnis"
                                className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>

                    {/* Col 3: Learning Hub Card */}
                    <div className="bg-white group animate-slide-up delay-200">
                        <div className="mb-4">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Learning-hub</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Bergabung dengan kami dan dapatkan akses belajar langsung dengan para profesional.
                            </p>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <img
                                src={learningImg}
                                alt="Learning-hub"
                                className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Grid: Services */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up delay-300">
                    {/* Service 1 */}
                    <div className="group">
                        <div className="mb-4">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Pendampingan UMKM</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Bantu kamu mendapatkan pendampingan berkualitas bantu pertumbuhan UMKM-mu
                            </p>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <img src={pendampinganImg} alt="Pendampingan UMKM" className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                        </div>
                    </div>

                    {/* Service 2 */}
                    <div className="group">
                        <div className="mb-4">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Konsultasi dengan Expert</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Konsultasikan permasalahan bisnismu dan dapatkan solusi dari para expert.
                            </p>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <img src={konsultasiImg} alt="Konsultasi dengan Expert" className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                        </div>
                    </div>

                    {/* Service 3 */}
                    <div className="group">
                        <div className="mb-4">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Sertifikasi & Legalitas</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Kami bekerja sama dengan pemerintah, bantu kamu mendapatkan sertifikasi usaha dan legalitas bisnis.
                            </p>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <img src={sertifikasiImg} alt="Sertifikasi & Legalitas" className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default ProgramsServices;
