import { CAMPAIGN_TAG } from '../../components/Campaign/config'
import { AssetType } from '../asset/types'
import { Section } from '../vendor/decentraland'
import { getSearchParams } from './search'
import { BrowseOptions } from './types'

export const locations = {
  root: () => '/',
  signIn: () => '/sign-in',
  settings: () => '/settings',
  lands: (options?: BrowseOptions) => {
    const params = getSearchParams(options)
    return params ? `/lands?${params.toString()}` : '/lands'
  },
  collectibles: () => '/collectibles',
  collection: (contractAddress = ':contractAddress') => `/collections/${contractAddress}`,
  browse: (options?: BrowseOptions) => {
    const params = getSearchParams(options)
    return params ? `/browse?${params.toString()}` : '/browse'
  },
  campaign: (options?: BrowseOptions) => {
    const params = getSearchParams(options)
    const path = `/${CAMPAIGN_TAG}`
    return params ? `${path}?${params.toString()}` : path
  },
  currentAccount: (options?: BrowseOptions) => {
    const params = getSearchParams(options)
    return params ? `/account?${params.toString()}` : '/account'
  },
  defaultCurrentAccount: function () {
    return this.currentAccount({
      section: Section.COLLECTIONS
    })
  },
  account: (address = ':address', options?: BrowseOptions) => {
    const params = getSearchParams(options)
    return params ? `/accounts/${address}?${params.toString()}` : `/accounts/${address}`
  },
  nft: (contractAddress = ':contractAddress', tokenId = ':tokenId') => `/contracts/${contractAddress}/tokens/${tokenId}`,
  manage: (contractAddress = ':contractAddress', tokenId = ':tokenId') => `/contracts/${contractAddress}/tokens/${tokenId}/manage`,
  item: (contractAddress = ':contractAddress', itemId = ':itemId') => `/contracts/${contractAddress}/items/${itemId}`,
  parcel: (x = ':x', y = ':y') => `/parcels/${x}/${y}/detail`,
  estate: (estateId = ':estateId') => `/estates/${estateId}/detail`,
  buy: (type: AssetType, contractAddress = ':contractAddress', tokenId = ':tokenId') =>
    `/contracts/${contractAddress}/${getResource(type)}/${tokenId}/buy`,
  buyWithCard: (type: AssetType, contractAddress = ':contractAddress', tokenId = ':tokenId') =>
    `/contracts/${contractAddress}/${getResource(type)}/${tokenId}/buy?withCard=true`,
  buyStatusPage: (type: AssetType, contractAddress = ':contractAddress', tokenId = ':tokenId') =>
    `/contracts/${contractAddress}/${getResource(type)}/${tokenId}/buy/status`,
  sell: (contractAddress = ':contractAddress', tokenId = ':tokenId') => `/contracts/${contractAddress}/tokens/${tokenId}/sell`,
  cancel: (contractAddress = ':contractAddress', tokenId = ':tokenId') => `/contracts/${contractAddress}/tokens/${tokenId}/cancel`,
  transfer: (contractAddress = ':contractAddress', tokenId = ':tokenId') => `/contracts/${contractAddress}/tokens/${tokenId}/transfer`,
  bid: (contractAddress = ':contractAddress', tokenId = ':tokenId') => `/contracts/${contractAddress}/tokens/${tokenId}/bid`,
  activity: () => '/activity'
}

function getResource(type: AssetType) {
  switch (type) {
    case AssetType.NFT:
      return 'tokens'
    case AssetType.ITEM:
      return 'items'
    default:
      throw new Error(`Invalid type ${type}`)
  }
}
