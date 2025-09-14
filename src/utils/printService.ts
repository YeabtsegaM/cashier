import { API_CONFIG } from '@/lib/constants';

interface PrintSummaryData {
  cashierFirstName: string;
  cashierUsername: string;
  dateTime: Date;
  fromDate: string;
  toDate: string;
  tickets: number;
  bets: number;
  redeemed: number;
  endBalance: number;
}

interface PrintResultsData {
  cashierFirstName: string;
  cashierUsername: string;
  dateTime: Date;
  gameId: string;
  resultNumbers: number[];
}

class PrintService {
  private printerAgentUrl: string;

  constructor() {
    // Use the printer agent URL from environment or default to localhost
    this.printerAgentUrl = process.env.NEXT_PUBLIC_PRINTER_AGENT_URL || 'http://localhost:6060';
  }

  async printSummary(summaryData: PrintSummaryData): Promise<boolean> {
    try {
      const response = await fetch(`${this.printerAgentUrl}/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: `summary-${Date.now()}`,
          type: 'summary',
          summaryData: {
            cashierFirstName: summaryData.cashierFirstName,
            cashierUsername: summaryData.cashierUsername,
            dateTime: summaryData.dateTime.toISOString(),
            fromDate: summaryData.fromDate,
            toDate: summaryData.toDate,
            tickets: summaryData.tickets,
            bets: summaryData.bets,
            redeemed: summaryData.redeemed,
            endBalance: summaryData.endBalance
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Summary printed successfully:', result);
        return true;
      } else {
        throw new Error(`Print failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  }

  async printResults(resultsData: PrintResultsData): Promise<boolean> {
    try {
      console.log('Sending print request to:', `${this.printerAgentUrl}/print`);
      console.log('Print data:', resultsData);
      
      const response = await fetch(`${this.printerAgentUrl}/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: `results-${Date.now()}`,
          type: 'results',
          resultsData: {
            cashierFirstName: resultsData.cashierFirstName,
            cashierUsername: resultsData.cashierUsername,
            dateTime: resultsData.dateTime.toISOString(),
            resultNumbers: resultsData.resultNumbers
          }
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Results printed successfully:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Print response error:', errorText);
        throw new Error(`Print failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  }
}

export const printService = new PrintService();
export type { PrintSummaryData, PrintResultsData };
