import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ArrowsClockwise, CreditCard, Leaf, LinkSimple, LockKey, Receipt, User } from '@phosphor-icons/react/dist/ssr';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
// import { BellGear as BellGearIcon } from '@phosphor-icons/react/dist/ssr/BellGear';
import { SlidersHorizontal as SlidersHorizontalIcon } from '@phosphor-icons/react/dist/ssr/SlidersHorizontal';
import { Swap as SwapIcon } from '@phosphor-icons/react/dist/ssr/Swap';
// import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UserPlus } from '@phosphor-icons/react/dist/ssr/UserPlus';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': LockKey,
  'plugs-connected': ArrowsClockwise,
  'x-square': XSquare,
  user: User,
  users: UsersIcon,
  currency: CurrencyDollarIcon,
  history: ClockIcon,
  paperless: Leaf,
  credit: CreditCard,
  receipt: Receipt,
  swap: SwapIcon,
  'notification-settings': BellIcon,
  'link-account': LinkSimple,
} as Record<string, Icon>;
