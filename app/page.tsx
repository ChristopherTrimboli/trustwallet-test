"use client"

import { useEffect, useState } from 'react'
import { Wallet, ethers } from 'ethers'

export default function Home() {
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | Wallet | null>(null)
  const [localWallet, setLocalWallet] = useState<string | null>('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState('')

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
    if (!wallet) return console.log('issue creating wallet from local wallet')

    console.log('unlocked wallet', wallet)

    setWallet(wallet)
    setIsUnlocked(true)
    setPassword('')
  }

  useEffect(() => {
    const localWallet = localStorage.getItem('localWallet') as string;
    if (localWallet) {
      setLocalWallet(localWallet)
    } else {
      setLocalWallet(null)
      console.log('no local wallet');
    }
  }, [wallet])

  return (
    <main>
      {
        wallet ? (
          <>
            <h1>Wallet created</h1>
            <p>Address: {wallet.address}</p>
          </>
        ) : (
          <>
           {
              localWallet && !isUnlocked && (
                <>
                <h1>Unlock your wallet</h1>
                <input type="password" onChange={({target}) => setPassword(target.value)} />
                <button onClick={handleUnlock}>Unlock</button>
              </>
              ) 
            }
            { !localWallet && (
                <>
                <h1>Create Wallet</h1>
                <input type="password" onChange={({target}) => setPassword(target.value)} />
                <button onClick={createWallet} disabled={!password}>Create wallet</button>
              </>
              )
            }
          </>
        )
      }
    </main>
  )
}
