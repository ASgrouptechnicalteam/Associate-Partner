import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';

export default function PublicFeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [overallRating, setOverallRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [propertyExperienceRating, setPropertyExperienceRating] = useState(5);
  const [writtenReview, setWrittenReview] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Invalid review link.');
      setLoading(false);
      return;
    }

    api.publicFeedback.get(id)
      .then((res: any) => {
        setReviewData(res.review);
        if (res.review.isSubmitted) {
          setIsSubmitted(true);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load review request.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSubmitting(true);
    setError(null);
    try {
      await api.publicFeedback.submit(id, {
        overallRating,
        communicationRating,
        propertyExperienceRating,
        writtenReview
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading review...</div>;
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="card" style={{ maxWidth: 500, width: '100%', textAlign: 'center', borderTop: '4px solid var(--danger)' }}>
          <h2 style={{ marginBottom: 16 }}>Oops!</h2>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--background)' }}>
        <div className="card" style={{ maxWidth: 500, width: '100%', textAlign: 'center', borderTop: '4px solid var(--success)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={{ marginBottom: 16 }}>Thank You!</h2>
          <p className="text-muted">Your feedback has been submitted successfully.</p>
          <p className="text-muted" style={{ marginTop: 8 }}>We appreciate your time.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', background: 'var(--background)', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 600, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Customer Feedback</h1>
          <p className="text-muted">
            Share your experience regarding {reviewData?.project?.name ? `project ${reviewData.project.name}` : 'our services'} with associate {reviewData?.associate?.name}.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Overall Rating (1-5)</label>
            <input 
              type="number" 
              className="form-input" 
              min="1" max="5" 
              value={overallRating}
              onChange={(e) => setOverallRating(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Communication Rating (1-5)</label>
            <input 
              type="number" 
              className="form-input" 
              min="1" max="5" 
              value={communicationRating}
              onChange={(e) => setCommunicationRating(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Property Experience Rating (1-5)</label>
            <input 
              type="number" 
              className="form-input" 
              min="1" max="5" 
              value={propertyExperienceRating}
              onChange={(e) => setPropertyExperienceRating(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Written Feedback</label>
            <textarea 
              className="form-input" 
              rows={4} 
              value={writtenReview}
              onChange={(e) => setWrittenReview(e.target.value)}
              placeholder="Tell us what you loved or how we can improve..."
              required
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 48, fontSize: 16 }} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
