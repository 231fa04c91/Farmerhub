import React, { useState } from 'react';
import { Phone, MessageCircle, Edit2, Trash2, Check, X } from 'lucide-react';
import { Product } from './ShopSection';

interface ProductCardProps {
  product: Product;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updatedProduct: Partial<Product>) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onRemove, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    phone: product.phone,
    whatsapp: product.whatsapp,
  });

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in your ${product.name} (₹${product.price}). Is it still available?`
    );
    window.open(`https://wa.me/91${product.whatsapp}?text=${message}`, '_blank');
  };

  const handlePhoneClick = () => {
    window.open(`tel:+91${product.phone}`, '_self');
  };

  const handleSaveEdit = () => {
    onUpdate(product.id, editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      phone: product.phone,
      whatsapp: product.whatsapp,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="aspect-w-16 aspect-h-12 bg-gray-200">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <div className="text-white text-lg font-semibold">
              {product.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Product name"
            />
            
            <input
              type="number"
              value={editForm.price}
              onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Price"
            />
            
            <input
              type="number"
              value={editForm.quantity}
              onChange={(e) => setEditForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Quantity"
            />
            
            <input
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Phone number"
            />
            
            <input
              type="tel"
              value={editForm.whatsapp}
              onChange={(e) => setEditForm(prev => ({ ...prev, whatsapp: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="WhatsApp number"
            />
            
            <div className="flex space-x-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-gray-800 line-clamp-2">{product.name}</h3>
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  title="Edit product"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRemove(product.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-2xl font-bold text-green-600 mb-1">₹{product.price.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Available: {product.quantity} units</div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handlePhoneClick}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </button>
              
              <button
                onClick={handleWhatsAppClick}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              Listed on {new Date(product.createdAt).toLocaleDateString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;