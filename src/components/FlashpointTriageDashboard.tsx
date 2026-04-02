'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FlashpointTriageDashboard.module.css';

interface DueReview {
  conceptId: string;
  conceptTitle: string;
  phase: 'phase-1' | 'phase-2' | 'phase-3';
  difficulty: 'multiple-choice' | 'text-input' | 'blindspot';
  daysOverdue: number;
  daysUntilDue: number;
  successRate: number;
  totalReviews: number;
}

interface TriageStats {
  totalConcepts: number;
  conceptsDueToday: number;
  masteredConcepts: number;
  needsReviewConcepts: number;
  averageSuccessRate: number;
}

interface Props {
  userId?: string;
  onSelectReview: (review: DueReview) => void;
}

export default function FlashpointTriageDashboard({ userId, onSelectReview }: Props) {
  const [dueReviews, setDueReviews] = useState<DueReview[]>([]);
  const [stats, setStats] = useState<TriageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchDueReviews();
  }, [userId]);

  const fetchDueReviews = async () => {
    try {
      setLoading(true);
      // Use GET with userId query param — API implemented as GET
      const uid = encodeURIComponent(userId || 'demo-user');
      const response = await fetch(`/api/flashpoint/due-reviews?userId=${uid}`);
      const data = await response.json();

      // API may return { due_reviews: [...] } or { dueToday: [...] } depending on implementation
      const due = data.due_reviews || data.dueToday || [];
      setDueReviews(due || []);

      // Build lightweight stats if API didn't return statistics
      if (data.statistics) {
        setStats(data.statistics);
      } else {
        const total = due.length;
        const mastered = due.filter((d: any) => d.current_interval && d.current_interval > 30).length;
        const avgSuccess = total > 0 ? Math.round((due.reduce((s: number, r: any) => s + (r.successRate || 75), 0) / total)) : 100;
        setStats({
          totalConcepts: total,
          conceptsDueToday: total,
          masteredConcepts: mastered,
          needsReviewConcepts: total - mastered,
          averageSuccessRate: avgSuccess,
        });
      }
    } catch (error) {
      console.error('Failed to fetch due reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'multiple-choice':
        return '#ff8c42'; // orange
      case 'text-input':
        return '#667eea'; // purple
      case 'blindspot':
        return '#ff6b6b'; // red
      default:
        return '#ffffff';
    }
  };

  const getPhaseLabel = (phase: string): string => {
    switch (phase) {
      case 'phase-1':
        return 'URGENT (1-3d)';
      case 'phase-2':
        return 'DIAGNOSTIC (7-14d)';
      case 'phase-3':
        return 'MASTERY (30-90d)';
      default:
        return phase;
    }
  };

  const renderUrgency = (daysOverdue: number): React.ReactNode => {
    if (daysOverdue > 0) {
      return (
        <motion.div
          className={styles.urgencyBadge}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            boxShadow: [
              '0 0 10px rgba(255, 107, 107, 0.5)',
              '0 0 20px rgba(255, 107, 107, 0.8)',
              '0 0 10px rgba(255, 107, 107, 0.5)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {daysOverdue}d OVERDUE
        </motion.div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <motion.div
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={styles.loadingSpinner}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            ⚙️
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header with Statistics */}
      <motion.div
        className={styles.header}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className={styles.title}>
          <div className={styles.titleText}>FLASHPOINT TRIAGE</div>
          <div className={styles.subtitle}>Your review schedule for today</div>
        </div>

        {stats && (
          <div className={styles.stats}>
            <motion.div
              className={styles.statCard}
              whileHover={{ scale: 1.05 }}
            >
              <div className={styles.statNumber}>{stats.conceptsDueToday}</div>
              <div className={styles.statLabel}>Due Today</div>
            </motion.div>
            <motion.div
              className={styles.statCard}
              whileHover={{ scale: 1.05 }}
            >
              <div className={styles.statNumber}>{stats.masteredConcepts}</div>
              <div className={styles.statLabel}>Mastered</div>
            </motion.div>
            <motion.div
              className={styles.statCard}
              whileHover={{ scale: 1.05 }}
            >
              <div className={styles.statNumber}>{stats.averageSuccessRate}%</div>
              <div className={styles.statLabel}>Success Rate</div>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Due Reviews List */}
      <motion.div
        className={styles.reviewsList}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {dueReviews.length === 0 ? (
          <motion.div
            className={styles.emptyState}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className={styles.emptyIcon}>✓</div>
            <div className={styles.emptyTitle}>All Caught Up!</div>
            <div className={styles.emptyText}>
              No concepts due for review today. Great job staying on top of your learning!
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {dueReviews.map((review, index) => (
              <motion.div
                key={review.conceptId}
                className={`${styles.reviewCard} ${selectedIndex === index ? styles.selected : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedIndex(index);
                  onSelectReview(review);
                }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Overdue Badge */}
                {review.daysOverdue > 0 && (
                  <div className={styles.cardOverdueIndicator}>
                    {renderUrgency(review.daysOverdue)}
                  </div>
                )}

                <div className={styles.cardLeft}>
                  {/* Concept Title */}
                  <h3 className={styles.conceptTitle}>{review.conceptTitle}</h3>

                  {/* Phase & Difficulty */}
                  <div className={styles.metadata}>
                    <motion.span
                      className={styles.phase}
                      style={{
                        color: getDifficultyColor(review.difficulty),
                        borderColor: getDifficultyColor(review.difficulty),
                      }}
                    >
                      {getPhaseLabel(review.phase)}
                    </motion.span>
                    <span className={styles.separator}>•</span>
                    <span className={styles.difficulty}>
                      {review.difficulty.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Review Stats */}
                  <div className={styles.stats2}>
                    <span>Success: {review.successRate}%</span>
                    <span className={styles.separator}>•</span>
                    <span>Reviews: {review.totalReviews}</span>
                  </div>
                </div>

                <motion.div
                  className={styles.cardRight}
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    className={styles.arrow}
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Instruction Banner */}
      {dueReviews.length > 0 && (
        <motion.div
          className={styles.banner}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className={styles.bannerIcon}>ℹ️</span>
          <span className={styles.bannerText}>
            Click any concept to start your review. Your progress is tracked and your next review date will be calculated based on your performance.
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
