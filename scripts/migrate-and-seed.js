const { execSync } = require('child_process')

console.log('Running database migrations...')
execSync('npx prisma migrate deploy', { stdio: 'inherit' })

console.log('Seeding database...')
try {
  execSync('npx ts-node --compiler-options \'{"module":"CommonJS"}\' prisma/seed.ts', { stdio: 'inherit' })
} catch (e) {
  // Seed may fail on re-runs due to upsert conflicts — that's fine
  console.log('Seed skipped (already seeded or error):', e.message)
}
