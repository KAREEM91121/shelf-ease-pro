import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Receipt, Warehouse, TrendingUp } from "lucide-react";
import heroImage from "@/assets/supermarket-hero.jpg";

interface DashboardProps {
  products: Product[];
  invoices: Invoice[];
}

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
  items: { productId: string; quantity: number; price: number }[];
}

export const Dashboard = ({ products, invoices }: DashboardProps) => {
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const lowStockProducts = products.filter(product => product.quantity < 10).length;

  const stats = [
    {
      title: "إجمالي المنتجات",
      value: totalProducts,
      icon: Package,
      color: "bg-primary",
    },
    {
      title: "قيمة المخزن",
      value: `${totalInventoryValue.toLocaleString()} د.ع`,
      icon: Warehouse,
      color: "bg-success",
    },
    {
      title: "عدد الفواتير",
      value: totalInvoices,
      icon: Receipt,
      color: "bg-info",
    },
    {
      title: "إجمالي المبيعات",
      value: `${totalRevenue.toLocaleString()} د.ع`,
      icon: TrendingUp,
      color: "bg-warning",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-hero p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="سوبر ماركت" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">مرحباً بك في نظام إدارة السوبر ماركت</h1>
          <p className="text-primary-foreground/80 text-lg">
            إدارة شاملة للمنتجات والمخزون والفواتير
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-card hover:shadow-elegant transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              المنتجات منخفضة المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts > 0 ? (
              <div className="text-warning text-lg font-semibold">
                {lowStockProducts} منتج يحتاج إعادة تخزين
              </div>
            ) : (
              <div className="text-success text-lg font-semibold">
                جميع المنتجات متوفرة في المخزون
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              آخر الفواتير
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-2">
                {invoices.slice(-3).reverse().map((invoice) => (
                  <div key={invoice.id} className="flex justify-between items-center">
                    <span className="text-sm">{invoice.customerName}</span>
                    <span className="font-semibold">{invoice.total} د.ع</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">لا توجد فواتير بعد</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};