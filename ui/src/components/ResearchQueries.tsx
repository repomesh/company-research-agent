import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ResearchQueriesProps } from '../types';
import { fadeInAnimation } from '../styles';
import { useSmoothText } from '../hooks/useSmooth';

const QueryItem = ({ text, isStreaming }: { text: string; isStreaming: boolean }) => {
  const { text: visibleText, isRevealing } = useSmoothText(text);
  const showCursor = isStreaming || isRevealing;
  return (
    <div className={`backdrop-filter backdrop-blur-lg bg-white/80 border rounded-lg p-2 transition-colors duration-500 ${showCursor ? 'border-[#2677FF]/30' : 'border-gray-200'}`}>
      <span className="text-gray-600">{visibleText}</span>
      {showCursor && <span className="animate-pulse ml-1 text-[#8FBCFA]">|</span>}
    </div>
  );
};

const ResearchQueries = ({
  queries,
  streamingQueries,
  isExpanded,
  onToggleExpand,
  isResetting,
  glassStyle
}: ResearchQueriesProps) => {
  const glassCardStyle = `${glassStyle} rounded-2xl p-6`;

  return (
    <div 
      className={`${glassCardStyle} ${fadeInAnimation.fadeIn} ${isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'} font-sans`}
    >
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggleExpand}
      >
        <h2 className="text-xl font-semibold text-gray-900">
          Generated Research Queries
        </h2>
        <button className="text-gray-600 hover:text-gray-900 transition-colors">
          {isExpanded ? (
            <ChevronUp className="h-6 w-6" />
          ) : (
            <ChevronDown className="h-6 w-6" />
          )}
        </button>
      </div>
      
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'mt-4 max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="grid grid-cols-2 gap-4">
          {['company', 'industry', 'financial', 'news'].map((category) => (
            <div key={category} className={`${glassStyle} rounded-xl p-3`}>
              <h3 className="text-base font-medium text-gray-900 mb-3 capitalize">
                {category.charAt(0).toUpperCase() + category.slice(1)} Queries
              </h3>
              <div className="space-y-2">
                {/* Streaming and completed queries share a key per query number, so a query
                    keeps its place and its reveal animation when it finishes streaming */}
                {[
                  ...queries
                    .filter((q) => q.category.startsWith(category))
                    .map((q) => ({ number: q.number, text: q.text, isStreaming: false })),
                  ...Object.values(streamingQueries)
                    .filter((q) => q.category.startsWith(category))
                    .filter((q) => !queries.some((done) => done.category === q.category && done.number === q.number))
                    .map((q) => ({ number: q.number, text: q.text, isStreaming: true })),
                ]
                  .sort((a, b) => a.number - b.number)
                  .map((query) => (
                    <QueryItem key={`${category}-${query.number}`} text={query.text} isStreaming={query.isStreaming} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {!isExpanded && (
        <div className="mt-2 text-sm text-gray-600">
          {queries.length} queries generated across {['company', 'industry', 'financial', 'news'].length} categories
        </div>
      )}
    </div>
  );
};

export default ResearchQueries; 