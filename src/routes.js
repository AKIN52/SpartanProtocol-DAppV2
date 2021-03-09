import Dashboard from './components/Dashboard/Dashboard'
import PoolsTable from './views/pages/PoolsTable'
import Icons from './views/pages/Samples/Icons'
import Notifications from './views/pages/Samples/Notifications'
import Buttons from './views/pages/Samples/Buttons'
import Alerts from './views/pages/Samples/Alerts'
import Typography from './views/pages/Samples/Typography'
import Grid from './views/pages/Samples/Grid'
import ReactTables from './views/pages/Samples/ReactTables'
import Forms from './views/pages/Samples/Forms'
import ExtendedForms from './views/pages/Samples/ExtendedForms'
import Panels from './views/pages/Samples/Panels'
import Tiles from './views/pages/Samples/Tiles'
import Utils from './utils/Utils'
import Tabs from './views/pages/Samples/Tabs'
import Liquidity from './views/pages/Pools/Liquidity'

const routes = [
  {
    path: '/home',
    name: 'Home',
    icon: 'icon-medium icon-home icon-dark',
    component: Dashboard,
    layout: '/dapp',
  },

  {
    collapse: true,
    name: 'Pools',
    icon: 'icon-medium icon-info icon-dark',
    state: 'pagesCollapse',
    views: [
      {
        path: '/pools/overview',
        name: 'Overview',
        mini: 'OVIEW',
        component: PoolsTable,
        layout: '/dapp',
      },
      {
        path: '/pools/swap',
        name: 'Swap',
        mini: 'SWAP',
        component: Tiles,
        layout: '/dapp',
      },
      {
        path: '/pools/liquidity',
        name: 'Liquidity',
        mini: 'LIQ',
        component: Liquidity,
        layout: '/dapp',
      },
      {
        path: '/pools/bond',
        name: 'Bond',
        mini: 'BOND',
        component: Tiles,
        layout: '/dapp',
      },
      {
        path: '/pools/positions',
        name: 'Positions',
        mini: 'POS',
        component: Tiles,
        layout: '/dapp',
      },
    ],
  },

  {
    collapse: true,
    name: 'DAO',
    icon: 'icon-medium icon-info icon-dark',
    state: 'pagesCollapse',
    views: [
      {
        path: '/dao/overview',
        name: 'Overview',
        mini: 'OVIEW',
        component: Tiles,
        layout: '/dapp',
      },
      {
        path: '/dao/lockearn',
        name: 'Lock+Earn',
        mini: 'EARN',
        component: Tiles,
        layout: '/dapp',
      },
      {
        path: '/dao/proposals',
        name: 'Proposals',
        mini: 'PROP',
        component: Tiles,
        layout: '/dapp',
      },
    ],
  },

  {
    collapse: true,
    name: 'Components',
    icon: 'icon-medium icon-info icon-dark',
    state: 'pagesCollapse',
    views: [
      {
        path: '/cards',
        name: 'Tiles',
        mini: 'CR',
        component: Tiles,
        layout: '/dapp',
      },
      {
        path: '/buttons',
        name: 'Buttons',
        mini: 'BU',
        component: Buttons,
        layout: '/dapp',
      },
      {
        path: '/notificaions',
        name: 'Notificaions',
        mini: 'NO',
        component: Notifications,
        layout: '/dapp',
      },
      {
        path: '/panels',
        name: 'Panels',
        mini: 'PA',
        component: Panels,
        layout: '/dapp',
      },
      {
        path: '/alerts',
        name: 'Alerts',
        mini: 'AL',
        component: Alerts,
        layout: '/dapp',
      },
      {
        path: '/typography',
        name: 'Typography',
        mini: 'TY',
        component: Typography,
        layout: '/dapp',
      },
      {
        path: '/tables',
        name: 'ReactTables',
        mini: 'TB',
        component: ReactTables,
        layout: '/dapp',
      },
      {
        path: '/forms',
        name: 'Forms',
        mini: 'FO',
        component: Forms,
        layout: '/dapp',
      },
      {
        path: '/input',
        name: 'Input',
        mini: 'FO',
        component: ExtendedForms,
        layout: '/dapp',
      },
      {
        path: '/grid',
        name: 'Grid',
        mini: 'GR',
        component: Grid,
        layout: '/dapp',
      },
      {
        path: '/tabs',
        name: 'Tabs',
        mini: 'TB',
        component: Tabs,
        layout: '/dapp',
      },
      {
        path: '/icons',
        name: 'Icons',
        mini: 'IC',
        component: Icons,
        layout: '/dapp',
      },
      {
        path: '/utils',
        name: 'Utils',
        mini: 'UT',
        component: Utils,
        layout: '/dapp',
      },
    ],
  },
]

export default routes
