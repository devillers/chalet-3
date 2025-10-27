'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import type { FAQEntry } from '@/types/faq';

interface FAQContentProps {
  languageLabel: string;
  intro: string;
  items: FAQEntry[];
}

export default function FAQContent({ languageLabel, intro, items }: FAQContentProps) {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      const question = item.question.toLowerCase();
      const answer = item.answer.toLowerCase();

      return (
        question.includes(normalizedQuery) || answer.includes(normalizedQuery)
      );
    });
  }, [items, query]);

  return (
    <motion.div
      className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Intro */}
      <div className="rounded-3xl border border-white/60 bg-white/70 p-10 shadow-md backdrop-blur-xl">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.45em] text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          {languageLabel}
          <span className="h-px flex-1 bg-gray-200" />
        </div>
        <p className="mt-6 text-lg leading-relaxed text-gray-700 sm:text-xl">{intro}</p>
      </div>

      {/* Accordion */}
      <div className="mt-12 space-y-6">
        <div>
          <label htmlFor="faq-search" className="sr-only">
            Search frequently asked questions
          </label>
          <Input
            id="faq-search"
            type="search"
            placeholder="Search questions"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-full border-white/60 bg-white/90 py-6 text-base shadow-sm placeholder:text-gray-400 focus-visible:ring-[#bd9254]"
          />
        </div>
        <Accordion
          type="single"
          collapsible
          className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-md backdrop-blur-xl divide-y divide-white/60"
        >
          {filteredItems.length === 0 ? (
            <div className="px-6 py-10 text-center text-base text-gray-500 sm:px-10">
              No questions match your search.
            </div>
          ) : (
            filteredItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="group flex w-full items-center justify-between px-6 py-8 text-left transition-all hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd9254] sm:px-10">
                  <div className="flex flex-col text-left">
                    <span className="text-[22px] sm:text-[26px] font-light leading-snug text-slate-900 group-hover:text-[#bd9254] transition-colors">
                      {item.question}
                  </span>
                </div>
                <ChevronDown
                  className="ml-4 h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-10 sm:px-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-base leading-relaxed text-gray-700 sm:text-lg">{item.answer}</p>
                </motion.div>
              </AccordionContent>
            </AccordionItem>
            ))
          )}
        </Accordion>
      </div>
    </motion.div>
  );
}
