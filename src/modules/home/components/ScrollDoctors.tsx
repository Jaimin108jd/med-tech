import { motion, useTransform, useScroll } from "framer-motion";
import { useRef } from "react";
import { Lexend_Giga } from "next/font/google";
import { cn } from "@/lib/utils";
const lxgiga = Lexend_Giga({
  subsets: ["latin", "latin-ext", "vietnamese"],
});
const DoctorScrollCarousel = () => {
  return (
    <div className="bg-white">
      <div className="flex  items-center justify-center">
        <span className={cn("font-bold text-6xl", lxgiga.className)}>
          <span className="text-blue-500">Our</span> Doctors
        </span>
      </div>
      <HorizontalScrollCarousel />
    </div>
  );
};

const HorizontalScrollCarousel = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-white">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-4">
          {cards.map((card) => {
            return <Card card={card} key={card.id} />;
          })}
        </motion.div>
      </div>
    </section>
  );
};

const Card = ({ card }: any) => {
  return (
    <div
      key={card.id}
      className="group relative h-[450px] w-[450px] overflow-hidden bg-neutral-200"
    >
      <div
        style={{
          backgroundImage: `url(${card.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110"
      ></div>
      <div className="absolute inset-0 z-10 grid place-content-center">
        {/* <p className="bg-gradient-to-br from-white/20 to-white/0 p-8 text-6xl font-black uppercase text-white backdrop-blur-lg">
          {card.title}
        </p> */}
      </div>
    </div>
  );
};

export default DoctorScrollCarousel;

const cards = [
  {
    url: "/doctor-1.jpg",
    title: "Title 1",
    id: 1,
  },
  {
    url: "/doctor-2.png",
    title: "Title 2",
    id: 2,
  },
  {
    url: "/doctor-3.png",
    title: "Title 3",
    id: 3,
  },
  {
    url: "/doctor-4.jpg",
    title: "Title 4",
    id: 4,
  },
  {
    url: "/doctor-5.jpg",
    title: "Title 5",
    id: 5,
  },
  {
    url: "/doctor-6.jpg",
    title: "Title 6",
    id: 6,
  },
  {
    url: "/doctor-7.jpg",
    title: "Title 7",
    id: 7,
  },
];
