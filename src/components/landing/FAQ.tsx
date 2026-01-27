
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
    return (
        <section className="py-24 bg-white font-sans">
            <div className="container max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">

                {/* Header */}
                <div className="max-w-4xl mb-16 mx-auto text-center">
                    <span className="text-primary font-bold tracking-wider uppercase text-sm mb-4 inline-block">
                        (FAQ)
                    </span>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                        Ada pertanyaan? kami<br />siapkan jawaban-nya.
                    </h2>
                </div>

                <div className="max-w-4xl mx-auto">
                    <Accordion type="single" collapsible className="w-full space-y-6" defaultValue="item-1">
                        {/* Item 1 */}
                        <AccordionItem value="item-1" className="bg-white border-b border-gray-200 px-0 pb-6">
                            <AccordionTrigger className="text-2xl font-bold text-slate-900 hover:no-underline py-4 [&[data-state=open]>div>svg]:rotate-180 text-left">
                                Apa saja syarat untuk bergabung dengan Semindo?
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 leading-relaxed text-lg pt-2 text-left">
                                Program Semindo terbuka untuk seluruh pelaku UMKM di Indonesia yang memiliki usaha aktif minimal 6 bulan. Dokumen yang diperlukan meliputi KTP, NPWP (jika ada), dan data usaha dasar.
                            </AccordionContent>
                        </AccordionItem>

                        {/* Item 2 */}
                        <AccordionItem value="item-2" className="bg-white border-b border-gray-200 px-0 pb-6">
                            <AccordionTrigger className="text-2xl font-bold text-slate-900 hover:no-underline py-4 [&[data-state=open]>div>svg]:rotate-180 text-left">
                                Apakah ada biaya pendaftaran?
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 leading-relaxed text-lg pt-2 text-left">
                                Pendaftaran awal dan akses ke fitur dasar Semindo tidak dipungut biaya (Gratis). Untuk program pendampingan intensif atau sertifikasi tertentu, mungkin dikenakan biaya atau subsidi tergantung program yang berjalan.
                            </AccordionContent>
                        </AccordionItem>

                        {/* Item 3 */}
                        <AccordionItem value="item-3" className="bg-white border-b border-gray-200 px-0 pb-6">
                            <AccordionTrigger className="text-2xl font-bold text-slate-900 hover:no-underline py-4 [&[data-state=open]>div>svg]:rotate-180 text-left">
                                Bagaimana proses pendampingan dilakukan?
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 leading-relaxed text-lg pt-2 text-left">
                                Pendampingan dilakukan secara hybrid (online dan offline). Anda akan dipasangkan dengan mentor sesuai bidang usaha, mendapatkan sesi konsultasi rutin, dan akses ke learning hub 24/7.
                            </AccordionContent>
                        </AccordionItem>

                        {/* Item 4 */}
                        <AccordionItem value="item-4" className="bg-white border-b border-gray-200 px-0 pb-6">
                            <AccordionTrigger className="text-2xl font-bold text-slate-900 hover:no-underline py-4 [&[data-state=open]>div>svg]:rotate-180 text-left">
                                Apakah Semindo membantu akses permodalan?
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 leading-relaxed text-lg pt-2 text-left">
                                Ya, kami bekerja sama dengan berbagai lembaga keuangan dan fintech terpercaya untuk memfasilitasi akses permodalan bagi UMKM yang telah terverifikasi dan memenuhi syarat kelayakan bisnis.
                            </AccordionContent>
                        </AccordionItem>

                        {/* Item 5 */}
                        <AccordionItem value="item-5" className="bg-white border-b border-gray-200 px-0 pb-6">
                            <AccordionTrigger className="text-2xl font-bold text-slate-900 hover:no-underline py-4 [&[data-state=open]>div>svg]:rotate-180 text-left">
                                Berapa lama durasi program akselerasi?
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 leading-relaxed text-lg pt-2 text-left">
                                Durasi program bervariasi antara 3 hingga 6 bulan tergantung kategori usaha dan target yang ingin dicapai. Namun, akses ke komunitas dan materi pembelajaran berlaku selamanya selama akun aktif.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
