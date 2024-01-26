import React from 'react';
import './App.css';
import icon from './Icon.png'
import { satoshiToBGL } from './util';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

type ActiveTab = 'metrics' | 'transactions' | 'mempool' | 'Searching'

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


interface MempoolTxes {
  data: Data;
  time: number;
}

interface Data {
  page: number;
  limit: number;
  pages: number;
  count: number;
  fromTimestamp: number;
  list: Array<Transaction>;
}

interface Transaction {
  regtest: boolean;
  segwit: boolean;
  rbf: boolean;
  txId: string;
  hash: string;
  version: number;
  size: number;
  vSize: number;
  bSize: number;
  lockTime: number;
  time: number;
  coinbase: boolean;
  fee: number;
  data?: any;
  amount: number;
  weight: number;
  feeRate: number;
  mempoolRank: number;
  conflict?: any;
  valid: boolean;
}
const REFRESH_TIME_INTERVAL = 600000 * 6 // every 1 hour 

function App() {

  const [mempool, setMempool] = React.useState<MempoolState | null>(null)
  const [mempoolTransactions, setMempoolTransactions] = React.useState<MempoolTxes | null>(null)
  const [txsearch, setTxsearch] = React.useState('')
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('metrics')
  const [mempoolAgeMap, setMempoolAgeMap] = React.useState({})

  React.useEffect(() => {
    async function getMempoolState() {
      try {
        const res = await fetch('https://api.bitaps.com/bgl/v1/blockchain/mempool/state', { method: 'GET' })
        const mempoolState = await res.json() as MempoolState
        setMempool(mempoolState)
        setMempoolAgeMap(mempoolState.data.inputs.ageMap)

      } catch (error) {
        setMempool(null)
        alert('Network Error- Check your Internet connection')
      }
    }
    getMempoolState()

    getMempoolState()
    const intervalId = setInterval(() => {
      getMempoolState()
    }, REFRESH_TIME_INTERVAL)
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  React.useEffect(() => {
    async function getMempoolTxes() {
      let err = null
      try {
        const res = await fetch('https://api.bitaps.com/bgl/v1/blockchain/mempool/transactions', { method: 'GET' })
        const mempoolTransactions = await res.json() as MempoolTxes
        console.log(mempoolTransactions)
        setMempoolTransactions(mempoolTransactions)

      } catch (error) {
        // setMempoolTransactions(null)
        err = error
        alert('Network Error- Check your Internet connection')
      } finally {
        if (err) {
          const res = await fetch('https://api.bitaps.com/bgl/v1/blockchain/mempool/transactions', { method: 'GET' })
          const mempoolTransactions = await res.json() as MempoolTxes
          console.log(mempoolTransactions)
          setMempoolTransactions(mempoolTransactions)

        }
      }
    }
    getMempoolTxes()
    const intervalId = setInterval(() => {
      getMempoolTxes()
    }, REFRESH_TIME_INTERVAL)
    return () => {
      clearInterval(intervalId)
    }
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
          <p>Total transaction amount in the mempool: {mempool.data.inputs.amount.total}</p>
          <h3>Segwit Transactions</h3>
          <p>SegWit Transaction count: {transactions.segwitCount} Transactions</p>
        </div>
      )
    }
    return null
  }

  const renderTransactions = () => {
    if (mempoolTransactions?.data.count) {
      const txes = mempoolTransactions.data.list
      return (<>
        {txes.map((tx, key) => (<>
          <div key={key}>
            <h3>#{key + 1} </h3>
            <img src={icon} alt="" height={30} width={30} />
            <p>Amount(BGL): {satoshiToBGL(tx.amount)}</p>
            <p>TxHash(integer hash): {tx.hash}</p>
            <p>TxId : {tx.txId}</p>
            <p>Fee: {tx.fee}</p>
            <p>Transaction size (in bytes) {tx.size}</p>
            <hr />
          </div>
        </>))}
      </>)
    }
    return null
  }

  const renderSearchResult = () => {
    const result = mempoolTransactions?.data.list.find(tx => tx.txId === txsearch || txsearch === tx.hash)
    const resultTwo = mempoolTransactions?.data.list.find(tx => tx.hash === txsearch)

    if (result) {
      return (
        <>
          <div>
            <h3>Found</h3>
            <img src={icon} alt="" height={30} width={30} />
            <p>Amount(BGL): {satoshiToBGL(result.amount)}</p>
            <p>TxHash(integer hash): {result.hash}</p>
            <p>TxId : {result.txId}</p>
            <p>Fee: {result.fee}</p>
            <p>Transaction size (in bytes) {result.size}</p>
            <hr />
          </div>
        </>
      )
    }
    if (resultTwo) {
      return (
        <>
          <div>
            <h3>Found</h3>
            <img src={icon} alt="" height={30} width={30} />
            <p>Amount(BGL): {satoshiToBGL(resultTwo.amount)}</p>
            <p>TxHash(integer hash): {resultTwo.hash}</p>
            <p>TxId : {resultTwo.txId}</p>
            <p>Fee: {resultTwo.fee}</p>
            <p>Transaction size (in bytes) {resultTwo.size}</p>
            <hr />
          </div>
        </>
      )
    }
    return (<>
      <p>Not found any transactioin : {txsearch}</p>
    </>)

  }

  const renderMetrics = () => {
    const ageMap = mempool?.data.inputs.ageMap

    if (ageMap?.['1y']) {
      const DATA_COUNT = 3; // 3 year gap
      // @ts-ignore
      const NUMBER_CFG = { count: DATA_COUNT, min: ageMap["1y"].amount, max: ageMap["3y"].amount };

      const labels = ['1y', '2y', '3y']
      const data = {
        labels: labels,
        datasets: [
          {
            label: 'Amount (BGL)',
            // @ts-ignore
            data: [ageMap["1y"].amount, ageMap["2y"].amount, ageMap['3y'].amount],

            backgroundColor: 'rgb(75, 192, 192)',
          },
          // {
          //   label: 'Transaction Count',
          //   // @ts-ignore
          //   data: [ageMap["1y"].count, ageMap["2y"].count, ageMap['3y'].count],
          //   borderColor: '#0000ff',
          //   backgroundColor: '#0000ff',
          // }
        ]

      };

      const txCountData = {
        labels: labels,
        datasets: [
          {
            label: 'Transaction Count 1-3 years',
            // @ts-ignore
            data: [ageMap["1y"].count, ageMap["2y"].count, ageMap['3y'].count],
            borderColor: '#0000ff',
          },

        ]

      };
      return (<div style={{ marginTop: '80px' }}>
        <h3>Transaction volume in BGL Over ~3 years</h3>
        <Bar data={data} />
        <div style={{ marginTop: '40px' }}>
        <h3>Transaction Count in BGL Over ~3 years</h3>
          <Line data={txCountData} />
        </div>
      </div>)


    }

    return null
  }

  return (

    <>
      <Navbar />
      <div className="mempool-container">
        <div className="mempool">
          <div className="tab">
            <button className="tablinks" onClick={() => openTab('metrics')}>
              Mempool Overview
            </button>
            <button className="tablinks" onClick={() => openTab('mempool')}>
              Mempool State
            </button>
            <button className="tablinks" onClick={() => openTab('transactions')}>
              Mempool Transactions
            </button>
            {activeTab === 'transactions' && (
              <>
                <div style={{ marginLeft: '20px', marginTop: '20px', display: 'flex', }}>
                  <input type="text" placeholder='Search TxId or TxHash' onChange={e => {
                    setTxsearch(e.target.value)
                  }} />
                  <button onClick={() => {
                    renderSearchResult()
                    openTab('Searching')
                  }}>Search</button>

                </div>
              </>
            )}
          </div>

          <div className="tab-content-container">
            <div id="state" className="tabcontent" style={{ display: activeTab === 'mempool' ? 'block' : 'none' }}>
              <p>Mempool state</p>
              {mempool?.data.inputs.count ? (<>

                {renderMempool()}

              </>) : (<>Loading...</>)}
            </div>

            <div id="transactions" className="tabcontent" style={{ display: activeTab === 'transactions' ? 'block' : 'none' }}>
              <p>Transactions in Mempool - Table</p>

              {mempoolTransactions?.data.count ? (<>

                {renderTransactions()}

              </>) : (<>Loading...</>)}

            </div>
            <div className="tabcontent" style={{ display: activeTab === 'Searching' ? 'block' : 'none' }}>
              {renderSearchResult()}
            </div>

            <div id="metrics" className="tabcontent" style={{ display: activeTab === 'metrics' ? 'block' : 'none' }}>
              {mempoolTransactions?.data.count ? (<>

                {renderMetrics()}

              </>) : (<>Loading...</>)}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <a className="navbar-brand" href="https://bitgesell.ca/">
        <img src={icon} alt="Bootstrap" className='brand-icon' />
      </a>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNavAltMarkup"
        aria-controls="navbarNavAltMarkup"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div className="navbar-nav">

          <a className="nav-item nav-link" href="https://app.bglwallet.io/">
            Official Bitgesell Wallet
          </a>

          <a className="nav-item nav-link" href="https://bitgesell.ca/">
            Visit Official Website
          </a>
          <a className="nav-item nav-link" href="https://github.com/BitgesellOfficial">
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}

export default App;
