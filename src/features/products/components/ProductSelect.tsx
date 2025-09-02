import React from 'react'
import { EntitySelect, type EntitySelectProps } from '@/components/forms/EntitySelect'
import { transformProducts } from '@/lib/entity-transformers'

export interface ProductSelectProps extends Omit<EntitySelectProps, 'options'> {
  products: Array<{
    id: string
    name: string
    sku?: string
    category?: string
    principal?: { name: string }
  }>
}

export const ProductSelect: React.FC<ProductSelectProps> = ({ products, ...props }) => {
  const options = transformProducts(products)
  return <EntitySelect options={options} {...props} />
}
