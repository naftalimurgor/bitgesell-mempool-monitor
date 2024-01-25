import React from 'react';
import './App.css';

type ActiveTab = 'metrics' | 'transactions' | 'mempool'

interface MempoolState {
  data: {
    inputs: {
      count: number;
      ageMap: {
        '1y': MempoolAgeData;
        '2y': MempoolAgeData;
        '3y': MempoolAgeData;
      };
      amount: {
        max: MempoolTransactionAmount;
        min: MempoolTransactionAmount;
        total: number;
      };
      typeMap: {
        '5': MempoolTypeData;
      };
      amountMap: {
        '3': MempoolAmountData;
        '4': MempoolAmountData;
        '5': MempoolAmountData;
        '6': MempoolAmountData;
        '7': MempoolAmountData;
        '8': MempoolAmountData;
        '9': MempoolAmountData;
        '10': MempoolAmountData;
      };
    };
    outputs: {
      count: number;
      amount: MempoolTransactionAmount;
      typeMap: {
        '5': MempoolTypeData;
      };
      amountMap: {
        '3': MempoolAmountData;
        '4': MempoolAmountData;
        '5': MempoolAmountData;
        '8': MempoolAmountData;
        '9': MempoolAmountData;
        '11': MempoolAmountData;
      };
    };
    transactions: {
      fee: {
        max: MempoolTransactionFee;
        min: MempoolTransactionFee;
        total: number;
      };
      size: {
        max: MempoolTransactionSize;
        min: MempoolTransactionSize;
        total: number;
      };
      count: number;
      vSize: {
        max: MempoolTransactionSize;
        min: MempoolTransactionSize;
        total: number;
      };
      amount: MempoolTransactionAmount;
      feeRate: {
        max: MempoolTransactionFeeRate;
        min: MempoolTransactionFeeRate;
        best: number;
        best4h: number;
        bestHourly: number;
      };
      rbfCount: number;
      feeRateMap: {
        '2': MempoolFeeRateData;
        '10': MempoolFeeRateData;
        '20': MempoolFeeRateData;
        '70': MempoolFeeRateData;
        '100': MempoolFeeRateData;
        '15050': MempoolFeeRateData;
      };
      doublespend: MempoolDoubleSpendData;
      segwitCount: number;
      doublespendChilds: MempoolDoubleSpendData;
    };
  };
  time: number;
}

interface MempoolAgeData {
  count: number;
  amount: number;
}

interface MempoolTransactionAmount {
  txId: string;
  value: number;
}

interface MempoolTypeData {
  count: number;
  amount: number;
}

interface MempoolAmountData {
  count: number;
  amount: number;
}

interface MempoolTransactionFee {
  txId: string;
  value: number;
}

interface MempoolTransactionSize {
  txId: string;
  value: number;
}

interface MempoolTransactionFeeRate {
  txId: string;
  value: number;
}

interface MempoolFeeRateData {
  size: number;
  count: number;
  vSize: number;
}

interface MempoolDoubleSpendData {
  size: number;
  count: number;
  vSize: number;
  amount: number;
}

const REFRESH_TIME_OUT = 300000 // convert to 30 seconds

function App() {

  const [mempool, setMempool] = React.useState<MempoolState | null>(null)
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('mempool')

  React.useEffect(() => {
    async function getMempoolState() {
      try {
        const res = await fetch('https://api.bitaps.com/bgl/v1/blockchain/mempool/state', { method: 'GET' })
        const mempoolState = await res.json() as MempoolState
        setMempool(mempoolState)

      } catch (error) {
        setMempool(null)
        alert('Network Error- Check your Internet connection')
      }
    }
    getMempoolState()
  }, [])

  const openTab = (tab: ActiveTab) => {
    setActiveTab(tab)
  }

  const renderMempool = () => {
    if (mempool?.data.inputs.count) {
      const transactions = mempool.data.transactions
      return (
        <div>
          <h3>Fees</h3>
          <p>Min Transaction Fee: {transactions.fee.min.value} </p>
          <p>Max Transaction Fee: {transactions.fee.max.value}</p>
          <p>Transaction Count in the mempool: {transactions.count} Transactions</p>
          <h3>Size</h3>
          <p>Max Transaction size in pool: {transactions.size.max.value} bytes</p>
          <p>Min Transaction size in pool: {transactions.size.min.value} bytes</p>
          <h3>Amount</h3>
          <p>Total transaction amount in the mempool: {transactions.amount.value}</p>
          <h3>Segwit Transactions</h3>
          <p>SegWit Transaction count: {transactions.segwitCount} Transactions</p>
        </div>
      )
    }
    return null
  }

  return (

    <>
      <div className="mempool-container">
        <div className="mempool">
          <div className="tab">
            <button className="tablinks" onClick={() => openTab('mempool')}>
              Mempool State
            </button>
            <button className="tablinks" onClick={() => openTab('transactions')}>
              Transactions
            </button>
            <button className="tablinks" onClick={() => openTab('metrics')}>
              Transaction metrics over the years
            </button>
          </div>

          <div className="tab-content-container">
            <div id="state" className="tabcontent" style={{ display: activeTab === 'mempool' ? 'block' : 'none' }}>
              <p>Mempool state</p>
              {mempool?.data.inputs.count ? (<>

                {renderMempool()}

              </>) : (<>Loading...</>)}
            </div>

            <div id="transactions" className="tabcontent" style={{ display: activeTab === 'transactions' ? 'block' : 'none' }}>
              <p>Transactions in Mempool</p>
            </div>

            <div id="metrics" className="tabcontent" style={{ display: activeTab === 'metrics' ? 'block' : 'none' }}>
              <p>Transaction metrics over the years</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default App;
