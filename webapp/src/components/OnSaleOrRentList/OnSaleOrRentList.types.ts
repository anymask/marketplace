import { Props as OnRentListElementProps } from './OnRentListElement/OnRentListElement.types'
import { Props as OnSaleListElementProps } from './OnSaleListElement/OnSaleListElement.types'

export enum OnSaleOrRentType {
  RENT,
  SALE
}

export type Props = {
  elements: OnSaleListElementProps[] | OnRentListElementProps[]
  address?: string
  isCurrentAccount: boolean
  isLoading: boolean
  onSaleOrRentType: OnSaleOrRentType
}

export type MapStateProps = Pick<Props, 'elements' | 'isLoading'>

export type OwnProps = Pick<Props, 'onSaleOrRentType' | 'address' | 'isCurrentAccount'>
