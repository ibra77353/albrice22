import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Share2, X } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function InvoiceModal({ sale, settings, onClose }) {
  const printRef = useRef(null);
  if (!sale) return null;

  const sym = settings?.currency_symbol || "ر.ي";
  const networkName = settings?.network_name || "شبكة البرنس";

  const handlePrint = () => {
    window.print();
  };

  const buildText = () => {
    const lines = [
      `${networkName} — فاتورة بيع`,
      `رقم الفاتورة: ${sale.invoice_number || "-"}`,
      `التاريخ: ${formatDateTime(sale.sale_date)}`,
      `الموزع: ${sale.distributor_name || "-"}`,
      "",
      "تفاصيل الباقات:",
      ...(sale.items || []).map((it) =>
        `• ${it.package_name} — الكمية: ${it.quantity} × ${formatCurrency(it.unit_price, sym)} = ${formatCurrency(it.total_price || it.quantity * it.unit_price, sym)}`
      ),
      "",
      `الإجمالي: ${formatCurrency(sale.total_amount, sym)}`,
      `المدفوع: ${formatCurrency(sale.paid_amount, sym)}`,
      `المتبقي: ${formatCurrency(sale.remaining_amount, sym)}`,
    ];
    if (sale.notes) lines.push("", `ملاحظات: ${sale.notes}`);
    return lines.join("\n");
  };

  const handleShare = async () => {
    const text = buildText();
    if (navigator.share) {
      try {
        await navigator.share({ title: `فاتورة ${sale.invoice_number || ""}`, text });
      } catch (e) { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("تم نسخ تفاصيل الفاتورة");
      } catch (e) { alert(text); }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 no-print" onClick={onClose}>
      <div
        ref={printRef}
        className="print-area w-full max-w-md bg-white text-black rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Invoice header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold">{networkName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">فاتورة بيع</p>
          </div>
          <button onClick={onClose} className="no-print text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Invoice meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">رقم الفاتورة</p>
              <p className="font-bold">{sale.invoice_number || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">التاريخ</p>
              <p className="font-medium">{formatDateTime(sale.sale_date)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 text-xs">الموزع</p>
              <p className="font-medium">{sale.distributor_name || "-"}</p>
            </div>
          </div>

          {/* Items table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs">
                <tr>
                  <th className="text-right p-2.5 font-semibold">الباقة</th>
                  <th className="text-center p-2.5 font-semibold">الكمية</th>
                  <th className="text-center p-2.5 font-semibold">السعر</th>
                  <th className="text-left p-2.5 font-semibold">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(sale.items || []).map((it, i) => (
                  <tr key={i}>
                    <td className="p-2.5">{it.package_name}</td>
                    <td className="p-2.5 text-center">{it.quantity}</td>
                    <td className="p-2.5 text-center">{formatCurrency(it.unit_price, sym)}</td>
                    <td className="p-2.5 text-left font-medium">{formatCurrency(it.total_price || it.quantity * it.unit_price, sym)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">الإجمالي</span>
              <span className="font-bold">{formatCurrency(sale.total_amount, sym)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">المدفوع</span>
              <span className="font-medium text-emerald-600">{formatCurrency(sale.paid_amount, sym)}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-gray-200">
              <span className="text-gray-600">المتبقي</span>
              <span className="font-bold text-rose-600">{formatCurrency(sale.remaining_amount, sym)}</span>
            </div>
          </div>

          {sale.notes && (
            <div className="text-sm">
              <p className="text-gray-500 text-xs">ملاحظات</p>
              <p className="mt-0.5">{sale.notes}</p>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
            شكراً لتعاملكم مع {networkName}
          </p>
        </div>

        {/* Actions */}
        <div className="no-print flex gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <Button onClick={handlePrint} className="flex-1 gap-2"><Printer className="w-4 h-4" /> طباعة</Button>
          <Button onClick={handleShare} variant="outline" className="flex-1 gap-2"><Share2 className="w-4 h-4" /> مشاركة</Button>
        </div>
      </div>
    </div>
  );
}