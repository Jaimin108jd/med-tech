"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { MessageSquare, CreditCard, Sparkles } from "lucide-react"

const FeatureCards = () => {
    const controls = useAnimation()
    const ref = useRef(null)
    const isInView = useInView(ref, { once: false, amount: 0.3 })

    useEffect(() => {
        if (isInView) {
            controls.start("visible")
        }
    }, [controls, isInView])

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.2,
            },
        },
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    }

    return (
        <section className="py-16 px-4 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        In built <span className="text-blue-500">AI Integration</span>
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                        With AI booming each passing day, we've made sure that we integrate AI the best way we can, that is
                        embedding it at meaningful places.
                    </p>
                </div>

                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={controls}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {/* Chat Card */}
                    <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <div className="h-80 mb-6 bg-gray-50 rounded-lg p-4 relative overflow-hidden">
                            <ChatInterface />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 flex items-center">
                            <MessageSquare className="mr-2 text-blue-500" size={20} />
                            Chat with your calls
                        </h3>
                        <p className="text-gray-600">It makes no sense but we have it here. Use it the way you want it.</p>
                    </motion.div>

                    {/* Payment Card */}
                    <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <div className="h-80 mb-6 flex items-start py-14 justify-center bg-gray-50 rounded-lg px-0 relative overflow-hidden">
                            <PaymentCard />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 flex items-center">
                            <CreditCard className="mr-2 text-blue-500" size={20} />
                            Easy payments
                        </h3>
                        <p className="text-gray-600">
                            We accept all kinds of cards. We make sure you get money whichever way possible.
                        </p>
                    </motion.div>

                    {/* AI Summary Card (replacing Invite team members) */}
                    <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <div className="h-80 mb-6 bg-gray-50 rounded-lg p-4 relative overflow-hidden">
                            <AISummaryCard />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 flex items-center">
                            <Sparkles className="mr-2 text-blue-500" size={20} />
                            AI Summary
                        </h3>
                        <p className="text-gray-600">
                            Our AI-powered summaries help you extract key insights from your data in seconds.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

// Chat Interface Component
const ChatInterface = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
                <motion.div
                    initial={{ y: 0 }}
                    animate={{
                        y: [0, -280, -280, 0],
                        transition: {
                            duration: 10,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "loop",
                            times: [0, 0.4, 0.8, 1],
                            ease: "easeInOut",
                        },
                    }}
                    className="flex flex-col gap-3"
                >
                    <div className="bg-white rounded-lg p-3 shadow-sm self-start max-w-[80%]">
                        <p className="text-sm">Hello, Nice</p>
                    </div>

                    <div className="bg-white rounded-lg p-3 shadow-sm self-start max-w-[80%]">
                        <p className="text-sm">
                            Welcome to LiveChat I was made with Pick a topic from the list or type down a question!
                        </p>
                    </div>

                    <div className="bg-blue-100 rounded-lg p-3 shadow-sm self-end max-w-[80%]">
                        <p className="text-sm">Welcome</p>
                    </div>

                    <div className="mt-4">
                        <div className="bg-white rounded-lg p-3 shadow-sm self-start max-w-[80%]">
                            <p className="text-sm">How can I help you today?</p>
                        </div>
                    </div>

                    <div className="bg-blue-100 rounded-lg p-3 shadow-sm self-end max-w-[80%]">
                        <p className="text-sm">I need information about your services</p>
                    </div>

                    <div className="bg-white rounded-lg p-3 shadow-sm self-start max-w-[80%]">
                        <p className="text-sm">
                            We offer AI integration, payment processing, and data analytics. Which one would you like to know more
                            about?
                        </p>
                    </div>
                </motion.div>
            </div>

            <div className="mt-auto pt-3 border-t border-gray-200">
                <div className="bg-white rounded-full flex items-center px-4 py-2 shadow-sm">
                    <input type="text" placeholder="Write a message" className="flex-1 outline-none text-sm" disabled />
                    <button className="text-blue-500 ml-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M22 2L11 13"></path>
                            <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

// Payment Card Component
const PaymentCard = () => {
    const cards = [
        {
            id: 2,
            name: "",
            designation: "",
            content: (
                <div className="w-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Credit Card</span>
                        <span className="text-sm">Visa</span>
                    </div>
                    <div className="mt-4">
                        <span className="text-xl font-mono">**** **** **** 2834</span>
                    </div>
                    <div className="mt-4">
                        <span className="text-sm">Total Balance</span>
                        <span className="block text-xl font-bold">$1,234.56</span>
                    </div>
                </div>
            ),
        },
        {
            id: 0,
            name: "",
            designation: "",
            content: (
                <div className="w-full  bg-gradient-to-r from-orange-500 to-orange-800 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Credit Card</span>
                        <span className="text-sm">Visa</span>
                    </div>
                    <div className="mt-4">
                        <span className="text-xl font-mono">**** **** **** 2834</span>
                    </div>
                    <div className="mt-4">
                        <span className="text-sm">Total Balance</span>
                        <span className="block text-xl font-bold">$1,234.56</span>
                    </div>
                </div>
            ),
        },
        {
            id: 1,
            name: "",
            designation: "",
            content: (
                <div className="w-full  bg-gradient-to-r from-black to-black rounded-lg shadow-lg p-6 text-white">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Credit Card</span>
                        <span className="text-sm">Visa</span>
                    </div>
                    <div className="mt-4">
                        <span className="text-xl font-mono">**** **** **** 2834</span>
                    </div>
                    <div className="mt-4">
                        <span className="text-sm">Total Balance</span>
                        <span className="block text-xl font-bold">$1,234.56</span>
                    </div>
                </div>
            ),
        },

    ];

    return (
        <div className=" flex items-center justify-center w-full">
            {/* {cards.map((card, index) => ( */}
            <CardStack items={cards} />
            {/* // ))} */}
        </div>
    );
};

// AI Summary Card Component (replacing Invite team members)
const AISummaryCard = () => {
    return (
        <div className="h-full flex flex-col">
            <motion.div
                initial={{ x: 0 }}
                animate={{
                    x: [0, -300, -300, 0],
                    transition: {
                        duration: 10,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                        times: [0, 0.4, 0.8, 1],
                        ease: "easeInOut",
                    },
                }}
                className="flex gap-4 w-[600px]"
            >
                <div className="flex-1 min-w-[270px] border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium">High</div>
                        <div className="text-blue-500 font-medium">+ Generate</div>
                    </div>

                    <h4 className="font-bold text-lg mb-1">Research</h4>
                    <p className="text-gray-600 text-sm mb-4">User research helps you to create an optimal product for users.</p>

                    <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                            <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                >
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                10 comments
                            </span>
                            <span className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                3 files
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-w-[270px] border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-green-100 text-green-600 px-3 py-1 rounded-md text-sm font-medium">Medium</div>
                        <div className="text-blue-500 font-medium">+ Generate</div>
                    </div>

                    <h4 className="font-bold text-lg mb-1">Data Analysis</h4>
                    <p className="text-gray-600 text-sm mb-4">
                        Our AI analyzes your data to find patterns and insights automatically.
                    </p>

                    <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                            <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                >
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                8 comments
                            </span>
                            <span className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                5 files
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default FeatureCards






let interval: any;

type Card = {
    id: number;
    name: string;
    designation: string;
    content: React.ReactNode;
};

export const CardStack = ({
    items,
    offset,
    scaleFactor,
}: {
    items: Card[];
    offset?: number;
    scaleFactor?: number;
}) => {
    const CARD_OFFSET = offset || 5;
    const SCALE_FACTOR = scaleFactor || 0.1;
    const [cards, setCards] = useState<Card[]>(items);

    useEffect(() => {
        startFlipping();

        return () => clearInterval(interval);
    }, []);
    const startFlipping = () => {
        interval = setInterval(() => {
            setCards((prevCards: Card[]) => {
                const newArray = [...prevCards]; // create a copy of the array
                newArray.unshift(newArray.pop()!); // move the last element to the front
                return newArray;
            });
        }, 5000);
    };

    return (
        <div className="relative  h-full w-full p-0">
            {cards.map((card, index) => {
                return (
                    <motion.div
                        key={card.id}
                        className="absolute  h-full w-full rounded-3xl  flex flex-col  items-center justify-start"
                        style={{
                            transformOrigin: "center center",
                        }}
                        animate={{
                            top: index * - CARD_OFFSET,
                            scale: 1 - index * SCALE_FACTOR, // decrease scale for cards that are behind
                            zIndex: cards.length - index, //  decrease z-index for the cards that are behind
                        }}
                    >
                        <div className="font-normal text-neutral-700 dark:text-neutral-200 w-full px-2">
                            {card.content}
                        </div>
                        <div>
                            <p className="text-neutral-500 font-medium dark:text-white">
                                {card.name}
                            </p>
                            <p className="text-neutral-400 font-normal dark:text-neutral-200">
                                {card.designation}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
