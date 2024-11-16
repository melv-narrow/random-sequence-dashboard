'use client'

import { useState } from 'react'
import {
  Book,
  Calculator,
  ChartBar,
  Lightbulb,
  Sparkles,
  Brain,
  Rocket,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

interface GuideSection {
  id: string
  title: string
  icon: JSX.Element
  content: string
  examples?: string[]
  tips?: string[]
}

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Rocket className="h-6 w-6 text-blue-500" />,
      content: `Welcome to your lottery sequence analysis dashboard! This tool helps you generate and analyze 
        number sequences with advanced statistical insights. While we can't predict lottery numbers 
        (no one can!), we can help you understand patterns and probabilities in a fun and educational way.`,
      tips: [
        'Start by generating a sequence in the Generate page',
        'Try different sequence lengths to see how patterns change',
        'Use the analysis tools to understand your sequences better',
        'Save interesting sequences for future reference'
      ]
    },
    {
      id: 'calculations',
      title: 'How We Calculate',
      icon: <Calculator className="h-6 w-6 text-purple-500" />,
      content: `Our calculations are based on mathematical principles and statistical analysis. Here's how we analyze your sequences:`,
      examples: [
        'Pattern Detection: We look for consecutive numbers, even/odd ratios, and high/low distributions',
        'Frequency Analysis: We track how often numbers appear in your sequences',
        'Win Probability: Based on historical patterns and mathematical probability',
        'Statistical Trends: Using time-series analysis and frequency distributions'
      ]
    },
    {
      id: 'analysis',
      title: 'Understanding Analysis',
      icon: <Brain className="h-6 w-6 text-green-500" />,
      content: `Our analysis tools provide various insights into your sequences. Here's what each metric means:`,
      examples: [
        'Hot Numbers: Frequently appearing in recent sequences',
        'Cold Numbers: Rarely appearing in recent sequences',
        'Pattern Strength: How well-balanced your sequence is',
        'Historical Trends: How numbers perform over time'
      ]
    },
    {
      id: 'tips',
      title: 'Pro Tips',
      icon: <Lightbulb className="h-6 w-6 text-yellow-500" />,
      content: `Make the most of your analysis with these pro tips:`,
      tips: [
        'Compare multiple sequences to spot patterns',
        'Use the analysis dialog to dive deep into statistics',
        'Save sequences with interesting patterns',
        'Track your favorite number combinations'
      ]
    },
    {
      id: 'visualization',
      title: 'Reading Charts',
      icon: <ChartBar className="h-6 w-6 text-red-500" />,
      content: `Our visualizations help you understand complex data at a glance:`,
      examples: [
        'Bar Charts: Show frequency distribution of numbers',
        'Trend Lines: Indicate how patterns change over time',
        'Heat Maps: Highlight hot and cold numbers',
        'Pattern Indicators: Visual representation of sequence characteristics'
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Guide</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Learn how to make the most of your sequence analysis tools.
        </p>
      </div>

      {/* Quick Start */}
      <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Start Guide</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">1</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Generate</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create your first sequence with custom parameters
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">2</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Analyze</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View detailed statistical analysis and patterns
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">3</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Track</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Save and monitor your sequence performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`rounded-lg border bg-white p-6 shadow-sm transition-all cursor-pointer 
              dark:bg-gray-800 dark:border-gray-700 hover:shadow-md
              ${activeSection === section.id ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
            onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {section.icon}
                <h3 className="font-semibold text-gray-900 dark:text-white">{section.title}</h3>
              </div>
              <ArrowRight className={`h-5 w-5 text-gray-400 transition-transform ${
                activeSection === section.id ? 'rotate-90' : ''
              }`} />
            </div>
            
            {activeSection === section.id && (
              <div className="mt-4 space-y-4">
                <p className="text-gray-600 dark:text-gray-400">{section.content}</p>
                
                {section.examples && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Examples:</h4>
                    <ul className="space-y-1">
                      {section.examples.map((example, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.tips && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Tips:</h4>
                    <ul className="space-y-1">
                      {section.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Sparkles className="h-4 w-4 mt-0.5 text-yellow-500" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Get Started Button */}
      <div className="flex justify-center">
        <Link
          href="/dashboard/generate"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          Start Generating
          <Rocket className="h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}
