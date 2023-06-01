"use client"

import { useCallback, useEffect, useState } from 'react'
import { Wallet, ethers } from 'ethers'

export default function Home() {
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | Wallet | null>(null)
  const [localWallet, setLocalWallet] = useState<string | null>('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [balance, setBalance] = useState('')
  const [isLoading, setLoading] = useState(true)

  const getBalance = useCallback(async (address: string) => {
    const provider = new ethers.BrowserProvider((window as any).ethereum)
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(balanceInEth);
    return balanceInEth;
  }, [])

  const createWallet = async () => {
    const wallet = ethers.Wallet.createRandom()
    console.log('new wallet', wallet)

    if (!wallet?.mnemonic?.phrase) return console.log('issue creating wallet')

    const jsonWallet = await wallet.encrypt(password)

    setLocalWallet(jsonWallet)
    setWallet(wallet)
    setPassword('')
    localStorage.setItem('localWallet', jsonWallet)
    console.log(wallet)
  }

  const handleUnlock = async () => {
    if (!localWallet) return console.log('no local wallet')

    const wallet = await ethers.Wallet.fromEncryptedJson(localWallet, password)
    if (!wallet) return console.log('issue decrypting wallet from local wallet')

    console.log('unlocked wallet', wallet)

    setBalance(await getBalance(wallet.address))
    setWallet(wallet)
    setIsUnlocked(true)
    setPassword('')
  }

  useEffect(() => {
    setLoading(true)
    const localWallet = localStorage.getItem('localWallet') as string;
    if (localWallet) {
      setLocalWallet(localWallet)
    } else {
      setLocalWallet(null)
      console.log('no local wallet');
    }
    setLoading(false)
  }, [wallet])

  return (
    <main>
      {
        wallet ? (
          <>
            <h1>Your Wallet</h1>
            <p>Address: {wallet.address}</p>
            <p>Balance: {balance} ETH</p>
            <p>Private Key: {wallet.privateKey}</p>
          </>
        ) : (
          <>
            {
              isLoading ? (
                <p>Fetching / decrypting your wallet...</p>
              ) : (
                <>
                  {
                    localWallet && !isUnlocked && (
                      <>
                        <h1>Unlock your wallet</h1>
                        <input type="password" onChange={({ target }) => setPassword(target.value)} />
                        <button onClick={handleUnlock} disabled={!password}>Unlock</button>
                      </>
                    )
                  }
                  {!localWallet && (
                    <>
                      <h1>Create Wallet</h1>
                      <input type="password" onChange={({ target }) => setPassword(target.value)} />
                      <button onClick={createWallet} disabled={!password}>Create wallet</button>
                    </>
                  )
                  }
                </>
              )
            }
          </>
        )
      }
    </main>
  )
}
