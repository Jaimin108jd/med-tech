"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BentoCard,
  BentoGrid,
} from "@/modules/home/components/acernity/bento-grid";
import { DotPattern } from "@/modules/home/components/acernity/dotpattern";
import { FlickeringGrid } from "@/modules/home/components/acernity/flickering-bg";
import { Reviews } from "@/modules/home/components/acernity/gallery";
import { Globe } from "@/modules/home/components/acernity/globe";
import { AnimatedGridPattern } from "@/modules/home/components/acernity/sqaures";
import { TextReveal } from "@/modules/home/components/acernity/text-reveal";
import FeatureCards from "@/modules/home/components/feature-card";
import { FloatingNav } from "@/modules/home/components/floating-nav";
import DoctorScrollCarousel from "@/modules/home/components/ScrollDoctors";
import { motion } from "framer-motion";
import {
  Check,
  HeartIcon,
  HomeIcon,
  Microscope,
  ShieldAlertIcon,
  Stethoscope,
  UserIcon,
  ZapIcon,
} from "lucide-react";
import { Lexend_Giga } from "next/font/google";

const navItems = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Product",
    link: "/product",
  },
  {
    name: "Pricing",
    link: "/pricing",
  },
  {
    name: "Blog",
    link: "/blog",
  },
];
const giga = Lexend_Giga({
  subsets: ["latin", "latin-ext", "vietnamese"],
});

const items = [
  {
    image: "https://picsum.photos/300/300?grayscale",
    link: "https://google.com/",
    title: "Item 1",
    description: "This is pretty cool, right?",
  },
  {
    image: "https://picsum.photos/400/400?grayscale",
    link: "https://google.com/",
    title: "Item 2",
    description: "This is pretty cool, right?",
  },
  {
    image: "https://picsum.photos/500/500?grayscale",
    link: "https://google.com/",
    title: "Item 3",
    description: "This is pretty cool, right?",
  },
  {
    image: "https://picsum.photos/600/600?grayscale",
    link: "https://google.com/",
    title: "Item 4",
    description: "This is pretty cool, right?",
  },
];
const profiles = [
  { id: 1, x: "70%", y: "20%", delay: 0.5, scale: 1 },
  { id: 2, x: "85%", y: "35%", delay: 1.2, scale: 0.9 },
  { id: 3, x: "90%", y: "60%", delay: 1.8, scale: 1.2 },
  { id: 4, x: "75%", y: "80%", delay: 2.3, scale: 1 },
  { id: 5, x: "55%", y: "90%", delay: 2.7, scale: 1.1 },
  { id: 6, x: "40%", y: "70%", delay: 3.1, scale: 0.8 },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white">
      <FloatingNav navItems={navItems} />
      <div className="relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg bg-background p-20">
        <AnimatedGridPattern
          numSquares={80}
          maxOpacity={0.3}
          duration={1}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
          )}
        />
        <div className="max-w-5xl mx-auto text-center space-y-12 pt-20">
          <TextReveal
            text="Revolutionizing Healthcare with Advanced Medical Systems"
            highlightedText="Advanced Medical Systems"
            className="mb-6"
          />

          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Our cutting-edge medical systems streamline patient care, enhance
            diagnostic accuracy, and improve overall healthcare efficiency.
            Experience the future of healthcare with our innovative solutions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button className="px-8 py-3 rounded-md bg-black text-white font-medium hover:bg-black/90 transition-all">
              Get Started
            </Button>
            <Button
              variant="outline"
              className="px-8 py-3 rounded-md border border-gray-300 font-medium hover:bg-gray-100 transition-all"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
      <section
        id="Features"
        className="flex flex-col items-center justify-center w-full py-20"
      >
        <div className="section-here max-w-5xl mx-auto text-center space-y-12">
          <h2
            className={cn(
              "text-4xl md:text-5xl font-bold tracking-tight",
              giga.className
            )}
          >
            Features so good you'll
            <span className="text-blue-500"> Love us</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Packed with thousands of features, we are going to show you only 4
            because bento looks the best with that
          </p>
          {/* Bento Grid */}
          <BentoGrid className="mt-12">
            <BentoCard
              Icon={UserIcon}
              name="Connect with Doctors"
              description="connect with doctors from around the world and get expert advice on your health concerns."
              href="#"
              className="col-span-3 lg:col-span-1"
              cta="Learn More"
              background={
                <div className="relative">
                  <Globe className="top-28 translate-x-14 scale-150" />
                </div>
              }
            />
            <BentoCard
              Icon={Microscope}
              name="Advance Diagnostics"
              description="Get access to advanced diagnostic tools and technologies to get accurate results."
              href="#"
              className="col-span-3 lg:col-span-1"
              cta="Learn More"
              background={
                <FlickeringGrid
                  className="absolute inset-0 z-0 size-full"
                  squareSize={4}
                  gridGap={6}
                  color="#6B7280"
                  maxOpacity={0.1}
                  flickerChance={0.1}
                  height={800}
                  width={800}
                />
              }
            />
            <BentoCard
              Icon={HeartIcon}
              name="Personalized Care"
              description="Get personalized care plans tailored to your health needs and lifestyle."
              href="#"
              className="col-span-3 lg:col-span-1"
              cta="Learn More"
              background={
                <div className="bg-gradient-to-br from-blue-500 to-blue-400" />
              }
            />
            <BentoCard
              Icon={ShieldAlertIcon}
              name="Secure & Private"
              description="Your data is safe with us. We use the latest encryption technologies to keep your data secure."
              href="#"
              className="col-span-3 lg:col-span-2"
              cta="Learn More"
              background={
                <DotPattern
                  className={cn(
                    "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
                  )}
                />
              }
            />
            <BentoCard
              Icon={HeartIcon}
              name="Personalized Care"
              description="Get personalized care plans tailored to your health needs and lifestyle."
              href="#"
              className="col-span-3 lg:col-span-1"
              cta="Learn More"
              background={
                <div className="bg-gradient-to-br from-blue-500 to-blue-400" />
              }
            />
          </BentoGrid>
        </div>
      </section>
      <DoctorScrollCarousel />
      <section
        id="Ai"
        className="flex flex-col items-center justify-center w-full py-2"
      >
        <FeatureCards />
      </section>
      <section
        id="Testimonial"
        className="flex  items-center justify-between w-full py-10 px-20"
      >
        <div className="">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="pr-4">
              <h1 className="text-5xl font-bold mb-6">
                <span className="text-blue-500">People</span> Love Us
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                People love us for our consulation service. Here are some of the
                reviews from our users.
                
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-blue-500">
                    <Check size={20} />
                  </div>
                  <p className="text-gray-700">
                    Prove your point to a stakeholder
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-blue-500">
                    <Check size={20} />
                  </div>
                  <p className="text-gray-700">Validate a hypothesis</p>
                </div>

                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-blue-500">
                    <Check size={20} />
                  </div>
                  <p className="text-gray-700">
                    Find topics you need to research
                  </p>
                </div>
              </div>

              <button className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                Get Started
              </button>
            </div>

            <div className="relative h-96 lg:h-full">
              <Reviews />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
