/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { InputNumber ,Table,Switch,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip   } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {rootPath,systemStatus,host,titles as _tit ,PE_tableField as _PET} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic,div,mul,add,sub} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { fetchPEMain,newPEMain,raiseInv,completeJob} from '../modules/PE'
const Option = Select.Option;
const Search = Input.Search;




class PEMainPage extends React.Component{
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
      modal:false,
      complete:false,
      raise:false,
      modalLoad:false,
      selectedRowKeys:[]

    }
  }


  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    // this.setState({loading:true});
    let json = {
      limit:9999,
      offset:0
    }
    dispatch(fetchPEMain(json)).then((e)=>{
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
    dispatch(fetchPEMain(values)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
        this.setState({loading:false})
      } else {
        this.setState({
          loading: false,
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
    dispatch(pathJump('/PE_details/'+id))
  }

  handleStatus=(status,id)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchPEMainInfo(id)).then(e=>{
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
    const {dispatch,PEInfo,intl:{formatMessage}} = this.props;
    this.setState({modalTLoad:true})
    let _record = PEInfo.toJS()
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

  PEFlowStatus=()=>{
    const {intl:{formatMessage}} = this.props;
    let arr = Object.keys(systemStatus)
    let re = []
    arr.map(v=>{
      let obj = {}
      obj.text = formatMessage({id:v})
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

    dispatch(fetchPEMain(json)).then((e)=>{
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
    dispatch(fetchPEMain()).then((e)=>{
      if(e.error){
        message.error(e.error.message);
      }else{
        this.setState({
          loading: false,
        })
      }
    });
  }


  changeData=(i,type,record,v)=> {
    if(!record) return
    const {PE} = this.props;
    let _data = this.state.selectedRows.slice(0)
    _data[i][type] = v.target ? v.target.value : v
    console.log('llllll',v)
    if(v){
      if(this.state.raise){
        let obj
        PE.map(v=>{
          if(record.id===v.get('id')){
            obj = v.toJS()
          }
        })
        console.log('ksksksk',obj)
        let peG = div(obj['gross'],100)
        let peN = div(obj['net'],100)
        let peT = div(obj['tax'],100)
        console.log('kkkkk', _data)
        if(type==='gross'){
          if(_data[i][type]&&_data[i][type]!==0){
            let ratio = div(_data[i][type],peG)
            console.log('ratio',ratio)
            _data[i]['net'] = mul(peN,ratio).toFixed(4)
            _data[i]['tax'] = mul(peT,ratio).toFixed(4)
            _data[i]['raisePercentage'] = mul(ratio,100).toFixed(4)
          }
        }
      }else{
        _data[i][type] = v.target ? v.target.value : v
      }

      console.log('000000',_data)

      this.setState({selectedRows: _data})
    }else{
      _data[i][type] = ''
      console.log('jjjj', _data)
      this.setState({selectedRows: _data})
    }
  }

  fileChange = (state,index,info)=> {
    if (info.file.status !== 'uploading') {
      //console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      //console.log('upinfo',info)
      message.success(`${info.file.name} file uploaded successfully`,1);
      let _data = this.state.selectedRows.slice(0)
      _data[index][state] = info.file.response.obj
      this.setState({selectedRows:_data})
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`,1);
    }
  }

  submitInv=(i)=>{
    const {dispatch} = this.props
    let obj = Object.assign({},this.state.selectedRows[i])
    if(this.state.raise){
      const item = this.state.selectedRows[i]
      const reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
      if(!item.gross) return message.warn('Please input gross')
      if(!item.raisePercentage) return message.warn('Please input percentage')
      if(!item.net) return message.warn('Please input net')
      if(!item.tax) return message.warn('Please input tax')
      if(!item.emailPath) return message.warn('Please upload Client Email')

      if(!reg.test(item.net)) return message.warn('Please check net,should be positive and two decimal places')

      obj.PEId = obj.id
      obj.percentage = div(obj.raisePercentage,100)
      obj.gross = mul(obj.gross,100)
      obj.net = mul(obj.net,100)
      obj.tax = mul(obj.tax,100)
      this.setState({modalLoad: true})

      dispatch(raiseInv(obj)).then((e)=>{
        if(e.error){
          message.error(e.error.message);
          this.setState({modalLoad: false})
        }else{
          this.setState({modalLoad: false,modal:false,selectedRowKeys:[]})
          message.success('Operation Success')
          this.setState({loading:true})
          dispatch(fetchPEMain()).then((e)=>{
            if(e.error){
              message.error(e.error.message);
            }else{
              this.setState({
                loading: false,
              })
            }
          });
        }
      });
    }else{
      let json = {
        PEId:this.state.selectedRows[i]['id'],
        remark:this.state.selectedRows[i]['remark']
      }
      dispatch(completeJob(json)).then((e)=>{
        if(e.error){
          message.error(e.error.message);
          this.setState({modalLoad: false})
        }else{
          this.setState({modalLoad: false,modal:false,selectedRowKeys:[]})
          message.success('Operation Success')
          this.setState({loading:true})
          dispatch(fetchPEMain()).then((e)=>{
            if(e.error){
              message.error(e.error.message);
            }else{
              this.setState({
                loading: false,
              })
            }
          });
        }
      });
    }

  }

  formatM=(currency,value)=>{
    if(value){
      let parts = value.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      if(parts[1]){
        parts[1] = parts[1].substring(0,2)
      }
      console.log('ppp',parts)
      return `${currency==='CNY'?'￥':'$'} ${parts.join(".")}`;
    }else{
      return `${currency==='CNY'?'￥':'$'} 0`;
    }
  }


  render(){
    const {intl:{formatMessage},location:{pathname},count,PE,PEInfo} = this.props;
    const { selectedRowKeys,selectedRows,raise,complete,searchText4,expandTable,searchText1,searchText2,searchText3,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage} = this.state
    //console.log('state',this.state)
    let { filteredInfo } = this.state;
    filteredInfo = filteredInfo || {};

    const columns = [
      {dataIndex:_PET.status,render:(text,record)=><Link to={{pathname:`/PE_details/${record&&record.id}`}}>{formatMessage({id:`PE_${text}`})}</Link>},
      {dataIndex:_PET.peCode},
      {dataIndex:_PET.description,render: (text, record) => (
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>),width: 150},
      {dataIndex:_PET.client,render:(text,record)=>record.clientDetail.nameEN},
      {dataIndex:_PET.product,render:(text,record)=>record.productName[0]},
      {dataIndex:_PET.cpo},
      {dataIndex:_PET.gad},
      {dataIndex:_PET.contact},
      {dataIndex:_PET.currency},
      {dataIndex:_PET.net,className:'column-money',render:money=>formatMoney(div(money,100)||0)},
      {dataIndex:_PET.tax,className:'column-money',render:money=>formatMoney(div(money,100)||0)},
      {dataIndex:_PET.gross,className:'column-money',render:money=>formatMoney(div(money,100)||0)},
      {dataIndex:_PET.percentage,className:'column-money',render:text=><span>{text?mul(text,100):0}%</span>},
      {dataIndex:_PET.ar,className:'column-money',render:money=>money&&formatMoney(div(money,100)||0)},
      {dataIndex:_PET.ap,className:'column-money',render:money=>money&&formatMoney(div(money,100)||0)},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`PEDetail_${item.dataIndex}`}),
      })
    );



    const columns_modal = [
      {dataIndex:_PET.operation,render:(text,record,index)=><Button type='primary' onClick={this.submitInv.bind(this,index)}>Submit</Button>},
      {dataIndex:_PET.peCode,width: 100},
      {dataIndex:_PET.description},
      {dataIndex:_PET.currency,width: 100},
      {dataIndex:_PET.percentage,width:150,className:'column-money',render:(data,record,i)=><span>
        <InputNumber
          min={0}
          max={100}
          value={data}
          style={{width:70}}
          onChange={this.changeData.bind(this,i,'raisePercentage',record)}
        /> %
      </span>},
      {dataIndex:_PET.net,className:'column-money',render:(money,record,i)=><InputNumber
        value={money}
        style={{width:150}}
        formatter={this.formatM.bind(this,record.currencyId)}
        parser={value => record.currencyId==='CNY'?value.replace(/\￥\s?|(,*)/g, ''):value.replace(/\$\s?|(,*)/g, '')}
        onChange={this.changeData.bind(this,i,'net',record)}
      />},
      {dataIndex:_PET.tax,className:'column-money',render:(money,record,i)=><InputNumber
        value={money}
        style={{width:150}}
        formatter={this.formatM.bind(this,record.currencyId)}
        parser={value => record.currencyId==='CNY'?value.replace(/\￥\s?|(,*)/g, ''):value.replace(/\$\s?|(,*)/g, '')}
        onChange={this.changeData.bind(this,i,'tax',record)} />},
      {dataIndex:_PET.gross,className:'column-money',render:(money,record,i)=><InputNumber
        value={money}
        style={{width:150}}
        formatter={this.formatM.bind(this,record.currencyId)}
        parser={value => record.currencyId==='CNY'?value.replace(/\￥\s?|(,*)/g, ''):value.replace(/\$\s?|(,*)/g, '')}
        onChange={this.changeData.bind(this,i,'gross',record)} />},
      {dataIndex:_PET.emailPath,render:(text,record,index)=><Upload
        name='photo'
        action={`${host}/common/upload?target=PE&name=${record.id}`}
        onChange={this.fileChange.bind(this,'emailPath',index)}
        showUploadList={false}
      >
        <Button>
          <Icon type="upload" /> Click to Upload
        </Button>
      </Upload>},
      {dataIndex:_PET.remark,render:(data,record,i)=><Input value={data} style={{width:100}} onChange={this.changeData.bind(this,i,'remark',record)} />}

    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`PEDetail_${item.dataIndex}`}),
      })
    );


    const columns_job = [
      {dataIndex:_PET.operation,render:(text,record,index)=><Button type='primary' onClick={this.submitInv.bind(this,index)}>Submit</Button>},
      {dataIndex:_PET.peCode,width: 100},
      {dataIndex:_PET.description},
      {dataIndex:_PET.currency,width: 100},
      {dataIndex:_PET.net,className:'column-money',render:(money,record,i)=>formatMoney(money)},
      {dataIndex:_PET.ar,className:'column-money',render:(money,record,i)=>formatMoney(money)},
      {dataIndex:_PET.ap,className:'column-money',render:(money,record,i)=>formatMoney(money)},
      {dataIndex:_PET.remark,render:(data,record,i)=><Input value={data} style={{width:100}} onChange={this.changeData.bind(this,i,'remark',record)} />}

    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`PEDetail_${item.dataIndex}`}),
      })
    );

      const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
          this.setState({ selectedRowKeys });
          let _selectedRows = []
          if(selectedRows.length>0){
            selectedRows.map(v=>{
              v.raisePercentage = v.raisePercentage?mul(sub(1,v.raisePercentage),100):0
              v.gross = div(v.gross,100)
              v.net = div(v.net,100)
              v.tax = div(v.tax,100)
              _selectedRows.push(v)
            })
          }
          this.setState({selectedRows:_selectedRows})
        },
        onSelect: (record, selected, selectedRows) => {
          console.log(record, selected, selectedRows);
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          console.log(selected, selectedRows, changeRows);
        },
      };


    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.PE}`})} />
        <Row style={{marginTop:61}}>
          <Row type='flex' justify='start' style={{marginBottom:15}}>
            <Button type='primary' size='large' onClick={()=>this.setState({modal:true,raise:true})}>{formatMessage({id:'raiseInv'})}</Button>
            <Button type='primary' size='large' onClick={()=>this.setState({modal:true,complete:true})} style={{marginLeft:15}}>{formatMessage({id:'doneJob'})}</Button>
          </Row>
          <Table
            loading={loading}
            columns={columns}
            rowSelection={rowSelection}
            dataSource={PE&&PE.toJS()}
            rowKey={record =>record.id}
            pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
            onChange={this.changeTable}
            scroll={{x:1700}}
            bordered
            size='small'
            rowClassName={(record,index)=>index%2===0?'row-a':'row-b'}
          />
        </Row>
        <Modal
          visible={modal}
          // onCancel={()=>this.setState({modal:false,raise:false,complete:false})}
          title={raise?'Raise Invoice':'Job Completion Form'}
          // onOk={this.handleModal}
          maskClosable={false}
          width={1200}
          footer={<Button onClick={()=>this.setState({modal:false,raise:false,complete:false,selectedRowKeys:[]})}>Back</Button>}
        >
            <Row>
              <Table
                loading={modalLoad}
                columns={raise?columns_modal:columns_job}
                dataSource={selectedRows}
                rowKey={record =>record.id}
                bordered
                size='small'
                pagination={false}
                scroll={{x:1500}}
              />
            </Row>
        </Modal>
      </Row>
    )
  }
}




PEMainPage.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => ({
  PE : state.getIn(['PE','PE']),
  count : state.getIn(['PE','count']),
  PEInfo: state.getIn(['PE','PEInfo']),
});

export default injectIntl(connect(mapStateToProps)(PEMainPage))


//const WrappedSystemUser = Form.create()();



