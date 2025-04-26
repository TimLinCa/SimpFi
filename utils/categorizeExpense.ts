// utils/expenseClassifier.ts
import classifierJsonData from '@/assets/classifier/category_classifier.json';
// Type definitions
// Cast the imported data to the interface
const classifierData = classifierJsonData as ClassifierData;

export interface CategoryType {
  id: number;
  name: string;
  icon: string;
}

interface WordFrequency {
  [word: string]: number;
}

interface CategoryData {
  wordFrequencies: WordFrequency;
  documentCount: number;
}

interface ClassifierData {
  categories: { [category: string]: CategoryData };
  totalDocuments: number;
  vocabulary: string[];
}

// The expense categories list - make sure this matches your app's categories
const expenseCategories: CategoryType[] = [
  { id: 1, name: 'Food & Drinks', icon: 'food' },
  { id: 2, name: 'Transportation', icon: 'car' },
  { id: 3, name: 'Accommodation', icon: 'home' },
  { id: 4, name: 'Entertainment', icon: 'movie' },
  { id: 5, name: 'Shopping', icon: 'cart' },
  { id: 6, name: 'Utilities', icon: 'lightning-bolt' },
  { id: 7, name: 'Health', icon: 'medical-bag' },
  { id: 8, name: 'Travel', icon: 'airplane' },
  { id: 9, name: 'Grocery', icon: 'cart-outline' },
  { id: 10, name: 'Other', icon: 'dots-horizontal-circle' }
];

// Create a mapping from category names to category objects
const categoryMapping: { [categoryName: string]: CategoryType } = {};
expenseCategories.forEach(category => {
  categoryMapping[category.name] = category;
});

let vocabulary: Set<string> = new Set();
let isLoaded = false;

// Simplified loader that doesn't use asset registry
export const loadExpenseClassifier = async (): Promise<boolean> => {
  try {
    if (isLoaded) return true;
    if (!classifierData) return false;
    // Use the imported data directly
    vocabulary = new Set(classifierData.vocabulary);

    isLoaded = true;
    console.log('Classifier model loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading classifier model:', error);
    return false;
  }
};
/**
 * Tokenize text into an array of normalized words
 */
const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);
};

/**
 * Calculate probability of a text belonging to a category
 */
const calculateProbability = (text: string, category: string): number => {
  if (!classifierData) return 0;

  const tokens = tokenize(text);
  const categoryData = classifierData.categories[category];

  // Calculate prior probability P(category)
  const priorProbability = categoryData.documentCount / classifierData.totalDocuments;

  // Calculate P(word|category) for each word
  let logProbability = Math.log(priorProbability);

  tokens.forEach(word => {
    // How many times this word appears in documents of this category
    const wordFrequencyInCategory = categoryData.wordFrequencies[word] || 0;

    // Total words in this category
    const totalWordsInCategory = Object.values(categoryData.wordFrequencies)
      .reduce((sum, count) => sum + count, 0);

    // Calculate probability with Laplace smoothing
    const smoothedProbability =
      (wordFrequencyInCategory + 1) /
      (totalWordsInCategory + vocabulary.size);

    // Add log probability
    logProbability += Math.log(smoothedProbability);
  });

  return logProbability;
};

/**
 * Classify an expense title into a category
 * @param title The expense title to classify
 * @returns Object with category and confidence score
 */
export const classifyExpense = (title: string): string => {
  let category = 'Other'; // Default category
  if (!isLoaded || !classifierData) {
    return category;
  }

  if (!title || title.trim() === '') {
    return category;
  }

  const probabilities = Object.keys(classifierData.categories).map(category => ({
    category,
    probability: calculateProbability(title, category)
  }));

  // Sort by probability (highest first)
  probabilities.sort((a, b) => b.probability - a.probability);

  // Get the category with highest probability
  const topCategory = probabilities[0].category;

  // Calculate confidence score
  let confidence = 0;

  // If we only have one category or the highest is vastly better than the second
  if (probabilities.length === 1 ||
    (probabilities.length > 1 &&
      probabilities[0].probability - probabilities[1].probability > 10)) {
    confidence = 1.0;
  } else {
    // Convert log probabilities to normal scale and normalize
    const expProbs = probabilities.map(p => ({
      category: p.category,
      expProb: Math.exp(p.probability)
    }));

    const sumExpProbs = expProbs.reduce((sum, p) => sum + p.expProb, 0);

    confidence = expProbs[0].expProb / sumExpProbs;
  }

  category = categoryMapping[topCategory].name;

  return category;
};