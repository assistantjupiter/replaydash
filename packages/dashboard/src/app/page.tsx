'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CursorTracker } from '@/components/CursorTracker'
import { StarBorder } from '@/components/StarBorder'
import { FloatingNav } from '@/components/FloatingNav'
import { GradientText } from '@/components/GradientText'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'

export default function HomePage() {
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Cursor tracking effect */}
      <CursorTracker />
      
      {/* Floating navigation (appears on scroll) */}
      <FloatingNav />
      
      {/* Navigation */}
      <nav className="w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center group cursor-pointer">
              <img 
                src="/logo-full.png" 
                alt="ReplayDash" 
                className="h-8 transform group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </a>
              <a href="#docs" className="text-gray-600 hover:text-gray-900 transition-colors">
                Docs
              </a>
              {isSignedIn ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
                  >
                    Dashboard
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-50/30 to-transparent"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main hero content - left aligned */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-red-600 text-white rounded-full px-4 py-2 text-sm font-medium shadow-lg animate-fade-in-down">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="3" className="animate-pulse"/>
                </svg>
                <span>Live Session Recording</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight animate-fade-in-up">
                Debug like you're
                <br />
                <span className="relative inline-block mt-2">
                  <GradientText animationSpeed={3} className="relative z-10">
                    sitting next to them
                  </GradientText>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 0 8 Q 100 2, 200 8 T 400 8" stroke="#dc2626" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed animate-fade-in-up animation-delay-200">
                Record every click, scroll, and network request. Watch session replays that show you exactly what went wrong—no guessing required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400">
                <StarBorder className="rounded-lg">
                  <SignUpButton mode="modal">
                    <button className="group relative px-8 py-4 bg-red-600 text-white rounded-lg font-semibold overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5 hover:bg-red-700 w-full">
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Get Started Free
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </button>
                  </SignUpButton>
                </StarBorder>
                <button className="group px-8 py-4 bg-white border border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-gray-400 transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                  </svg>
                  Watch 2min Demo
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-8 pt-4 animate-fade-in-up animation-delay-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm text-gray-600">GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm text-gray-600">No Credit Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm text-gray-600">2min Setup</span>
                </div>
              </div>
            </div>

            {/* Visual representation - session replay UI mockup */}
            <div className="relative lg:block animate-fade-in-up animation-delay-200">
              {/* Browser mockup */}
              <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Browser chrome */}
                <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500 font-mono ml-4">
                    replaydash.com/sessions/abc-123
                  </div>
                </div>
                
                {/* Replay interface */}
                <div className="p-6 space-y-4">
                  {/* Playback controls */}
                  <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <button className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors shadow-md">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                      </svg>
                    </button>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-red-600 rounded-full relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg"></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1:23</span>
                        <span>3:45</span>
                      </div>
                    </div>
                  </div>

                  {/* Event timeline */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Click - "Add to Cart"</div>
                        <div className="text-xs text-gray-500 font-mono">button.checkout-btn</div>
                      </div>
                      <div className="text-xs text-gray-500">0:45</div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-orange-500"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Network - POST /api/cart</div>
                        <div className="text-xs text-gray-500">Status: 500 Error</div>
                      </div>
                      <div className="text-xs text-gray-500">0:47</div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Error - Cannot read property</div>
                        <div className="text-xs text-gray-500 font-mono truncate">TypeError: Cannot read property 'id' of undefined</div>
                      </div>
                      <div className="text-xs text-gray-500">0:48</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-green-500 text-white rounded-lg px-4 py-2 shadow-lg text-sm font-medium animate-float">
                ✓ Bug Found
              </div>
              <div className="absolute -bottom-4 -left-4 bg-red-600 text-white rounded-lg px-4 py-2 shadow-lg text-sm font-medium animate-float animation-delay-2000">
                📹 Recording
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-gradient-to-r from-red-100 to-orange-100 text-red-700 rounded-full text-sm font-semibold">
                Features
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Everything you need
              <br />
              <GradientText animationSpeed={3}>
                to ship with confidence
              </GradientText>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful session replay with zero configuration. Start recording in under 60 seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🎬',
                title: 'Pixel-Perfect Replay',
                description: 'Watch exactly what happened. DOM snapshots capture every interaction without performance impact.',
                gradient: 'from-red-500 to-orange-500'
              },
              {
                icon: '🐛',
                title: 'Error Correlation',
                description: 'See the full context behind every error. Console logs, network requests, and user actions.',
                gradient: 'from-orange-500 to-amber-500'
              },
              {
                icon: '🔒',
                title: 'Privacy First',
                description: 'GDPR compliant out of the box. All inputs masked by default. You control what gets recorded.',
                gradient: 'from-red-600 to-rose-600'
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Zero performance impact. Smart batching and compression keeps your app running smooth.',
                gradient: 'from-yellow-500 to-orange-500'
              },
              {
                icon: '🔍',
                title: 'Smart Search',
                description: 'Find any session instantly. Filter by user, URL, error type, custom events, and more.',
                gradient: 'from-emerald-500 to-green-600'
              },
              {
                icon: '📊',
                title: 'Analytics Ready',
                description: 'Track user journeys, measure performance, and understand behavior patterns automatically.',
                gradient: 'from-red-500 to-pink-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Start recording in
              <br />
              <GradientText animationSpeed={3}>
                under 60 seconds
              </GradientText>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-red-200 via-orange-200 to-amber-200"></div>

            {[
              {
                step: '1',
                title: 'Install',
                code: 'npm install @replaydash/sdk',
                gradient: 'from-red-500 to-orange-500'
              },
              {
                step: '2',
                title: 'Initialize',
                code: 'replayDash.init({ apiKey })',
                gradient: 'from-orange-500 to-amber-500'
              },
              {
                step: '3',
                title: 'Debug',
                code: '// That\'s it! 🎉',
                gradient: 'from-red-600 to-rose-600'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {item.step}
                  </div>
                  <div className="mt-8 mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
                      {item.title}
                    </h3>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <code className="text-sm text-green-400 font-mono whitespace-nowrap">
                      {item.code}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-gradient-to-r from-red-100 to-orange-100 text-red-700 rounded-full text-sm font-semibold">
                Pricing
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Simple, transparent
              <br />
              <GradientText animationSpeed={3}>
                pricing for everyone
              </GradientText>
            </h2>
            <p className="text-xl text-gray-600">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$0',
                period: 'Forever free',
                features: ['1,000 sessions/month', '30-day retention', 'Email support', 'Core features'],
                cta: 'Get Started',
                highlighted: false
              },
              {
                name: 'Pro',
                price: '$49',
                period: 'per month',
                features: ['50,000 sessions/month', '90-day retention', 'Priority support', 'Advanced filters', 'Team collaboration'],
                cta: 'Start Free Trial',
                highlighted: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'Contact sales',
                features: ['Unlimited sessions', 'Custom retention', 'Dedicated support', 'Self-hosted option', 'SLA guarantee'],
                cta: 'Contact Sales',
                highlighted: false
              }
            ].map((plan, index) => {
              const CardWrapper = plan.highlighted ? StarBorder : 'div'
              const wrapperProps = plan.highlighted ? { className: 'rounded-3xl', speed: 2, starDensity: 60 } : {}
              
              return (
                <CardWrapper key={index} {...wrapperProps}>
                  <div
                    className={`relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                      plan.highlighted
                        ? 'bg-gradient-to-br from-red-600 to-orange-600 text-white shadow-2xl scale-105'
                        : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl'
                    }`}
                  >
                {plan.highlighted && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-bold rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className={`text-5xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </div>
                  <div className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.period}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className={plan.highlighted ? 'text-red-50' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  plan.highlighted
                    ? 'bg-white text-red-600 hover:bg-red-50 hover:shadow-lg'
                    : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:scale-105'
                }`}>
                  {plan.cta}
                </button>
              </div>
            </CardWrapper>
          )
        })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-600 via-orange-600 to-rose-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to ship with confidence?
          </h2>
          <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto">
            Join thousands of developers using ReplayDash to debug production issues faster.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <StarBorder className="rounded-xl" speed={2}>
              <SignUpButton mode="modal">
                <button className="px-8 py-4 bg-white text-red-600 rounded-xl font-semibold text-lg hover:bg-red-50 hover:shadow-2xl transition-all hover:scale-105 w-full">
                  Start Free Trial
                </button>
              </SignUpButton>
            </StarBorder>
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all hover:scale-105"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all hover:scale-105">
                  Sign In →
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <img 
                  src="/logo-full.png" 
                  alt="ReplayDash" 
                  className="h-8 brightness-0 invert"
                />
              </div>
              <p className="text-sm mb-4 max-w-xs">
                Session replay and event tracking for modern web applications. Debug faster, ship with confidence.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  𝕏
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  in
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  GH
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><a href="#changelog" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#api" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#guides" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="#status" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>© 2024 ReplayDash. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="#terms" className="hover:text-white transition-colors">Terms</a>
              <a href="#security" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          animation-fill-mode: both;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .bg-grid-white\\/10 {
          background-image: linear-gradient(0deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  )
}
