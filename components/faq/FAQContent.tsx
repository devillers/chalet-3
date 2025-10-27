'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronDown } from 'lucide-react';
import type { FAQEntry } from '@/types/faq';

interface FAQContentProps {
  languageLabel: string;
  intro: string;
  items: FAQEntry[];
}

export default function FAQContent({ languageLabel, intro, items }: FAQContentProps) {
  return (
    <>
      {/* Intro */}
      <div className=" max-w-5xl  p-4 ">
    
        <p className="mt-6 text-3xl leading-12 uppercase font-thin text-gray-600 max-w-md ">{intro}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 mx-auto max-w-5xl pb-10">
        <div className="hidden md:block text-3xl leading-12 uppercase font-thin text-gray-600 px-4 sm:px-6 lg:px-8">{intro}</div>
        <motion.div
          className="mx-auto col-span-2 px-4 sm:px-6  lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Accordion */}
          <div className="mt-12">
            <Accordion
              type="single"
              collapsible
              className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-md backdrop-blur-xl divide-y divide-white/60"
            >
              {items.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="group flex w-full items-center justify-between px-6 py-8 text-left transition-all hover:bg-white/50 sm:px-10">
                    <div className="flex flex-col text-left">
                      <span className="text-sm uppercase font-thin leading-snug text-slate-900 ">
                        {item.question}
                      </span>
                    </div>
                    {/* <ChevronDown
                  className="ml-4 h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                /> */}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-10 sm:px-10">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-[12px] leading-relaxed text-gray-700 ">{item.answer}</p>
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </>
  );
}
