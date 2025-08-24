import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { ProductManagement } from "@/components/ProductManagement";
import { InvoiceManagement } from "@/components/InvoiceManagement";
import { InventoryManagement } from "@/components/InventoryManagement";
import { useAutoSave, loadFromStorage } from "@/hooks/useAutoSave";

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
  customerName: string;
  total: number;
  date: string;
  items: { productId: string; quantity: number; price: number; productName: string }[];
}

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  
  // Load data from localStorage on component mount
  const [products, setProducts] = useState<Product[]>(() => 
    loadFromStorage("supermarket_products", [
      {
        id: "1",
        name: "أرز بسمتي",
        price: 25.50,
        quantity: 50,
        category: "حبوب",
        barcode: "1234567890123"
      },
      {
        id: "2", 
        name: "زيت طبخ",
        price: 45.00,
        quantity: 8,
        category: "زيوت",
        barcode: "1234567890124"
      },
      {
        id: "3",
        name: "سكر أبيض",
        price: 18.75,
        quantity: 25,
        category: "حبوب",
        barcode: "1234567890125"
      }
    ])
  );
  
  const [invoices, setInvoices] = useState<Invoice[]>(() => 
    loadFromStorage("supermarket_invoices", [])
  );

  // Auto-save data to localStorage
  useAutoSave({ data: products, key: "supermarket_products" });
  useAutoSave({ data: invoices, key: "supermarket_invoices" });

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
    };
    setProducts([...products, newProduct]);
  };

  const handleUpdateProduct = (id: string, productData: Omit<Product, 'id'>) => {
    setProducts(products.map(p => p.id === id ? { ...productData, id } : p));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleAddInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
    };
    setInvoices([...invoices, newInvoice]);
  };

  const handleUpdateProductQuantity = (productId: string, newQuantity: number) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, quantity: newQuantity } : p
    ));
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard products={products} invoices={invoices} />;
      case "products":
        return (
          <ProductManagement
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case "invoices":
        return (
          <InvoiceManagement
            products={products}
            invoices={invoices}
            onAddInvoice={handleAddInvoice}
            onUpdateProductQuantity={handleUpdateProductQuantity}
          />
        );
      case "inventory":
        return <InventoryManagement products={products} />;
      default:
        return <Dashboard products={products} invoices={invoices} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
