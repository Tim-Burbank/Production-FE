import React from 'react'
import {Form,Input,Col,Button,Icon,Switch,Tabs,Row,Upload,DatePicker,Radio,message} from 'antd'
import {
  host,
  titles as _tit,
  vendorDetail_tableField as _venDeT,
  venDetail_type as _clientPOType,
  currency as _cur,
  vendorTypeArr
} from "../../../../../../config";
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
import Immutable from "immutable";
import moment from "moment";
import './VisitForm_.scss'

class VisitForm extends React.PureComponent{
  constructor(props){
    super(props)
    this.state={
      isVisit:"N",
      isConflict:"N",
      fileList:[],
      values:Immutable.fromJS({})
    }
  }
  static defaultProps={
    labelCol:{span:4},
    wrapperCol:{span:14}
  }

  componentWillMount(){
    const {values} = this.state
    const {initial}  = this.props
  }


  componentDidMount(){
    const {values} = this.state
    console.log(31,values,values&&values.toJS())
    this.props.form.setFieldsValue(values.toJS())
  }

  componentWillReceiveProps(nextProps){
    // console.log("收到数据",nextProps,nextProps.initial,nextProps.initial&&nextProps.initial.toJS())
    if(nextProps.initial!==this.props.initial){
      console.log("收到数据",nextProps.initial.toJS())
      let values_ = nextProps.initial.toJS()
      let fileList =[]
      if(values_.visitFilePath){
        fileList.push({
          uid: 1,
          name: values_.visitFilePath,
          status:"done",
          response:{
            obj:values_.visitFilePath,
            status:"success"
          }
        })
        localStorage.setItem("visitFilePath",values_.visitFilePath)
        console.log(fileList)
        this.setState({
          fileList
        })
      }
      this.setState({
        values:nextProps.initial,
      })
      if(values_.isVisit&&values_.isConflict){
        localStorage.setItem("isVisit",values_.isVisit)
        localStorage.setItem("isConflict",values_.isConflict)
        this.setState({
          isVisit:values_.isVisit,
          isConflict:values_.isConflict,
        })
      }
      // this.props.form.setFieldsValue(nextProps.initial.toJS())
    }
  }
  componentDidUpdate(preProps,preState){
    const {values} = this.state
    console.log(53,this.state.values.toJS())
    if(preState.values !==this.state.values){
      let values_ = values.toJS()
      values_.visitDate = moment(values_.visitDate)
      this.props.form.setFieldsValue(values_)
    }
  }

