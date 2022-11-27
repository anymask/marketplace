import classNames from 'classnames'
import { Badge } from 'decentraland-ui/dist/components/Badge/Badge'
// TODO: Extract other imports
import { Color, Icon } from 'decentraland-ui'
import styles from './ListedBadge.module.css'

type Props = {
  className?: string
}

const ListedBadge = ({ className }: Props) => (
  <Badge
    className={classNames(styles.badge, className)}
    color={Color.SUMMER_RED}
  >
    <Icon className={styles.icon} name="tag" />
  </Badge>
)

export default ListedBadge
