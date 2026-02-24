'use client'

import { useState } from 'react'
import { Copy, Check, Code, FileCode, Zap, AlertCircle } from 'lucide-react'

export default function DocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const installCode = `npm install @replaydash/sdk`
  
  const initCode = `import ReplayDash from '@replaydash/sdk';

// Initialize with your API key
ReplayDash.init({
  apiKey: 'your_api_key_here',
  // Optional configuration
  captureConsole: true,
  captureNetwork: true,
  captureErrors: true,
});`

  const htmlCode = `<!-- Add this script tag before closing </body> -->
<script src="https://cdn.replaydash.com/sdk/latest/replaydash.min.js"></script>
<script>
  ReplayDash.init({
    apiKey: 'your_api_key_here',
    captureConsole: true,
    captureNetwork: true,
    captureErrors: true
  });
</script>`

  const reactCode = `// App.tsx or your root component
import { useEffect } from 'react';
import ReplayDash from '@replaydash/sdk';

function App() {
  useEffect(() => {
    ReplayDash.init({
      apiKey: 'your_api_key_here',
      captureConsole: true,
      captureNetwork: true,
      captureErrors: true,
    });
  }, []);

  return <YourApp />;
}`

  const nextCode = `// app/layout.tsx or pages/_app.tsx
import ReplayDash from '@replaydash/sdk';

if (typeof window !== 'undefined') {
  ReplayDash.init({
    apiKey: 'your_api_key_here',
    captureConsole: true,
    captureNetwork: true,
    captureErrors: true,
  });
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}`

  const vueCode = `// main.js or main.ts
import { createApp } from 'vue';
import ReplayDash from '@replaydash/sdk';
import App from './App.vue';

ReplayDash.init({
  apiKey: 'your_api_key_here',
  captureConsole: true,
  captureNetwork: true,
  captureErrors: true,
});

createApp(App).mount('#app');`

  const CodeBlock = ({ code, language, section }: { code: string; language: string; section: string }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 rounded-t-xl border-b border-gray-700">
        <span className="text-xs font-medium text-gray-400">{language}</span>
        <button
          onClick={() => copyToClipboard(code, section)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          {copiedSection === section ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-xl overflow-x-auto">
        <code className="text-sm font-mono">{code}</code>
      </pre>
    </div>
  )

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
            <FileCode className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Integration Guide
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Add ReplayDash to your application in under 60 seconds. Choose your integration method below.
        </p>
      </div>

      {/* Quick Start */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-3 mb-4">
          <Zap className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Quick Start (HTML/CDN)
            </h2>
            <p className="text-gray-700 mb-4">
              The fastest way to get started. Just copy this snippet and paste it before your closing <code className="bg-white px-2 py-0.5 rounded text-sm">&lt;/body&gt;</code> tag:
            </p>
          </div>
        </div>
        <CodeBlock code={htmlCode} language="HTML" section="html" />
      </div>

      {/* NPM Installation */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Code className="h-7 w-7 text-red-600" />
          NPM Installation
        </h2>
        
        <div className="space-y-8">
          {/* Step 1: Install */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              1. Install the package
            </h3>
            <CodeBlock code={installCode} language="bash" section="install" />
          </div>

          {/* Step 2: Initialize */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              2. Initialize in your app
            </h3>
            <CodeBlock code={initCode} language="JavaScript" section="init" />
          </div>
        </div>
      </div>

      {/* Framework-Specific Examples */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Framework-Specific Examples
        </h2>

        <div className="space-y-6">
          {/* React */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white">React</h3>
            </div>
            <div className="p-6">
              <CodeBlock code={reactCode} language="TypeScript / React" section="react" />
            </div>
          </div>

          {/* Next.js */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Next.js</h3>
            </div>
            <div className="p-6">
              <CodeBlock code={nextCode} language="TypeScript / Next.js" section="next" />
            </div>
          </div>

          {/* Vue */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Vue.js</h3>
            </div>
            <div className="p-6">
              <CodeBlock code={vueCode} language="JavaScript / Vue" section="vue" />
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Options */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Configuration Options
        </h2>
        
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Option</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Default</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 font-mono text-sm text-red-600">apiKey</td>
                <td className="px-6 py-4 text-sm text-gray-600">string</td>
                <td className="px-6 py-4 text-sm text-gray-600"><span className="text-red-600 font-semibold">required</span></td>
                <td className="px-6 py-4 text-sm text-gray-700">Your ReplayDash API key</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-sm text-red-600">captureConsole</td>
                <td className="px-6 py-4 text-sm text-gray-600">boolean</td>
                <td className="px-6 py-4 text-sm text-gray-600">true</td>
                <td className="px-6 py-4 text-sm text-gray-700">Capture console.log, warn, error</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-sm text-red-600">captureNetwork</td>
                <td className="px-6 py-4 text-sm text-gray-600">boolean</td>
                <td className="px-6 py-4 text-sm text-gray-600">true</td>
                <td className="px-6 py-4 text-sm text-gray-700">Capture fetch/XHR requests</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-sm text-red-600">captureErrors</td>
                <td className="px-6 py-4 text-sm text-gray-600">boolean</td>
                <td className="px-6 py-4 text-sm text-gray-600">true</td>
                <td className="px-6 py-4 text-sm text-gray-700">Capture JavaScript errors</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-sm text-red-600">maskAllInputs</td>
                <td className="px-6 py-4 text-sm text-gray-600">boolean</td>
                <td className="px-6 py-4 text-sm text-gray-600">true</td>
                <td className="px-6 py-4 text-sm text-gray-700">Mask all input fields (GDPR)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-sm text-red-600">sampleRate</td>
                <td className="px-6 py-4 text-sm text-gray-600">number</td>
                <td className="px-6 py-4 text-sm text-gray-600">1.0</td>
                <td className="px-6 py-4 text-sm text-gray-700">Sample rate (0.0 - 1.0)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>Replace <code className="bg-white px-2 py-0.5 rounded">your_api_key_here</code> with your actual API key from the <a href="/dashboard/api-keys" className="text-red-600 hover:underline font-semibold">API Keys page</a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>The SDK automatically starts recording when initialized</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>All sensitive inputs are masked by default (GDPR compliant)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>The SDK is ~15KB gzipped and has minimal performance impact</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-12 flex gap-4">
        <a
          href="/dashboard/api-keys"
          className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white text-center font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Get Your API Key →
        </a>
        <a
          href="/dashboard/sessions"
          className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 text-center font-semibold rounded-xl hover:border-gray-400 transition-all"
        >
          View Sessions
        </a>
      </div>
    </div>
  )
}
