import httpClient from './httpClient';
import type { FAQ } from '../types';

function toFAQ(data: any): FAQ {
  return {
    id: data.id,
    category: data.category,
    question: data.question,
    answer: data.answer,
  };
}

/**
 * GET /faqs?category=...
 *
 * Returns all FAQs, optionally filtered by category.
 */
export async function listFAQs(category?: string): Promise<FAQ[]> {
  const params: Record<string, string> = {};
  if (category) {
    params.category = category;
  }
  const response = await httpClient.get('/faqs', { params });
  return (response.data as any[]).map(toFAQ);
}

/**
 * GET /faqs/categories
 *
 * Returns all distinct FAQ categories.
 */
export async function listCategories(): Promise<string[]> {
  const response = await httpClient.get('/faqs/categories');
  return response.data as string[];
}

/**
 * GET /faqs/{id}
 *
 * Returns a single FAQ by its id.
 */
export async function getFAQ(id: string): Promise<FAQ> {
  const response = await httpClient.get(`/faqs/${id}`);
  return toFAQ(response.data);
}
