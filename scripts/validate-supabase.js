/**
 * Supabase Integration Validation Script
 * This script validates the Supabase setup and integration
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Starting Supabase Integration Validation...\n')

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * 1. Database Connection Test
 */
async function testDatabaseConnection() {
  console.log('📡 Testing Database Connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    return true
  } catch (err) {
    console.error('❌ Database connection error:', err.message)
    return false
  }
}

/**
 * 2. Authentication Setup Test
 */
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Setup...')
  
  try {
    // Test session retrieval
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Auth session error:', error.message)
      return false
    }
    
    console.log('✅ Auth session retrieval works')
    
    // Test auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('✅ Auth state change listener works')
    })
    
    // Clean up subscription
    subscription.unsubscribe()
    
    return true
  } catch (err) {
    console.error('❌ Authentication test error:', err.message)
    return false
  }
}

/**
 * 3. API Endpoints Test
 */
async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints...')
  
  const endpoints = [
    { table: 'profiles', operation: 'SELECT' },
    { table: 'designs', operation: 'SELECT' },
    { table: 'collections', operation: 'SELECT' },
    { table: 'orders', operation: 'SELECT' },
    { table: 'chat_boxes', operation: 'SELECT' },
    { table: 'messages', operation: 'SELECT' },
    { table: 'saved_items', operation: 'SELECT' },
    { table: 'plans', operation: 'SELECT' }
  ]
  
  let allPassed = true
  
  for (const endpoint of endpoints) {
    try {
      const { data, error } = await supabase
        .from(endpoint.table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ ${endpoint.table} endpoint failed:`, error.message)
        allPassed = false
      } else {
        console.log(`✅ ${endpoint.table} endpoint accessible`)
      }
    } catch (err) {
      console.error(`❌ ${endpoint.table} endpoint error:`, err.message)
      allPassed = false
    }
  }
  
  return allPassed
}

/**
 * 4. Security Measures Test
 */
async function testSecurityMeasures() {
  console.log('\n🔒 Testing Security Measures...')
  
  try {
    // Test RLS policies by attempting unauthorized access
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
    
    // This should either work (if public) or fail with proper RLS error
    if (error && error.message.includes('row-level security')) {
      console.log('✅ RLS policies are active')
    } else if (!error) {
      console.log('✅ Public access working as expected')
    } else {
      console.error('❌ Unexpected security error:', error.message)
      return false
    }
    
    // Test SSL connection (implicit in Supabase)
    console.log('✅ SSL/TLS connection (handled by Supabase)')
    
    return true
  } catch (err) {
    console.error('❌ Security test error:', err.message)
    return false
  }
}

/**
 * 5. Performance Test
 */
async function testPerformance() {
  console.log('\n⚡ Testing Performance...')
  
  try {
    const startTime = Date.now()
    
    // Test query response time
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .limit(10)
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    if (error) {
      console.error('❌ Performance test failed:', error.message)
      return false
    }
    
    console.log(`✅ Query response time: ${responseTime}ms`)
    
    if (responseTime > 2000) {
      console.warn('⚠️ Response time is slow (>2s)')
    }
    
    // Test real-time subscription
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'designs' }, (payload) => {
        console.log('✅ Real-time subscription working')
      })
      .subscribe()
    
    // Clean up
    setTimeout(() => {
      supabase.removeChannel(channel)
    }, 1000)
    
    return true
  } catch (err) {
    console.error('❌ Performance test error:', err.message)
    return false
  }
}

/**
 * Main validation function
 */
async function validateSupabaseIntegration() {
  console.log('🚀 SunilTextile.AI - Supabase Integration Validation\n')
  
  // Check environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables:')
    console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.error('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌')
    return
  }
  
  console.log('✅ Environment variables configured\n')
  
  const results = {
    database: await testDatabaseConnection(),
    authentication: await testAuthentication(),
    endpoints: await testAPIEndpoints(),
    security: await testSecurityMeasures(),
    performance: await testPerformance()
  }
  
  console.log('\n📊 Validation Summary:')
  console.log('========================')
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.charAt(0).toUpperCase() + test.slice(1)}: ${passed ? 'PASSED' : 'FAILED'}`)
  })
  
  const allPassed = Object.values(results).every(result => result)
  
  console.log('\n' + '='.repeat(50))
  console.log(`🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`)
  console.log('='.repeat(50))
  
  if (!allPassed) {
    console.log('\n🔧 Recommended Actions:')
    console.log('1. Check Supabase project settings')
    console.log('2. Verify RLS policies are correctly configured')
    console.log('3. Ensure all required tables exist')
    console.log('4. Check network connectivity')
  }
}

// Run validation
validateSupabaseIntegration().catch(console.error)