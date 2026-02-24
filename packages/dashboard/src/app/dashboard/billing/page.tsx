'use client'

import { Check, Zap, Crown, Star } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out ReplayDash',
    features: [
      '100 sessions/month',
      '10K API requests',
      '1 GB storage',
      '7 days retention',
      'Basic analytics',
      'Email support'
    ],
    current: true,
    cta: 'Current Plan',
    icon: Star
  },
  {
    name: 'Pro',
    price: '$49',
    period: 'per month',
    description: 'For growing teams and products',
    features: [
      '10,000 sessions/month',
      '1M API requests',
      '50 GB storage',
      '90 days retention',
      'Advanced analytics',
      'Custom events',
      'Priority support',
      'Team collaboration'
    ],
    popular: true,
    cta: 'Upgrade to Pro',
    icon: Zap
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For large-scale applications',
    features: [
      'Unlimited sessions',
      'Unlimited API requests',
      'Unlimited storage',
      'Custom retention',
      'Advanced security',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
      'On-premise option'
    ],
    cta: 'Contact Sales',
    icon: Crown
  }
]

export default function BillingPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Start free and scale as you grow. All plans include our core session replay features.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-sm border-2 p-8 transition-all hover:shadow-xl ${
                plan.popular 
                  ? 'border-red-500 relative scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-red-500 to-orange-500' 
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                }`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.current}
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all ${
                  plan.current
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-lg'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          )
        })}
      </div>

      {/* Current Usage */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Current Billing Period
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sessions Used</p>
              <p className="text-2xl font-bold text-gray-900">25 / 100</p>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-600" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">API Requests</p>
              <p className="text-2xl font-bold text-gray-900">1.2K / 10K</p>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Storage</p>
              <p className="text-2xl font-bold text-gray-900">45 MB / 1 GB</p>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600" style={{ width: '4.5%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              💡 Your current billing period resets on <span className="font-semibold">March 1, 2026</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
