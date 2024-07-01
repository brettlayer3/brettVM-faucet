'use client'

// import { wagmiConfig } from '@/wagmi'
import { useEffect, useState } from "react";
// import "./App.css";
import { ethers } from "ethers";
import faucetContract from "../ethereum/faucet";
// eslint-disable-next-line
import React, { Component } from 'react'
import { ReactNode } from 'react';
import Image from './Image';

import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { WalletComponents } from './WalletComponents'
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi'
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import TransactionStatus from "./TransactionStatus";
import { parseAbi } from 'viem'

import faucetImage from '../images/faucet-drip-pixel.png';
import telegramPixel from '../images/telegram.png';
import xTwitterPixel from '../images/xtwitter.png';
import mailPixel from '../images/outlook_express-4.png';
import docsPixel from '../images/Windows98Scaled Icon 13-3.png';
import brettPixel from '../images/brett-pixel-256px.png.png';
import brettnobg from '../images/brettvm-nobg.png';
import bridgePixel from '../images/concrete-bridge-pixelated.png';

// import { ReactComponent as MinimizeIcon } from '../images/MinimizeIcon.svg';
// import { ReactComponent as WindowIcon } from '../images/WindowIcon.svg';
// import { ReactComponent as CloseIcon } from '../images/CloseIcon.svg';

