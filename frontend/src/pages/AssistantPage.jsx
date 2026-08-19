import { useState } from 'react';
import AssistantChatCard from '../components/assistant/AssistantChatCard.jsx';
import AssistantHero from '../components/assistant/AssistantHero.jsx';
import CategoryGrid from '../components/assistant/CategoryGrid.jsx';
import CategoryProducts from '../components/assistant/CategoryProducts.jsx';

export default function AssistantPage() {
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const selectSuggestion = (prompt) => {
    setAutoSubmit(false);
    setSelectedPrompt(prompt);
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <section className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-5 py-14 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
        <AssistantHero onPromptSelect={selectSuggestion} />
        <AssistantChatCard selectedPrompt={selectedPrompt} autoSubmit={autoSubmit} />
      </section>
      <CategoryGrid onCategorySelect={selectCategory} />
      <CategoryProducts category={selectedCategory} />
    </>
  );
}
