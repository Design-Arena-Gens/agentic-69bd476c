'use client';

import { useMemo, useState } from 'react';
import palette from '../data/palette.json';

const totals = palette.reduce(
  (acc, category) => {
    acc.categories += 1;
    category.topics.forEach((topic) => {
      acc.topics += 1;
      acc.examples += topic.examples.length;
    });
    return acc;
  },
  { categories: 0, topics: 0, examples: 0 }
);

function filterPalette(query) {
  const normalised = query.trim().toLowerCase();
  if (!normalised) {
    return { data: palette, counts: totals };
  }

  let topicsCount = 0;
  let examplesCount = 0;

  const data = palette
    .map((category) => {
      const categoryMatches = category.category
        .toLowerCase()
        .includes(normalised);

      const topics = category.topics
        .map((topic) => {
          const topicMatches =
            topic.title.toLowerCase().includes(normalised) ||
            topic.rawTitle.toLowerCase().includes(normalised);

          const exampleMatches = topic.examples.filter((example) =>
            example.toLowerCase().includes(normalised)
          );

          if (categoryMatches || topicMatches) {
            topicsCount += 1;
            examplesCount += topic.examples.length;
            return { ...topic };
          }

          if (exampleMatches.length > 0) {
            topicsCount += 1;
            examplesCount += exampleMatches.length;
            return { ...topic, examples: exampleMatches };
          }

          return null;
        })
        .filter(Boolean);

      if (categoryMatches) {
        return { ...category };
      }

      if (topics.length > 0) {
        return { ...category, topics };
      }

      return null;
    })
    .filter(Boolean);

  return {
    data,
    counts: {
      categories: data.length,
      topics: topicsCount,
      examples: examplesCount,
    },
  };
}

function SectionCard({ category }) {
  return (
    <section className="section-card">
      <header>
        <h2>{category.category}</h2>
        <p>
          {category.topics.length} topic
          {category.topics.length === 1 ? '' : 's'} ·{' '}
          {category.topics.reduce(
            (count, topic) => count + topic.examples.length,
            0
          )}{' '}
          example
          {category.topics.reduce(
            (count, topic) => count + topic.examples.length,
            0
          ) === 1
            ? ''
            : 's'}
        </p>
      </header>
      {category.topics.map((topic) => (
        <article key={topic.rawTitle} className="topic-card">
          <h3>
            <span className="topic-number">{topic.id}.</span> {topic.title}
          </h3>
          <ul>
            {topic.examples.map((example, index) => (
              <li key={`${topic.rawTitle}-${index}`}>{example}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState('');

  const { data, counts } = useMemo(() => filterPalette(query), [query]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Sentence Palette Explorer</h1>
          <p>
            Extracted examples grouped by section, with quick filtering to help
            you find the sentence you need.
          </p>
        </div>
        <div className="page-stats">
          <div>
            <span className="stat-value">{counts.categories}</span>
            <span className="stat-label">Categories</span>
          </div>
          <div>
            <span className="stat-value">{counts.topics}</span>
            <span className="stat-label">Topics</span>
          </div>
          <div>
            <span className="stat-value">{counts.examples}</span>
            <span className="stat-label">Examples</span>
          </div>
        </div>
      </header>

      <div className="toolbar">
        <label htmlFor="search" className="visually-hidden">
          Search sentences
        </label>
        <input
          id="search"
          type="search"
          placeholder="Search categories, topics, or example text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <main className="content">
        {data.length === 0 ? (
          <p className="empty-state">
            No examples match “{query.trim()}”. Try a different search term.
          </p>
        ) : (
          data.map((category) => (
            <SectionCard key={category.category} category={category} />
          ))
        )}
      </main>
    </div>
  );
}

