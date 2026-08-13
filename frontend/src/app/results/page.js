'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import AuditResults from '@/components/AuditResults';
import { analyzeInvoice } from '@/lib/api';
import styles from './page.module.css';

// Helper to convert base64 back to File object
function base64ToFile(base64Data, filename) {
  const arr = base64Data.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const processInvoice = async () => {
      if (!sessionId) {
        if (isMounted) {
          setError('No payment session found.');
          setLoading(false);
        }
        return;
      }

      const pendingInvoiceStr = sessionStorage.getItem('pendingInvoice');
      if (!pendingInvoiceStr) {
        if (isMounted) {
          setError('No pending invoice found. Please upload your invoice again.');
          setLoading(false);
        }
        return;
      }

      try {
        const pendingInvoice = JSON.parse(pendingInvoiceStr);
        const file = base64ToFile(pendingInvoice.data, pendingInvoice.filename);

        const response = await analyzeInvoice(file, sessionId);
        
        if (!isMounted) return;

        if (response?.success) {
          setResult(response.data);
          sessionStorage.removeItem('pendingInvoice');
        } else {
          setError(response?.error || 'Failed to analyze invoice.');
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'An error occurred during analysis.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    processInvoice();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return (
    <div className={styles.main}>
      <Header />
      <div className={styles.content}>
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingCard}>
              <div className={styles.shimmer}></div>
            </div>
            <h2 className={styles.loadingTitle}>Analyzing your invoice with AI...</h2>
            <p className={styles.loadingSubtitle}>This usually takes 10-30 seconds</p>
          </div>
        )}

        {!loading && error && (
          <div className={styles.errorContainer}>
            <h2 className={styles.errorTitle}>Analysis Failed</h2>
            <p className={styles.errorText}>{error}</p>
            <Link href="/" className={styles.backButton}>Try Again</Link>
          </div>
        )}

        {!loading && !error && result && (
          <div className={styles.resultsContainer}>
            <AuditResults data={result} />
            <Link href="/" className={styles.newAuditButton}>Audit Another Invoice</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className={styles.main}><Header /></div>}>
      <ResultsContent />
    </Suspense>
  );
}
