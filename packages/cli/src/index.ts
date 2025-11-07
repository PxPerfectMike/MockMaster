#!/usr/bin/env node

// CLI exports for programmatic use
export * from './types'
export * from './fs'
export * from './generate'

// CLI entry point - will be fully implemented in Phase 7
if (require.main === module) {
  console.log('mock-master CLI v0.0.0')
  console.log('')
  console.log('Commands:')
  console.log('  generate <spec>  Generate mocks from OpenAPI spec')
  console.log('  list             List all scenarios')
  console.log('  delete <name>    Delete a scenario')
  console.log('')
  console.log('Full interactive CLI coming in Phase 7!')
}
