import React, { useState, useEffect } from 'react';
import { DollarSign, Shield, CheckCircle2, Clock, Send, FileText, ChevronRight, X } from 'lucide-react';
import { apiFundMilestone, apiVerifyPayment, apiSubmitMilestone, apiReleaseMilestone, apiGetPayoutStatus, apiStartPayoutOnboarding } from '../api/client';

// Loads Razorpay's Checkout script once and reuses it — Razorpay Checkout is a JS
// overlay/modal, not a hosted redirect page like Stripe Checkout.
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function ContractsPanel({ contracts, currentUser, onRefresh, onOpenChat }) {
  const [loadingId, setLoadingId] = useState(null);
  const [submitNotes, setSubmitNotes] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [payoutStatus, setPayoutStatus] = useState(null);
  const [showOnboardingForm, setShowOnboardingForm] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    name: currentUser?.name || '', email: currentUser?.email || '', phone: '',
    businessName: '', accountNumber: '', ifscCode: '', beneficiaryName: currentUser?.name || ''
  });
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'freelancer') {
      apiGetPayoutStatus().then(setPayoutStatus);
    }
  }, [currentUser]);

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setOnboardingSubmitting(true);
    setErrorMsg('');
    try {
      await apiStartPayoutOnboarding(onboardingData);
      setShowOnboardingForm(false);
      const status = await apiGetPayoutStatus();
      setPayoutStatus(status);
    } catch (err) {
      setErrorMsg(err.message || 'Could not set up payouts');
    } finally {
      setOnboardingSubmitting(false);
    }
  };

  const payoutBanner = currentUser?.role === 'freelancer' && payoutStatus && !payoutStatus.onboardingComplete && (
    <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-amber-600 flex-shrink-0" />
        <div>
          <div className="font-semibold text-slate-800">Set up payouts to get paid</div>
          <div className="text-sm text-slate-500">Add your bank details (Razorpay test mode) before you can receive released milestone funds.</div>
        </div>
      </div>
      <button
        onClick={() => setShowOnboardingForm(true)}
        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl transition shadow flex items-center gap-2 flex-shrink-0"
      >
        <Shield className="w-4 h-4" /> Set Up Payouts
      </button>
    </div>
  );

  const onboardingModal = showOnboardingForm && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={() => setShowOnboardingForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Set up payouts</h3>
        <p className="text-sm text-slate-500 mb-4">Test mode — you can use dummy bank details. Real details required before going live.</p>
        <form onSubmit={handleOnboardingSubmit} className="space-y-3">
          <input required placeholder="Full name" value={onboardingData.name}
            onChange={e => setOnboardingData({ ...onboardingData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input required type="email" placeholder="Email" value={onboardingData.email}
            onChange={e => setOnboardingData({ ...onboardingData, email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input required placeholder="Phone (10 digits)" value={onboardingData.phone}
            onChange={e => setOnboardingData({ ...onboardingData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input placeholder="Business name (optional)" value={onboardingData.businessName}
            onChange={e => setOnboardingData({ ...onboardingData, businessName: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input required placeholder="Bank account number" value={onboardingData.accountNumber}
            onChange={e => setOnboardingData({ ...onboardingData, accountNumber: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input required placeholder="IFSC code" value={onboardingData.ifscCode}
            onChange={e => setOnboardingData({ ...onboardingData, ifscCode: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input required placeholder="Beneficiary name (as per bank)" value={onboardingData.beneficiaryName}
            onChange={e => setOnboardingData({ ...onboardingData, beneficiaryName: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <button type="submit" disabled={onboardingSubmitting}
            className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition disabled:opacity-50">
            {onboardingSubmitting ? 'Setting up…' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );

  if (!contracts || contracts.length === 0) {
    return (
      <div className="space-y-6">
        {payoutBanner}
        {onboardingModal}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Contracts</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {currentUser?.role === 'client' 
              ? 'Accept a proposal on one of your posted projects to initiate a funded contract with a freelancer.'
              : 'Once a client accepts your proposal, active milestone contracts will appear here.'}
          </p>
        </div>
      </div>
    );
  }

  const handleFund = async (contractId, milestoneId) => {
    try {
      setLoadingId(milestoneId);
      setErrorMsg('');

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg('Could not load Razorpay Checkout. Check your internet connection.');
        setLoadingId(null);
        return;
      }

      const order = await apiFundMilestone(contractId, milestoneId);

      const razorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'WorkPulse',
        description: 'Milestone escrow deposit',
        theme: { color: '#059669' },
        handler: async (response) => {
          try {
            const verifyResult = await apiVerifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyResult.funded) {
              onRefresh();
            } else {
              setErrorMsg('Payment received but confirmation is still processing — refresh in a moment.');
            }
          } catch (err) {
            setErrorMsg(err.message || 'Payment verification failed');
          } finally {
            setLoadingId(null);
          }
        },
        modal: {
          ondismiss: () => setLoadingId(null) // user closed the Razorpay modal without paying
        }
      };

      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();
    } catch (err) {
      setErrorMsg(err.message || 'Funding failed');
      setLoadingId(null);
    }
  };

  const handleSubmit = async (contractId, milestoneId) => {
    try {
      setLoadingId(milestoneId);
      setErrorMsg('');
      const notes = submitNotes[milestoneId] || 'Completed deliverable attached for review.';
      await apiSubmitMilestone(contractId, milestoneId, notes);
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRelease = async (contractId, milestoneId) => {
    try {
      setLoadingId(milestoneId);
      setErrorMsg('');
      await apiReleaseMilestone(contractId, milestoneId);
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message || 'Payment release failed');
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'funded':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200"><Shield className="w-3.5 h-3.5" /> Funded in Escrow</span>;
      case 'submitted':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200"><Clock className="w-3.5 h-3.5" /> Work Submitted</span>;
      case 'released':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200"><CheckCircle2 className="w-3.5 h-3.5" /> Payment Released</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200"><Clock className="w-3.5 h-3.5" /> Pending Funding</span>;
    }
  };

  return (
    <div className="space-y-6">
      {payoutBanner}
      {onboardingModal}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {contracts.map((contract) => {
        const otherParty = currentUser?.role === 'client' ? contract.freelancer : contract.client;
        return (
          <div key={contract._id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200 hover:border-slate-300">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-400/30 uppercase tracking-wide">
                    {contract.status} Contract
                  </span>
                  <span className="text-slate-400 text-xs">ID: {contract._id.slice(-6)}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{contract.title}</h3>
                <p className="text-slate-300 text-sm mt-1">
                  {currentUser?.role === 'client' ? 'Freelancer: ' : 'Client: '}
                  <span className="font-semibold text-white">{otherParty?.name || 'User'}</span> ({otherParty?.email})
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Budget</span>
                  <span className="text-2xl font-black text-emerald-400">₹{contract.totalAmount?.toLocaleString()}</span>
                </div>

                {onOpenChat && (
                  <button
                    onClick={() => onOpenChat(contract)}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-md"
                  >
                    <Send className="w-4 h-4" /> Message Workroom
                  </button>
                )}
              </div>
            </div>

            {/* Milestones list */}
            <div className="p-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Milestone Escrow Details
              </h4>

              {contract.milestones && contract.milestones.map((m) => (
                <div key={m._id} className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h5 className="font-semibold text-slate-800">{m.title}</h5>
                      {getStatusBadge(m.status)}
                    </div>
                    <p className="text-sm font-bold text-emerald-700">₹{m.amount?.toLocaleString()}</p>
                    {m.submissionNotes && (
                      <div className="mt-2 p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-600">
                        <strong className="text-slate-800">Submission Note:</strong> {m.submissionNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions depending on role & milestone status */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* CLIENT ACTIONS */}
                    {currentUser?.role === 'client' && (
                      <>
                        {m.status === 'pending' && (
                          <button
                            onClick={() => handleFund(contract._id, m._id)}
                            disabled={loadingId === m._id}
                            className="w-full md:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <DollarSign className="w-4 h-4" /> Deposit Escrow (₹{m.amount})
                          </button>
                        )}

                        {m.status === 'submitted' && (
                          <button
                            onClick={() => handleRelease(contract._id, m._id)}
                            disabled={loadingId === m._id}
                            className="w-full md:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve & Release Payment
                          </button>
                        )}
                      </>
                    )}

                    {/* FREELANCER ACTIONS */}
                    {currentUser?.role === 'freelancer' && (
                      <>
                        {m.status === 'funded' && (
                          <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full md:w-auto">
                            <input
                              type="text"
                              placeholder="Submission notes..."
                              value={submitNotes[m._id] || ''}
                              onChange={(e) => setSubmitNotes({ ...submitNotes, [m._id]: e.target.value })}
                              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                            />
                            <button
                              onClick={() => handleSubmit(contract._id, m._id)}
                              disabled={loadingId === m._id}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" /> Submit Work
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
