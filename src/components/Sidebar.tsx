import { Package, Receipt, Warehouse, BarChart3, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "لوحة التحكم", icon: BarChart3 },
  { id: "products", label: "إدارة المنتجات", icon: Package },
  { id: "invoices", label: "الفواتير", icon: Receipt },
  { id: "inventory", label: "المخزن", icon: Warehouse },
];

export const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-card shadow-card">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
          سوبر ماركت
        </h2>
        <p className="text-sm text-muted-foreground mt-1">نظام إدارة المتجر</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Button
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className="w-full justify-start text-right"
                  onClick={() => {
                    onSectionChange(item.id);
                    setIsOpen(false);
                  }}
                >
                  <Icon className="ml-2 h-4 w-4" />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 right-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0 max-w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-card border-l border-border">
        <SidebarContent />
      </div>
    </>
  );
};