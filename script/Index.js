const React = require('react');
const ReactRouterDom = require('react-router-dom');
const { Component } = React;
const { Link } = ReactRouterDom;
const store = require('./store.js');
const date = require('./modules/date');
const post = require('./modules/post');


class Loading extends Component{
    render(){
        if(this.props.loadingAnimation){
            return (
                <div className="index-layout">
                    <div className="text-center index-loadingText">
                        <svg className="index-loadingIcon" viewBox="0 0 32 32">
                            <path d="M32 16c-0.040-2.089-0.493-4.172-1.331-6.077-0.834-1.906-2.046-3.633-3.533-5.060-1.486-1.428-3.248-2.557-5.156-3.302-1.906-0.748-3.956-1.105-5.981-1.061-2.025 0.040-4.042 0.48-5.885 1.292-1.845 0.809-3.517 1.983-4.898 3.424s-2.474 3.147-3.193 4.994c-0.722 1.846-1.067 3.829-1.023 5.79 0.040 1.961 0.468 3.911 1.254 5.694 0.784 1.784 1.921 3.401 3.316 4.736 1.394 1.336 3.046 2.391 4.832 3.085 1.785 0.697 3.701 1.028 5.598 0.985 1.897-0.040 3.78-0.455 5.502-1.216 1.723-0.759 3.285-1.859 4.574-3.208 1.29-1.348 2.308-2.945 2.977-4.67 0.407-1.046 0.684-2.137 0.829-3.244 0.039 0.002 0.078 0.004 0.118 0.004 1.105 0 2-0.895 2-2 0-0.056-0.003-0.112-0.007-0.167h0.007zM28.822 21.311c-0.733 1.663-1.796 3.169-3.099 4.412s-2.844 2.225-4.508 2.868c-1.663 0.646-3.447 0.952-5.215 0.909-1.769-0.041-3.519-0.429-5.119-1.14-1.602-0.708-3.053-1.734-4.25-2.991s-2.141-2.743-2.76-4.346c-0.621-1.603-0.913-3.319-0.871-5.024 0.041-1.705 0.417-3.388 1.102-4.928 0.683-1.541 1.672-2.937 2.883-4.088s2.642-2.058 4.184-2.652c1.542-0.596 3.192-0.875 4.832-0.833 1.641 0.041 3.257 0.404 4.736 1.064 1.48 0.658 2.82 1.609 3.926 2.774s1.975 2.54 2.543 4.021c0.57 1.481 0.837 3.064 0.794 4.641h0.007c-0.005 0.055-0.007 0.11-0.007 0.167 0 1.032 0.781 1.88 1.784 1.988-0.195 1.088-0.517 2.151-0.962 3.156z" />
                        </svg>
                        <span className="index-tishi">正在获取数据，请稍后...</span>
                    </div>
                </div>
            );
        }else{
            return (
                <div style={{ display: 'none' }} />
            );
        }
    }
}