import '@coinbase/onchainkit/styles.css';

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect()
  const {
    writeContractsAsync,
    error: errorTx,
    status: statusTx,
    data: id,
} = useWriteContracts();
const { data: callsStatus } = useCallsStatus({
  id: id as string,
  query: {
      enabled: !!id,
      // Poll every second until the calls are confirmed
      refetchInterval: (data) =>
          data.state.data?.status === "CONFIRMED" ? false : 1000,
  },
});

  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [fcContract, setFcContract] = useState();
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [transactionData, setTransactionData] = useState("");
  const [isButtonHoveredtemp1, setIsButtonHoveredtemp1] = useState(false); 
  const [isButtonHoveredtemp2, setIsButtonHoveredtemp2] = useState(false);
  const [inputValue, setInputValue] = useState("");
  

  const faucetAbi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenAddress",
          "type": "address"
        }
      ],
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Deposit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Withdrawal",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "getBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "lockTime",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "requestTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "setLockTime",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "setWithdrawalAmount",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "token",
      "outputs": [
        {
          "internalType": "contract IERC20",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawalAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];

  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
    accountUpdated();
  }, [walletAddress]);

  console.log(account.status)
  
  const connectWallet = async () => {
    // eslint-disable-next-line
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* get provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        /* get accounts */
        const accounts = await provider.send("eth_requestAccounts", []);
        /* get signer */
        setSigner(provider.getSigner());
        /* local contract instance */
        setFcContract(faucetContract(provider));
        /* set active wallet address */
        setWalletAddress(accounts[0]);

        // // Create provider
        // const provider = sdk.makeWeb3Provider({options: 'all'});
        // // Use provider
        // const accounts = await provider.request({method: 'eth_requestAccounts'});
        // console.log(accounts)
        // // /* get signer */
        // setSigner(provider.request({method: 'personal_sign'}));
        // // /* local contract instance */
        // setFcContract(faucetContract(provider));
        // // /* set active wallet address */
        // setWalletAddress(accounts[0]);

        navigator.clipboard.writeText(walletAddress)
        .then(() => {
          console.log(walletAddress);
        })
        .catch(err => {
          console.error('Failed to copy text:', err);
        });
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const getCurrentWalletConnected = async () => {
    // eslint-disable-next-line
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* get provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        /* get accounts */
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          /* get signer */
          setSigner(provider.getSigner());
          /* local contract instance */
          setFcContract(faucetContract(provider));
          /* set active wallet address */
          setWalletAddress(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect Wallet button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const addWalletListener = async () => {
    // eslint-disable-next-line
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };

  const accountUpdated = async () => {
    // eslint-disable-next-line
    
    console.log(account.status)
    if (!account.address) {
      /* wallet is not connected */
      setWalletAddress("");
      console.log("Please connect wallet");
    } else {
      console.log(account.addresses[0])
      setWalletAddress(account.addresses[0]);
    }
  };

  const getOCTHandler = async () => {
    setWithdrawError("");
    setWithdrawSuccess("");
    try {
      const fcContractWithSigner = fcContract.connect(signer);
      const resp = await fcContractWithSigner.requestTokens();
      setWithdrawSuccess("Enjoy your BRETT!");
      setTransactionData(resp.hash);
    } catch (err) {
      setWithdrawError(err.message);
    }
  };
  // account: `0x${account.address.slice(2)}`,
  
  async function requestTokens() {
    try {
      console.log(walletAddress)
      console.log(`0x${account.address.slice(2)}`)
      // window.location.reload()
      await writeContractsAsync({
          account: `0x${account.address.slice(2)}`,
          contracts: [
                {
                    address: '0x5d80850b701E9d685F2eFCe5C903214017ad36b8',
                    abi: faucetAbi,
                    args: [],
                    functionName: "requestTokens",
                },
            ],
        });
    } catch (error) {
        console.error(error);
    }
}


  
  return (
    <>
      {/* <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div> */}

      {/* <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div> */}

      <div>
      {/* <nav className="navbar" style={{
        // border: '8px solid #069',
        // borderRadius: '20px',
        backgroundColor: '#069420',
        color: '#000',
        padding: '30px',
        marginBottom: '2px'
      }}>


      


        <div className="container">
          
          <div className="navbar-brand">
          </div>
          <div id="navbarMenu" className="navbar-menu">
            <div className="navbar-end is-align-items-center">

            </div>
          </div>
        </div>






        
      </nav> */}

<nav className="navbar" style={{
      textAlign: "center",
      // display: "flex", 
      flexDirection: "row", 
      justifyContent: "space-around",
      alignItems: "center",
      padding: "1rem"
      }}>
      <div style={{ 
          display: "flex", 
          flexDirection: "row", 
          alignItems: "center",
          justifyContent: "space-between",

        }}>
        <a href="https://twitter.com/brettlayer3" target="_blank" rel="noopener noreferrer">
          <Image src={xTwitterPixel} width={30} alt="twitter" />
          <p>X</p>
        </a>
        <a href="https://t.me/brettlayer3" target="_blank" rel="noopener noreferrer">
          <Image src={telegramPixel} width={30} alt="telegram" />
          <p>Telegram</p>
        </a>
        <a href="https://docs.brettvm.com" target="_blank" rel="noopener noreferrer">
          <Image src={docsPixel} width={30} alt="docs" />
          <p>Docs</p>
        </a>
        <a href="mailto:hello@brettvm.com" target="_blank" rel="noopener noreferrer">
          <Image src={mailPixel} width={30} alt="email" />
          <p>Mail</p>
        </a>
        <a href="https://brettvm-testnet-3o1ozdql67-6aac6993b9bfa2bd.testnets.rollbridge.app" target="_blank" rel="noopener noreferrer">
          <Image src={bridgePixel} width={30} alt="bridge" />
          <p>Bridge</p>
        </a>
      
      </div>
      <div style={{ 
          display: "flex", 
          flexDirection: "row", 
          alignItems: "center",
          justifyContent: "space-between",
          // padding: "1rem" 
        }}>
        <a href="https://brettswap.com" target="_blank" rel="noopener noreferrer">
          <Image src={brettPixel} width={30} alt="website" />
          <p>BrettSwap</p>
        </a>
      
      </div>
  </nav>

      <section className="hero is-fullheight" >
        <div className="faucet-hero-body">
          <div className="container has-text-centered main-content">
            {/* <h1 className="title is-1">BrettVM Sepolia Faucet</h1> */}
            {/* <Image src={brettnobg} width={216} alt="website" /> */}

            <div className="window-wrap">
              <div className="window-header">
                <div>BrettVM Sepolia Testnet Faucet</div>
                <div className="windows-button-wrap">
                  <div className="window-button">
                    {/* <MinimizeIcon className="button-icon"/> */}
                  </div>
                  <div className="window-button">
                    {/* <WindowIcon className="button-icon"/> */}
                  </div>
                  <div className="window-button">
                    {/* <CloseIcon className="button-icon"/> */}
                  </div>
                </div>
              </div>

              <div style={{
                // "display": "flex",
                // "flexDirection": "column", 
                // "alignItems": "center"
              }}>

              <Image src={faucetImage} alt="Logo" className="" style={{ width: '128px', height: '128px' }} />
              <WalletComponents></WalletComponents>
              {/* <button
                className={`button ${isButtonHoveredtemp2 ? 'button-hovered' : ''}`}  onClick={connectWallet}
                  style={{
                    border: '0px solid',
                    background: 'hsla(0, 0%, 75.29%,1.00)',
                    borderRadius: '0px',
                    color: '#000',
                    // padding: '20px',
                    // marginBottom: '20px',
                    // transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={() => setIsButtonHoveredtemp2(true)}
                  onMouseLeave={() => setIsButtonHoveredtemp2(false)}
              >
                <span className="is-link has-text-weight-bold">
                  {walletAddress && walletAddress.length > 0
                    ? `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`
                    : "Connect Wallet"}
                </span>
              </button> */}
              </div>

              <div className="">
                <div className="column">
                  <input
                    style={{
                      maxWidth: '100%'
                    }}
                    className=""
                    type="text"
                    placeholder="Enter your wallet address (0x...)"
                    // defaultValue={walletAddress}
                    value={inputValue || (account.addresses ? account.addresses : "") }
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                <div className="column">

                <div className=""> 
                {withdrawError && (
                  <div className="withdraw-error">{withdrawError}</div>
                )}

                {withdrawSuccess && (
                  <div className="withdraw-success">{withdrawSuccess}</div>
                )}
              </div>
              
              <br/>

              <div style={{
                "padding": "1rem"
              }}>

              <a href={transactionData ? `https://sepolia.basecan.org/tx/${transactionData}`: ""} target="blank">
                    {transactionData
                      ? `Transaction hash: ${transactionData}`
                      : ""}
              </a>
              </div>

                  {/* <button style={{
                    border: '0px solid',
                    background: 'hsla(0, 0%, 75.29%,1.00)',
                    borderRadius: '0px',
                    color: '#000',
                    // padding: '20px',
                    // marginBottom: '20px',
                    // transition: 'background-color 0.3s ease'
                  }}
                    className={`button ${isButtonHoveredtemp1 ? 'button-hovered' : ''} `}
                    onClick={requestTokens}
                    isLoading={statusTx}
                    disabled={walletAddress ? false : true}
                    // onMouseEnter={() => setIsButtonHoveredtemp1(true)}
                    // onMouseLeave={() => setIsButtonHoveredtemp1(false)}
                  > 

                    {walletAddress ? "Send Me BRETT" : "Your wallet is not connected"}

                  </button> */}
                    <p style={{
                      color: 'black',
                      margin: '2rem'
                    }}>
                      This is a faucet to recieve test BRETT & ETH on Base Sepolia via Coinbase Smart Wallet
                    </p>
                  {isConnected ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: '2rem',
                }}>
                    <button style={{
                        border: '0px solid',
                        background: 'hsla(0, 0%, 75.29%,1.00)',
                        borderRadius: '0px',
                        color: '#000',
                        padding: '20px',
                        margin: '2rem',
                        // maxWidth: '100%'
                        
                        // marginBottom: '20px',
                        // transition: 'background-color 0.3s ease'
                      }}
                      className={`button ${isButtonHoveredtemp1 ? 'button-hovered' : ''} `}
                      onClick={requestTokens}
                      // disabled={walletAddress ? false : true}
                      // onMouseEnter={() => setIsButtonHoveredtemp1(true)}
                      // onMouseLeave={() => setIsButtonHoveredtemp1(false)}
                      // isLoading={statusTx === "pending"}
                      > 
                      {statusTx === "pending" ? "Loading..." : "Send Me BRETT"}
                    </button>

                    {/* <div>writeContracts Status: {statusTx}</div> */}
                    <div style={{
                      color: 'red',
                      maxWidth: '80%',
                      textAlign: 'center'
                      }}>{errorTx?.message}</div>
                    <TransactionStatus callStatus={callsStatus} />
                </div>
            ) : null}

                 
                </div>
              </div>
              {statusTx === "success" ?
              <p className="" style={{
                "color": "black",
                "padding": "1rem",
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "center"
              }}>
                <a href="https://brettvm-testnet-3o1ozdql67-6aac6993b9bfa2bd.testnets.rollbridge.app" target="blank"> Success! 🎉 Bridge to BrettVM Testnet </a>
                <b>*Bridge less than MAX amount of BRETT*</b>
                <br/>
                <a href="https://brettswap.com" target="blank">Then don't forget to Swap 🔄 on Brettswap! </a>
                {/* Ensure you have some test ETH. Visit
                <a href="https://faucet.quicknode.com/drip" target="blank"> here </a>
                to receive some.
                <br/>
                <br/>
                Connect wallet to 
                <a href="https://chainlist.org/chain/84532" target="blank"> Base Sepolia </a>
                before requesting BRETT 
                <br/>
                <br/>
                Request 100 
                <a 
                 href="https://sepolia.basescan.org/address/0x77f70e76bfc7d801cb1e1d5967cd6359afbf5833"
                 target="blank"> Test BRETT </a>
                mirrored after BRETT on
                 <a 
                 href="https://basescan.org/address/0x532f27101965dd16442e59d40670faf5ebb142e4"
                 target="blank"> Base Mainnet.</a>
                 <br/> 
                 <br/> 
                Must wait at least 60 Seconds before requesting again
                 <br/> 
                 <br/> 
                Click<a href="https://brettvm-testnet-3o1ozdql67-6aac6993b9bfa2bd.testnets.rollbridge.app" target="blank"> here </a>
                to transfer to BrettVM Testnet.
                <br/>
                <b>*Bridge less than MAX amount of BRETT*</b>
                <br/> */}
                {/* <a style= {{
                  "alignItems": "center"
                }} href="https://brettvm-testnet-3o1ozdql67-6aac6993b9bfa2bd.testnets.rollbridge.app" target="blank">
                  <Image src={bridgePixel} width={48} alt="bridge" />
                </a> */}
              </p> : null
              }
              {/* <br /> */}

              {/* <ReCAPTCHA
                sitekey=""
                onChange={onChange}
              /> */}

              {/* <div style={{
                "padding": "1rem"
              }}>

              <a href={transactionData ? `https://sepolia.etherscan.io/tx/${transactionData}`: ""} target="blank">
                    {transactionData
                      ? `Transaction hash: ${transactionData}`
                      : ""}
              </a>
              </div> */}


              {/* <article className="panel is-grey-darker" style={{
                  border: '4px solid #fff',
                  borderRadius: '20px',
                  color: '#333',
                  padding: '20px',
                  marginBottom: '20px',
                  transition: 'background-color 0.3s ease'
                }}>
                <p className="panel-heading" >Transaction Data</p>
                <div className="panel-block">
                  <a href={transactionData ? `https://sepolia.etherscan.io/tx/${transactionData}`: ""} target="blank">
                    {transactionData
                      ? `Transaction hash: https://sepolia.etherscan.io/tx/${transactionData}`
                      : "--"}
                  </a>
                </div>
              </article> */}
            </div>
          </div>
        </div>
      </section>



    <footer style={{
      textAlign: "center",
      marginTop: "50px",
      display: "flex", 
      flexDirection: "row", 
      justifyContent: "space-around",
      alignItems: "center",
      padding: "1rem"
      }}>
      {/* <div style={{ 
          display: "flex", 
          flexDirection: "row", 
          // alignItems: "center",
          justifyContent: "space-between",

        }}>
        <a href="https://twitter.com/brettlayer3" target="_blank" rel="noopener noreferrer">
          <Image src={xTwitterPixel} width={36} alt="twitter" />
        </a>
        <a href="https://t.me/brettlayer3" target="_blank" rel="noopener noreferrer">
          <Image src={telegramPixel} width={36} alt="telegram" />
        </a>
        <a href="https://docs.brettvm.com" target="_blank" rel="noopener noreferrer">
          <Image src={docsPixel} width={36} alt="docs" />
        </a>
        <a href="mailto:hello@brettvm.com" target="_blank" rel="noopener noreferrer">
          <Image src={mailPixel} width={36} alt="email" />
        </a>
      
      </div>
      <div style={{ 
          // display: "flex", 
          // flexDirection: "row", 
          // alignItems: "center",
          // justifyContent: "space-around",
          // padding: "1rem" 
        }}>
        <a href="https://brettvm.com" target="_blank" rel="noopener noreferrer">
          <Image src={brettPixel} width={36} alt="website" />
        </a>
      
      </div> */}
  </footer>



    </div>
    </>
  )
}

export default App
