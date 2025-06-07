import { EntityType } from '@onsale/worker'
import { atom } from 'jotai'

export const productAtom = atom<EntityType<'products'>>()
