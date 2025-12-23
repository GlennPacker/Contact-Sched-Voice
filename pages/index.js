import Link from 'next/link'
import { Button } from 'react-bootstrap'
import styles from './index.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <h1>Welcome to Contact Sched Voice (Next.js)</h1>
        <p>This is a minimal Next.js scaffold. Run <code>npm run dev</code> to start the dev server.</p>

        <div className="u-cta">
          <Link href="/contacts/create" passHref>
            <Button variant="primary">Create Contact</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
