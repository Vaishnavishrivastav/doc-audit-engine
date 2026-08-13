'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import DropZone from '@/components/DropZone';
import { createCheckoutSession } from '@/lib/api';
import styles from './page.module.css';

function HomeContent() {
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError('');
  };

  const handlePayment = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    
    try {
      // Convert file to base64 to store in sessionStorage
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result;
        sessionStorage.setItem('pendingInvoice', JSON.stringify({
          filename: file.name,
          data: base64Data
        }));

        try {
          const { url } = await createCheckoutSession(file.name);
          window.location.href = url;
        } catch (err) {
          setError(err.message || 'Payment initiation failed');
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read file');
        setLoading(false);
      };
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className={styles.main}>
      <Header />
      {cancelled && (
        <div className={styles.cancelledBanner}>
          Payment was cancelled. Upload your invoice to try again.
        </div>
      )}
      <div className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.badge}>AI-Powered Auditing</div>
          <h1 className={styles.title}>Catch invoice errors before they cost you.</h1>
          <p className={styles.subtitle}>
            SmartAudit AI uses Google Gemini to analyze your logistics invoices, flag billing discrepancies, and extract key data — in seconds.
          </p>
        </section>

        <DropZone onFileSelected={handleFileSelect} />

        {file && (
          <div className={styles.ctaSection}>
            <button
              className={`${styles.payButton} ${loading ? styles.payButtonLoading : ''}`}
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? <span className={styles.spinner}></span> : 'Pay & Audit — $0.50'}
            </button>
            {error && <div className={styles.error}>{error}</div>}
          </div>
        )}
      </div>
      <footer className={styles.footer}>
        SmartAudit AI · Built for the Gemini XPRIZE Hackathon · Powered by Google Gemini
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className={styles.main}><Header /></div>}>
      <HomeContent />
    </Suspense>
  );
}
