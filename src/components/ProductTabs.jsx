import { useState } from 'react'

const PRODUCTS = [
  { id: 'aplicativo', label: 'Aplicativo' },
  { id: 'web', label: 'Web' },
  { id: 'parcerias', label: 'Parcerias' },
  { id: 'ai', label: 'AI' },
  { id: 'automacao', label: 'Automação' }
]

const WEB_SUB_PRODUCTS = [
  { id: 'geral', label: 'Geral' },
  { id: 'backoffice', label: 'Backoffice' },
  { id: 'portal_estrela', label: 'Portal Estrela' },
  { id: 'doctor', label: 'Doctor' },
  { id: 'company', label: 'Company' }
]

const APP_SUB_PRODUCTS = [
  { id: 'geral', label: 'Geral' },
  { id: 'brasil', label: 'Brasil' },
  { id: 'global', label: 'Global' }
]

const ProductTabs = ({ currentProduct, currentSubProduct, onProductChange, onSubProductChange }) => {
  return (
    <div className="space-y-6">
      {/* Abas de Produtos */}
      <div className="product-tabs">
        <div className="flex space-x-0">
          {PRODUCTS.map(product => (
            <button
              key={product.id}
              onClick={() => {
                onProductChange(product.id)
                if (product.id === 'web' || product.id === 'aplicativo') {
                  onSubProductChange('geral')
                } else {
                  onSubProductChange('')
                }
              }}
              className={`product-tab ${currentProduct === product.id ? 'active' : ''}`}
            >
              {product.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-abas para Web */}
      {currentProduct === 'web' && (
        <div className="sub-product-tabs">
          <div className="flex flex-wrap gap-2">
            {WEB_SUB_PRODUCTS.map(subProduct => (
              <button
                key={subProduct.id}
                onClick={() => onSubProductChange(subProduct.id)}
                className={`sub-product-tab ${currentSubProduct === subProduct.id ? 'active' : ''}`}
              >
                {subProduct.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sub-abas para Aplicativo */}
      {currentProduct === 'aplicativo' && (
        <div className="sub-product-tabs">
          <div className="flex flex-wrap gap-2">
            {APP_SUB_PRODUCTS.map(subProduct => (
              <button
                key={subProduct.id}
                onClick={() => onSubProductChange(subProduct.id)}
                className={`sub-product-tab ${currentSubProduct === subProduct.id ? 'active' : ''}`}
              >
                {subProduct.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductTabs

