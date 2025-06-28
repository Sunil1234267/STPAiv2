/**
 * React Component for Testing Supabase Integration
 * This component provides a UI for testing various Supabase features
 */

import React, { useState, useEffect } from 'react'
import { supabase } from '../src/supabaseClient'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error' | 'warning'
  message: string
  details?: string
}

const SupabaseIntegrationTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name)
      if (existing) {
        existing.status = status
        existing.message = message
        existing.details = details
        return [...prev]
      }
      return [...prev, { name, status, message, details }]
    })
  }

  const runTests = async () => {
    setIsRunning(true)
    setTests([])

    // Test 1: Environment Variables
    updateTest('Environment', 'pending', 'Checking environment variables...')
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      updateTest('Environment', 'error', 'Missing environment variables', 
        `URL: ${supabaseUrl ? '✓' : '✗'}, Key: ${supabaseKey ? '✓' : '✗'}`)
    } else {
      updateTest('Environment', 'success', 'Environment variables configured')
    }

    // Test 2: Database Connection
    updateTest('Database Connection', 'pending', 'Testing database connection...')
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      if (error) {
        updateTest('Database Connection', 'error', 'Connection failed', error.message)
      } else {
        updateTest('Database Connection', 'success', 'Database connected successfully')
      }
    } catch (err: any) {
      updateTest('Database Connection', 'error', 'Connection error', err.message)
    }

    // Test 3: Authentication
    updateTest('Authentication', 'pending', 'Testing authentication system...')
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        updateTest('Authentication', 'error', 'Auth system error', error.message)
      } else {
        updateTest('Authentication', 'success', 'Authentication system working')
      }
    } catch (err: any) {
      updateTest('Authentication', 'error', 'Auth test failed', err.message)
    }

    // Test 4: Table Access
    const tables = ['profiles', 'designs', 'collections', 'orders', 'chat_boxes', 'messages', 'plans']
    
    for (const table of tables) {
      updateTest(`Table: ${table}`, 'pending', `Testing ${table} table access...`)
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          if (error.message.includes('row-level security')) {
            updateTest(`Table: ${table}`, 'warning', 'RLS active (expected)', 'Table protected by Row Level Security')
          } else {
            updateTest(`Table: ${table}`, 'error', 'Access failed', error.message)
          }
        } else {
          updateTest(`Table: ${table}`, 'success', 'Table accessible')
        }
      } catch (err: any) {
        updateTest(`Table: ${table}`, 'error', 'Table test failed', err.message)
      }
    }

    // Test 5: Real-time Subscriptions
    updateTest('Real-time', 'pending', 'Testing real-time subscriptions...')
    try {
      const channel = supabase
        .channel('test-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'designs' }, () => {
          updateTest('Real-time', 'success', 'Real-time subscriptions working')
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            updateTest('Real-time', 'success', 'Real-time subscriptions working')
            setTimeout(() => supabase.removeChannel(channel), 2000)
          }
        })
    } catch (err: any) {
      updateTest('Real-time', 'error', 'Real-time test failed', err.message)
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="text-green-500" size={20} />
      case 'error': return <XCircle className="text-red-500" size={20} />
      case 'warning': return <AlertCircle className="text-yellow-500" size={20} />
      case 'pending': return <Loader2 className="text-blue-500 animate-spin" size={20} />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'error': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'pending': return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Supabase Integration Test Suite
        </h1>
        
        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium flex items-center space-x-2"
          >
            {isRunning && <Loader2 className="animate-spin" size={16} />}
            <span>{isRunning ? 'Running Tests...' : 'Run Integration Tests'}</span>
          </button>
        </div>

        <div className="space-y-4">
          {tests.map((test, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getStatusColor(test.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <span className="font-medium text-gray-800">{test.name}</span>
                </div>
                <span className="text-sm text-gray-600">{test.message}</span>
              </div>
              {test.details && (
                <div className="mt-2 text-sm text-gray-600 bg-white bg-opacity-50 p-2 rounded">
                  {test.details}
                </div>
              )}
            </div>
          ))}
        </div>

        {tests.length > 0 && !isRunning && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Test Summary</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-green-600 font-bold">
                  {tests.filter(t => t.status === 'success').length}
                </div>
                <div className="text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-red-600 font-bold">
                  {tests.filter(t => t.status === 'error').length}
                </div>
                <div className="text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-600 font-bold">
                  {tests.filter(t => t.status === 'warning').length}
                </div>
                <div className="text-gray-600">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-blue-600 font-bold">
                  {tests.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SupabaseIntegrationTest
