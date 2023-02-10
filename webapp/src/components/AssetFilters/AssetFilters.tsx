import { useCallback } from 'react'
import { EmotePlayMode, GenderFilterOption, Network, Rarity, WearableGender } from '@dcl/schemas'
import { AssetType } from '../../modules/asset/types'
import { getSectionFromCategory } from '../../modules/routing/search'
import { isLandSection } from '../../modules/ui/utils'
import { Menu } from '../Menu'
import { LANDFilters } from '../Vendor/decentraland/types'
import { BodyShapeFilter } from './BodyShapeFilter'
import { CollectionFilter } from './CollectionFilter'
import { EmotePlayModeFilter } from './EmotePlayModeFilter'
import { LandStatusFilter } from './LandStatusFilter'
import { MoreFilters } from './MoreFilters'
import { NetworkFilter } from './NetworkFilter'
import PriceFilter from './PriceFilter'
import { RarityFilter } from './RarityFilter'
import { AssetFilter, filtersBySection } from './utilts'
import { Props } from './AssetFilters.types'
import './AssetFilters.css'

export const AssetFilters = ({
  minPrice,
  maxPrice,
  collection,
  rarities,
  network,
  category,
  bodyShapes,
  isOnlySmart,
  isOnSale,
  emotePlayMode,
  assetType,
  section,
  landStatus,
  defaultCollapsed,
  onBrowse,
  isPriceFilterEnabled,
  values
}: Props): JSX.Element | null => {
  const isPrimarySell = assetType === AssetType.ITEM
  const isInLandSection = isLandSection(section)

  const handlePriceChange = useCallback(
    (value: [string, string]) => {
      const [minPrice, maxPrice] = value
      onBrowse({ minPrice, maxPrice })
    },
    [onBrowse]
  )

  const handleRarityChange = useCallback(
    (value: Rarity[]) => {
      onBrowse({ rarities: value })
    },
    [onBrowse]
  )

  const handleNetworkChange = useCallback(
    (value: Network) => {
      onBrowse({ network: value })
    },
    [onBrowse]
  )

  const handleBodyShapeChange = useCallback(
    (value: (WearableGender | GenderFilterOption)[]) => {
      onBrowse({ wearableGenders: value })
    },
    [onBrowse]
  )

  const handleOnlySmartChange = useCallback(
    (value: boolean) => {
      onBrowse({ onlySmart: value })
    },
    [onBrowse]
  )

  const handleOnSaleChange = useCallback(
    (value: boolean) => {
      onBrowse({ onlyOnSale: value })
    },
    [onBrowse]
  )

  const handleEmotePlayModeChange = useCallback(
    (value: EmotePlayMode[]) => {
      onBrowse({ emotePlayMode: value })
    },
    [onBrowse]
  )

  function handleCollectionChange(value: string | undefined) {
    const newValue = value ? [value] : []
    onBrowse({ contracts: newValue })
  }

  function handleLandStatusChange(value: LANDFilters) {
    switch (value) {
      case LANDFilters.ALL_LAND:
        onBrowse({ onlyOnSale: undefined, onlyOnRent: undefined })
        break
      case LANDFilters.ONLY_FOR_RENT:
        onBrowse({ onlyOnSale: undefined, onlyOnRent: true })
        break
      case LANDFilters.ONLY_FOR_SALE:
        onBrowse({ onlyOnSale: true, onlyOnRent: undefined })
        break
    }
  }

  const shouldRenderFilter = useCallback(
    (filter: AssetFilter) => {
      // /lands page won't have any category, we fallback to the section, that will be Section.LAND
      const parentSection = category ? getSectionFromCategory(category) : section
      return filtersBySection[parentSection!]?.includes(filter)
    },
    [category, section]
  )

  if (isInLandSection) {
    return (
      <div className="filters-sidebar">
        <LandStatusFilter landStatus={landStatus} onChange={handleLandStatusChange} />
        {isPriceFilterEnabled ? <PriceFilter onChange={handlePriceChange} minPrice={minPrice} maxPrice={maxPrice} values={values} /> : null}
      </div>
    )
  }

  return (
    <Menu className="filters-sidebar">
      {shouldRenderFilter(AssetFilter.Rarity) ? (
        <RarityFilter onChange={handleRarityChange} rarities={rarities} defaultCollapsed={!!defaultCollapsed?.[AssetFilter.Network]} />
      ) : null}
      {isPriceFilterEnabled && shouldRenderFilter(AssetFilter.Price) && isOnSale ? (
        <PriceFilter
          onChange={handlePriceChange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          defaultCollapsed={!!defaultCollapsed?.[AssetFilter.Price]}
          values={values}
        />
      ) : null}
      {shouldRenderFilter(AssetFilter.Collection) ? (
        <CollectionFilter
          onChange={handleCollectionChange}
          collection={collection}
          onlyOnSale={isOnSale}
          defaultCollapsed={!!defaultCollapsed?.[AssetFilter.Collection]}
        />
      ) : null}
      {shouldRenderFilter(AssetFilter.PlayMode) && (
        <EmotePlayModeFilter
          onChange={handleEmotePlayModeChange}
          emotePlayMode={emotePlayMode}
          defaultCollapsed={!!defaultCollapsed?.[AssetFilter.PlayMode]}
        />
      )}
      {shouldRenderFilter(AssetFilter.Network) && !isPrimarySell && (
        <NetworkFilter onChange={handleNetworkChange} network={network} defaultCollapsed={!!defaultCollapsed?.[AssetFilter.Network]} />
      )}
      {shouldRenderFilter(AssetFilter.BodyShape) && (
        <BodyShapeFilter
          onChange={handleBodyShapeChange}
          bodyShapes={bodyShapes}
          defaultCollapsed={!!defaultCollapsed?.[AssetFilter.BodyShape]}
        />
      )}
      {shouldRenderFilter(AssetFilter.More) && (
        <MoreFilters
          category={category}
          isOnSale={isOnSale}
          isOnlySmart={isOnlySmart}
          onSaleChange={handleOnSaleChange}
          onOnlySmartChange={handleOnlySmartChange}
          defaultCollapsed={!!defaultCollapsed?.[AssetFilter.More]}
        />
      )}
    </Menu>
  )
}
