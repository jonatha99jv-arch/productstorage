import { useState } from 'react'

const PRODUCTS = [
  { id: 'aplicativo', label: 'Jornada do Paciente' },
  { id: 'jornada_profissional', label: 'Jornada do Profissional' },
  { id: 'parcerias', label: 'Jornada do Parceiro' },
  { id: 'hr_experience', label: 'HR Experience' },
  { id: 'ai', label: 'AI' },
  { id: 'automacao', label: 'Automação' }
]

const WEB_SUB_PRODUCTS = [
  { id: 'geral', label: 'Geral' },
  { id: 'backoffice', label: 'Backoffice' },
  { id: 'doctor', label: 'Doctor' }
]

const APP_SUB_PRODUCTS = [
  { id: 'geral', label: 'Geral' },
  { id: 'brasil', label: 'Brasil' },
  { id: 'global', label: 'Global' },
  { id: 'portal_estrela', label: 'Portal Estrela' }
]

const HR_EXPERIENCE_SUB_PRODUCTS = [
  { id: 'geral', label: 'Geral' },
  { id: 'company', label: 'Company' },
  { id: 'nr1', label: 'NR1' }
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
                if (product.id === 'jornada_profissional' || product.id === 'aplicativo' || product.id === 'hr_experience') {
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
      {currentProduct === 'jornada_profissional' && (
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

      {/* Sub-abas para HR Experience */}
      {currentProduct === 'hr_experience' && (
        <div className="sub-product-tabs">
          <div className="flex flex-wrap gap-2">
            {HR_EXPERIENCE_SUB_PRODUCTS.map(subProduct => (
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

