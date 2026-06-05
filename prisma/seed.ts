import { PrismaClient, Priority } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password123', 10)

  const alice = await prisma.user.upsert({
    where: { email: 'alice@devtrack.io' },
    update: {},
    create: { name: 'Alice Chen', email: 'alice@devtrack.io', password, color: '#6366f1' },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@devtrack.io' },
    update: {},
    create: { name: 'Bob Kim', email: 'bob@devtrack.io', password, color: '#22c55e' },
  })

  const carol = await prisma.user.upsert({
    where: { email: 'carol@devtrack.io' },
    update: {},
    create: { name: 'Carol Zhao', email: 'carol@devtrack.io', password, color: '#f97316' },
  })

  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of the marketing site and developer docs',
      color: '#6366f1',
      members: {
        create: [
          { userId: alice.id, role: 'owner' },
          { userId: bob.id, role: 'member' },
          { userId: carol.id, role: 'member' },
        ],
      },
      labels: {
        create: [
          { name: 'Frontend', color: '#6366f1' },
          { name: 'Backend', color: '#22c55e' },
          { name: 'Design', color: '#ec4899' },
          { name: 'Bug', color: '#f43f5e' },
          { name: 'Infra', color: '#f97316' },
        ],
      },
    },
  })

  const columns = await Promise.all([
    prisma.column.create({ data: { name: 'Backlog', position: 0, color: '#64748b', projectId: project.id } }),
    prisma.column.create({ data: { name: 'To Do', position: 1, color: '#6366f1', projectId: project.id } }),
    prisma.column.create({ data: { name: 'In Progress', position: 2, color: '#f59e0b', projectId: project.id } }),
    prisma.column.create({ data: { name: 'Review', position: 3, color: '#8b5cf6', projectId: project.id } }),
    prisma.column.create({ data: { name: 'Done', position: 4, color: '#22c55e', projectId: project.id } }),
  ])

  const taskData = [
    { title: 'Audit current site performance', priority: Priority.HIGH, columnIdx: 0, position: 0, assignee: alice.id },
    { title: 'Define new design system tokens', priority: Priority.URGENT, columnIdx: 1, position: 0, assignee: carol.id },
    { title: 'Set up Storybook component library', priority: Priority.MEDIUM, columnIdx: 1, position: 1, assignee: alice.id },
    { title: 'Redesign hero section', priority: Priority.HIGH, columnIdx: 2, position: 0, assignee: carol.id },
    { title: 'Migrate API to v2 endpoints', priority: Priority.URGENT, columnIdx: 2, position: 1, assignee: bob.id },
    { title: 'Implement dark mode toggle', priority: Priority.LOW, columnIdx: 2, position: 2, assignee: alice.id },
    { title: 'Code review: navigation refactor', priority: Priority.MEDIUM, columnIdx: 3, position: 0, assignee: bob.id },
    { title: 'QA sign-off on mobile layout', priority: Priority.HIGH, columnIdx: 3, position: 1, assignee: carol.id },
    { title: 'Update sitemap and robots.txt', priority: Priority.LOW, columnIdx: 4, position: 0, assignee: bob.id },
    { title: 'Deploy staging environment', priority: Priority.MEDIUM, columnIdx: 4, position: 1, assignee: alice.id },
  ]

  for (const t of taskData) {
    await prisma.task.create({
      data: {
        title: t.title,
        priority: t.priority,
        position: t.position,
        projectId: project.id,
        columnId: columns[t.columnIdx].id,
        createdById: alice.id,
        assignees: { create: [{ userId: t.assignee }] },
      },
    })
  }

  console.log('Seed complete. Login with alice@devtrack.io / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
