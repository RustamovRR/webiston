/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Commit type
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Code style (formatting, semicolons, etc)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding missing tests
        'chore',    // Build process, dependencies
        'ci',       // CI/CD changes
        'build',    // Build system changes
        'revert'    // Reverting a previous commit
      ]
    ],
    // Subject length
    'subject-max-length': [2, 'always', 96],
    'subject-min-length': [2, 'always', 3],
    // Subject format
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    // Type format
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    // Header format
    'header-max-length': [2, 'always', 100]
  },
  // Custom messages
  helpUrl: 'https://www.conventionalcommits.org/',
  prompt: {
    messages: {
      type: "Commit type ni tanlang:",
      subject: "Qisqa va aniq tavsif yozing:",
      body: "Batafsil tavsif (ixtiyoriy):",
      footer: "Footer (ixtiyoriy):"
    },
    questions: {
      type: {
        description: "Qanday o'zgarish kiritmoqdasiz?",
        enum: {
          feat: {
            description: "Yangi feature yoki funksiya",
            title: "Features"
          },
          fix: {
            description: "Bug fix",
            title: "Bug Fixes"
          },
          docs: {
            description: "Documentation o'zgarishlar",
            title: "Documentation"
          },
          style: {
            description: "Code style (formatting, etc)",
            title: "Styles"
          },
          refactor: {
            description: "Code refactoring",
            title: "Code Refactoring"
          },
          perf: {
            description: "Performance yaxshilash",
            title: "Performance Improvements"
          },
          test: {
            description: "Test qo'shish yoki o'zgartirish",
            title: "Tests"
          },
          chore: {
            description: "Build, dependencies, etc",
            title: "Chores"
          }
        }
      }
    }
  }
}