'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import CashierOptionsModal from '../modals/CashierOptionsModal';
import CancelBetslipModal from '../modals/CancelBetslipModal';
import RedeemBetslipModal from '../modals/RedeemBetslipModal';

interface HeaderProps {
  userName?: string;
  userRole?: string;
}

// Memoized clock component for performance
const Clock = memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }, []);

  return (
    <div className="absolute top-1 right-2 sm:right-4">
      <span className="text-xs sm:text-sm font-normal text-gray-600">{formatTime(currentTime)}</span>
    </div>
  );
});

Clock.displayName = 'Clock';

// Memoized action buttons component
const ActionButtons = memo(() => {
  const [showCashierOptions, setShowCashierOptions] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const handleCashierOptions = useCallback(() => {
    setShowCashierOptions(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const handleRedeem = useCallback(() => {
    setShowRedeemModal(true);
  }, []);

  return (
    <>
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Cashier Options Button */}
        <button
          onClick={handleCashierOptions}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          title="Cashier Options"
        >
          Cashier Options
        </button>

        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-400 hover:bg-orange-500 text-white text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 flex items-center space-x-1"
          title="Cancel"
        >
          <span>Cancel</span>
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Redeem $ Button */}
        <button
          onClick={handleRedeem}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          title="Redeem $"
        >
          Redeem $
        </button>
      </div>

      {/* Modals */}
      <CashierOptionsModal
        isOpen={showCashierOptions}
        onClose={() => setShowCashierOptions(false)}
        balance="1,250.00"
      />
      <CancelBetslipModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
      />
      <RedeemBetslipModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
      />
    </>
  );
});

ActionButtons.displayName = 'ActionButtons';

// Memoized user info component
const UserInfo = memo(({ userName }: { userName?: string }) => (
  <>
    {/* Desktop user info */}
    <div className="hidden sm:flex items-center space-x-3">
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium text-gray-900">Cashier Name ({userName || 'Cashier'})</span>
      </div>
    </div>

    {/* Mobile user info */}
    <div className="sm:hidden flex items-center space-x-2">
      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <span className="text-xs font-medium text-gray-900">{userName || 'Cashier'}</span>
    </div>
  </>
));

UserInfo.displayName = 'UserInfo';

// Memoized logout button component
const LogoutButton = memo(() => {
  const { logout } = useAuth();

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <button
      onClick={handleLogout}
      className="p-1 sm:p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 transition-colors duration-200"
      title="Logout"
    >
      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </button>
  );
});

LogoutButton.displayName = 'LogoutButton';

// Main Header component
export default function Header({ userName, userRole }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Title */}
          <div className="flex items-center">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-green-600">Logo</h1>
            </div>
          </div>

          {/* Center - Action Buttons */}
          <div className="hidden md:flex items-center">
            <ActionButtons />
          </div>

          {/* Right side - User info and logout */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <UserInfo userName={userName} />
            <LogoutButton />
          </div>
        </div>
        
        {/* Mobile Action Buttons - below header */}
        <div className="md:hidden py-2 border-t border-gray-100">
          <ActionButtons />
        </div>
        
        {/* Real-time clock */}
        <Clock />
      </div>
    </header>
  );
} 