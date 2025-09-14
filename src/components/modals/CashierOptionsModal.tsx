'use client';

import React, { useState, useCallback } from 'react';
import Modal from '../ui/Modal';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { SummaryTab } from './tabs/SummaryTab';
import { RecallBetsTab } from './tabs/RecallBetsTab';
import { SearchTab } from './tabs/SearchTab';
import { WinPatternTab } from './tabs/WinPatternTab';
import { CartelaTab } from './tabs/CartelaTab';

interface CashierOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance?: string;
}

type TabType = 'summary' | 'recall' | 'search' | 'cartelas' | 'winpattern';

interface SummaryData {
  cashierName: string;
  fromDate: string;
  toDate: string;
  tickets: number;
  bets: number;
  unclaimed: number;
  redeemed: number;
  netBalance: number;
  shopName: string;
}

const CashierOptionsModal = ({ isOpen, onClose, balance }: CashierOptionsModalProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [currentBalance, setCurrentBalance] = useState<string>('Br. 0.00');
  
  // Summary data state moved to parent to persist across tab switches
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [showSummaryData, setShowSummaryData] = useState(false);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleSummaryDataUpdate = useCallback((data: SummaryData | null, showData: boolean) => {
    setSummaryData(data);
    setShowSummaryData(showData);
  }, []);

  const tabs = [
    { id: 'summary' as TabType, label: 'Summary' },
    { id: 'recall' as TabType, label: 'Recall Bets' },
    { id: 'search' as TabType, label: 'Event Result Search' },
                      { id: 'cartelas' as TabType, label: 'Cartelas' },
    { id: 'winpattern' as TabType, label: 'Win Pattern' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <SummaryTab 
            onBalanceUpdate={setCurrentBalance}
            summaryData={summaryData}
            showData={showSummaryData}
            onDataUpdate={handleSummaryDataUpdate}
          />
        );
      case 'recall':
        return <RecallBetsTab />;
      case 'search':
        return <SearchTab />;
              case 'cartelas':
          return <CartelaTab cashierId={user?.id} />;
      case 'winpattern':
        return <WinPatternTab cashierId={user?.id} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cashier Options"
      size="xl"
      showBalance={false}
      balance={balance}
    >
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-green-50 text-green-700 border border-green-300'
                    : 'bg-white text-gray-700 border border-green-300 hover:bg-green-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="text-green-700 text-sm font-medium">
            Balance: {currentBalance}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </Modal>
  );
};

export default CashierOptionsModal; 