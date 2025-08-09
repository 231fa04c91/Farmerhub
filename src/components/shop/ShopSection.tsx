import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ProductCard from './ProductCard';
import AddProductForm from './AddProductForm';

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  phone: string;
  whatsapp: string;
  createdAt: string;
}

const ShopSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Load products from localStorage on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('farmerProducts');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Save products to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('farmerProducts', JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);
    setShowAddForm(false);
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updatedProduct } : p
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">Farmer's Shop</h1>
            <p className="text-green-600">List your products and connect with buyers</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <AddProductForm
          onAdd={addProduct}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onRemove={removeProduct}
              onUpdate={updateProduct}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <Plus className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No products listed yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first product to the marketplace</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Your First Product
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopSection;