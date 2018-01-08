import React from 'react'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { IndexLink, Link } from 'react-router'
import { Menu, Icon ,message ,Badge } from 'antd'
import { pathJump } from '../../utils/'
import { logout ,getLogNum } from '../../store/user'
import Immutable from 'immutable'
import './Nav.scss'
const SubMenu = Menu.SubMenu;

class Side extends React.Component {
  // rootSubmenuKeys = ['group_management', 'JR_management', 'PE_management','vendorPo_management','system_settings','personal_center'];
  // state = {
  //   openKeys: [],
  // };

  componentDidMount(){
  }
  componentWillUnmount(){
  }

  // onOpenChange = (openKeys) => {
  //   const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
  //   if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
  //     this.setState({ openKeys });
  //   } else {
  //     this.setState({
  //       openKeys: latestOpenKey ? [latestOpenKey] : [],
  //     });
  //   }
  // }

  render() {
    const props=this.props;
    const {intl:{formatMessage},location:{pathname},user,userInfo,collapsed}=props;
    console.log('user',user,userInfo,props)
    const nav = [
      {
        key: 'client_po',
        name: formatMessage({id: 'client_po'}),
        icon: 'file',
        show:true,
      },
      {
        key: 'billing_plan_list',
        name: formatMessage({id: 'billing_plan_list'}),
        icon: 'book',
        show:true,
      },
      {
        key: 'invoice_management',
        name: formatMessage({id: 'invoice_management'}),
        icon: 'copy',
        show:true,
      },
      {
        key: 'VAT_list',
        name: formatMessage({id: 'VAT_list'}),
        icon: 'save',
        show:true,
      },
      {
        key: 'collect_balance',
        name: formatMessage({id: 'collect_balance'}),
        icon: 'pay-circle-o',
        show:true,
      },
      {
        key: 'group_management',
        name: formatMessage({id: 'group_management'}),
        icon: 'usergroup-add',
        show:true,
        type:'sub',
        child:[{
          key: 'group',
          name: formatMessage({id: 'group'}),
          show:true,
        },
          {
            key: 'tier_1',
            name: formatMessage({id: 'tier_1'}),
            show:true,
          },
          // {
          //   key: 'tier_4',
          //   name: formatMessage({id: 'tier_4'}),
          //   show:true,
          // }
        ]
      },
      {
        key: 'JR_management',
        name: formatMessage({id: 'JR_management'}),
        icon: 'paper-clip',
        show:true,
        type:'sub',
        child:[{
          key: 'JR',
          name: formatMessage({id: 'JR'}),
          show:true,
        },
          {
            key: 'DAF',
            name: formatMessage({id: 'DAF'}),
            show:true,
          },
        ]
      },
      {
        key: 'PE_management',
        name: formatMessage({id: 'PE'}),
        icon: 'form',
        show: true,
        type: 'sub',
        child: [
          {
          key: 'PE',
          name: formatMessage({id: 'PE'}),
          show: true,
        },
          {
            key: 'jobCompletion',
            name: formatMessage({id: 'jobCompletion'}),
            show: true,
          },
          {
            key: 'raiseInv',
            name: formatMessage({id: 'raiseInv'}),
            show: true,
          }
        ],
      },

          {
          key: 'vendorPo_management',
          name: formatMessage({id: 'vendorPo_management'}),
          icon: 'exception',
          show:true,
          type:'sub',
          child:[{
          key: 'vendor_po',
          name: formatMessage({id: 'vendor_po'}),
          show:true,
        },
          {
            key: 'vendor_inv_vat',
            name: formatMessage({id: 'vendor_inv_vat'}),
            show:true,
          },
          {
            key: 'payment',
            name: formatMessage({id: 'payment'}),
            show:true,
          },
        ]
      },
      {
        key: 'system_settings',
        name: formatMessage({id: 'system_settings'}),
        icon: 'appstore-o',
        show:true,
        type:'sub',
        child:[{
          key: 'client',
          name: formatMessage({id: 'client'}),
          show:true,
        },
          {
            key: 'bill_to',
            name: formatMessage({id: 'bill_to'}),
            show:true,
          },
          {
            key: 'approver',
            name: formatMessage({id: 'approver'}),
            show:true,
          },
          {
            key: 'send_to',
            name: formatMessage({id: 'send_to'}),
            show:true,
          },
          {
            key: 'placed_to',
            name: formatMessage({id: 'placed_to'}),
            show:true,
          },
          {
            key: 'vendor',
            name: formatMessage({id: 'vendor'}),
            show:true,
          },
          {
            key: 'product',
            name: formatMessage({id: 'product'}),
            show:true,
          },
          {
            key: 'jr_cate',
            name: formatMessage({id: 'jr_cate'}),
            show: true,
          }

        ]
      },
      {
        key: 'personal_center',
        name: formatMessage({id: 'personal_center'}),
        icon: 'solution',
        show:true,
        type:'sub',
        child:[{
          key: 'requisition',
          name: formatMessage({id: 'requisition'}),
          show:true,
        },
          {
            key: 'personal_information',
            name: formatMessage({id: 'personal_information'}),
            show:true,
          },

        ]
      },
      {
        key: 'authority_management',
        name: formatMessage({id: 'authority_management'}),
        icon: 'link',
        show:true,
      }

    ];

    const getSubKey = (pathname) => {
      ////console.log('pathname',pathname)
      let key = pathname.replace(/(^\/)+|\/.*/g, '')
      let sub = [],subkey
      nav.forEach(item => {
        if (item.show && item.type === 'sub') {
          sub.push(item)
        }
      })
      sub.forEach(item => {
        let iskey = false
        item.child.forEach(child => {
          if (child.key === key) {
            iskey = true
          }
        })
        iskey&&(subkey = item.key)
      })
      return subkey
    }

    //let _user = user.toJS()
    //let checkNavDisplay=navList=>{
    //  return navList.map(nav=>{
    //
    //    let hasScope=false;
    //    let _userRole = [];
    //    if(_user.roles){
    //      _user.roles.map(v=>{
    //        _userRole.push(v.id)
    //      })
    //    }
    //    //console.log(_userRole)
    //    //查看权限
    //    if(nav.role && Array.isArray(nav.role)){
    //      for(let k of _userRole){
    //        hasScope= nav.role.indexOf(k)>-1
    //        if(hasScope) break
    //      }
    //    }
    //
    //
    //    //console.log(hasScope)
    //    //设置show
    //    nav.show!==false?nav.show=true:nav.show=false;
    //    if(!hasScope) {
    //      nav.show = false;
    //    }
    //
    //    return nav;
    //  });
    //
    //};
    //let nav = _nav.slice(0)
    //if(_user.roles){
    //  nav = checkNavDisplay(_nav)
    //}
    return (
      <Menu
        theme='dark'
        // openKeys={this.state.openKeys}
        // onOpenChange={this.onOpenChange}
        mode="inline"
        selectedKeys={[pathname.replace(/(^\/)+|\/.*/g,'')]}
        defaultSelectedKeys={['bill_to']}
        //defaultOpenKeys={collapsed===false?[getSubKey(pathname)]:[]}
        onClick={e=>{
          if(e.key==='login'){
            props.dispatch(logout()).then(result=>{
              if(result.error){
                message.error(result.error.message)
              }else{
                props.pathJump('/'+e.key)
              }
            })
          }else if(e.key==='username'){
          if(user){
             props.pathJump('personal_information')
          }
          }else{
            props.pathJump('/'+e.key)
          }
        }}
      >
        {
          nav.map(item => {
            return item.type==='sub'?<SubMenu
              key={item.key}
              title={<span><Icon type={item.icon} /><span className="nav-text">{item.name}</span></span>}
              style={{display:item.show?'block':'none'}}>
              {item.child&&item.child.map(v =>(
                  <Menu.Item
                  key={v.key}
                  style={{display:v.show?'block':'none'}}
                >{v.name}
                </Menu.Item>))
              }
            </SubMenu>: <Menu.Item
                key={item.key}
                style={{display:item.show?'block':'none'}}
              >
              <Icon type={item.icon} />
              <span className='nav-text'>{item.name}</span>
              </Menu.Item>
          })
        }
        <Menu className="divider" />
        <Menu.Item key='username'>
          <div >
                <span>
                  <Icon type="user" />
                  {userInfo&&<span  className="nav-text">{userInfo.get('id')}</span>}
                </span>
          </div>
          </Menu.Item>
        <Menu.Item key='login'>
            <span>
              <Icon type='poweroff' />
              <span className='logout'>Sign out</span>
            </span>
        </Menu.Item>
      </Menu>
    )
  }
}


  const mapStateToProps = (state) => ({
  location:state.get('routing').locationBeforeTransitions,
  user : state.get('user'),
  userInfo:state.getIn(['userInfo','userLoginInfo'])
})

  const mapDispatchToProps =dispatch=>({
  dispatch,
  pathJump:(path)=>dispatch(pathJump(path))
});
  export default connect(mapStateToProps,mapDispatchToProps)(injectIntl(Side))

