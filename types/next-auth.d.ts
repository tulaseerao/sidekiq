import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    color?: string
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      color?: string
    }
  }
}
