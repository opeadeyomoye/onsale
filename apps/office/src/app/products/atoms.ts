import type { EntityType } from '@onsale/worker'
import { atom } from 'jotai'

export interface ProductAtomType extends EntityType<'products'> {
  prices: Array<EntityType<'prices'>>
}
export const productAtom = atom<ProductAtomType>()
