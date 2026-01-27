

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MobileHome from './MobileHome';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && window.innerWidth > 1500) {
      router.replace('/visits/calendar');
    }
  }, [router]);

  if (!mounted) return null;
  if (typeof window !== 'undefined' && window.innerWidth <= 1500) {
    return <MobileHome />;
  }
  return null;
}
