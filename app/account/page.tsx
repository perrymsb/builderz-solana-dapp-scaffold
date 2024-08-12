"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Modal from "../../components/Modal";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, ParsedTransactionWithMeta } from "@solana/web3.js";

export default function Account() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState<ParsedTransactionWithMeta[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey) return;

      try {
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 5 });
        const txs = await connection.getParsedTransactions(signatures.map(sig => sig.signature));
        setTransactions(txs.filter((tx): tx is ParsedTransactionWithMeta => tx !== null));
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [publicKey, connection]);

  const formatAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="max-w-2xl w-full bg-transparent text-black dark:text-white rounded-lg shadow-lg border border-0.5 border-gray-300 dark:border-gray-800 p-[1.25rem]">
        <div className="flex flex-col justify-center p-4 bg-inherit gap-10">
          <div className="flex flex-row items-center justify-center gap-8">
            <a href="https://builderz.build" target="_blank" rel="noopener noreferrer">
              <Image src="/images/builderz-symbol.svg" height={60} width={50} style={{ objectFit: "contain" }} alt="builderz" />
            </a>
            <Image width={75} height={75} src="/sol.png" className="" alt="sol" />
          </div>
          <h1 className="text-2xl font-bold text-center text-black dark:text-white">Account Page</h1>
          
          {publicKey ? (
            <>
              <p className="text-center text-black dark:text-white">
                Connected wallet: {formatAddress(publicKey.toBase58())}
              </p>
              <h2 className="text-xl font-semibold mt-4 mb-2">Recent Transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-black dark:text-white">
                  <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3">Signature</th>
                      <th scope="col" className="px-6 py-3">Block Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr key={index} className="bg-white dark:bg-gray-800 border-b">
                        <td className="px-6 py-4">{formatAddress(tx.transaction.signatures[0])}</td>
                        <td className="px-6 py-4">{tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-center text-black dark:text-white">
              Please connect your wallet to view recent transactions.
            </p>
          )}
          
          <div className="flex flex-col md:flex-row justify-center items-center py-4">
            <Modal />
          </div>
        </div>
      </div>
    </div>
  );
}