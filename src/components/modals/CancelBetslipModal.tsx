'use client';

import React from 'react';
import Modal from '../ui/Modal';
import { BetslipKeypad } from '../betslip/BetslipKeypad';
import BetslipDisplay from '../betslip/BetslipDisplay';
import { useBetslipState } from '../../hooks/useBetslipState';
import { useToast } from '../../contexts/ToastContext';
import { BetslipModalProps } from '../../types/betslip';

const CancelBetslipModal = ({ isOpen, onClose }: BetslipModalProps) => {
  const { showToast } = useToast();
  
  const {
    betslipCode,
    showData,
    betslipData,
    loading,
    setBetslipCode,
    handleNumberClick,
    handleBackspace,
    handleClear,
    handleEnter,
    handleAction
  } = useBetslipState({
    type: 'cancel',
    onError: (message) => showToast(message, 'error'),
    onSuccess: (message) => showToast(message, 'success')
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Betslip"
      size="xl"
    >
      <div className="flex">
        {/* Left Side - Keypad */}
        <BetslipKeypad
          betslipCode={betslipCode}
          onNumberClick={handleNumberClick}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onEnter={handleEnter}
        />

        {/* Right Side - Data Display */}
        <BetslipDisplay
          betslipData={betslipData}
          actionButtonText="Cancel Betslip"
          onAction={handleAction}
        />
      </div>
    </Modal>
  );
};

export default CancelBetslipModal; 