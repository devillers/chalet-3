export type FAQEntry = {
  id: string;
  question: string;
  answer: string;
};

export type FAQTranslations = {
  title: string;
  subtitle: string;
  intro: string;
  items: FAQEntry[];
};
