
import whyUsImage from "@/assets/rectangle.jpeg";
import stonkIcon from "@/assets/stonk_graph.png";

const WhyUs = () => {
    return (
        <section className="py-24 bg-white font-sans">
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
                            className="w-full h-auto rounded-[2rem] object-cover shadow-lg"
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
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Lorem ipsum dolor sit amet</h3>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
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
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Lorem ipsum dolor sit amet</h3>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
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
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Lorem ipsum dolor sit amet</h3>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
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
