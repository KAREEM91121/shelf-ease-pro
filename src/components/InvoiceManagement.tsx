import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Receipt, Trash2, ShoppingCart, Search, Printer, FileText, Calendar, CreditCard, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { PrintableInvoice } from "@/components/PrintableInvoice";
import { useReactToPrint } from "react-to-print";
import { addDays, format } from "date-fns";

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

interface InvoiceManagementProps {
  products: Product[];
  invoices: Invoice[];
  onAddInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  onUpdateProductQuantity: (productId: string, newQuantity: number) => void;
}

export const InvoiceManagement = ({ 
  products, 
  invoices, 
  onAddInvoice,
  onUpdateProductQuantity 
}: InvoiceManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedItems, setSelectedItems] = useState<{
    productId: string;
    quantity: number;
    price: number;
    productName: string;
  }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [daysToAdd, setDaysToAdd] = useState(30);
  const [notes, setNotes] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `فاتورة-${selectedInvoice?.invoiceNumber}`,
  });

  // Generate unique invoice number
  const generateInvoiceNumber = () => {
    return `INV-${Date.now().toString().slice(-8)}`;
  };

  // Filter products based on search (name, category, barcode)
  const filteredProducts = products.filter(product =>
    product.quantity > 0 && (
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.barcode.includes(productSearch)
    )
  );

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleBarcodeSearch = (barcodeValue: string) => {
    const product = products.find(p => p.barcode === barcodeValue);
    if (product) {
      if (product.quantity > 0) {
        setSelectedProduct(product.id);
        setProductSearch("");
        setItemQuantity("1");
        toast({
          title: "تم العثور على المنتج",
          description: `${product.name} - ${product.price} د.ع`,
        });
      } else {
        toast({
          title: "تحذير",
          description: "هذا المنتج غير متوفر في المخزن",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على منتج بهذا الباركود",
        variant: "destructive",
      });
    }
  };

  const calculateSubtotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - discount + tax;
  };

  const addItemToInvoice = () => {
    if (!selectedProduct || !itemQuantity) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار منتج وكمية",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const quantity = parseInt(itemQuantity);
    if (quantity > product.quantity) {
      toast({
        title: "خطأ",
        description: "الكمية المطلوبة أكبر من المتوفر في المخزن",
        variant: "destructive",
      });
      return;
    }

    const existingItemIndex = selectedItems.findIndex(item => item.productId === selectedProduct);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...selectedItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.quantity) {
        toast({
          title: "خطأ",
          description: "الكمية الإجمالية أكبر من المتوفر في المخزن",
          variant: "destructive",
        });
        return;
      }
      
      updatedItems[existingItemIndex].quantity = newQuantity;
      setSelectedItems(updatedItems);
    } else {
      setSelectedItems([...selectedItems, {
        productId: selectedProduct,
        quantity,
        price: product.price,
        productName: product.name,
      }]);
    }

    setSelectedProduct("");
    setItemQuantity("");
  };

  const removeItemFromInvoice = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setSelectedItems([]);
    setProductSearch("");
    setSelectedProduct("");
    setItemQuantity("");
    setDiscount(0);
    setTax(0);
    setPaymentMethod('cash');
    setDaysToAdd(30);
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || selectedItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم العميل وإضافة منتجات للفاتورة",
        variant: "destructive",
      });
      return;
    }

    // Update product quantities
    selectedItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        onUpdateProductQuantity(item.productId, product.quantity - item.quantity);
      }
    });

    const subtotal = calculateSubtotal();
    const total = calculateTotal();
    const currentDate = new Date();
    const dueDate = paymentMethod === 'credit' ? addDays(currentDate, daysToAdd) : undefined;

    const invoice = {
      invoiceNumber: generateInvoiceNumber(),
      customerName,
      customerPhone: customerPhone || undefined,
      subtotal,
      total,
      discount,
      tax,
      date: currentDate.toISOString(),
      dueDate: dueDate?.toISOString(),
      paymentStatus: paymentMethod === 'cash' ? 'paid' as const : 'pending' as const,
      paymentMethod,
      notes: notes || undefined,
      items: selectedItems,
    };

    onAddInvoice(invoice);

    toast({
      title: "تم بنجاح",
      description: `تم إنشاء الفاتورة ${invoice.invoiceNumber} بنجاح`,
    });

    resetForm();
    setIsDialogOpen(false);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">مدفوع</Badge>;
      case 'pending':
        return <Badge variant="secondary">في الانتظار</Badge>;
      case 'overdue':
        return <Badge variant="destructive">متأخر</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            إدارة الفواتير
          </h1>
          <p className="text-muted-foreground mt-1">إنشاء وإدارة فواتير البيع</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="lg">
              <Plus className="ml-2 h-4 w-4" />
              فاتورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="customerName">اسم العميل</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="أدخل اسم العميل"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">رقم الهاتف (اختياري)</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <div className="space-y-4">
                <Label>إضافة منتجات</Label>
                
                {/* Product Search */}
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="البحث بالاسم، الفئة أو الباركود..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <BarcodeScanner onScan={handleBarcodeSearch}>
                    <Button type="button" variant="outline">
                      مسح باركود
                    </Button>
                  </BarcodeScanner>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر منتج" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.price} د.ع (متوفر: {product.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="الكمية"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    min="1"
                  />
                  <Button type="button" onClick={addItemToInvoice} variant="success">
                    إضافة
                  </Button>
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">المنتجات المحددة:</h3>
                  <div className="space-y-2">
                    {selectedItems.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex-1">
                          <span className="font-medium">{item.productName}</span>
                          <span className="text-muted-foreground mr-2">
                            {item.quantity} × {item.price} د.ع = {(item.quantity * item.price).toFixed(2)} د.ع
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItemFromInvoice(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Totals Section */}
                  <div className="border-t pt-4 mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="discount">الخصم (د.ع)</Label>
                        <Input
                          id="discount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tax">الضريبة (د.ع)</Label>
                        <Input
                          id="tax"
                          type="number"
                          min="0"
                          step="0.01"
                          value={tax}
                          onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-right">
                      <div className="flex justify-between">
                        <span>المجموع الفرعي:</span>
                        <span>{calculateSubtotal().toFixed(2)} د.ع</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>الخصم:</span>
                          <span>-{discount.toFixed(2)} د.ع</span>
                        </div>
                      )}
                      {tax > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>الضريبة:</span>
                          <span>+{tax.toFixed(2)} د.ع</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>الإجمالي النهائي:</span>
                        <span>{calculateTotal().toFixed(2)} د.ع</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>طريقة الدفع</Label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="radio"
                        id="cash"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'credit')}
                        className="ml-2"
                      />
                      <Label htmlFor="cash" className="flex items-center gap-1">
                        <Banknote className="h-4 w-4" />
                        نقداً
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="radio"
                        id="credit"
                        name="paymentMethod"
                        value="credit"
                        checked={paymentMethod === 'credit'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'credit')}
                        className="ml-2"
                      />
                      <Label htmlFor="credit" className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        آجل
                      </Label>
                    </div>
                  </div>
                </div>
                
                {paymentMethod === 'credit' && (
                  <div>
                    <Label htmlFor="daysToAdd">فترة الأجل (أيام)</Label>
                    <Input
                      id="daysToAdd"
                      type="number"
                      min="1"
                      value={daysToAdd}
                      onChange={(e) => setDaysToAdd(parseInt(e.target.value) || 30)}
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أدخل أي ملاحظات إضافية..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="success" className="flex-1">
                  إنشاء الفاتورة
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث في الفواتير..."
            value={invoiceSearch}
            onChange={(e) => setInvoiceSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            size="sm"
          >
            الكل
          </Button>
          <Button
            variant={statusFilter === "paid" ? "default" : "outline"}
            onClick={() => setStatusFilter("paid")}
            size="sm"
          >
            مدفوع
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
            size="sm"
          >
            آجل
          </Button>
          <Button
            variant={statusFilter === "overdue" ? "default" : "outline"}
            onClick={() => setStatusFilter("overdue")}
            size="sm"
          >
            متأخر
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{invoice.customerName}</CardTitle>
                  <p className="text-sm text-muted-foreground">#{invoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  {getPaymentStatusBadge(invoice.paymentStatus)}
                  <div className="flex items-center gap-1 mt-1">
                    {invoice.paymentMethod === 'cash' ? (
                      <Banknote className="h-4 w-4 text-green-600" />
                    ) : (
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {invoice.paymentMethod === 'cash' ? 'نقداً' : 'آجل'}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">التاريخ:</span>
                  <span>{format(new Date(invoice.date), 'dd/MM/yyyy')}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">تاريخ الاستحقاق:</span>
                    <span className={new Date(invoice.dueDate) < new Date() ? 'text-red-600' : ''}>
                      {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                )}
                {invoice.customerPhone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الهاتف:</span>
                    <span>{invoice.customerPhone}</span>
                  </div>
                )}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">المنتجات:</h4>
                  {invoice.items.map((item, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      {item.productName} - {item.quantity} قطعة
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي:</span>
                      <span>{invoice.subtotal.toFixed(2)} د.ع</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>الخصم:</span>
                        <span>-{invoice.discount.toFixed(2)} د.ع</span>
                      </div>
                    )}
                    {invoice.tax > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>الضريبة:</span>
                        <span>+{invoice.tax.toFixed(2)} د.ع</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-1 border-t">
                      <span>الإجمالي:</span>
                      <span className="text-success">{invoice.total.toFixed(2)} د.ع</span>
                    </div>
                  </div>
                </div>
                {invoice.notes && (
                  <div className="bg-muted p-2 rounded text-sm">
                    <span className="font-medium">ملاحظات: </span>
                    {invoice.notes}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrintInvoice(invoice)}
                    className="flex-1"
                  >
                    <Printer className="ml-1 h-3 w-3" />
                    طباعة
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // TODO: Add edit functionality
                      toast({
                        title: "قريباً",
                        description: "ميزة تعديل الفاتورة ستتوفر قريباً",
                      });
                    }}
                    className="flex-1"
                  >
                    <FileText className="ml-1 h-3 w-3" />
                    تفاصيل
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && invoiceSearch && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground mb-4">لم يتم العثور على فواتير تطابق البحث</p>
            <Button
              variant="outline"
              onClick={() => setInvoiceSearch("")}
            >
              مسح البحث
            </Button>
          </CardContent>
        </Card>
      )}

      {invoices.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد فواتير</h3>
            <p className="text-muted-foreground mb-4">ابدأ بإنشاء فاتورة جديدة</p>
            <Button
              variant="hero"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="ml-2 h-4 w-4" />
              إنشاء أول فاتورة
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Hidden Printable Invoice */}
      {selectedInvoice && (
        <div style={{ display: 'none' }}>
          <PrintableInvoice ref={printRef} invoice={selectedInvoice} />
        </div>
      )}
    </div>
  );
};