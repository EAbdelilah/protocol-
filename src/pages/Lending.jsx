import { useState } from 'react'

const pools = [
  { id: 1, asset: 'ETH', supplyAPY: '3.2%', borrowAPY: '5.5%', totalSupplied: '$25M', totalBorrowed: '$18M' },
  { id: 2, asset: 'USDC', supplyAPY: '8.1%', borrowAPY: '12.3%', totalSupplied: '$50M', totalBorrowed: '$35M' },
]

export default function Lending() {
  return (
    <div>
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
        Lending Markets
      </h2>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Asset
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Supply APY
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Borrow APY
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Total Supplied
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Total Borrowed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pools.map((pool) => (
                    <tr key={pool.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {pool.asset}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pool.supplyAPY}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pool.borrowAPY}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pool.totalSupplied}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pool.totalBorrowed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}