  fileChange = (state, info) => {
    console.log(state,info)
    const {values} = this.state
    if (info.file.status !== "uploading") {
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`, 1);
      let _values = values.toJS()
      _values[state] = info.file.response.obj;
      localStorage.setItem("visitFilePath",_values[state])
      this.setState({
        values:Immutable.fromJS(_values),
      });
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`, 1);
    }
    let fileList = info.fileList.slice(-1)
    //写入到localStorage
    this.setState({
      fileList
    })
  };

  openPSD = v => {
    window.open(v);
  };


  render(){
    const {columns,form:{getFieldDecorator,getFieldValue},labelCol,wrapperCol,layout,colSpan,stepArr}=this.props;
    const {isVisit,values,isConflict,fileList,defaultFileList} = this.state
    return(
      <Form layout={layout} style={{marginLeft:32}}>
        <Row>
          <Col sm={{span:6}} >1. Site visit performed </Col>
          <Col sm={{span:6}}>
            <RadioGroup onChange={(e)=>{
              localStorage.setItem("isVisit",e.target.value)
              this.setState({
                isVisit:e.target.value
              })
            }} value={isVisit}>
              <Radio value={"Y"}>Yes</Radio>
              <Radio value={"N"}>No</Radio>
            </RadioGroup>
          </Col>
        </Row>
        <Tabs activeKey={isVisit}
          className = {"tab_hidden no_border"}
          defaultActiveKey = {isVisit}
          onTabClick={(value)=>{console.log(value)}}
        >
          <TabPane tab="Yes" key="Y">
            <Col span={12} key={"visitDate"}>
              <FormItem
                label={"Date"}
                key={"visitDate"}
                labelCol={{xs: { span: 24 },sm: { span: 7 },}}
                wrapperCol={{xs: { span: 24 },sm: { span: 14 }}}
              >
                {getFieldDecorator("visitDate")(
                  <DatePicker />
                )}
              </FormItem>
            </Col>
            <Col span={12} key={"visitor"}>
              <FormItem
                label={"Visitor"}
                key={"visitor"}
                labelCol={{xs: { span: 24 },sm: { span: 7 },}}
                wrapperCol={{xs: { span: 24 },sm: { span: 14 }}}
              >
                {getFieldDecorator("visitor")(
                  <Input placeholder={"Visitor"}/>
                )}
              </FormItem>
            </Col>
            <Col span={12} key={"visitResult"}>
              <FormItem
                label={"Result"}
                key={"visitResult"}
                labelCol={{xs: { span: 24 },sm: { span: 7 },}}
                wrapperCol={{xs: { span: 24 },sm: { span: 14 }}}
              >
                {getFieldDecorator("visitResult")(
                  <Input placeholder={"Result"}/>
                )}
              </FormItem>
            </Col>
            <Col span={12} key={"visitFilePath"}>
              <Col span={7} style={{textAlign:"right"}}>Visit Report：</Col>
              <Col span={14}>
                <Upload
                name='photo'
                action={`${host}/common/upload/`}
                onChange={(info)=>this.fileChange("visitFilePath",info)}
                onPreview = {(file)=>this.openPSD(file.response.obj)}
                defaultFileList={defaultFileList}
                fileList={fileList}
              >
                  <Button>
                    <Icon type="upload" /> upload
                  </Button>
                </Upload>
              </Col>
            </Col>
          </TabPane>
          <TabPane tab="No" key="N"></TabPane>
        </Tabs>

        <Row style={{marginBottom:16,marginTop:16}}>
          <Col sm={{span:6}}>2. Special capabilities of this vendor </Col>
        </Row>
        <Col style={{margin:"0 24px"}}>
          <FormItem
            key={"capabilities"}
            labelCol={{xs: { span: 24 },sm: { span: 0 },}}
            wrapperCol={{xs: { span: 24 },sm: { span: 21 }}}
          >
            {getFieldDecorator("capabilities")(
              <Input placeholder={"请输入"}/>
            )}
          </FormItem>
        </Col>

        <Row>
          <Col sm={{span:12}}>3.Any potential conflict of interest with employees/directors </Col>
          <Col sm={{span:6}}>
            <RadioGroup onChange={(e)=>{
              localStorage.setItem("isConflict",e.target.value)
              this.setState({
                isConflict:e.target.value
              })
            }} value={isConflict}>
              <Radio value={"Y"}>Yes</Radio>
              <Radio value={"N"}>No</Radio>
            </RadioGroup>
          </Col>
        </Row>
        <Tabs activeKey={isConflict}
          className = {"tab_hidden no_border"}
          defaultActiveKey = {isConflict}
          style={{margin:"0 24px"}}
          onTabClick={(value)=>{console.log(value)}}
        >
          <TabPane tab="Yes" key="Y"  className={"text_left"}>
            <Col span={24} key={"conflictName"}>
              <FormItem
                label={"Name of employees/directors"}
                key={"conflictName"}
                labelCol={{xs: { span: 24 },sm: { span: 7 },}}
                wrapperCol={{xs: { span: 24 },sm: { span: 14 }}}
              >
                {getFieldDecorator("conflictName")(
                  <Input placeholder={"Name"}/>
                )}
              </FormItem>
            </Col>
            <Col span={24} key={"conflictTitle"}>
              <FormItem
                label={"Title of employees/directors"}
                key={"conflictTitle"}
                labelCol={{xs: { span: 24 },sm: { span: 7 },}}
                wrapperCol={{xs: { span: 24 },sm: { span: 14 }}}
              >
                {getFieldDecorator("conflictTitle")(
                  <Input placeholder={"Title"}/>
                )}
              </FormItem>
            </Col>
            <Col span={24} key={"relation"}>
              <FormItem
                label={"Relationship with vendors"}
                key={"relation"}
                labelCol={{xs: { span: 24 },sm: { span: 7 },}}
                wrapperCol={{xs: { span: 24 },sm: { span: 14 }}}
              >
                {getFieldDecorator("relation")(
                  <Input placeholder={"relation"}/>
                )}
              </FormItem>
            </Col>
          </TabPane>
          <TabPane tab="No" key="N"></TabPane>
        </Tabs>

        <Row style={{marginTop:16,marginBottom:16}}>
          <Col sm={{span:12}}>4.Any potential conflict of interest with employees/directors </Col>
        </Row>
        <Row className={"text_left"} style={{margin:"0 24px"}}>
          <Col span={24} key={"vendorCity"}>
            <FormItem
              label={"City of operation base of this vendor"}
              key={"vendorCity"}
              labelCol={{xs: { span: 24 },sm: { span: 7 },}}
              wrapperCol={{xs: { span: 24 },sm: { span: 14 }}}
            >
              {getFieldDecorator("vendorCity")(
                <Input placeholder={"供应商基础操作的所在城市"}/>
              )}
            </FormItem>
          </Col>
          <Col span={24} key={"officeInChina"}>
            <FormItem
              label={"Network/ branch office within China"}
              key={"officeInChina"}
              labelCol={{xs: { span: 24 },sm: { span: 7 },}}
              wrapperCol={{xs: { span: 24 },sm: { span: 14 }}}
            >
              {getFieldDecorator("officeInChina")(
                <Input placeholder={"在中国内的网络/ 分支机构"}/>
              )}
            </FormItem>
          </Col>
          <Col span={24} key={"officeOutChina"}>
            <FormItem
              label={"Network/ branch office outside China"}
              key={"officeOutChina"}
              labelCol={{xs: { span: 24 },sm: { span: 7 },}}
              wrapperCol={{xs: { span: 24 },sm: { span: 14 }}}
            >
              {getFieldDecorator("officeOutChina")(
                <Input placeholder={"relation"}/>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}
export default Form.create()(VisitForm)
