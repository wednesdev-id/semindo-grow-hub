
import { useState } from "react";
import imgSarah from "@/assets/image 43.png";
import imgEvelyn from "@/assets/image 45.png";
import imgJoko from "@/assets/image 44.png";
import arrowLeft from "@/assets/arrow left.png";
import arrowRight from "@/assets/arrow right.png";

const SuccessStories = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const stories = [
    {
      name: "Sarah Dewi",
      business: "Warung Digital Nusantara",
      category: "F&B",
      date: "Bandung, 12 Januari 2026",
      image: imgSarah,
      quote: "Dari warung kecil menjadi franchise digital dengan 50+ outlet berkat strategi digitalisasi dari Semindo.",
    },
    {
      name: "Evelyn Wijayanto",
      business: "Batik Modern Indonesia",
      category: "Fashion",
      date: "Padang, 22 Januari 2026",
      image: imgEvelyn,
      quote: "Ekspor batik ke 15 negara dengan bantuan program export readiness dan sertifikasi internasional.",
    },
    {
      name: "Joko Utomo",
      business: "Toko pertanian",
      category: "Pertanian",
      date: "Timika, 24 Januari 2026",
      image: imgJoko,
      quote: "Mengintegrasikan IoT dan AI untuk pertanian modern, meningkatkan produktivitas petani lokal 300%.",
    },
    {
      name: "Andi Saputra",
      business: "Kopi Nusantara",
      category: "F&B",
      date: "Aceh, 28 Januari 2026",
      image: imgSarah, // Reusing for demo
      quote: "Omzet meningkat 200% setelah mengikuti program pendampingan dan akses pasar global dari Semindo.",
    }
  ];

  const itemsPerPage = 3;
  const maxIndex = Math.max(0, stories.length - itemsPerPage);

  // Logic: Previous button disabled if index == 0
  // Next button disabled if index >= maxIndex
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex >= maxIndex;

  const handlePrev = () => {
    if (!isPrevDisabled) setCurrentIndex(prev => prev - 1);
  };

  const handleNext = () => {
    if (!isNextDisabled) setCurrentIndex(prev => prev + 1);
  };

  return (
    <section className="py-24 bg-white font-sans">
      <div className="container max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight max-w-2xl">
            Apa yang UMKM rasakan setelah bergabung dengan kami
          </h2>
          <span className="text-primary font-bold uppercase tracking-wider text-sm pt-2">
            (SUCCESS STORY)
          </span>
        </div>

        {/* Stories Grid/Carousel */}
        <div className="overflow-hidden">
          <div
            className="flex gap-8 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (384 + 32)}px)` }} // Approximate card width + gap (w-96 = 384px) - or better: use grid/flex layout logic
          >
            {/* Note: Fixed width translation is tricky with responsive. 
                 For exact "desktop" match where card width is balanced, I'll use a specific card width or flex-basis.
                 The layout shows 3 balanced cards. I'll use simple grid for the cards but apply translation logic if I had to slide them one by one.
                 Or, since I have 4 items, I can just slice the array for simplicity if strictly "3 visible".
                 But "slider" implies movement. I'll settle for a grid that shows `slice(index, index+3)` which simulates sliding without complex CSS transform calc.
             */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {stories.slice(currentIndex, currentIndex + 3).map((story, idx) => (
                <div key={idx} className="bg-[#E9ECF6] rounded-xl p-8 flex flex-col justify-between h-full min-h-[360px] animate-fade-in">
                  {/* Header: Date & Category */}
                  <div className="flex justify-between items-start text-xs sm:text-sm text-slate-500 mb-6 font-medium">
                    <span>{story.date}</span>
                    <span className="text-slate-600">({story.category})</span>
                  </div>

                  {/* Quote */}
                  <div className="mb-8">
                    <p className="text-xl sm:text-2xl font-semibold text-slate-900 leading-snug">
                      "{story.quote}"
                    </p>
                  </div>

                  {/* Profile */}
                  <div className="flex items-center gap-4 mt-auto">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{story.name}</h4>
                      <p className="text-slate-500 text-sm">{story.business}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center items-center gap-4 mt-16">
          <button
            onClick={handlePrev}
            disabled={isPrevDisabled}
            className="transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src={arrowLeft}
              alt="Previous"
              className={`w-12 h-12 object-contain ${isPrevDisabled ? 'grayscale opacity-50' : ''}`}
            // Note: User said "bila tidak on maka warna grey". 
            // If the png is already blue, grayscale makes it grey.
            // Assuming arrow pngs are Blue by default.
            />
          </button>
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src={arrowRight}
              alt="Next"
              className={`w-12 h-12 object-contain ${isNextDisabled ? 'grayscale opacity-50' : ''}`}
            />
          </button>
        </div>

      </div>
    </section>
  );
};

export default SuccessStories;