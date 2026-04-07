"use client";

import React from "react";
import BaseWidget from "./BaseWidget";
import { Badge } from "../ui/Card";
import { MessageCircle, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { getWidgetConfig, getRefreshInterval, API_ENDPOINTS } from "../../../lib/config";

export default function RedditWidget({ 
  subreddit, 
  limit,
  className = "" 
}) {
  const config = getWidgetConfig("reddit");
  const finalSubreddit = subreddit || config.subreddit;
  const finalLimit = limit || config.limit;
  const apiEndpoint = API_ENDPOINTS.reddit(finalSubreddit, finalLimit);

  const renderRedditContent = (posts) => {
    if (!posts || posts.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300">No recent posts found</p>
            <p className="text-gray-400 text-sm mt-1">Check back later for updates</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 pr-2">
        {posts.map((post, index) => (
          <RedditPostCard key={post.id || index} post={post} />
        ))}
      </div>
    );
  };

  return (
    <BaseWidget
      title="Reddit"
      subtitle={`r/${finalSubreddit}`}
      icon={MessageCircle}
      apiEndpoint={apiEndpoint}
      className={className}
      refreshInterval={getRefreshInterval("reddit")}
    >
      {renderRedditContent}
    </BaseWidget>
  );
}

function RedditPostCard({ post }) {
  const isValidThumbnail = post.thumbnail && post.thumbnail.startsWith("http");
  const getScoreColor = (score) => {
    if (score > 100) return "success";
    if (score > 10) return "default";
    return "secondary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-white/10 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
    >
      <div className="flex gap-4">
        {isValidThumbnail && (
          <img 
            src={post.thumbnail} 
            alt="Post thumbnail" 
            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-medium text-white/90 leading-relaxed line-clamp-2">
              {post.title}
            </h3>
            <a 
              href={post.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-shrink-0 text-white/60 hover:text-white/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-white/60 mb-2">
            <span>u/{post.author}</span>
            <Badge variant={getScoreColor(post.upvotes)} className="text-xs">
              <ArrowUp className="w-3 h-3 mr-1" />
              {post.upvotes}
            </Badge>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {post.comments}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
