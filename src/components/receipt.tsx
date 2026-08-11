"use client";

import { formatCurrency, formatDateTime } from "@/lib/format";
import { Settings, Transaction } from "@/lib/types";

export function Receipt({
  transaction,
  settings,
}: {
  transaction: Transaction;
  settings: Settings;
}) {
  const itemCount = transaction.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="receipt p-4 max-w-[300px] mx-auto bg-white text-black text-xs font-mono">
      {/* Header */}
      <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
        <p className="font-bold text-sm">{settings.storeName || "Warung"}</p>
        {settings.storeTagline && (
          <p className="text-[10px] text-gray-500">{settings.storeTagline}</p>
        )}
        <p className="text-[10px] text-gray-500">{settings.city}</p>
        <p className="text-[10px] text-gray-400 mt-1">{settings.storeAddress}</p>
      </div>

      {/* Transaction info */}
      <div className="space-y-1 border-b border-dashed border-gray-300 pb-3 mb-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Tanggal</span>
          <span>{formatDateTime(transaction.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">No. Transaksi</span>
          <span>{transaction.id.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Pembayaran</span>
          <span>{transaction.paymentMethod}</span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 border-b border-dashed border-gray-300 pb-3 mb-3">
        {transaction.items.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between">
              <span className="font-medium">{item.productName}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>{formatCurrency(item.unitPrice)} x {item.quantity}</span>
              <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="space-y-1 border-b border-dashed border-gray-300 pb-3 mb-3">
        <div className="flex justify-between text-gray-500">
          <span>Total item</span>
          <span>{itemCount} pcs</span>
        </div>
        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL</span>
          <span>{formatCurrency(transaction.total)}</span>
        </div>
      </div>

      {/* Void notice */}
      {transaction.voided && (
        <div className="text-center text-destructive font-bold py-2 mb-3">
          *** DIBATALKAN ***
          {transaction.voidReason && (
            <p className="text-[10px] font-normal">{transaction.voidReason}</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-2">
        <p className="text-[10px] text-gray-400">Terima kasih atas kunjungan Anda!</p>
        <p className="text-[10px] text-gray-400">{settings.storeName}</p>
      </div>
    </div>
  );
}
