import type { SelectModel } from '@onsale/worker'
import { atom } from 'jotai'

export interface ProductAtomType extends SelectModel<'products'> {
  prices: Array<SelectModel<'prices'>>
}
export const productAtom = atom<ProductAtomType>()
