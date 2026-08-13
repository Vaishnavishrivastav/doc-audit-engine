'use client';

import React from 'react';
import styles from './AuditResults.module.css';

export default function AuditResults({ data }) {
  if (!data) return null;

  const {
    vendorName,
    invoiceNumber,
    totalAmountDue,
    billingDiscrepanciesFound,
    extractedLineItems,
    auditSummaryNotes
  } = data;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateTotal = () => {
    if (!extractedLineItems || !Array.isArray(extractedLineItems)) return 0;
    return extractedLineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  return (
    <div className={styles.results}>
      <div className={styles.summaryRow}>
        <div className={styles.card} style={{ animationDelay: '0.1s' }}>
          <div className={styles.cardLabel}>Vendor Name</div>
          <div className={styles.cardValue}>{vendorName || 'N/A'}</div>
        </div>
        <div className={styles.card} style={{ animationDelay: '0.2s' }}>
          <div className={styles.cardLabel}>Invoice #</div>
          <div className={styles.cardValue}>{invoiceNumber || 'N/A'}</div>
        </div>
        <div className={styles.card} style={{ animationDelay: '0.3s' }}>
          <div className={styles.cardLabel}>Total Due</div>
          <div className={styles.cardValue}>{totalAmountDue !== undefined ? formatCurrency(totalAmountDue) : 'N/A'}</div>
        </div>
      </div>

      <div className={`${styles.discrepancyBanner} ${billingDiscrepanciesFound ? styles.bannerDanger : styles.bannerSuccess}`} style={{ animationDelay: '0.4s' }}>
        {billingDiscrepanciesFound ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            ⚠ Billing Discrepancies Detected
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            ✓ No Billing Issues Found
          </>
        )}
      </div>

      {extractedLineItems && extractedLineItems.length > 0 && (
        <div className={styles.tableCard} style={{ animationDelay: '0.5s' }}>
          <h3 className={styles.tableTitle}>Extracted Line Items</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>#</th>
                  <th className={styles.th}>Description</th>
                  <th className={`${styles.th} ${styles.amount}`}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {extractedLineItems.map((item, index) => (
                  <tr key={index}>
                    <td className={styles.td}>{index + 1}</td>
                    <td className={styles.td}>{item.description}</td>
                    <td className={`${styles.td} ${styles.amount}`}>{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
                <tr className={styles.totalRow}>
                  <td className={styles.td} colSpan={2}>Calculated Total</td>
                  <td className={`${styles.td} ${styles.amount}`}>{formatCurrency(calculateTotal())}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {auditSummaryNotes && (
        <div className={styles.notesCard} style={{ animationDelay: '0.6s' }}>
          <h3 className={styles.notesTitle}>Audit Summary Notes</h3>
          <p className={styles.notesText}>{auditSummaryNotes}</p>
        </div>
      )}
    </div>
  );
}
