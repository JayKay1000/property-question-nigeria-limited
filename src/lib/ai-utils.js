// Enterprise AI Intelligence Utilities

export const AI_FEATURES = [
  {
    code: 'property_recommendation',
    name: 'AI Property Recommendations',
    description: 'Intelligent property matching based on user preferences, budget, and behavior',
    icon: 'Sparkles',
    color: '#FF7A00',
    category: 'Discovery',
    enabled: true,
  },
  {
    code: 'chatbot',
    name: 'AI Chatbot Assistant',
    description: '24/7 conversational assistant for property enquiries, FAQs, and guidance',
    icon: 'Bot',
    color: '#001A3D',
    category: 'Support',
    enabled: true,
  },
  {
    code: 'document_summarization',
    name: 'AI Document Summarisation',
    description: 'Auto-summarise legal documents, contracts, and property reports',
    icon: 'FileText',
    color: '#8B5CF6',
    category: 'Documents',
    enabled: true,
  },
  {
    code: 'property_description',
    name: 'AI Property Descriptions',
    description: 'Generate compelling, SEO-optimized property descriptions automatically',
    icon: 'PenLine',
    color: '#10B981',
    category: 'Content',
    enabled: true,
  },
  {
    code: 'valuation_assistance',
    name: 'AI Valuation Assistance',
    description: 'Data-driven property valuation estimates using market comparables',
    icon: 'TrendingUp',
    color: '#059669',
    category: 'Valuation',
    enabled: true,
  },
  {
    code: 'fraud_detection',
    name: 'AI Fraud Detection',
    description: 'Detect suspicious listings, fake documents, and fraudulent patterns',
    icon: 'ShieldAlert',
    color: '#DC2626',
    category: 'Security',
    enabled: true,
  },
  {
    code: 'duplicate_detection',
    name: 'AI Duplicate Detection',
    description: 'Identify duplicate property listings and records automatically',
    icon: 'Copy',
    color: '#F59E0B',
    category: 'Data Quality',
    enabled: true,
  },
  {
    code: 'search_assistant',
    name: 'AI Search Assistant',
    description: 'Natural language property search with intent understanding',
    icon: 'Search',
    color: '#3B82F6',
    category: 'Discovery',
    enabled: true,
  },
  {
    code: 'analytics_insight',
    name: 'AI Analytics & Insights',
    description: 'Automated market trends, performance insights, and predictive analytics',
    icon: 'BarChart3',
    color: '#6366F1',
    category: 'Analytics',
    enabled: true,
  },
  {
    code: 'content_generation',
    name: 'AI Content Generation',
    description: 'Generate blog posts, social media content, and marketing copy',
    icon: 'PenTool',
    color: '#EC4899',
    category: 'Content',
    enabled: true,
  },
];

export const AI_MODELS = [
  { value: 'automatic', label: 'Automatic (Best Available)', credits: 1 },
  { value: 'gpt_5_mini', label: 'GPT-5 Mini', credits: 1 },
  { value: 'gemini_3_flash', label: 'Gemini 3 Flash', credits: 1 },
  { value: 'gpt_5_4', label: 'GPT-5.4', credits: 3 },
  { value: 'claude_sonnet_4_6', label: 'Claude Sonnet 4.6', credits: 3 },
  { value: 'claude_opus_4_6', label: 'Claude Opus 4.6', credits: 5 },
  { value: 'gemini_3_1_pro', label: 'Gemini 3.1 Pro', credits: 3 },
];

export const AI_REQUEST_STATUS = {
  success: { label: 'Success', color: 'bg-success/15 text-success' },
  failed: { label: 'Failed', color: 'bg-error/15 text-error' },
  partial: { label: 'Partial', color: 'bg-warning/15 text-warning' },
  timeout: { label: 'Timeout', color: 'bg-error/15 text-error' },
};

export const AI_CONVERSATION_TYPES = {
  chatbot: { label: 'Chatbot', icon: 'Bot', color: '#001A3D' },
  property_recommendation: { label: 'Recommendation', icon: 'Sparkles', color: '#FF7A00' },
  search_assistant: { label: 'Search', icon: 'Search', color: '#3B82F6' },
  valuation_assistant: { label: 'Valuation', icon: 'TrendingUp', color: '#059669' },
  document_summary: { label: 'Document Summary', icon: 'FileText', color: '#8B5CF6' },
  content_generation: { label: 'Content Gen', icon: 'PenTool', color: '#EC4899' },
  fraud_analysis: { label: 'Fraud Analysis', icon: 'ShieldAlert', color: '#DC2626' },
};

export function getFeatureInfo(code) {
  return AI_FEATURES.find(f => f.code === code) || AI_FEATURES[0];
}

export function getModelInfo(value) {
  return AI_MODELS.find(m => m.value === value) || AI_MODELS[0];
}

export function formatTokens(tokens) {
  if (!tokens) return '0';
  if (tokens < 1000) return `${tokens}`;
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${(tokens / 1000000).toFixed(2)}M`;
}

export function getConfidenceLabel(score) {
  if (score === undefined || score === null) return 'Unknown';
  if (score >= 0.8) return 'High';
  if (score >= 0.6) return 'Medium';
  if (score >= 0.4) return 'Low';
  return 'Very Low';
}

export function getConfidenceColor(score) {
  if (score === undefined || score === null) return 'text-muted-foreground';
  if (score >= 0.8) return 'text-success';
  if (score >= 0.6) return 'text-info';
  if (score >= 0.4) return 'text-warning';
  return 'text-error';
}