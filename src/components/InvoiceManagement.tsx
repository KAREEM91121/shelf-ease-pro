import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Receipt, Trash2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface Invoice {
  id: string;
  customerName: string;
  total: number;
  date: string;
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
  const [customerName, setCustomerName] = useState("");
  const [selectedItems, setSelectedItems] = useState<{
    productId: string;
    quantity: number;
    price: number;
    productName: string;
  }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const { toast } = useToast();

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
      updatedItems[existingItemIndex].quantity += quantity;
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

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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

    const invoice = {
      customerName,
      total: calculateTotal(),
      date: new Date().toLocaleDateString('ar-EG'),
      items: selectedItems,
    };

    onAddInvoice(invoice);

    toast({
      title: "تم بنجاح",
      description: "تم إنشاء الفاتورة بنجاح",
    });

    setCustomerName("");
    setSelectedItems([]);
    setIsDialogOpen(false);
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

              <div className="space-y-4">
                <Label>إضافة منتجات</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر منتج" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.filter(p => p.quantity > 0).map((product) => (
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
                  <div className="border-t pt-4 mt-4">
                    <div className="text-lg font-bold text-left">
                      الإجمالي: {calculateTotal().toFixed(2)} د.ع
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="success" className="flex-1">
                  إنشاء الفاتورة
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setCustomerName("");
                    setSelectedItems([]);
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{invoice.customerName}</CardTitle>
                <Badge variant="secondary">{invoice.date}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      {item.productName} - {item.quantity} قطعة
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">الإجمالي:</span>
                    <span className="text-lg font-bold text-success">{invoice.total} د.ع</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  );
};