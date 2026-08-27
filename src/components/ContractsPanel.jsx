import React, { useState } from 'react';
import { DollarSign, Shield, CheckCircle2, Clock, Send, FileText, ChevronRight } from 'lucide-react';
import { apiFundMilestone, apiSubmitMilestone, apiReleaseMilestone } from '../api/client';

export default function ContractsPanel({ contracts, currentUser, onRefresh, onOpenChat }) {
  const [loadingId, setLoadingId] = useState(null);
  const [submitNotes, setSubmitNotes] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  if (!contracts || contracts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Contracts</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          {currentUser?.role === 'client' 
            ? 'Accept a proposal on one of your posted projects to initiate a funded contract with a freelancer.'
            : 'Once a client accepts your proposal, active milestone contracts will appear here.'}
        </p>
      </div>
    );
  }

  const handleFund = async (contractId, milestoneId) => {
    try {
      setLoadingId(milestoneId);
      setErrorMsg('');
      await apiFundMilestone(contractId, milestoneId);
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message || 'Funding failed');
    } finally {
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
                  <span className="text-2xl font-black text-emerald-400">${contract.totalAmount?.toLocaleString()}</span>
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
                    <p className="text-sm font-bold text-emerald-700">${m.amount?.toLocaleString()}</p>
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
                            <DollarSign className="w-4 h-4" /> Deposit Escrow (${m.amount})
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
