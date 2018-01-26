/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Switch,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip   } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {rootPath,JRStatus,host,titles as _tit ,JR_tableField as _JRT} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { fetchJRMain,newJRMain} from '../modules/JR'
const Option = Select.Option;
const Search = Input.Search;





class JRMainPage extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      search1: false,
      search2: false,
      search3: false,
      search4: false,
      loading : false,
      searchText1: '',
      searchText2: '',
      searchText3: '',
      searchText4: '',
      filtered: false,
      filteredInfo: null,
      expandTable:false,

    }
  }


  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:true});
    let json = {
      limit:9999,
      offset:0
    }
    dispatch(fetchJRMain(json)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
      }else{
        this.setState({
          loading: false,
        })
      }
    });
  }

  onFetch = (values,limit,offset,cur=1,p) =>{
    this.setState({ loading:true,currentPage:cur });
    const { dispatch } = this.props;
    values={
      ...values,
      limit:limit,
      offset:offset
    };
    dispatch(fetchJRMain(values)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
        this.setState({loading:false})
      } else {
        //判断从哪里发起的请求
        let count = 0
        if (!p) {
          count = e.payload.objs.length || 0
        } else {
          count =e.payload.count
        }
        this.setState({
          loading: false,
          count:count,
        })
      }
    });
  };


  changeTable = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      // sortedInfo: sorter,
    });
  }
  handleModal=()=>{


    
    const {dispatch,params,intl:{formatMessage}} = this.props;
    this.form.validateFields((err, values) => {
      if (!err) {
        //console.log('receive form value',values)
        this.setState({modalLoad:true})
        //console.log('value',values)
        if(this.state.itemId == null){
          this.form.resetFields()
          values = {
            ...values,
            logo:values["logo"].file.response.obj
          }
          dispatch(newPlacedTo(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.setState({modalLoad:false,modal:false,itemId:null,slideList:[]})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }else{
          values = {
            ...values,
            logo:values["logo"].file.response.obj
          }
          dispatch(altPlacedTo(this.state.itemId,values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.setState({modalLoad:false,modal:false,itemId:null,currentPage:1,slideList:[]})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }
      }
    });
  };



  billDetails=(id,e)=>{
    const {dispatch} = this.props;
    console.log('-----',id)
    dispatch(pathJump('/JR_details/'+id))
  }

  handleStatus=(status,id)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchJRMainInfo(id)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        let _Arr=[];
        _Arr.push({
          uid: e.payload.logo,
          status: 'done',
          percent: 100,
          url: e.payload.logo,
        });
        this.setState({slideList:_Arr})
        this.setState({itemId:id,status:status===1,modal_t:true})
        this.setState({loading:false})
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }


  handleModal_t=()=>{
    const {dispatch,JRInfo,intl:{formatMessage}} = this.props;
    this.setState({modalTLoad:true})
    let _record = JRInfo.toJS()
    let action =_record.status===1?'disable':'enable'
    let json = {
      ..._record,
      status:_record.status===1?0:1
    }
    dispatch(altPlacedTo(action,this.state.itemId,json)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        this.setState({itemId:null,modal_t:false,currentPage:1})
        this.setState({modalTLoad:false})
        message.success(_record.status===1?formatMessage({id:'abandonSuccess'}):formatMessage({id:'enabledSuccess'}))
      }else{
        this.setState({modalTLoad:false})
        message.error(e.error.message)
      }
    })
  };

  beforeUpload=(file)=> {
    const isJPG = file.type === 'image/jpeg'||file.type ==='image/png';
    if (!isJPG) {
      message.error('You can only upload JPG or PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      message.error('Image must smaller than 5MB!');
    }
    return isJPG && isLt2M;
  }

  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  JRFlowStatus=()=>{
    const {intl:{formatMessage}} = this.props;
    let arr = Object.keys(JRStatus)
    let re = []
    arr.map(v=>{
      let obj = {}
      obj.text = formatMessage({id:`JR_${v}`})
      obj.value = v
      re.push(obj)
    })
    return re
  }

  //handleSlideChange = (file) =>{
  //  //console.log(file)
  //  file.fileList.map(v=>{
  //    if(v.status=='done'){
  //      if(v.response){
  //        this.setState({slideList:v.response.Location})
  //      }
  //    }
  //  });
  //  this.setState({slideList:file.fileList})
  //};


  onSearch=(state,e)=>{
    const {dispatch} = this.props;
    let json = {
      //[key]:this.state[value],
      id_like:this.state.searchText1,
      'clientDetail.clientId':this.state.searchText2,
      'product.productDetail.name_like':this.state.searchText3,
      'project.clientPoId_like':this.state.searchText4
    }

    this.setState({loading:true,
      [state]: false,
    })

    dispatch(fetchJRMain(json)).then((e)=>{
      if(e.error){
        this.setState({loading:false})
        message.error(e.error.message);
      }else{
        this.setState({
          loading: false,

        })
      }
    });

  }


  onInputChange = (key,e) => {
    this.setState({ [key]: e.target.value });
  }


  getcontent=()=>{
    const {intl:{formatMessage}} = this.props
    return (
      <Col>
        <Button onClick={()=>{this.setState({modal:true,itemId:null})}} type='primary'>{formatMessage({id:'new_btn'})}</Button>
      </Col>
    )
  };

  clearFilters = () => {
    const {dispatch} = this.props;
    this.setState({ filteredInfo: null,searchText1:'',searchText2:'',searchText3:'',searchText4:'',loading:true });
    dispatch(fetchJRMain()).then((e)=>{
      if(e.error){
        message.error(e.error.message);
      }else{
        this.setState({
          loading: false,
        })
      }
    });
  }

  render(){
    const {intl:{formatMessage},location:{pathname},count,JR,JRInfo} = this.props;
    const { searchText4,expandTable,searchText1,searchText2,searchText3,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage} = this.state
    //console.log('state',this.state)
    let {  filteredInfo } = this.state;
    console.log('0000000',JR&&JR.toJS())
    filteredInfo = filteredInfo || Immutable.fromJS({});

    const columns = [
      {dataIndex:_JRT.createdUsr,width:150},
      {dataIndex:_JRT.flowStatus,
        render:text => <span>{formatMessage({id:`JR_${text}`})}</span>,
        filters: this.JRFlowStatus(),
        onFilter: (value, record) => record.get('flowStatus').indexOf(value) === 0,
        filteredValue: filteredInfo.flowStatus || null,
      },



      {
        dataIndex: _JRT.id,
        render: (text,record) => <a onClick={this.billDetails.bind(this, record.get('id'))}>{text}</a>,
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => this.searchInput1 = ele}
              placeholder="Search name"
              value={searchText1}
              onChange={this.onInputChange.bind(this,'searchText1')}
              onPressEnter={this.onSearch.bind(this,'search1')}
            />
            <Button type="primary" onClick={this.onSearch.bind(this,'search1')}>Search</Button>
          </div>
        ),
        filterIcon: <Icon type="search" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />,
        filterDropdownVisible: this.state.search1,
        onFilterDropdownVisibleChange: (visible) => {
          this.setState({
            search1: visible,
          }, () => this.searchInput1.focus());
        },
      },
      {dataIndex:_JRT.description_JR,render:(text,record)=>record.get('description'),},

      {dataIndex:_JRT.clientDetailId,render:(text,record)=>record.getIn(['clientDetail','clientId']),
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => this.searchInput2 = ele}
              placeholder="Search Client"
              value={searchText2}
              onChange={this.onInputChange.bind(this,'searchText2')}
              onPressEnter={this.onSearch.bind(this,'search2')}
            />
            <Button type="primary" onClick={this.onSearch.bind(this,'search2')}>Search</Button>
          </div>
        ),

        filterIcon: <Icon type="search" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />,
        filterDropdownVisible: this.state.search2,
        onFilterDropdownVisibleChange: (visible) => {
          this.setState({
            search2: visible,
          }, () => this.searchInput2.focus());
        },
      },

      {dataIndex:_JRT.productId,render:(text,record)=>record.getIn(['product','name']),
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => this.searchInput3 = ele}
              placeholder="Search Product"
              value={searchText3}
              onChange={this.onInputChange.bind(this,'searchText3')}
              onPressEnter={this.onSearch.bind(this,'search3')}
            />
            <Button type="primary" onClick={this.onSearch.bind(this,'search3')}>Search</Button>
          </div>
        ),
        filterIcon: <Icon type="search" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />,
        filterDropdownVisible: this.state.search3,
        onFilterDropdownVisibleChange: (visible) => {
          this.setState({
            search3: visible,
          }, () => this.searchInput3.focus());
        },},
      {dataIndex:_JRT.clientPoId,render:(text,record)=>record.getIn(['project','clientPoId']),
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => this.searchInput4 = ele}
              placeholder="Search CPO"
              value={searchText4}
              onChange={this.onInputChange.bind(this,'searchText4')}
              onPressEnter={this.onSearch.bind(this,'search4')}
            />
            <Button type="primary" onClick={this.onSearch.bind(this,'search4')}>Search</Button>
          </div>
        ),

        filterIcon: <Icon type="search" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />,
        filterDropdownVisible: this.state.search4,
        onFilterDropdownVisibleChange: (visible) => {
          this.setState({
            search4: visible,
          }, () => this.searchInput4.focus());
        },},
      {dataIndex:_JRT.projectDesc,render:(text,record)=>record.getIn(['project','description']),},
      {dataIndex:_JRT.currencyId,
        filters: [{text:'CNY',value:'CNY'},{text:'USD',value:'USD'}],
        onFilter: (value, record) => record.get('currencyId').indexOf(value) === 0,
        filteredValue: filteredInfo.currencyId || null,},
      {dataIndex:_JRT.net,render:text=>formatMoney(text),className:'column-money'},
      {dataIndex:_JRT.tax,render:text=>formatMoney(text),className:'column-money'},
      {dataIndex:_JRT.gross,render:text=>formatMoney(text),className:'column-money'},

    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`JRDetail_${item.dataIndex}`}),
      })
    );

    const addColumn = [
      ...columns,
      {dataIndex:_JRT.purchaseType,},
      {dataIndex:_JRT.DAFs,},
      {dataIndex:_JRT.vendor_s,render:(text,record)=>record.getIn(['JR_VendorDetails',0,'vendorDetailId'])},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`JRDetail_${item.dataIndex}`}),
      })
    );




    const renderForm=(v,column)=>{
      //console.log('form',v)
      if(v === undefined || v==='') return

      if(column.trans){
        return column.trans(v,column.config)
      }else if(column.format){
        return column.format(v).map((t,i)=>(
          <Row key={i} >
            {t}
          </Row>

        ))
      }else if(column.render){
        return column.render(v)
      }else{
        return v
      }
    }


    const rightContent = <Row type='flex' justify='start'  className='title_btn' style={{position:'absolute',right:'17%',top:'11px'}}>
      <p style={{marginRight:5,color:'white',lineHeight:'31px'}}>{formatMessage({id:'moreAttr_btn'})}</p>
      <Switch style={{marginTop:5}}
              defaultChecked={false}
              checked={expandTable}
              checkedChildren={<Icon type="check" />}
              unCheckedChildren={<Icon type="cross" />}
              onChange={(checked)=>{this.setState({expandTable:checked})}}
      />


      <Button onClick={()=>{
        const {dispatch} = this.props;
        dispatch(pathJump(rootPath.JR_details+'/new'))
      }} style={{marginBottom:10,backgroundColor:'#00c1de',color:"#fff",border:0,marginLeft:10}} >{formatMessage({id:'new_btn'})}</Button>
      <Button onClick={this.clearFilters}>Clear filters</Button>
    </Row>

    return (
      <Row>
        <Title rightContent={rightContent} title={formatMessage({id:`${_tit.JR}`})} />
        <Row style={{marginTop:61,height:'90vh'}}>

          <ImmutableTable
            loading={loading}
            columns={expandTable?addColumn:columns}
            dataSource={JR}
            rowKey={record =>record.get("id")}
            pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
            onChange={this.changeTable}
            // scroll={{x:1600}}
          />


        </Row>
      </Row>
    )
  }
}




JRMainPage.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => ({
  JR : state.getIn(['JR','JR']),
  count : state.getIn(['JR','count']),
  JRInfo: state.getIn(['JR','JRInfo']),
});

export default injectIntl(connect(mapStateToProps)(JRMainPage))


//const WrappedSystemUser = Form.create()();



