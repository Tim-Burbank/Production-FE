// We only need to import the modules necessary for initial render
import {rootPath,chilPath} from '../config'
import {requireAuth} from '../components/authentication/requireAuth'
import LoginRoute from './Login'
import Layout from '../layouts/CoreLayout'
import BillTo from './system_settings/bill_to'
import Approver from './system_settings/approver'
import SendTo from './system_settings/send_to'
import PlacedTo from './system_settings/placed_to'
import Requisition from './personal_center/requisition'
import Client from './system_settings/client'
import PersonaInformation from './personal_center/personal_information'
import Authority from './authority_management'
import ClientPO from './clientPO'
import ClientPoDetails from './clientPO/clientpo_details'
import BillingPlanList from './billing_plan_list'
import InvoiceManagement from './invoice_management'
import InvoiceDetails from './invoice_management/invoice_detail'
import CollectBalance from './collect_balance'
import CollectBalanceDetails from './collect_balance/collect_balance_details'
import VatBalanceDetails from './invoice_management/vat_balance_details'
import CPOInvoice from './clientPO/cpo_invoice'
import VATList from './VAT_list'
import Group from './group_management/group'
import GroupDetails from  './group_management/group/group_detail'
import tier1 from './group_management/tier1'
import tier1Details from  './group_management/tier1/tier1_detail'
import tier2 from './group_management/tier2'

import Product from './system_settings/product'
import ProductInfo from './system_settings/product/product_details'
import Vendor from './system_settings/vendor'
import JrCate from './system_settings/jr_cate'
import VendorDetailEdit from './system_settings/vendor/vendor_detail_edit'
import VendorDetailShow from './system_settings/vendor/vendor_detail_show'
import JRMain from './JR_management/JR'
import JRDetails from './JR_management/JR/JR_details'
import DAF from './JR_management/DAF'
// import DAFDetails from './JR_management/DAF/DAF_details

import DAFDetailEdit from './JR_management/DAF/DAF_detail_edit/'
import DAFDetailShow from './JR_management/DAF/DAF_detail_show/'

import PEMain from './pe/pe'
import PEDetails from './pe/pe/PEInfo'

import VendorPo from "./vendorPo_management/vendor_po"
import VendorPoShow from "./vendorPo_management/vendor_po/vendor_PO_show"
import VendorInvVat from "./vendorPo_management/vendor_inv_vat"
import Payment from "./vendorPo_management/payment"

import JobMain from './pe/Job_completion'
import RaiseInv from './pe/raise_invoice'

console.log('%c',"padding:50px 118px;background:url(http://www.loncus.com/img/logo.png) no-repeat 0 10px;line-height:100px;height:1px")





export const createRoutes = (store) => ({
  path: '/',
  exact: true,
  indexRoute:{
    onEnter: (_, replaceState) => {
      replaceState("/login");//应该跳转到默认的首页
    },
  },
  childRoutes : [
    {
      component:requireAuth(Layout),
      childRoutes:[
        BillTo(store),
        Approver(store),
        SendTo(store),
        PlacedTo(store),
        Requisition(store),
        Client(store),
        PersonaInformation(store),
        Authority(store),
        ClientPO(store),
        ClientPoDetails(store),
        BillingPlanList(store),
        CollectBalance(store),
        CollectBalanceDetails(store),
        InvoiceManagement(store),
        InvoiceDetails(store),
        CPOInvoice(store),
        VatBalanceDetails(store),
        VATList(store),
        Group(store),
        GroupDetails(store),
        tier1(store),
        tier1Details(store),
        tier2(store),
        Vendor(store),
        VendorDetailEdit(store),
        VendorDetailShow(store),
        Product(store),
        ProductInfo(store),
        JrCate(store),
        JRMain(store),
        JRDetails(store),
        DAF(store),
        DAFDetailEdit(store),

        PEMain(store),
        PEDetails(store),
        JobMain(store),
        RaiseInv(store),


        VendorPo(store),
        VendorPoShow(store),
        VendorInvVat(store),
        Payment(store)
      ]
    },
    LoginRoute(store)
  ]
});



/*  Note: childRoutes can be chunked or otherwise loaded programmatically
    using getChildRoutes with the following signature:

    getChildRoutes (location, cb) {
      require.ensure([], (require) => {
        cb(null, [
          // Remove imports!
          require('./Counter').default(store)
        ])
      })
    }

    However, this is not necessary for code-splitting! It simply provides
    an API for async route definitions. Your code splitting should occur
    inside the route `getComponent` function, since it is only invoked
    when the route exists and matches.
*/

export default createRoutes
