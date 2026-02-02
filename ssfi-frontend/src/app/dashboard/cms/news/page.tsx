'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Calendar,
  Eye,
  Tag,
  ChevronRight,
  Loader2,
  Newspaper,
} from 'lucide-react';

import { useNews, useNewsCategories } from '@/lib/hooks/useCMS';
import type { NewsArticle, NewsQueryParams } from '@/types/cms';
import { formatDate } from '@/types/cms';

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [params, setParams] = useState<NewsQueryParams>({
    page: 1,
    limit: 12,
    status: 'PUBLISHED',
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  const { fetchNews, data, isLoading, error } = useNews();
  const { fetchCategories, data: categories } = useNewsCategories();

  useEffect(() => {
    fetchNews(params);
  }, [fetchNews, params]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== params.search) {
        setParams(prev => ({ ...prev, search: searchQuery || undefined, page: 1 }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setParams(prev => ({ ...prev, category: category || undefined, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            News &{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Updates
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Stay updated with the latest news, events, and announcements from SSFI
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col md:flex-row gap-4"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* News Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : data?.data && data.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((article, index) => (
                <NewsCard key={article.id} article={article} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setParams(prev => ({ ...prev, page: prev.page! - 1 }))}
                  disabled={params.page === 1}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-slate-400">
                  Page {params.page} of {data.totalPages}
                </span>
                <button
                  onClick={() => setParams(prev => ({ ...prev, page: prev.page! + 1 }))}
                  disabled={params.page === data.totalPages}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No News Found</h3>
            <p className="text-slate-400">Check back later for updates</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NewsCard({ article, index }: { article: NewsArticle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/news/${article.slug}`}
        className="block bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-all group"
      >
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Newspaper className="w-12 h-12 text-slate-600" />
            </div>
          )}
          {article.isFeatured && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded">
              Featured
            </span>
          )}
          {article.category && (
            <span className="absolute top-3 right-3 px-2 py-1 bg-blue-500/80 text-white text-xs font-medium rounded">
              {article.category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-slate-400 text-sm line-clamp-2 mb-4">{article.excerpt}</p>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              {article.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(article.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.views}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
