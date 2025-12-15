#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

// Simple CLI script to add an admin username:password to the project's .env
// Usage:
//   node scripts/admin.js --user admin --pass secret
//   node scripts/admin.js (interactive)

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--user' || a === '-u') out.user = args[++i]
    else if (a === '--pass' || a === '-p') out.pass = args[++i]
    else if (a === '--help' || a === '-h') out.help = true
  }
  return out
}

function prompt(question) {
  return new Promise((resolve) => {
    process.stdout.write(question)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    process.stdin.once('data', (data) => {
      process.stdin.pause()
      resolve(data.toString().trim())
    })
  })
}

async function main() {
  const args = parseArgs()
  if (args.help) {
    console.log('Usage: node scripts/admin.js --user USERNAME --pass PASSWORD')
    process.exit(0)
  }

  let username = args.user
  let password = args.pass

  if (!username) username = await prompt('Username: ')
  if (!password) password = await prompt('Password: ')

  if (!username || !password) {
    console.error('Username and password are required')
    process.exit(1)
  }

  const repoRoot = path.resolve(__dirname, '..')
  const envPath = path.join(repoRoot, '.env')

  let envText = ''
  if (fs.existsSync(envPath)) {
    envText = fs.readFileSync(envPath, 'utf8')
  }

  // Parse existing .env into map while keeping original lines for rewriting
  const lines = envText.split(/\r?\n/)
  const envMap = {}
  const otherLines = []
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) {
      otherLines.push(line)
      continue
    }
    const idx = line.indexOf('=')
    if (idx === -1) {
      otherLines.push(line)
      continue
    }
    const key = line.slice(0, idx).trim()
    const val = line.slice(idx + 1)
    envMap[key] = val
  }

  const accountEntry = `${username}:${password}`

  let accounts = []
  if (envMap['AUTH_ACCOUNTS'] && envMap['AUTH_ACCOUNTS'].trim() !== '') {
    // Remove any surrounding quotes
    let raw = envMap['AUTH_ACCOUNTS']
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
      raw = raw.slice(1, -1)
    }
    accounts = raw.split(',').map(s => s.trim()).filter(Boolean)
  }

  // Replace existing entry for username if present
  const existingIndex = accounts.findIndex(a => a.split(':')[0] === username)
  if (existingIndex !== -1) {
    accounts[existingIndex] = accountEntry
    console.log(`Updated password for user '${username}'`)
  } else {
    accounts.push(accountEntry)
    console.log(`Added user '${username}'`)
  }

  const finalAccounts = accounts.join(',')

  // Rebuild .env content: keep other vars in original order, update or append AUTH_ACCOUNTS
  let wrote = false
  const outLines = []
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) {
      outLines.push(line)
      continue
    }
    const idx = line.indexOf('=')
    if (idx === -1) {
      outLines.push(line)
      continue
    }
    const key = line.slice(0, idx).trim()
    if (key === 'AUTH_ACCOUNTS') {
      outLines.push(`AUTH_ACCOUNTS="${finalAccounts}"`)
      wrote = true
    } else {
      outLines.push(line)
    }
  }

  if (!wrote) {
    // ensure there's a blank line before appending
    if (outLines.length > 0 && outLines[outLines.length - 1].trim() !== '') outLines.push('')
    outLines.push(`# Authentication accounts for lightrag (username:password, comma-separated)`)
    outLines.push(`AUTH_ACCOUNTS="${finalAccounts}"`)
  }

  fs.writeFileSync(envPath, outLines.join('\n'), 'utf8')
  console.log(`Written AUTH_ACCOUNTS to ${envPath}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
