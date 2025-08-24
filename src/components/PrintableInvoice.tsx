import { forwardRef } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  barcode: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  date: string;
  dueDate?: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  paymentMethod: 'cash' | 'credit';
  notes?: string;
  items: { productId: string; quantity: number; price: number; productName: string }[];
}

interface PrintableInvoiceProps {
  invoice: Invoice;
}

export const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ invoice }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black max-w-4xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">سوبر ماركت الرائد</h1>
          <p className="text-gray-600">العنوان: شارع الرئيسي، المدينة، العراق</p>
          <p className="text-gray-600">الهاتف: 07XX XXX XXXX</p>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">معلومات الفاتورة</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">رقم الفاتورة:</span> {invoice.invoiceNumber}</p>
              <p><span className="font-semibold">التاريخ:</span> {format(new Date(invoice.date), 'dd/MM/yyyy', { locale: ar })}</p>
              {invoice.dueDate && (
                <p><span className="font-semibold">تاريخ الاستحقاق:</span> {format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: ar })}</p>
              )}
              <p><span className="font-semibold">طريقة الدفع:</span> {invoice.paymentMethod === 'cash' ? 'نقداً' : 'آجل'}</p>
              <p><span className="font-semibold">حالة الدفع:</span> 
                <span className={`mr-2 px-2 py-1 rounded text-sm ${
                  invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {invoice.paymentStatus === 'paid' ? 'مدفوع' : 
                   invoice.paymentStatus === 'pending' ? 'في الانتظار' : 'متأخر'}
                </span>
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">معلومات العميل</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">اسم العميل:</span> {invoice.customerName}</p>
              {invoice.customerPhone && (
                <p><span className="font-semibold">رقم الهاتف:</span> {invoice.customerPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">تفاصيل المنتجات</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-right">#</th>
                <th className="border border-gray-300 p-3 text-right">اسم المنتج</th>
                <th className="border border-gray-300 p-3 text-center">الكمية</th>
                <th className="border border-gray-300 p-3 text-center">السعر (د.ع)</th>
                <th className="border border-gray-300 p-3 text-center">الإجمالي (د.ع)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-3">{index + 1}</td>
                  <td className="border border-gray-300 p-3">{item.productName}</td>
                  <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 p-3 text-center">{item.price.toLocaleString()}</td>
                  <td className="border border-gray-300 p-3 text-center">{(item.quantity * item.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-between items-start mb-8">
          <div className="w-1/2">
            {invoice.notes && (
              <div>
                <h3 className="font-semibold mb-2">ملاحظات:</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{invoice.notes}</p>
              </div>
            )}
          </div>
          
          <div className="w-1/3 bg-gray-50 p-4 rounded">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{invoice.subtotal.toLocaleString()} د.ع</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>الخصم:</span>
                  <span>-{invoice.discount.toLocaleString()} د.ع</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between">
                  <span>الضريبة:</span>
                  <span>+{invoice.tax.toLocaleString()} د.ع</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>الإجمالي النهائي:</span>
                <span>{invoice.total.toLocaleString()} د.ع</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-6 text-center text-gray-600">
          <p className="mb-2">شكراً لتسوقكم معنا</p>
          <p className="text-sm">تم إنشاء هذه الفاتورة إلكترونياً</p>
          {invoice.paymentMethod === 'credit' && invoice.dueDate && (
            <p className="text-sm mt-2 text-red-600 font-semibold">
              يرجى سداد المبلغ قبل تاريخ الاستحقاق المذكور أعلاه
            </p>
          )}
        </div>
      </div>
    );
  }
);

PrintableInvoice.displayName = "PrintableInvoice";