class Index extends Component{
    constructor(props){
        super(props);

        this.state = {
            reviewList: store.getState().reviewList, // 数据列表
            loadingAnimation: false,                 // 加载动画
            keywords: []                             // 关键字
        };
    }
    // 加载列表
    loadingReviewList(event){
        const _this = this;
        this.setState({
            loadingAnimation: true
        });
        post(store.getState().startTime, function(data, status, headers){
            store.dispatch({
                type: 'LOADING_REVIEWLIST',
                list: JSON.parse(data, null, 4),
                callback: function(){
                    _this.setState({
                        loadingAnimation: false,
                        reviewList: store.getState().reviewList
                    });
                }
            });
        });
    }
    // 刷新列表
    reloadReviewList(event){
        const _this = this;
        this.setState({
            loadingAnimation: true
        });
        post(0, function(data, status, headers){
            store.dispatch({
                type: 'RELOADING_REVIEWLIST',
                list: JSON.parse(data, null, 4),
                callback: function(){
                    _this.setState({
                        loadingAnimation: false,
                        reviewList: store.getState().reviewList
                    });
                }
            });
        });
    }
    // 渲染表格数据
    reviewListView(){
        return this.state.reviewList.map((item, index)=>{
            const to = {
                pathname: '/video',
                query: {
                    item: item,
                    index: index
                }
            };
            if(this.guoLv(item.title)){
                return (
                    <tr key={ index }>
                        <td>{ index }</td>
                        <td>{ item.title }</td>
                        <td>
                            <a target="_blank" href={ item.streamPath } title={ item.streamPath }>{ item.subTitle }</a>
                        </td>
                        <td>{ date(item.startTime) }</td>
                        <td>
                            <Link className="btn btn-default btn-sm" to={ to }>
                                <span className="glyphicon glyphicon-eye-open index-icon" />
                                <span>查看</span>
                            </Link>
                            <button className="btn btn-default btn-sm index-mLeft" type="button" onClick={ this.download.bind(this, item) }>
                                <span className="glyphicon glyphicon-save index-icon" />
                                <span>下载</span>
                            </button>
                        </td>
                    </tr>
                );
            }
        });
    }
    // 下载
    download(item, event){
        const f = item.title + '_' + date(item.startTime).replace(/\:/g, '-') + '.mp4';
        const options = {
            url: item.streamPath,
            filename: f,
            conflictAction: 'prompt',
            saveAs: true,
            method: 'GET'
        };

        chrome.downloads.download(options, (dlId)=>{
            store.dispatch({
                type: 'ADD_DOWNLOADLIST',
                obj: {
                    id: dlId,
                    infor: item,
                    filename: f,
                    fileSize: 1,
                    nowSize: 0,
                    timer: null,
                    current: null,
                    state: 0,
                    create: true
                }
            });
        });
    }
    // 搜索
    onSearch(event){
        const inputText = this.refs.searchName.value;
        let kg;
        if(/^\s*$/.test(inputText)){
            kg = [];
        }else{
            kg = inputText.split(/\s+/);
        }

        const n = [];
        for(let i = 0, j = kg.length; i < j; i++){
            n.push(new RegExp(`.*${ kg[i] }.*`));
        }

        this.setState({
            keywords: n
        });
    }
    // 回车
    onSearchEnter(event){
        if(event.keyCode === 13){
            this.onSearch.call(this, event);
        }
    }
    // 重置
    onReset(event){
        this.refs.searchName.value = '';
        this.setState({
            keywords: []
        });
    }
    // 过滤
    guoLv(text){
        let r = false;
        const length = this.state.keywords.length;

        if(length === 0){
            r = true;
        }else{
            for(let i = 0, j = length; i < j; i++){
                if(this.state.keywords[i].test(text)){
                    r = true;
                    break;
                }
            }
        }

        return r;
    }
    render(){
        return (
            <div>
                { /* 顶部工具栏 */ }
                <header className="bg-warning index-tools clearfix">
                    { /* 关键字搜索 */ }
                    <div className="pull-left form-inline index-searchGroup">
                        <label htmlFor="searchName">搜索已加载列表：</label>
                        <input className="form-control index-searchInput"
                               type="text"
                               id="searchName"
                               ref="searchName"
                               placeholder="多个关键字用空格分割"
                               defaultValue=""
                               onKeyDown={ this.onSearchEnter.bind(this) } />
                        <button className="btn btn-default index-mLeft" type="button" onClick={ this.onSearch.bind(this) }>
                            <span className="glyphicon glyphicon-search index-icon" />
                            <span>搜索</span>
                        </button>
                        <button className="btn btn-default index-mLeft" type="button" onClick={ this.onReset.bind(this) }>
                            <span className="glyphicon glyphicon-remove index-icon" />
                            <span>重置</span>
                        </button>
                    </div>
                    { /* 加载和刷新 */ }
                    <div className="pull-right">
                        <button className="btn btn-primary" type="button" onClick={ this.loadingReviewList.bind(this) }>
                            <span className="glyphicon glyphicon-cloud-download  index-icon" />
                            <span>加载列表</span>
                        </button>
                        <button className="btn btn-default index-mLeft" type="button" onClick={ this.reloadReviewList.bind(this) }>
                            <span className="glyphicon glyphicon-refresh index-icon" />
                            <span>刷新列表</span>
                        </button>
                        <Link className="btn btn-default index-mLeft" to="/download">
                            <span className="glyphicon glyphicon-th-list index-icon" />
                            <span>下载列表</span>
                        </Link>
                    </div>
                </header>
                { /* 底部显示数据 */ }
                <div className="index-dataBox">
                    <table className="table table-bordered table-hover table-condensed index-table">
                        <thead>
                            <tr className="info">
                            <th className="index-table-td0">序号</th>
                            <th className="index-table-td1">直播间</th>
                            <th className="index-table-td2">直播标题</th>
                            <th className="index-table-td3">开始时间</th>
                            <th className="index-table-td4">操作</th>
                            </tr>
                        </thead>
                        <tbody>{ this.reviewListView() }</tbody>
                    </table>
                </div>
                { /* 加载动画 */ }
                <Loading loadingAnimation={ this.state.loadingAnimation } />
            </div>
        );
    }
}

module.exports = Index;