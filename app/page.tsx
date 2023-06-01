"use client"

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Wallet, ethers } from 'ethers'

export default function Home() {
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | Wallet | null>(null)
  const [localWallet, setLocalWallet] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [balance, setBalance] = useState('')
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getBalance = useCallback(async (address: string) => {
    const provider = new ethers.BrowserProvider((window as any).ethereum)
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(balanceInEth);
    return balanceInEth;
  }, [])

  const createWallet = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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

  const handleUnlock = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!localWallet) return console.log('no local wallet')

    ethers.Wallet.fromEncryptedJson(localWallet, password)
      .then(async (wallet) => {
        console.log('unlocked wallet', wallet)
        setBalance(await getBalance(wallet.address))
        setWallet(wallet)
        setIsUnlocked(true)
        setPassword('')
      })
      .catch(e => {
        console.log('error unlocking wallet', e)
        setError('Wrong password')
      })
  }

  const deleteWallet = () => {
    localStorage.removeItem('localWallet')
    setLocalWallet('')
    setWallet(null)
    setIsUnlocked(false)
  }

  const logout = () => {
    setLocalWallet('')
    setWallet(null)
    setIsUnlocked(false)
  }

  useEffect(() => {
    setLoading(true)
    const localWallet = localStorage.getItem('localWallet') as string;
    if (localWallet) {
      setLocalWallet(localWallet)
    } else {
      setLocalWallet('')
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
            <h5>Address:</h5>
            <p>{wallet.address}</p>
            <h5>Balance:</h5>
            <p> {balance} ETH</p>
            <h5>Private Key:</h5>
            <p>{wallet.privateKey}</p>
            <button onClick={deleteWallet}>Delete this wallet from browser</button>
            <button onClick={logout}>Logout / lock wallet</button>
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
                      <form onSubmit={handleUnlock}>
                        <h1>Unlock your wallet</h1>
                        <input type="password" onChange={({ target }) => setPassword(target.value)} />
                        <button type='submit' disabled={!password}>Unlock</button>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                      </form>
                    )
                  }
                  {!localWallet && (
                    <form onSubmit={createWallet}>
                      <h1>Create Wallet</h1>
                      <input type="password" onChange={({ target }) => setPassword(target.value)} />
                      <button type="submit" disabled={!password}>Create wallet</button>
                    </form>
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
