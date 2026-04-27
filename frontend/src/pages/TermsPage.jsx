import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, AlertCircle, Mail, CreditCard, RefreshCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import StarField from '../components/StarField';

const API = process.env.REACT_APP_BACKEND_URL;

const TermsPage = () => {
  const navigate = useNavigate();
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundEmail, setRefundEmail] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefundRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API}/api/refund-request`, {
        email: refundEmail,
        reason: refundReason
      });
      toast.success('Refund request submitted successfully! We will contact you within 48 hours.');
      setShowRefundForm(false);
      setRefundEmail('');
      setRefundReason('');
    } catch (error) {
      toast.error('Failed to submit request. Please email us directly at getbabywish@hotmail.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      
      <div className="relative z-20 min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="text-white">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10"
          >
            {/* Title */}
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-10 h-10 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Terms & Conditions</h1>
                <p className="text-white/60 text-sm">Last updated: December 2025</p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8 text-white/80">
              
              {/* Entertainment Disclaimer */}
              <section className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-bold text-amber-400 mb-2">Entertainment Disclaimer</h2>
                    <p className="text-white/70">
                      BabyWish is an <strong>entertainment service</strong> that uses statistical analysis and AI algorithms 
                      to generate predictions. Our service is <strong>NOT</strong> a medical diagnostic tool and should 
                      <strong> NOT</strong> be used for medical decisions. The predictions provided are for 
                      <strong> entertainment purposes only</strong> and do not guarantee any specific outcome.
                    </p>
                  </div>
                </div>
              </section>

              {/* Service Description */}
              <section>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  1. Service Description
                </h2>
                <p>
                  BabyWish provides AI-powered gender predictions based on statistical analysis of parental birth dates. 
                  Our algorithms analyze biological cycles and probability patterns to generate predictions. 
                  This service is designed for entertainment and educational purposes.
                </p>
              </section>

              {/* Accuracy & Guarantee */}
              <section>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  2. 95% Accuracy Guarantee
                </h2>
                <p className="mb-4">
                  We claim a 95% accuracy rate based on our statistical models. If your prediction does not match 
                  the actual outcome, you are eligible for a <strong>full refund</strong> under the following conditions:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must submit proof of the actual birth outcome (birth certificate or official documentation)</li>
                  <li>The refund request must be submitted within 30 days of the child's birth</li>
                  <li>Only one refund per customer is allowed</li>
                  <li>Refunds are processed within 14 business days</li>
                </ul>
              </section>

              {/* Money Back Policy */}
              <section className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5 text-green-400" />
                  3. Money Back Policy
                </h2>
                <p className="mb-4">
                  If our prediction is incorrect, we offer a <strong>100% money-back guarantee</strong>. 
                  To request a refund:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4 mb-4">
                  <li>Click the "Request Refund" button below</li>
                  <li>Provide your registered email and order details</li>
                  <li>Upload proof of actual birth outcome</li>
                  <li>Our team will review within 48 hours</li>
                  <li>Approved refunds are processed via the original payment method</li>
                </ol>
                
                <Button 
                  onClick={() => setShowRefundForm(!showRefundForm)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {showRefundForm ? 'Hide Form' : 'Request Refund'}
                </Button>

                {/* Refund Form */}
                {showRefundForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 space-y-4 bg-white/5 rounded-xl p-4"
                    onSubmit={handleRefundRequest}
                  >
                    <div>
                      <label className="text-white/70 text-sm block mb-1">Registered Email</label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={refundEmail}
                        onChange={(e) => setRefundEmail(e.target.value)}
                        required
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white/70 text-sm block mb-1">Reason for Refund</label>
                      <textarea
                        placeholder="Please describe why you are requesting a refund..."
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        required
                        rows={3}
                        className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 placeholder:text-white/50"
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-600">
                      {isSubmitting ? 'Submitting...' : 'Submit Refund Request'}
                    </Button>
                  </motion.form>
                )}
              </section>

              {/* Payment Terms */}
              <section>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  4. Payment Terms
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All payments are processed securely via Stripe</li>
                  <li>Prices are displayed in EUR (€)</li>
                  <li>Subscriptions can be cancelled at any time</li>
                  <li>No automatic renewals without explicit consent</li>
                </ul>
              </section>

              {/* Privacy */}
              <section>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  5. Privacy & Data
                </h2>
                <p>
                  We respect your privacy. Your personal data is stored securely and never shared with third parties. 
                  Birth dates provided are used solely for prediction calculations. You can request data deletion 
                  at any time by contacting us.
                </p>
              </section>

              {/* Contact */}
              <section className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-400" />
                  6. Contact Us
                </h2>
                <p className="mb-2">For any questions, refund requests, or concerns:</p>
                <ul className="space-y-1">
                  <li><strong>Email:</strong> getbabywish@hotmail.com</li>
                  <li><strong>Website:</strong> getbabywish.com</li>
                </ul>
              </section>

              {/* Final Disclaimer */}
              <section className="text-center py-6 border-t border-white/10">
                <p className="text-white/50 text-sm">
                  By using BabyWish, you acknowledge that you have read and agree to these Terms & Conditions. 
                  This service is for entertainment purposes only and should not replace medical advice.
                </p>
                <p className="text-white/30 text-xs mt-4">
                  © 2025 BabyWish. All rights reserved.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

