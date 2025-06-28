import React from 'react'
import SupabaseIntegrationTest from '../../scripts/test-supabase-integration'

const SupabaseTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <SupabaseIntegrationTest />
    </div>
  )
}

export default SupabaseTest
