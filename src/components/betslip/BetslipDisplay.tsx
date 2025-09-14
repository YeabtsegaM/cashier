'use client';

import React from 'react';
import { BetslipDisplayProps } from '../../types/betslip';
import { formatCurrency } from '../../utils/betslipUtils';
import { formatGameIdForDisplay } from '../../utils/gameUtils';

export default function BetslipDisplay({ betslipData, onAction, actionButtonText }: BetslipDisplayProps) {
  // Debug logging to see what data we're receiving
  console.log('🔍 BetslipDisplay Debug Data:', {
    gameStatus: betslipData?.gameStatus,
    gameData: betslipData?.gameData,
    netPrizePool: betslipData?.gameData?.netPrizePool,
    prizeAmount: betslipData?.prizeAmount,
    canRedeem: betslipData?.canRedeem
  });

  if (!betslipData) {
    return null;
  }

  return (
    <div className="flex-1 ml-6 bg-white rounded-lg border-outline-none p-4">
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Betslip Details</h3>
        
        {/* Always show table when we have data - errors are handled by toast messages */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">No.</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Market</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Picks</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Game ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stack</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Win</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">1</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">BINGO</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Win</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">25</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {formatGameIdForDisplay(betslipData.gameId)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{formatCurrency(betslipData.amount)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {/* Show win amount based on status */}
                  {betslipData.gameStatus === 'completed' ? 
                    (betslipData.status === 'won_redeemed' ? 
                      formatCurrency(betslipData.win || betslipData.prizeAmount || 0) : // Show actual win amount for winning tickets
                      betslipData.status === 'lost_redeemed' ? 
                        formatCurrency(0) : // Show 0.00 for losing tickets
                      betslipData.status === 'lost' ? 
                        formatCurrency(0) : // Show 0.00 for lost tickets
                        formatCurrency(betslipData.prizeAmount || 0) // Show potential prize for available tickets
                    ) : 
                    formatCurrency(0.00) // Show 0.00 for non-completed games
                  }
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    betslipData.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                    betslipData.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    betslipData.status === 'won_redeemed' ? 'bg-green-100 text-green-800' :
                    betslipData.status === 'lost_redeemed' ? 'bg-red-100 text-red-800' :
                    betslipData.status === 'lost' ? 'bg-red-100 text-red-800' :
                    betslipData.status === 'won' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {betslipData.status === 'won_redeemed' ? 'Won' : 
                     betslipData.status === 'lost_redeemed' ? 'Lost' :
                     betslipData.status === 'won' ? 'Winner' :
                     betslipData.status === 'lost' ? 'Lost' :
                     betslipData.status === 'cancelled' ? 'Cancelled' :
                     betslipData.status === 'pending' ? 'Pending' :
                     betslipData.status === 'active' ? 'Active' :
                     betslipData.status}
                  </span>
                  
                  {/* Show additional status info for completed games */}
                  {betslipData.gameStatus === 'completed' && (
                    <div className="mt-1">
                      {betslipData.status === 'lost' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          Game Over
                        </span>
                      )}
                      {betslipData.redemptionStatus === 'already_redeemed' && betslipData.status === 'won' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Lost
                        </span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-start">
          <button
            onClick={onAction}
            disabled={
              actionButtonText.includes('Cancel') 
                ? betslipData.canCancel === false 
                : !betslipData.canRedeem || betslipData.redemptionStatus === 'already_redeemed'
            }
            className={`py-2 px-4 text-white rounded text-sm transition-colors duration-200 ${
              actionButtonText.includes('Cancel') 
                ? 'bg-red-400 hover:bg-red-500' 
                : 'bg-green-500 hover:bg-green-600'
            } ${
              (actionButtonText.includes('Cancel') 
                ? betslipData.canCancel === false 
                : !betslipData.canRedeem || betslipData.redemptionStatus === 'already_redeemed')
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-90'
            }`}
          >
            {actionButtonText}
          </button>
        </div>
      </div>
    </div>
  );
} 