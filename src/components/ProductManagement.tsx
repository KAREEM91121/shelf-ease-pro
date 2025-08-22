import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface ProductManagementProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductManagement = ({ 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct 
}: ProductManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.quantity || !formData.category) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      category: formData.category,
    };

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, productData);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث المنتج بنجاح",
      });
    } else {
      onAddProduct(productData);
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المنتج بنجاح",
      });
    }

    setFormData({ name: "", price: "", quantity: "", category: "" });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      category: product.category,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    onDeleteProduct(id);
    toast({
      title: "تم بنجاح",
      description: "تم حذف المنتج بنجاح",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            إدارة المنتجات
          </h1>
          <p className="text-muted-foreground mt-1">إضافة وتعديل وحذف المنتجات</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="lg">
              <Plus className="ml-2 h-4 w-4" />
              إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم المنتج</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسم المنتج"
                />
              </div>
              <div>
                <Label htmlFor="price">السعر</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="أدخل السعر"
                />
              </div>
              <div>
                <Label htmlFor="quantity">الكمية</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="أدخل الكمية"
                />
              </div>
              <div>
                <Label htmlFor="category">الفئة</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="أدخل فئة المنتج"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="success" className="flex-1">
                  {editingProduct ? "تحديث" : "إضافة"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingProduct(null);
                    setFormData({ name: "", price: "", quantity: "", category: "" });
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <Badge variant={product.quantity < 10 ? "destructive" : "secondary"}>
                  {product.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">السعر:</span>
                  <span className="font-semibold">{product.price} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الكمية:</span>
                  <span className={`font-semibold ${product.quantity < 10 ? 'text-destructive' : 'text-success'}`}>
                    {product.quantity}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="ml-1 h-3 w-3" />
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                    className="flex-1"
                  >
                    <Trash2 className="ml-1 h-3 w-3" />
                    حذف
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
            <p className="text-muted-foreground mb-4">ابدأ بإضافة منتجات جديدة لمتجرك</p>
            <Button
              variant="hero"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة أول منتج
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};