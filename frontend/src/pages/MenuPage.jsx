/**
 * Main menu page component.
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import CategorySection from '../components/Menu/CategorySection';
import MenuSkeleton from '../components/Menu/MenuSkeleton';
import CartDrawer from '../components/Cart/CartDrawer';
import CartButton from '../components/Cart/CartButton';
import { useMenu } from '../hooks/useMenu';
import { useTable } from '../hooks/useTable';
import useCartStore from '../hooks/useCart';
import toast from 'react-hot-toast';

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const { tableId, loading: tableLoading, error: tableError } = useTable();
  const { data: menuData, loading: menuLoading, error: menuError } = useMenu(tableId);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const setTableId = useCartStore((state) => state.setTableId);

  // Set table ID in cart store
  useEffect(() => {
    if (tableId) {
      setTableId(tableId);
    }
  }, [tableId, setTableId]);

  // Check for cancelled payment
  useEffect(() => {
    if (searchParams.get('cancelled') === 'true') {
      toast.error('Payment was cancelled');
      searchParams.delete('cancelled');
      window.history.replaceState({}, '', window.location.pathname + '?' + searchParams.toString());
    }
  }, [searchParams]);

  if (tableLoading || menuLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header tableNumber={null} />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <MenuSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (tableError || menuError) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header tableNumber={null} />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {tableError || menuError}
            </h2>
            <p className="text-gray-600">
              Please scan a valid QR code to view the menu.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!menuData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header tableNumber={menuData.table_number} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {menuData.categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No menu items available at this time.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {menuData.categories.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </div>
        )}
      </main>
      <Footer />
      <CartButton onClick={() => setIsCartOpen(true)} />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tableId={tableId}
      />
    </div>
  );
};

export default MenuPage;
