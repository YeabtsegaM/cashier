'use client';

import React from 'react';
import { useRecallBetsState } from '../../../hooks/useRecallBetsState';
import { useToast } from '../../../contexts/ToastContext';
import { RecallBetsTabProps } from '../../../types/recallBets';
import { formatGameIdForDisplay } from '../../../utils/gameUtils';

export const RecallBetsTab: React.FC<RecallBetsTabProps> = () => {
  const { showToast } = useToast();
  
  const {
    // State
    recallBetsData,
    showRecallBets,
    showRecallBetsTable,
    selectedTicket,
    filteredAndSortedData,
    loading,
    
    // Actions
    loadRecallBetsData,
    handleViewSlips,
    handlePrintTicket,
    setShowRecallBets,
    setShowRecallBetsTable
  } = useRecallBetsState({
    onError: (message) => showToast(message, 'error'),
    onSuccess: (message) => showToast(message, 'success')
  });

  const handleShowRecallBetsTable = async () => {
    if (!showRecallBets) {
      // Load data only when button is clicked for the first time
      await loadRecallBetsData();
    }
    setShowRecallBetsTable(true);
  };

  return (
    <div className="space-y-4">
      {/* Recall Bets Button */}
      <div className="text-left">
        <button
          onClick={handleShowRecallBetsTable}
          className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors duration-200 font-medium flex items-center space-x-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Recall Bets</span>
        </button>
      </div>

      {/* Table Header - Always visible */}
      <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 ">
          <thead className="bg-green-50">
            <tr>
              <th className="px-4 text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Number</th>
              <th className="pl-24 text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Net Stake</th>
              <th className="px-8 text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">View Slips</th>
              <th className="px-8 text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Print Ticket</th>
            </tr>
          </thead>
        </table>
        
        {/* Table Body - Show when data is loaded and button is clicked */}
        {showRecallBetsTable && (
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>Loading recall bets data...</p>
              </div>
            ) : !showRecallBets || filteredAndSortedData.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No recall bets data available</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedData.map((ticket) => (
                    <React.Fragment key={ticket.ticketNumber}>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{ticket.ticketNumber}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 ">Br. {ticket.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap ">
                          <button
                            onClick={() => handleViewSlips(ticket.ticketNumber)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            {selectedTicket === ticket.ticketNumber ? 'Hide Slips' : 'View Slips'}
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button 
                            onClick={() => handlePrintTicket(ticket.ticketNumber)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                          </button>
                        </td>
                      </tr>
                      {/* Ticket Details - Show below specific ticket row */}
                      {selectedTicket === ticket.ticketNumber && (
                        <tr>
                          <td colSpan={4} className="px-4 py-3 bg-green-50">
                            <div className="space-y-3">
                              <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-green-50">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">No.</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Market</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cartela</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Game ID</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stack</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    <tr>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">1</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">BINGO</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Win</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{ticket.cartelaNumber}</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {formatGameIdForDisplay(ticket.gameId)}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Br. {ticket.amount.toFixed(2)}</td>
                                   
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 