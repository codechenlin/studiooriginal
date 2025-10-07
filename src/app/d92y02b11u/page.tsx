"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/d92y02b11u/login');
  }, [router]);

  return null; // or a loading spinner
}
