import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { EmptyState } from '../components/ui/EmptyState';
import { faqData } from '../data/mockData';

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFaq = faqData.filter((item) => {
    const matchesSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Layout hideNav>
      <Header title="Часто задаваемые вопросы" showBack />

      <div className="p-4 space-y-4">
        {/* Search */}
        <Input
          placeholder="Поиск по вопросам..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-[var(--tg-theme-button-color,#3390ec)] text-white'
                  : 'bg-[var(--tg-theme-bg-color,#fff)] text-[var(--tg-theme-text-color,#000)]'
              }`}
            >
              {category === 'all' ? 'Все' : category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        {filteredFaq.length === 0 ? (
          <EmptyState
            icon={<Search className="w-16 h-16" />}
            title="Ничего не найдено"
            description="Попробуйте изменить запрос или выберите другую категорию"
          />
        ) : (
          <div className="space-y-3">
            {filteredFaq.map((item) => (
              <Card key={item.id} padding="none">
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-xs text-[var(--tg-theme-button-color,#3390ec)] mb-1 font-medium">
                        {item.category}
                      </div>
                      <h4 className="font-semibold text-[var(--tg-theme-text-color,#000)]">
                        {item.question}
                      </h4>
                    </div>
                    {expandedId === item.id ? (
                      <ChevronUp className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] flex-shrink-0" />
                    )}
                  </div>
                </button>
                {expandedId === item.id && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-[var(--tg-theme-text-color,#000)] leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
