

/*
    author:jiaobingqian
    email:bingqian.jiao@3g2win.com
    description:web/weixin main function
    create:2015.08.07
    update:______/___author___

*/
(function(){
    
    var currZIndex = 9000;
    var currZIndex2 = 99999;
    var currPages = 1;
    var curWwwPath=window.document.location.href;
    
    var jsFiles=document.scripts;
    var jsBasePath=jsFiles[jsFiles.length-1].src.substring(0,jsFiles[jsFiles.length-1].src.lastIndexOf("/js/")+1);



    var isWebApp = function(){
        var iswa = location.href.indexOf('http') > -1;
        return iswa;
    }();
    
    var isWeiXin = function(){
        return navigator.userAgent.match(/micromessenger/i);
    };
    
    function loadjs(src, success, error) {
        var node = document.createElement('script');
        var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
        node.src = src;
        
        if ('onload' in node) {
            node.onload = success;
            node.onerror = error;
        } else {
            node.onreadystatechange = function() {
                if (/loaded|complete/.test(node.readyState)) {
                    success();
                }
            }
        }
        
        head.appendChild(node);
    }
    var configWeiXin = function(url,callback){
        //unuse
        if(1 || !isWeiXin()){
            return;
        }
        callback = callback || function(){};
        var getConfig = function(success){
            var xhr = new XMLHttpRequest();
            url = url || 'http://weixin.appcan.cn:8083/wechat_api/jsapi/jsconfig?debug=true&url='+location.href.split('#')[0];
            xhr.open('GET',url,true);
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4){
                    if (xhr.status == 200){
                        try{ 
                            var resData= JSON.parse(xhr.response);
                            if(resData.error){
                                //alert(xhr.response);
                            }else{
                                success(JSON.parse(xhr.response));
                            }
                        }catch(e){
                            alert(e);
                            success({});
                        } 
                    }else{
                        callback(null);
                    }
                }else{
                    callback(null);
                }
            };
            xhr.send(null);
        };
        var wxjsSdk = 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js';
        loadjs(wxjsSdk,function(){
            getConfig(function(config){
                wx.config(config.res);
                //alert('config 111 success!');
                callback(config);
            });
        },function(e){
            callback(null);
        });
    };
    window.setWeiXinConfig = configWeiXin;
    
    
    var webchatUrl = location.origin + '/wechat_api/jsapi/jsconfig?debug=false&url='+location.href.split('#')[0];
    window.setWeiXinConfig(webchatUrl);

    //像素转em
    function px2em(px) {
        var basePx = window.getComputedStyle(document.body, '');
        var fontSize = parseInt(basePx.fontSize, 10);
        px = parseInt(px);
        return px / fontSize;
    }

    function isDefine(value) {
            if (value == null || value == "" || value == "undefined" || value == undefined || value == "null" || value == "(null)" || value == 'NULL' || typeof(value) == 'undefined') {
                return false;
            } else {
                value = value + "";
                value = value.replace(/\s/g, "");
                if (value == "") {
                    return false;
                }
                return true;
            }
        }
    /**
     * 向指定的选项填充内容
     * @param string id 元素id
     * @param string html 填充的内容
     * @param string showstr 如果html为空，备选显示的html值变量
     */
    function setHtml(id, html, showstr) {
        var showval = isDefine(showstr) ? showstr : "";
        if ("string" == typeof(id)) {
            var ele = window.top.Zepto('#' + id);
            if (ele != null) {
                ele.html(isDefine(html) ? html : showval);
            } else {

            }
        } else if (id != null) {
            id.innerHTML = isDefine(html) ? html : showval;
        }
    }

    function canonical_uri(src, base_path) {
        var root_page = /^[^?#]*\//.exec(location.href)[0],
            root_domain = /^\w+\:\/\/\/?[^\/]+/.exec(root_page)[0],
            absolute_regex = /^\w+\:\/\//;

        // is `src` is protocol-relative (begins with // or ///), prepend protocol 
        if (/^\/\/\/?/.test(src)) {
            src = location.protocol + src;
        }
        // is `src` page-relative? (not an absolute URL, and not a domain-relative path, beginning with /) 
        else if (!absolute_regex.test(src) && src.charAt(0) != "/" && src.indexOf('../') == -1) {
            // prepend `base_path`, if any 
            src = (base_path || "") + src;
        }
        // make sure to return `src` as absolute 
        return absolute_regex.test(src) ? src : ((src.charAt(0) == "/" ? root_domain + src : (src.indexOf('../') == 0 ? root_domain + src.substr(2) : root_page + src)));
    }
  
    function loadjscssfile(filename, filetype) {

        var isExist = false;
        if (filetype == "js") {
            var  scripts = document.getElementsByTagName('script');    
            for (var  i = 0; i < scripts.length; i++) {
                if (scripts[i]['src'].indexOf(filename) != -1) {
                    isExist = true;
                    return;
                }
            }
            if (!isExist) {
                var fileref = document.createElement('script');
                fileref.setAttribute("type", "text/javascript");
                fileref.setAttribute("src", filename);
            }
        } else if (filetype == "css") {
            var  links = document.getElementsByTagName('link');    
            for (var  i = 0; i < links.length; i++) {
                if (links[i]['href'].indexOf(filename) != -1) {
                    isExist = true;
                    return;
                }
            }
            if (!isExist) {
                var fileref = document.createElement('link');
                fileref.setAttribute("rel", "stylesheet");
                fileref.setAttribute("type", "text/css");
                fileref.setAttribute("href", filename);
            }
        }
        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }

    }

    //获取绝对路径
    function realPath(path){
        var DOT_RE = /\/\.\//g;
        var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
        var MULTI_SLASH_RE = /([^:/])\/+\//g;
        // /a/b/./c/./d ==> /a/b/c/d
        path = path.replace(DOT_RE, "/");
        /*
            a//b/c ==> a/b/c
            a///b/////c ==> a/b/c
            DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
        */
        path = path.replace(MULTI_SLASH_RE, "$1/");
        // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, "/");
        }
        return path;
    }

    function pathJoin(url,joinUrl){
        if(joinUrl.indexOf('http:') > -1){
            return joinUrl;
        }
        if(joinUrl.indexOf('//') == 0){
            return location.href.split('//')[0] + joinUrl;
        }
        if(url[url.length-1] != '/'){
            url = url.substr(0,url.lastIndexOf('/')+1);
        }
        var newUrl = url + joinUrl;
        return realPath(newUrl);
    }
    
    function getQueryString(name) { 
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
        var r = window.top.location.search.substr(1).match(reg); 
        if (r != null) return unescape(r[2]); return null; 
    } 
    
    //非popover页面加载IScroll调用函数
    function bounceSetting(enableBounce){
        
        //添加iscroll
        setTimeout(function(){
            //如果IScroll函数未加载完成
            if(!IScroll){ return ; }
            
            if(uexWindow._iscroll && uexWindow._iscroll.contentScroll){
                uexWindow._iscroll.contentScroll.destroy();
                uexWindow._iscroll.contentScroll = null;
            }
            
            //添加IScroll wrap && container 
            var popContent = Zepto("body").children();    
            var scrollContainer = Zepto('.scroll-container').length == 1 ? Zepto('.scroll-container') : Zepto('<div class="scroll-container" style=" min-height:100%; left:0;top:0;"></div>');
            var scrollWrapper = Zepto('.scroll-wrapper').length == 1 ? Zepto('.scroll-wrapper') :Zepto('<div class="scroll-wrapper" style="background-color:#ffffff;position:relative; height:100%;width:100%;overflow:hidden;"></div>');
            var originHtmlContainer = Zepto('.origin-html').length == 1 ? Zepto('.origin-html') :Zepto('<div class="origin-html" style="position:relative;width:100%;"></div>');
            
            if(!(scrollContainer.length && scrollContainer.selector && scrollWrapper.length && scrollWrapper.selector)){
                Zepto(originHtmlContainer).append(popContent);
                Zepto(scrollContainer).append(originHtmlContainer);
                Zepto(scrollWrapper).append(scrollContainer);
                Zepto("body")[0].appendChild(scrollWrapper[0]);
                
                if(originHtmlContainer.height()<scrollWrapper.height()){
                    originHtmlContainer.css("height",Zepto('body')[0].scrollHeight);
                }
                window._isFullScreen = true;
                //添加底部弹动内容区域
                scrollContainer.append('<div class="pullUpTips" style="height:52px;"><span class="pullUpIcon" style="display:inline-block;*display:inline;margin:auto;float:left; width: 24px;  height: 52px; "></span><span class="pullUpLabel" style="display:inline-block; line-height:52px; height:52px;"></span></div>');   
                //顶部弹动内容区域添加
                Zepto('<div class="pullDownTips" style="height:52px;"><span class="pullDownIcon" style="display:inline-block;*display:inline;margin:auto;float:left; width: 24px;  height: 52px; "></span><span class="pullDownLabel" style="display:inline-block; line-height:52px; height:52px;"></span></div>').insertBefore(Zepto('.scroll-container').children()[0]);   
 
                    
            }
            
            //设置弹动区域显示时默认配置

            var bounceImagePath = jsBasePath +'js/resource/blueArrow.png';
            
            var defaultParams ={
                'imagePath': bounceImagePath,
                'textColor': '#f0ecf3',
                'levelText': '',
                'pullToReloadText': '拖动刷新',
                'releaseToReloadText': '释放刷新',
                'loadingText': '加载中，请稍等',
                'loadingImagePath': ''
            };
            !uexWindow._iscroll.topParams && (uexWindow._iscroll.topParams = defaultParams);
            !uexWindow._iscroll.bottomParams && (uexWindow._iscroll.bottomParams = defaultParams);

            //showBounceView中参数flag设置是否显示弹动区域内容1:显示，0：不显示
            if(uexWindow._iscroll.topBounceShow){
                Zepto(".pullDownIcon")[0].style.cssText ='display:inline-block;*display:inline;margin:auto;float:left; width: 24px;  height: 52px;  background: url('+uexWindow._iscroll.topParams.imagePath+') 0 0 no-repeat;  -webkit-background-size: 24px 52px;  background-size: 24px 52px;  -webkit-transition-property: -webkit-transform;  -webkit-transition-duration: 0ms; -webkit-transform: rotate(-180deg) translateZ(0);';
                Zepto(".pullDownLabel").html(uexWindow._iscroll.topParams.pullToReloadText);
            }
            if(uexWindow._iscroll.topBounceColor){
                Zepto(".pullDownTips").css({"background-color":uexWindow._iscroll.topBounceColor});
            } 
            if(uexWindow._iscroll.bottomBounceShow){
                Zepto(".pullUpIcon")[0].style.cssText ='display:inline-block;*display:inline;margin:auto;float:left; width: 24px;  height: 52px;  background: url('+uexWindow._iscroll.bottomParams.imagePath+') 0 0 no-repeat;  -webkit-background-size: 24px 52px;  background-size: 24px 52px;  -webkit-transition-property: -webkit-transform;  -webkit-transition-duration: 0ms; -webkit-transform: rotate(0deg) translateZ(0);';
                Zepto(".pullUpLabel").html(uexWindow._iscroll.bottomParams.pullToReloadText);
            }
            if(uexWindow._iscroll.bottomBounceColor){
                Zepto(".pullUpTips").css({"background-color":uexWindow._iscroll.bottomBounceColor});
            }
            
            var pullDownTips = Zepto(".pullDownTips");
            var pullDownHeight = pullDownTips[0].offsetHeight;
            var pullDownIcon = Zepto(".pullDownIcon");
            var pullDownLabel = Zepto(".pullDownLabel");
            
            var pullUpTips = Zepto(".pullUpTips");
            var pullUpHeight =  pullUpTips[0]?pullUpTips[0].offsetHeight:0;
            var pullUpIcon = Zepto(".pullUpIcon");
            var pullUpLabel = Zepto(".pullUpLabel");

            //此变量用于修复滑动时maxScrollY获取不正确的问题
            var OrigMaxScrollY ;
            
            var enableCallback = false;
            
            //实例化IScroll
            uexWindow._iscroll.contentScroll = new IScroll(scrollWrapper[0],{
                useTransition: true,
                topOffset: pullDownHeight,
                bottomOffset: pullUpHeight,
                probeType:3,
                bounce:enableBounce,
                preventDefault:true,
                preventDefaultException:{tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/,className:/(^|\s)btn|not-btn(\s|$)/}
            });
            
            //scrollStart事件：滑动开始
            uexWindow._iscroll.contentScroll.on('scrollStart',function(){
                enableCallback = false;
                //禁止弹动
                if(this.options.bounce == false){
                    this.refresh();
                    return false;
                } 
                
                if(this.options.isRelease === false && this.directionY == -1 && this.y <= 0){

                    //顶部向下拉
                    if(uexWindow._iscroll.topNotifyState){
                        uexWindow.onBounceStateChange(0,0);
                    }
                    if(uexWindow._iscroll.topBounceShow && !uexWindow._iscroll.topHidden){
                        pullDownIcon[0].style.cssText = 'display:inline-block;*display:inline;margin:auto;float:left; width: 24px;  height: 52px;  background: url('+uexWindow._iscroll.topParams.imagePath+') 0 0 no-repeat;  -webkit-background-size: 24px 52px;  background-size: 24px 52px;  -webkit-transition-property: -webkit-transform;  -webkit-transition-duration: 0ms; -webkit-transform: rotate(-180deg) translateZ(0)';
                        pullDownLabel.html(uexWindow._iscroll.topParams.pullToReloadText);
                    }
                    else if(uexWindow._iscroll.topBounceColor){
                        Zepto(".pullDownTips").css({"background-color":uexWindow._iscroll.topBounceColor});
                    }
                }else if(this.options.isRelease === false && this.directionY == 1 && this.y >= this.maxScrollY){
                    
                    //底部向上拉
                    if(uexWindow._iscroll.bottomNotifyState){
                        uexWindow.onBounceStateChange(1,0);
                    }
                    if(uexWindow._iscroll.bottomBounceShow && !uexWindow._iscroll.bottomHidden){
                        pullUpIcon[0].style.cssText = 'display:inline-block;*display:inline;margin:auto;float:left; width: 24px;  height: 52px;  background: url('+uexWindow._iscroll.bottomParams.imagePath+') 0 0 no-repeat;  -webkit-background-size: 24px 52px;  background-size: 24px 52px;  -webkit-transition-property: -webkit-transform;  -webkit-transition-duration: 0ms; -webkit-transform: rotate(0deg) translateZ(0)';
                        pullUpLabel.html(uexWindow._iscroll.bottomParams.pullToReloadText);
                    }else if(uexWindow._iscroll.bottomBounceColor){
                        Zepto(".pullUpTips").css({"background-color":uexWindow._iscroll.bottomBounceColor});
                    }
                }
                if(this.options.isRelease === false){
                    this.refresh();
                }
            });
            
            //scroll事件：滑动中
            uexWindow._iscroll.contentScroll.on('scroll',function(evt){
                
                //禁止弹动
                if(this.options.bounce == false){
                    return ; 
                } 
                
                //禁止顶部弹动
                if(uexWindow._iscroll.topHidden && this.y >= 0){
                    this.scrollTo(0, 0); 
                    return ;
                }

                //禁止底部弹动
                if(uexWindow._iscroll.bottomHidden == 0 && this.y <= OrigMaxScrollY){
                    this.scrollTo(0, this.maxScrollY);
                    return ;
                }
                
                // //禁止顶部弹动
                // if(uexWindow._iscroll.topBounceShow == 0 && this.y >= 0){
                    // this.scrollTo(0, 0); 
                    // return ;
                // }
// 
                // //禁止底部弹动
                // if(uexWindow._iscroll.bottomBounceShow == 0 && this.y <= OrigMaxScrollY){
                    // this.scrollTo(0, OrigMaxScrollY);
                    // return ;
                //}
                
                //顶部resetBounceView执行
                if(uexWindow._iscroll.topReset === true && this.options.isRelease === true &&  this.y <= this.options.topOffset){

                    uexWindow._iscroll.contentScroll.options.isBack = true;

                    //未恢复到0,此处取1
                    if(this.y <=1){
                        uexWindow._iscroll.topReset =false;
                        this.options.isRelease = false;
                    }
                }
                
                //底部resetBounceView执行
                if(uexWindow._iscroll.bottomReset === true && this.options.isRelease === true &&  this.y >= this.maxScrollY - this.options.bottomOffset){

                    uexWindow._iscroll.contentScroll.options.isBack = true;
                    
                    //未恢复到0,此处取
                    if(this.y >=this.maxScrollY-this.options.bottomOffset){
                        uexWindow._iscroll.bottomReset =false;
                        this.options.isRelease = false;
                    }
                }
                
                
                //顶部下拉弹动处理
                if(this.options.isRelease === false && uexWindow._iscroll.topBounceShow && !uexWindow._iscroll.topHidden){
                    
                    //超越边界
                    if (this.y > pullDownHeight && !pullDownTips[0].className.match('flip')) {
                        this.options.isBack = false;
                        enableCallback = true;
                        pullDownTips[0].className = 'pullDownTips flip';
                        pullDownLabel.html(uexWindow._iscroll.topParams.releaseToReloadText);
                        pullDownIcon[0].style.cssText = 'display:inline-block;*display:inline;margin:auto;float:left; width: 24px;  height: 52px;  background: url('+uexWindow._iscroll.topParams.imagePath+') 0 0 no-repeat;  -webkit-background-size: 24px 52px;  background-size: 24px 52px;  -webkit-transition-property: -webkit-transform;  -webkit-transition-duration: 250ms; -webkit-transform: rotate(0deg) translateZ(0)';

                        if(uexWindow._iscroll.topNotifyState){
                            uexWindow.onBounceStateChange(0,1);
                        }
                    } else if (this.y < pullDownHeight && pullDownTips[0].className.match('flip')) {
                        pullDownTips[0].className = 'pullDownTips';
                        pullDownIcon[0].style.cssText = 'display:inline-block;*display:inline;margin:auto;float:left; width: 24px;  height: 52px;  background: url('+uexWindow._iscroll.topParams.imagePath+') 0 0 no-repeat;  -webkit-background-size: 24px 52px;  background-size: 24px 52px;  -webkit-transition-property: -webkit-transform;  -webkit-transition-duration: 250ms; -webkit-transform: rotate(-180deg) translateZ(0)';
                        pullDownLabel.html(uexWindow._iscroll.topParams.pullToReloadText);
                        this.minScrollY = -pullDownTips[0].offsetHeight;
                    }
                }

                //底部上拉弹动
                if(this.options.isRelease === false && uexWindow._iscroll.bottomBounceShow && !uexWindow._iscroll.bottomHidden && window._isFullScreen){
                    
                    var tipsHeight = Zepto(".pullUpTips")[0].offsetHeight;
                    
                    if(this.y < (this.maxScrollY - tipsHeight) && !pullUpTips[0].className.match('flip')) {
                        
                        this.options.isBack = false;
                        enableCallback = true;
                        pullUpTips[0].className = 'pullUpTips flip';
                        pullUpLabel.html(uexWindow._iscroll.bottomParams.releaseToReloadText);
                        pullUpIcon[0].style.cssText = 'display:inline-block;*display:inline;margin:auto;float:left; width: 24px;  height: 52px;  background: url('+uexWindow._iscroll.bottomParams.imagePath+') 0 0 no-repeat;  -webkit-background-size: 24px 52px;  background-size: 24px 52px;  -webkit-transition-property: -webkit-transform;  -webkit-transition-duration: 250ms; -webkit-transform: rotate(-180deg) translateZ(0)';
                        if(uexWindow._iscroll.bottomNotifyState){
                            uexWindow.onBounceStateChange(1,1);
                        } 
                    }else if(this.y >= (this.maxScrollY - tipsHeight) && pullUpTips[0].className.match('flip')){
                       
                        pullUpTips[0].className = 'pullUpTips';
                        pullUpLabel.html(uexWindow._iscroll.bottomParams.pullToReloadText);
                        pullUpIcon[0].style.cssText = 'display:inline-block;*display:inline;margin:auto;float:left; width: 24px;  height: 52px;  background: url('+uexWindow._iscroll.bottomParams.imagePath+') 0 0 no-repeat;  -webkit-background-size: 24px 52px;  background-size: 24px 52px;  -webkit-transition-property: -webkit-transform;  -webkit-transition-duration: 250ms; -webkit-transform: rotate(0deg) translateZ(0)';

                    }
                }
                
            });
            
            //下拉/上拉松手释放监控事件
            uexWindow._iscroll.contentScroll.on('release',function(){
                
                //标记是否已经释放
                this.options.isRelease = true;
                
                //禁止释放弹动
                if(this.options.bounce == false){
                    return ; 
                }
                
                //顶部释放刷新
                if(this.y>0 && uexWindow._iscroll.topBounceShow&& !uexWindow._iscroll.topHidden ){
                    pullDownTips[0].className = 'pullDownTips loading';

                    pullDownIcon.css({
                        'display':'inline-block',
                        'width':'52px',
                        'height':'52px',
                        'background':'url('+uexWindow._iscroll.bottomParams.loadingImagePath+') 0 0 no-repeat',
                        '-webkit-background-size': '52px 52px', 
                        'background-size': '52px 52px', 
                        '-webkit-transition-property': '-webkit-transform',
                        '-webkit-transition-duration': '5s', 
                        '-webkit-transform': 'rotate(360deg) translateZ(0)'
                    });
                    pullDownLabel.html(uexWindow._iscroll.topParams.loadingText);                                
                    
                    // 执行onBounceStateChange回调函数                              
                    if(uexWindow._iscroll.topNotifyState && enableCallback){                    
                        uexWindow.onBounceStateChange(0,2);                
                    }else{
                        uexWindow.resetBounceView(0);
                    }
                }
                
                //底部释放刷新
                if(this.y < this.maxScrollY && uexWindow._iscroll.bottomBounceShow && !uexWindow._iscroll.bottomHidden ){
                    pullUpTips[0].className = 'pullUpTips loading';
                    pullUpIcon.css({
                        'display':'inline-block',
                        'width':'52px',
                        'height':'52px',
                        'background':'url('+uexWindow._iscroll.bottomParams.loadingImagePath+') 0 0 no-repeat',
                        '-webkit-background-size': '52px 52px', 
                        'background-size': '52px 52px', 
                        '-webkit-transition-property': '-webkit-transform',
                        '-webkit-transition-duration': '5s', 
                        '-webkit-transform': 'rotate(360deg) translateZ(0)'
                    });
                    
                    pullUpLabel.html(uexWindow._iscroll.bottomParams.loadingText);   
                    
                    // 执行onBounceStateChange回调函数      
                    if(uexWindow._iscroll.bottomNotifyState && enableCallback){
                        uexWindow.onBounceStateChange(1,2);
                    }else{
                        uexWindow.resetBounceView(1);
                    }
                }
            });
            
        },60);
        
    }
    
     /**
     * openPopover加载页面设置IScroll
     * @param string popName popover页面name
     * @param bool enableBounce 是否允许弹动
     */
    function popoverBounceSetting(popName,enableBounce,popBgcolor){
        window = top.window || window;
        document = top.document || document;
        Zepto = top.Zepto || Zepto;
        
        Zepto('#'+popName)[0].style.backgroundColor = popBgcolor;
        Zepto('#cnt_'+popName)[0].style.backgroundColor = popBgcolor;
        
        //setTimeout(function(){
            var contentWindow = Zepto("#" + popName +" iframe")[0].contentWindow;
            //如果打开已经被制空的popover,返回
            if(!contentWindow.Zepto) return;
            uexWindow._popoverList[popName] = uexWindow._popoverList[popName] || {};
            uexWindow._popoverList[popName].contentWindow = contentWindow;
            
            var UA = navigator.userAgent;
            var forIOS = function(){
            if(!UA.match(/iPad/) && !UA.match(/iPhone/) && !UA.match(/iPod/)){return;}
            if(!contentWindow.Zepto('#selfWrapper').length){
               contentWindow.Zepto('body').children().not('script').wrapAll('<div id="selfWrapper" style="-webkit-overflow-scrolling:touch;overflow:auto;height:100%;"></div>'); 
            }
            }();
            
            //浮动窗口监控滑动效果，处理bounce刷新
            contentWindow.Zepto("#selfWrapper").scroll(function(e){
                var wrapperHeight = 0;
                var warpperChildHeight = 0;
                var cntHeight = 0;
                var scrollTop = 0;
                var scrollBottom = null;
                var scrollHeight = 0;
                var eles = contentWindow.Zepto("#selfWrapper")[0]&& contentWindow.Zepto("#selfWrapper")[0].children;
                if(eles && eles.length){
                    for(var i =0;i<eles.length;i++){
                        warpperChildHeight += eles[i].offsetHeight;
                    }
                }else{
                    warpperChildHeight = contentWindow.Zepto("#selfWrapper")[0].offsetHeight;
                }
                wrapperHeight = contentWindow.Zepto("#selfWrapper")[0].offsetHeight;
                cntHeight = warpperChildHeight>wrapperHeight?warpperChildHeight:wrapperHeight;
                
                scrollTop = contentWindow.Zepto("#selfWrapper").scrollTop();
                scrollBottom = cntHeight - scrollTop - wrapperHeight;
                
                if(scrollBottom !== null && scrollBottom <=0){
                    if(enableBounce && uexWindow._popoverList[popName].bottomNotifyState){
                        
                        contentWindow.uexWindow.onBounceStateChange(1,1);
                        contentWindow.uexWindow.onBounceStateChange(1,2);
                        
                        //解决andriod滑动到底部一直执行的bug
                        if(navigator.userAgent.indexOf('Android')>-1){
                            contentWindow.Zepto("#selfWrapper").scrollTop(scrollTop-1);
                        }
                        
                    }
                }
            });
            
            var popIframe = Zepto("iframe"); 
            if(popIframe && popIframe.length){
                Zepto.each(popIframe,function(i,v){
                    if(popIframe[i].id !="iframe_"+popName){
                        Zepto(popIframe[i]).css("display","none"); 
                    }
                });
            }
            
            //结束一个popover的iframe加载后，执行下一个popover的iframe加载
            uexWindow._lock = false;
            if(uexWindow._popoverQueue.length >0){
                var nextPopName = uexWindow._popoverQueue.shift();
                loadIframe(nextPopName);
            }
            
        //},6);
        
    }
    
    function loadIframe(popArgs){
        window = top.window || window;
        document = top.document || document;
        Zepto = top.Zepto || Zepto;
        
        var popName = popArgs.popName;
        uexWindow._popoverList[popName] = {'popName':popName};
        uexWindow._iscroll.popName = popName;//标识是否是popover的bounce
        var popContainer = Zepto("#" + popName);
        var iframecnt = Zepto("#cnt_" + popName);
        var popNameData =  popArgs;
        
        var popBackgroundColor = popArgs.bgColor||"#ffffff";

        var popIframe = document.createElement('iframe');
            popIframe.id ='iframe_'+popName;
            popIframe.src = popArgs.inData;
            popIframe.setAttribute('class', 'up ub ub-ver uabs ub-con');
            popIframe.style.height="100%";
            popIframe.style.width="100%";
        // if(popArgs.bgColor =='#ffffff'){
        //     popIframe.style.opacity="0";
        // }
        if (popIframe.attachEvent){ 
            popIframe.attachEvent("onload", function(){
                var enableBounce = uexWindow._popoverList[popName].enableBounce ? true:false;
                popoverBounceSetting(popName,enableBounce,popBackgroundColor);
               
                if(popArgs.inWindName && Zepto('#'+popArgs.inWindName).length>0){
                    var contentWidth = Zepto('#'+popArgs.inWindName).width();
                    var contentHeight = Zepto('#'+popArgs.inWindName).height();
                    window.top.uexWindow.setPopoverFrame(popArgs.inWindName,popArgs.x,popArgs.y,contentWidth,contentHeight);
                }
               
                var pageHistory = null; 
                var curWind = null;
               
               //
                popNameData.h = window.top.getComputedStyle(popContainer[0],null).height;
                popNameData.w = window.top.getComputedStyle(popContainer[0],null).width;
                popNameData.y = window.top.getComputedStyle(popContainer[0],null).top;
                popNameData.x = window.top.getComputedStyle(popContainer[0],null).left;
               
                pageHistory = sessionStorage.getItem('pageHistory');
                if(pageHistory){
                    pageHistory = JSON.parse(pageHistory);
                    curWind = pageHistory.curWind;
                    if(!pageHistory['win_'+curWind]){
                        pageHistory['win_'+curWind] ={};
                    }
                    if(!pageHistory['win_'+curWind].lastPop){
                        pageHistory['win_'+curWind].firstPop = popName;
                        pageHistory['win_'+curWind].prevPop = popName;
                    }else{
                        pageHistory['win_'+curWind].prevPop = pageHistory['win_'+curWind].lastPop;
                    }
                    pageHistory['win_'+curWind].lastPop = popName;
                    pageHistory['win_'+curWind][popName] = popNameData;
                }else{
                    pageHistory = {
                        'firstWind':'default',
                        'prevWind':'default',
                        'curWind':'default',
                        'windList':['default'], //递增序列
                        'win_default':{
                            'firstPop':popName,
                            'prevPop':popName,
                            'lastPop':popName
                        }
                    };
                    pageHistory['win_default'][popName] = popNameData;
                }
                sessionStorage.setItem('pageHistory',JSON.stringify(pageHistory));
                //
                window.top.isBack = false;
                
            }); 
        } else {
            popIframe.onload = function(){
               var enableBounce = uexWindow._popoverList[popName].enableBounce ? true:false;
               popoverBounceSetting(popName,enableBounce,popBackgroundColor);
               
               if(popArgs.inWindName && Zepto('#'+popArgs.inWindName).length>0){
                   var contentWidth = Zepto('#'+popArgs.inWindName).width();
                   var contentHeight = Zepto('#'+popArgs.inWindName).height();
                   window.top.uexWindow.setPopoverFrame(popArgs.inWindName,popArgs.x,popArgs.y,contentWidth,contentHeight);
               }
               
               var pageHistory = null; 
               var curWind = null;
               
               //
               popNameData.h = window.top.getComputedStyle(popContainer[0],null).height;
               popNameData.w = window.top.getComputedStyle(popContainer[0],null).width;
               popNameData.y = window.top.getComputedStyle(popContainer[0],null).top;
               popNameData.x = window.top.getComputedStyle(popContainer[0],null).left;
               
               pageHistory = sessionStorage.getItem('pageHistory');
               if(pageHistory){
                   pageHistory = JSON.parse(pageHistory);
                   curWind = pageHistory.curWind;
                   if(!pageHistory['win_'+curWind]){
                       pageHistory['win_'+curWind] ={};
                   }
                   if(!pageHistory['win_'+curWind].lastPop){
                       pageHistory['win_'+curWind].firstPop = popName;
                       pageHistory['win_'+curWind].prevPop = popName;
                   }else{
                       pageHistory['win_'+curWind].prevPop = pageHistory['win_'+curWind].lastPop;
                   }
                   pageHistory['win_'+curWind].lastPop = popName;
                   pageHistory['win_'+curWind][popName] = popNameData;
               }else{
                   pageHistory = {
                       'firstWind':'default',
                       'prevWind':'default',
                       'curWind':'default',
                       'windList':['default'], //递增序列
                       'win_default':{
                           'firstPop':popName,
                           'prevPop':popName,
                           'lastPop':popName
                       }
                   };
                   pageHistory['win_default'][popName] = popNameData;
               }
               sessionStorage.setItem('pageHistory',JSON.stringify(pageHistory));
               //
               window.top.isBack = false;
           }; 
       }
        iframecnt.append(popIframe);
    }

    /*
     * uexWindow 定义
     */
    window.uexWindow = {
        _lock : false,
        _popoverQueue:[],
        _popoverList:{},
        _iscroll:{},
        _isFunction: function(value) { return type(value) == "function"; },
        _isWindow: function(obj) { return obj != null && obj == obj.window ;},
        _isDocument: function(obj) { return obj != null && obj.nodeType == obj.DOCUMENT_NODE ;},
        _isObject: function(obj) { return typeof(obj) == "object" ;},
        _isPlainObject: function(obj) {
            return this._isObject(obj) && !this._isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype ;
        },
        _emptyFun:function(){},
        setPopTabIndex:function(popName,tabIndex){
            var pageHistory = sessionStorage.getItem('pageHistory');
            var curWindName = null;
            if(pageHistory){
                 pageHistory = JSON.parse(pageHistory);
                 curWindName = pageHistory.curWind;
                 pageHistory[curWindName + "_pop_" + popName +"_tabIndex"] = tabIndex;
                 sessionStorage.setItem('pageHistory',JSON.stringify(pageHistory));
            }
            
        },
        open: function(inWindName, inDataType, inData, inAniID, inWidth, inHeight, inFlag, inAnimDuration, extraInfo) {
            //use location.href
            if(inWindName=='default'){
                sessionStorage['s_pageHistory'] = JSON.stringify([['default', 'index.html']]);
            }else{
                try{
                    inData=inData||inWindName.inData;
                    var his = sessionStorage['s_pageHistory'] ? JSON.parse(sessionStorage['s_pageHistory']) : [['default', 'index.html']];
                    var len = his.length;
                    if(his[len-1][0]==inWindName){
                        his[len-1][1] = inData;
                    }else if(his[len-1][0]=='login'){
                        his[len-1] = [inWindName, inData];
                        sessionStorage['s_pageHistory'] = JSON.stringify(his);
                        window.top.location.replace(inData);
                        return;
                    }else{
                        his.push([inWindName, inData]);
                        sessionStorage['s_pageHistory'] = JSON.stringify(his);
                        window.top.location.href = inData;
                        return;
                    }
                    
                    
                }catch(e){}
                
            }
            sessionStorage['s_pageHistory'] = JSON.stringify(his);
            window.top.location.href = inData;
            return;
            var curArgs = null;
            var openArgs = {};
            if(arguments.length === 1 && uexWindow._isPlainObject(inWindName)){
                curArgs = inWindName;
                inWindName = curArgs['inWindName'];
                inDataType = curArgs['inDataType'];
                inData = curArgs['inData'];
                inAniID = curArgs['inAniID'];
                inWidth = curArgs['inWidth'];
                inHeight = curArgs['inHeight'];
                inFlag = curArgs['inFlag'];
                inAnimDuration = curArgs['inAnimDuration'];
                extraInfo = curArgs['extraInfo'];
                if(!curArgs['isBack']){
                    window.top.isBack = false;
                }
            }else{
                window.top.isBack = false;
            }
            
            var pageHistory = sessionStorage.getItem('pageHistory');
            var prevWind = null;
            var curWind = null;
            
            if(1 || !window.top.isBack){
                openArgs.inWindName = inWindName;
                openArgs.inDataType = inDataType;
                openArgs.inData = inData;
                openArgs.inAniID = inAniID;
                openArgs.inWidth = inWidth;
                openArgs.inHeight = inHeight;
                
                openArgs.inFlag = inFlag;
                openArgs.inAnimDuration = inAnimDuration;
                openArgs.extraInfo = extraInfo;

                //记录跳转历史
                
                if(pageHistory){
                    pageHistory = JSON.parse(pageHistory);
                    prevWind = pageHistory.curWind;
                    curWind = inWindName ? inWindName:'wind_'+currPages;
                    
                    pageHistory.prevWind = prevWind;
                    pageHistory.curWind = curWind;
                    pageHistory['win_'+curWind] ={
                        'openArgs':openArgs
                    };
                    //
                    var openWindName = openArgs.inWindName;
                    var windList = pageHistory.windList;
                    var windListLength = windList.length;
                    var openWindIndex = pageHistory.windList.indexOf(openWindName);
                    if(openWindIndex >=0){
                        for(var i = windListLength;i>openWindIndex;i--){
                            var idx = i;
                            delete pageHistory['win_' + windList[idx]];
                            pageHistory.windList.pop();
                        }
                    }
                    
                    //
                    if(pageHistory.windList.indexOf(curWind) < 0){
                        if(!(inWindName=='login' || inWindName=='payPage')){
                            pageHistory.windList.push(curWind);
                        }
                        
                    }
                    
                }else{
                    pageHistory = {
                        'firstWind':'default',
                        'prevWind':'default',
                        'curWind':'default',
                        'windList':['default'], //递增序列
                        'win_default':{
                            'openArgs':openArgs
                        }
                    };
                }
                //处理订单返回2016.06.12
                if(inWindName=='orderPayment' && window.top.location.href.indexOf('orderList.html')>-1){
                    try{
                        delete pageHistory.win_orderDetails;
                    }catch(e){}
                }else if(inWindName=='orderSubmit' && window.top.location.href.indexOf('goodsDetails.html')>-1){
                    try{
                        delete pageHistory.win_shoppingCar;
                    }catch(e){}
                }else if(inWindName=='personalCenter'){
                    try{
                        var tList = JSON.parse(JSON.stringify(pageHistory.windList));
                        for(var i=tList.length-1;i>=0;i--){
                            if(tList[i]!='default' || tList[i]!='goodsList'){
                                pageHistory.windList.pop();
                            }
                        }
                        pageHistory.prevWind = pageHistory.windList[pageHistory.winList.length-1];
                    }catch(e){}
                        
                }
                sessionStorage.setItem('pageHistory',JSON.stringify(pageHistory));
                if(inWindName=='login'){
                    sessionStorage.setItem('_prePage', window.top.location.href);
                }
                
                window.top.location.href = inData;
            }else{
                
                //close返回调用打开历史记录页面
                var urlIndex = null;
                var baseUrl = "";
                
                if(curArgs.prevInData && inData.indexOf('/')<0){
                    urlIndex = window.location.href.lastIndexOf(curArgs.prevInData);
                }else if(curArgs.prevInData && inData.indexOf('/')>0){
                    var prevIndataIndex = window.location.href.lastIndexOf(curArgs.prevInData);
                    urlIndex = window.location.href.substr(0,prevIndataIndex-1).lastIndexOf('/')+1;
                }
                //2016.06.01 返回路径错误，so添加mvc/
                baseUrl = urlIndex>0?window.location.href.substr(0,urlIndex):window.location.origin+"/mvc/";
                
                if(inWindName=='login'){
                    sessionStorage.setItem('_prePage', window.top.location.href);
                }
                if(inData.split('.').length == 2){
                    if(inData.indexOf('/')!=0){
                        if(window.top.location.href.indexOf('orderPayment.html')>-1){
                            window.top.location.href =  window.top.location.href.replace('orderPayment.html', inData) + '#isBack';
                        }else{
                            window.top.location.href =  baseUrl + inData + '#isBack';
                        }
                        
                    }else{
                        window.top.location.href =  inData.substr(1) + '#isBack';
                    }
                }else{
                    window.top.location.href = inData + '#isBack';
                }
            }

        },
        cbOpen: function(d) {
            
        },
        setWindowFrame: function(inX, inY, inAnimDuration) {},
        close: function() {

            var pageHistory = sessionStorage.getItem('pageHistory');
            var prevWind = null;
            var curWind = null;
            var openArgs = null;
            
            
            if(pageHistory){
                pageHistory = JSON.parse(pageHistory);
                curWind = pageHistory.curWind;
                prevWind = pageHistory.prevWind;
                pageHistory.curWind = prevWind;

                if(curWind == 'default' || prevWind == 'default' || !prevWind){
                    pageHistory.prevWind = 'default';
                }else{
                    pageHistory.prevWind = pageHistory.windList[pageHistory.windList.indexOf(prevWind)-1]||"default";
                }
                openArgs = pageHistory['win_'+prevWind].openArgs||{'inWindName':'default','inData':'index.html'};
                prevOpenArgs = pageHistory['win_'+curWind].openArgs;
                
                if(prevOpenArgs){
                    openArgs.prevInData = prevOpenArgs.inData ||"";
                }
                openArgs.isBack = true;
                window.top.isBack = true;
                
                pageHistory.windList.pop();
                //2016.05.27如果是支付页面，则再退一次
                if(window.top.location.href.indexOf('orderPayment.html')>-1){
                    pageHistory.windList.pop();
                }

                sessionStorage.setItem('pageHistory',JSON.stringify(pageHistory));
                window.top.uexWindow.open(openArgs);
            }else{
                window.top.history.back(-1);
                event.stopPropagation();
            }
        },
        cbClose: function() {

        },
        closeByName: function(n, a) {

        },
        openPopover: function(inWindName, inDataType, inData, data, x, y, w, h, fontSize, type, bottomMargin, extraInfo,position) {
            Zepto = top.Zepto||Zepto;
            var curArgs = null;
            if(arguments.length === 1 && uexWindow._isPlainObject(inWindName)){
                curArgs = inWindName;
                inWindName = curArgs['inWindName'];
                inDataType = curArgs['inDataType'];
                inData = curArgs['inData'];
                data = curArgs['data'];
                x = curArgs['x'];
                y = curArgs['y'];
                w = curArgs['w'];
                h = curArgs['h'];
                fontSize = curArgs['fontSize'];
                type = curArgs['type'];
                bottomMargin = curArgs['bottomMargin'];
                extraInfo = curArgs['extraInfo'];
                position = curArgs['position'];
            }else{
                curArgs ={
                    'inWindName': inWindName,
                    'inDataType': inDataType,
                    'inData': inData,
                    'data': data,
                    'x': x,
                    'y': y,
                    'w': w,
                    'h': h,
                    'fontSize': fontSize,
                    'type': type,
                    'bottomMargin': bottomMargin,
                    'extraInfo': extraInfo
                };
            }
            
            if (inWindName == "") inWindName = "index";
            var popName = 'pop_' + inWindName;
            var popContainer = Zepto("#" + popName);
            var content = Zepto("#content");
            if (popContainer.length > 0) {
                popContainer.remove();
            }
            var bgColor ="#ffffff";
            if(bottomMargin >=0 && extraInfo){
                extraInfoObj = JSON.parse(extraInfo) || {};
                if(extraInfoObj.extraInfo.opaque){
                    bgColor = "rgba(0,0,0,0)";
                }else if(!extraInfoObj.extraInfo.opaque && extraInfoObj.extraInfo.bgColor){
                    bgColor = extraInfoObj.extraInfo.bgColor;
                }
            }
            popContainer = Zepto('<div id="pop_' + inWindName + '" class="batou_zhy" style="overflow:hidden;"></div>');
            var iframecnt = Zepto('<div id="cnt_pop_' + inWindName + '" class="up ub ub-ver uabs ub-con" style="height:100%;overflow:hidden;"></div>');   
            Zepto(popContainer[0]).html("");
            Zepto(popContainer[0]).append(iframecnt);

            var eleZIndex = currZIndex++;
            x = x || 0;
            y = y || 0;
            w = (w || '100%') == '100%' ? '100%' : px2em(w) + 'em';
            h = (h || '100%') == '100%' ? '100%' : px2em(h) + 'em';

            Zepto(popContainer[0]).css({
                top: px2em(y) + 'em',
                left: px2em(x) + 'em',
                width: w,
                height: h,
                position: position ||'absolute',
                background: bgColor,
                zIndex: eleZIndex
            });
            Zepto("body").append(popContainer[0]);
            var popArgs ={
                'popName':popName,
                'inWindName':inWindName,
                'inDataType':inDataType,
                'inData':inData,
                'data':data,
                'fontSize':fontSize,
                'type':type,
                'bottomMargin':bottomMargin,
                'extraInfo':extraInfo,
                'x':x,
                'y':y,
                'w':w,
                'h':h,
                'bgColor':bgColor
            };
            
            loadIframe(popArgs);
        },
        closePopover: function(inPopName) {
            window = top.window || window;
            Zepto = top.Zepto || Zepto;
            var popElement = Zepto("#pop_" + inPopName);
            if (popElement.length > 0) {
                if(popElement[0].remove && typeof(popElement[0].remove) == 'function'){
                    popElement[0].remove();
                }else{
                    Zepto(popElement[0]).remove();
                }
                
            }
            //TODO:clear popover sessionStorage info
            var pageHistory = sessionStorage.getItem('pageHistory');
            var curWind = null;
            var prevPop = null;
            if(pageHistory){
                pageHistory = JSON.parse(pageHistory);
                curWind = pageHistory.curWind;
                if(pageHistory['win_'+curWind] && pageHistory['win_'+curWind].lastPop == 'pop_'+inPopName){
                    prevPop = pageHistory['win_'+curWind].prevPop||pageHistory['win_'+curWind].firstPop;
                    pageHistory['win_'+curWind].lastPop = prevPop;
                    sessionStorage.setItem('pageHistory',JSON.stringify(pageHistory));
                }
            }
            
        },
        openMultiPopover: function(inContent, inPopName, inDataType, inX, inY, inWidth, inHeight, inFontSize, inFlag, inIndexSelected) {},
        closeMultiPopover: function(inPopName) {},
        setSelectedPopOverInMultiWindow: function(inPopName, indexPage) {},
        setPopoverFrame: function(inPopName, inX, inY, inWidth, inHeight) {
            var popEle = window.top.Zepto("#pop_" + inPopName);
            if (popEle.length > 0) {
                //var zIndex = currZIndex++;
                popEle.css({
                    //'z-index':zIndex,
                    'left':inX+'px'||0,
                    'top':inY+'px'||0,
                    'width':inWidth+'px'||0,
                    'height':inHeight+'px'||0
                });
                //window.top.uexWindow._iscroll.popName = "pop_" + inPopName;
            }
        },
        setBounce: function(v) {
            window.top.uexWindow._popoverList = window.top.uexWindow._popoverList || {};
            var outUexWin = window.top.uexWindow._popoverList;
            var curUexWin = window.uexWindow;
            
            //页面是否通过popover弹出加载的iframe
            if(!window.top.uexWindow._iscroll){window.top.uexWindow._iscroll={};}
            if(window.top.uexWindow._iscroll.popName){
                var popName = window.top.uexWindow._iscroll.popName;
                outUexWin[popName].enableBounce = (v != 0 ? true : false);
                outUexWin[popName].contentScroll && (outUexWin[popName].contentScroll.options.bounce = outUexWin[popName].enableBounce);
            }else{
                uexWindow._iscroll.enableBounce = (v != 0 ? true : false);
                uexWindow._iscroll.contentScroll && (uexWindow._iscroll.contentScroll.options.bounce = uexWindow._iscroll.enableBounce);
            }
        },
        _setFrameOriginHeight:function(popName){
            var cntWind =  window.top.Zepto("#"+popName+" iframe")[0].contentWindow;
            var retHeight = 0;
            var eles = cntWind.Zepto(".origin-html")[0]&& cntWind.Zepto(".origin-html")[0].children;
            if(eles && eles.length>0){
                for(var i =0;i<eles.length;i++){
                    retHeight += Zepto(eles[i]).height();
                }
            }else{
                retHeight = cntWind.Zepto(".origin-html").height();
            }

            if(retHeight>cntWind.Zepto(".origin-html")[0].offsetHeight){
                Zepto(cntWind.Zepto(".origin-html")[0]).height(retHeight);
            }
            //retHeight && Zepto(cntWind.Zepto(".origin-html")[0]).height(retHeight);
        },
        refreshBounce: function() {
            window.top.uexWindow._popoverList = window.top.uexWindow._popoverList || {};
            var outUexWin = window.top.uexWindow._popoverList;
            var curUexWin = window.uexWindow;
            if(window.top.uexWindow._iscroll.popName){//页面是通过popover弹出加载的iframe
                var popName = window.top.uexWindow._iscroll.popName;
                outUexWin[popName].contentScroll && outUexWin[popName].contentScroll.refresh();
                uexWindow._setFrameOriginHeight(popName);
            }else{
                curUexWin._iscroll.contentScroll && curUexWin._iscroll.contentScroll.refresh();
            }
        },
        showBounceView: function(inType, inColor, inFlag) {
            //uexWindow._iscroll.contentScroll.refresh();//弹动结束后刷新
            inType = (inType === void 0 ? 0 : inType);
            window.top.uexWindow._popoverList = window.top.uexWindow._popoverList || {};
            var outUexWin = window.top.uexWindow._popoverList;
            var curUexWin = window.uexWindow;
            
            if(window.top.uexWindow._iscroll.popName){//页面是通过popover弹出加载的iframe
                var popName = window.top.uexWindow._iscroll.popName;
                if(inType != 0){
                    outUexWin[popName].bottomBounceColor = inColor;
                    outUexWin[popName].bottomBounceShow = inFlag;
                }else{
                    outUexWin[popName].topBounceColor = inColor;
                    outUexWin[popName].topBounceShow = inFlag;
                }
            }else{
                if(inType != 0){
                    curUexWin._iscroll.bottomBounceColor = inColor;
                    curUexWin._iscroll.bottomBounceShow = inFlag;
                }else{
                    curUexWin._iscroll.topBounceColor = inColor;
                    curUexWin._iscroll.topBounceShow = inFlag;
                }
                if(uexWindow._iscroll.enableBounce){
                    bounceSetting(true);
                }else{
                    bounceSetting(false);
                }
            }
        },
        resetBounceView: function(inType) {
            inType = (inType === void 0 ? 0 : inType);
            window.top.uexWindow._popoverList = window.top.uexWindow._popoverList || {};
            var outUexWin = window.top.uexWindow._popoverList;
            var curUexWin = window.uexWindow;
            
            //页面是通过popover弹出加载的iframe
            if(window.top.uexWindow._iscroll.popName){
                var popName = window.top.uexWindow._iscroll.popName;
                if(inType != 0){
                    outUexWin[popName].bottomReset = true;
                }else{
                    outUexWin[popName].topReset = true;
                    
                }
            }else{
                if(inType != 0){
                    curUexWin._iscroll.bottomReset =  true;
                }else{
                    curUexWin._iscroll.topReset = true;
                }
            }
        },
        hiddenBounceView: function(inType) {
            inType = (inType === void 0 ? 0 : inType);
            window.top.uexWindow._popoverList = window.top.uexWindow._popoverList || {};
            var outUexWin = window.top.uexWindow._popoverList;
            var curUexWin = window.uexWindow;
            
            if(window.top.uexWindow._iscroll.popName){//页面是通过popover弹出加载的iframe
                var popName = window.top.uexWindow._iscroll.popName;
                if(inType == 0){
                    outUexWin[popName].topHidden = true;
                }else{
                    outUexWin[popName].bottomHidden = true;
                }
            }else{
                if(inType == 0){
                    curUexWin._iscroll.topHidden =  true;
                }else{
                    curUexWin._iscroll.bottomHidden = true;
                }
            }
        },
        notifyBounceEvent: function(inType, inStatus) {
            inType = (inType === void 0 ? 0 : inType);
            inStatus = (inStatus === void 0 ? 0 : inStatus);
            window.top.uexWindow._popoverList = window.top.uexWindow._popoverList || {};
            var outUexWin = window.top.uexWindow._popoverList;
            var curUexWin = window.uexWindow;
            
            //页面是通过popover弹出加载的iframe
            if(window.top.uexWindow._iscroll.popName){
                var popName = window.top.uexWindow._iscroll.popName;
                if(inType != 0){
                    outUexWin[popName].bottomNotifyState = (inStatus == 0 ? false : true);
                }else{
                    outUexWin[popName].topNotifyState = (inStatus == 0 ? false : true);
                }
            }else{
                if(inType != 0){
                    curUexWin._iscroll.bottomNotifyState = (inStatus == 0 ? false : true);
                }else{
                    curUexWin._iscroll.topNotifyState = (inStatus == 0 ? false : true);
                }
            }
        },
        setBounceParams: function(inType, inJson) {
            try{
                window.top.uexWindow._popoverList = window.top.uexWindow._popoverList || {};
                var outUexWin = window.top.uexWindow._popoverList;
                var curUexWin = window.uexWindow;
                inJson = JSON.parse(inJson);
                
                var bounceImagePath = jsBasePath +'js/resource/blueArrow.png';
                var loadingImagePath = jsBasePath +'js/resource/icon-refresh-act.png';

                var bounceParams = {
                    'imagePath': inJson.imagePath || bounceImagePath,
                    'textColor': inJson.textColor || '#f0ecf3',
                    'levelText': inJson.levelText || '',
                    'pullToReloadText': inJson.pullToReloadText || '拖动刷新',
                    'releaseToReloadText': inJson.releaseToReloadText || '释放刷新',
                    'loadingText': inJson.loadingText || '加载中，请稍等',
                    'loadingImagePath': inJson.loadingImagePath || loadingImagePath
                };

                if(bounceParams.imagePath && bounceParams.imagePath.indexOf('res://') == 0){
                    //bounceParams.imagePath = jsBasePath +"wgtRes/"+ bounceParams.imagePath.split('res://')[1];
                    bounceParams.imagePath = jsBasePath +"wgtRes/"+ bounceParams.imagePath.split('res://')[1];
                }
                
                if(window.top.uexWindow._iscroll.popName){//页面是通过popover弹出加载的iframe
                    var popName = window.top.uexWindow._iscroll.popName;
                    if(inType!=0){
                        outUexWin[popName].bottomParams = bounceParams;
                    }else{
                        outUexWin[popName].topParams = bounceParams;
                    }
                }else{
                    if(inType!=0){
                        curUexWin._iscroll.bottomParams = bounceParams;
                    }else{
                        curUexWin._iscroll.topParams = bounceParams;
                    }
                }
            }catch(e){
                console.log(e);
            }
        },
        openSlibing: function(inType, inDataType, inUrl, inData, inWidth, inHeight) {},
        showSlibing: function(inType) {},
        closeSlibing: function(inType) {},
        evaluateScript: function(inWindowName, inType, inScript) {
            //只支持当前窗口执行
            window.top.eval(inScript);
        },
        evaluatePopoverScript: function(inWindowName, inPopName, inScript) {
            if (window.top.Zepto('#pop_' + inPopName).find('iframe').length > 0) {
                var win = window.top.Zepto('#pop_' + inPopName).find('iframe')[0].contentWindow;
                win.eval(inScript);
            }
        },
        loadObfuscationData: function(inUrl) {},
        back: function() {
            window.top.history.go(-1);
        },
        pageBack: function() {},
        forward: function() {
            
        },
        pageForward: function() {},
        windowBack: function() {},
        windowForward: function() {},
        alert: function(inTitle, inMessage, inButtonLable,isJackJones) {
            
            var plugincss = jsBasePath + "js/resource/appcan.plugin.css";
            loadjscssfile(plugincss,"css");
            var alertHtml;
            if(isJackJones){
                alertHtml = '<div class="loader_alert up ub ub-ver" style="background-color:rgba(0,0,0,.5);display:none !important;">'+
                    '<div class="ub-f1 tx-l t-bla zhy_top" >'+
                     '   <div class="ub ub-ver  zhy_win">'+
                      '      <div class="uinn uc-t1">'+
                       '         <div class="ub ub-ver  t-wh " style="color:#000;background:#ffffff;opacity:1;">'+
                        '            <div class=" uc-t1 tx-c zhy_border ">'+
                         '               <div class="uinn loader_alert_1" style="padding:0.8em;">提示</div>'+
                          '              <div class="uinn loader_alert_2"> 一旦提交，无法撤销</div>'+
                           '         </div>'+
                            '        <div class=" " onclick="uexWindow.closeAlert()">'+
                             '           <div class="ub tx-c">'+
                              '              <div class=" ub-f1 zhy_pading loader_alert_3" style="backgroud:#000000;color:#ffffff;margin:1em 3em;">确定</div>'+
                               '         </div>'+
                                '    </div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>';
            }else{
                alertHtml = '<div class="loader_alert up ub ub-ver" style="background-color:rgba(0,0,0,.5);display:none !important;"><div class="ub-f1 tx-l t-bla zhy_top" ><div class="ub ub-ver  zhy_win"><div class="uinn uc-t1"><div class="ub ub-ver zhy_bg t-wh uc-a "><div class="zhy_uinn uc-t1 tx-c zhy_border ubb"><div class="uinn loader_alert_1">提示</div><div class="uinn loader_alert_2"> 一旦提交，无法撤销</div></div><div class=" " onclick="uexWindow.closeAlert()"><div class="ub tx-c"><div class=" ub-f1 zhy_pading loader_alert_3">确定</div></div></div></div></div></div></div></div>';
            }
            
            if (Zepto('.loader_alert').length == 0) {
                Zepto('body').append(alertHtml);
            }
            Zepto(".loader_alert_1").html(inTitle);
            Zepto(".loader_alert_2").html(inMessage)
            Zepto(".loader_alert_3").html(inButtonLable)
            var alertZIndex = currZIndex2++;
            Zepto('.loader_alert').css({
                "color":"rgba(225,225,225,225)",
                "background-color": "rgba(0,0,0,.5)",
                "z-index": alertZIndex
            }).show();
        },
        closeAlert: function() {
            Zepto('.loader_alert').css({
                display: 'none !important'
            });
        },
        confirm: function(inTitle, inMessage, inButtonLable,isJackJones) {
            var plugincss = jsBasePath + "js/resource/appcan.plugin.css";
            loadjscssfile(plugincss,"css");
            var confirmHtml = '';
            if(isJackJones){
                confirmHtml = '<div class="loader_confirm up ub ub-ver"style="position:fixed;top:0;width:100%;height:100%;background-color:rgba(0,0,0,.5);display:none !important;"><div class="ub-f1 tx-l t-bla zhy_top"><div class="ub ub-ver uinn"><div class="uinn uc-t1"><div class="ub ub-ver zhy_bg t-wh " style="background:#fff;opacity:1;color:#000;"><div class="zhy_uinn tx-c zhy_border " style="padding:0;"><div class="uinn loader_confirm_1" style="background:#000;color:#fff;padding:0.8em;">您确定进行账户转换操作么？</div><div class="uinn loader_confirm_2" style="padding:0.8em;"> 一旦提交，无法撤销 </div></div><div class=" "><div class="ub tx-c loader_confirm_3"><div class="ubr zhy_border ub-f1 zhy_pading" style="margin:1em 3em;background:#000;color:#fff;padding:0.5em 0;" onclick="uexWindow._cbConfirm(0,0,0)">确定</div><div class="ub-f1 zhy_pading" style="margin:1em 3em;background:#000;color:#fff;padding:0.5em 0;" onclick="uexWindow._cbConfirm(0,0,1)">取消</div></div></div></div></div></div></div></div>';
            }else{
                confirmHtml = '<div class="loader_confirm up ub ub-ver"style="position:fixed;top:0;width:100%;height:100%;background-color:rgba(0,0,0,.5);display:none !important;"><div class="ub-f1 tx-l t-bla zhy_top"><div class="ub ub-ver uinn"><div class="uinn uc-t1"><div class="ub ub-ver zhy_bg t-wh uc-a "><div class="zhy_uinn uc-t1 tx-c zhy_border ubb"><div class="uinn loader_confirm_1">您确定进行账户转换操作么？</div><div class="uinn loader_confirm_2"> 一旦提交，无法撤销 </div></div><div class=" "><div class="ub tx-c loader_confirm_3"><div class="ubr zhy_border ub-f1 zhy_pading" onclick="uexWindow._cbConfirm(0,0,0)">确定</div><div class="ub-f1 zhy_pading" onclick="uexWindow._cbConfirm(0,0,1)">取消</div></div></div></div></div></div></div></div>';    
            }
            
            
            if (Zepto('.loader_confirm').length == 0) {
                Zepto('body').append(confirmHtml);
            }
            Zepto(".loader_confirm_1").html(inTitle);
            Zepto(".loader_confirm_2").html(inMessage);
            
            var bl = inButtonLable.length;
            if (bl == 1) {
                if(isJackJones){
                    Zepto(".loader_confirm_3").html('<div class="ub-f1 zhy_pading" style="margin:1em 3em;background:#000;color:#fff;padding:0.5em 0;" onclick="uexWindow._cbConfirm(0,0,0)">' + inButtonLable[0] + '</div>');
                }else{
                    Zepto(".loader_confirm_3").html('<div class="ub-f1 zhy_pading" onclick="uexWindow._cbConfirm(0,0,0)">' + inButtonLable[0] + '</div>');
                }
            }
            if (bl == 2) {
                if(isJackJones){
                    Zepto(".loader_confirm_3").html('<div class="ubr zhy_border ub-f1 zhy_pading" style="margin:1em;background:#000;color:#fff;padding:0.5em 0;" onclick="uexWindow._cbConfirm(0,0,0)">' + inButtonLable[0] + '</div><div class="ub-f1 zhy_pading" style="margin:1em;background:#000;color:#fff;padding:0.5em 0;" onclick="uexWindow._cbConfirm(0,0,1)">' + inButtonLable[1] + '</div>');
                }else{
                    Zepto(".loader_confirm_3").html('<div class="ubr zhy_border ub-f1 zhy_pading" onclick="uexWindow._cbConfirm(0,0,0)">' + inButtonLable[0] + '</div><div class="ub-f1 zhy_pading" onclick="uexWindow._cbConfirm(0,0,1)">' + inButtonLable[1] + '</div>');
                }
            }
            if (bl == 3) {
                if(isJackJones){
                    Zepto(".loader_confirm_3").html('<div class="ubr zhy_border ub-f1 zhy_pading" style="margin:1em;background:#000;color:#fff;padding:0.5em 0;" onclick="uexWindow._cbConfirm(0,0,0)">' + inButtonLable[0] + '</div><div class="ubr zhy_border ub-f1 zhy_pading" style="margin:1em;background:#000;color:#fff;padding:0.5em 0;" onclick="uexWindow._cbConfirm(0,0,1)">' + inButtonLable[1] + '</div><div class="ub-f1 zhy_pading" style="margin:1em;background:#000;color:#fff;padding:0.5em 0;" onclick="uexWindow._cbConfirm(0,0,2)">' + inButtonLable[2] + '</div>');
                }else{
                    Zepto(".loader_confirm_3").html('<div class="ubr zhy_border ub-f1 zhy_pading" onclick="uexWindow._cbConfirm(0,0,0)">' + inButtonLable[0] + '</div><div class="ubr zhy_border ub-f1 zhy_pading" onclick="uexWindow._cbConfirm(0,0,1)">' + inButtonLable[1] + '</div><div class="ub-f1 zhy_pading" onclick="uexWindow._cbConfirm(0,0,2)">' + inButtonLable[2] + '</div>');
                }
            }
            var confirmZIndex = currZIndex2++;
           
            setTimeout(function(){ 
                 Zepto('.loader_confirm').css({
                     "color":"rgba(225,225,225,225)",
                     "background-color": "rgba(0,0,0,.5)",
                     "z-index": confirmZIndex
                 }).show();
                 $('.loader_confirm').on('touchmove', function(){return false;});
            },30);
        },
        _cbConfirm: function(opid, dataType, data) {
            Zepto('.loader_confirm').css({
                display: 'none !important'
            });
            uexWindow.cbConfirm && uexWindow.cbConfirm(opid, 2, data);
        },
        prompt: function(inTitle, inMessage, inDefaultValue, inButtonLable) {},
        toast: function(inType, inLocation, inMsg, inDuration) {
            var plugincss = jsBasePath + "js/resource/appcan.plugin.css";
            loadjscssfile(plugincss,"css");
            var toastHtml = '<div class="loader_toast up ub ub-ver" style="position:fixed;top:0;width:100%;height:100%;background-color:rgba(0,0,0,.2);display:none !important;"><div class="ub-f1 tx-l t-bla zhy_top"><div class="ub uinn zhy_win"><div class="ub-f1"></div><div class="uinn ub-f1 uc-t1"><div class="ub ub-ver zhy_bg t-wh uc-a loader_toast_1"><div class="ub ub-pc ub-ac uinn"><div class="zhy_jiazai"></div></div><div class=" uc-t1 tx-c"><div class="uinn">登录成功！</div></div></div></div><div class="ub-f1"></div></div></div></div>'; 
            if (Zepto('.loader_toast').length == 0) {
                Zepto('body').append(toastHtml);
            }

            if (parseInt(inType) == 0) {
                Zepto(".loader_toast_1").html('<div class="zhy_uinn uc-t1 tx-c"><div class="uinn">' + inMsg + '</div></div>');
            } else {
                Zepto(".loader_toast_1").html('<div class="ub ub-pc ub-ac uinn"><div class="zhy_jiazai"></div></div><div class=" uc-t1 tx-c"><div class="uinn">' + inMsg + '</div></div>');
            }
            if (inDuration && inDuration != '0' && parseInt(inDuration) > 0) {
                var T = setTimeout(function() {
                    //2016.07.07 阻止浮层事件
                    $('.loader_toast').on('touchmove', function(){return true;})
                    uexWindow.closeToast();
                }, inDuration);
            }
            var toastZIndex = currZIndex2++;
            Zepto('.loader_toast').css({
                //'position':'fixed',//2016.05.05解决页面超过一屏显示问题
                "color":"rgba(225,225,225,225)",
                'background-color': 'rgba(0,0,0,.2);',
                'z-index': toastZIndex
            }).show();

            //2016.07.07 阻止浮层事件
           $('.loader_toast').on('touchmove', function(){return false;});
           /*setTimeout(function(){
               $('.loader_toast').on('touchmove', function(){return true;})
           },2000);*/
        },
        closeToast: function() {
            Zepto('.loader_toast').css({
                'display': 'none !important;'
            });
        },
        actionSheet: function(inTitle, inCancel, inButtonLables) {

            var plugincss = jsBasePath + "js/resource/appcan.plugin.css";
            loadjscssfile(plugincss,"css");
            var actionSheetHtml = '<div class="loader_actionsheet" style="background-color:rgba(0,0,0,.2);display:none !important;position:fixed;width:100%;height:100%;bottom:0;left:0;">\
                <div class="ub-f1 tx-l t-bla" style="width:100%;height:100%;">\
                <div class="ub ub-ver  zhy_winss" style="position:relative !important;">\
                <div class=" uc-t1" style="position:absolute;bottom:0;left:0;width:100%;">\
                <div class="ub ub-ver zhy_bg t-wh ">\
                <div class=" uc-t1 tx-c">\
                <div class="uinn loader_actionsheet_1">提示</div>\
                <div class="uinn loader_actionsheet_2"></div></div><div class=" "><div class="ub tx-c" onclick="uexWindow._cbActionSheet()"><div class=" ub-f1 zhy_pading loader_actionsheet_3">取消</div></div></div></div></div></div></div></div>';
            if (Zepto('.loader_actionsheet').length == 0) {
                Zepto('body').append(actionSheetHtml);
            }
            Zepto('.loader_actionsheet_1').html(inTitle);
            var btnstr = '';
            for (var i = 0; i < inButtonLables.length; i++) {
                if (i > 4) {
                    break;
                }
                btnstr += '<div class="ub tx-c zhy_border ubb"  onclick="uexWindow._cbActionSheet(\'' + i + '\')"><div class=" ub-f1 zhy_pading">' + inButtonLables[i] + '</div></div>'
            }
            Zepto('.loader_actionsheet_2').html(btnstr);
            Zepto('.loader_actionsheet_3').html(inCancel);

            var actionSheetZIndex = currZIndex2++;
            setTimeout(function(){ 
                Zepto('.loader_actionsheet').css({
                    "color":"rgba(225,225,225,225)",
                    "background-color": 'rgba(0,0,0,.2);',
                    "z-index": actionSheetZIndex
                }).show();
                $('.loader_actionsheet').on('touchmove', function(){return false;});
            },30);
            return false;
        },
        _cbActionSheet: function(index) {
            Zepto('.loader_actionsheet').css({
                display: 'none !important'
            });
            if (index) {
                uexWindow.cbActionSheet && uexWindow.cbActionSheet('0', '0', index);
            }
        },
        getState: function() {
            return 0;
        },
        onOAuthInfo: function(windowName, url) {},
        setReportKey: function(inKeyCode, inEnable) {},
        preOpenStart: function() {},
        preOpenFinish: function() {},
        getUrlQuery: function() {},
        didShowKeyboard: function() {},
        beginAnimition: function() {},
        setAnimitionDelay: function(inDelay) {},
        setAnimitionDuration: function(inDuration) {},
        setAnimitionCurve: function(InCurve) {},
        setAnimitionRepeatCount: function(InCount) {},
        setAnimitionAutoReverse: function(inReverse) {},
        makeTranslation: function(inToX, inToY, inToZ) {},
        makeScale: function(inToX, inToY, inToZ) {},
        makeRotate: function(inDegrees, inX, inY, inZ) {},
        makeAlpha: function(inAlpha) {},
        commitAnimition: function() {},
        openAd: function(inType, inDTime, inInterval, inFlag) {},
        statusBarNotification: function(inTitle, inMsg) {},
        bringToFront: function() {},
        sendToBack: function() {},
        insertAbove: function(inName) {},
        insertBelow: function(inName) {},
        insertPopoverAbovePopover: function(inNameA, inNameB) {},
        insertPopoverBelowPopover: function(inNameA, inNameB) {},
        bringPopoverToFront: function(inName) {
            Zepto = top.Zepto||Zepto;
            uexWindow = window.top.uexWindow || window.uexWindow;
            var ZIndex = currZIndex++;
            var lastPop = null;
            var popList = Zepto("iframe[id^='iframe_pop_']");
            
            Zepto.each(popList,function(i,v){
                var contentWrapper =Zepto(popList[i].contentDocument.querySelector("#selfWrapper")); 
                if(popList[i].id && popList[i].id !="iframe_pop_"+inName){
                    Zepto(popList[i]).css("display","block");
                    contentWrapper.css("overflow","hidden");
                }else if(popList[i].id && popList[i].id == "iframe_pop_"+inName){
                    // contentWrapper.css({
                        // "-webkit-overflow-scrolling":"auto",
                        // "overflow":"auto", 
                        // "height":'100%'
                    // });
                    Zepto(popList[i]).css("display","none");
                    contentWrapper.css("overflow","auto");
                }
            });
            
            Zepto("#pop_" + inName).css('z-index', ZIndex);
            uexWindow._iscroll.popName = "pop_" + inName;
            var pageHistory = sessionStorage.getItem('pageHistory');
            var windName = null;
            if(pageHistory){
                pageHistory = JSON.parse(pageHistory);
                windName = pageHistory.curWind;
                lastPop = pageHistory['win_'+windName].lastPop;
                pageHistory['win_'+windName].prevPop = lastPop;
                pageHistory['win_'+windName].lastPop = "pop_" + inName;
                sessionStorage.setItem('pageHistory',JSON.stringify(pageHistory));
            }
        },
        sendPopoverToBack: function(inName) {

        },
        setSwipeRate: function(inRate) {},
        insertWindowAboveWindow: function(inNameA, inNameB) {},
        insertWindowBelowWindow: function(inNameA, inNameB) {},
        setWindowHidden: function(inVisible) {},
        setOrientation: function(orientation) {},
        setWindowScrollbarVisible: function(Visible) {},
        postGlobalNotification: function() {},
        subscribeChannelNotification: function() {},
        publishChannelNotification: function() {},
        getState: function() {},
        statusBarNotification: function() {},
        setMultilPopoverFlippingEnbaled: function(inEnable){}
    };
    
    /*
        author:jiaobingqian
        email:bingqian.jiao@3g2win.com
        description:uexAudio weixin录音接口
        create:2015.08.07
        update:______/___author___

    */
 
    window.uexAudio = {
        currentPath:'',
        open:function(path){
            if(isWeiXin()){
                this.currentPath = path;
                return;
            }
        },
        play:function(repeats){
            var wx = window.top.wx;
            var that = this;
            if(isWeiXin()){
                wx.ready(function(){
                    wx.playVoice({
                        localId: that.currentPath // 需要播放的音频的本地ID，由stopRecord接口获得
                    });
                    
                    wx.onVoicePlayEnd({
                        success: function (res) {
                            var localId = res.localId; // 返回音频的本地ID
                            uexAudio.onPlayFinished && uexAudio.onPlayFinished(1);
                        }
                    });
                });
                
                return;
            }
        },
        pause:function(){
            var wx = window.top.wx;
            var that = this;
            if(isWeiXin()){
                wx.ready(function(){
                    wx.pauseVoice({
                        localId: that.currentPath // 需要暂停的音频的本地ID，由stopRecord接口获得
                    });
                });
                return;
            }
        },
        replay:function(){
            var wx = window.top.wx;
            var that = this;
            if(isWeiXin()){
                wx.ready(function(){
                    
                    wx.playVoice({
                        localId: that.currentPath // 需要播放的音频的本地ID，由stopRecord接口获得
                    });
                    
                    wx.onVoicePlayEnd({
                        success: function (res) {
                            var localId = res.localId; // 返回音频的本地ID
                            uexAudio.onPlayFinished && uexAudio.onPlayFinished(1);
                        }
                    });
                    
                });
                return;
            }
            
        },
        stop:function(){
            var wx = window.top.wx;
            var that = this;
            if(isWeiXin()){
                
                wx.ready(function(){
                    wx.stopVoice({
                        localId: that.currentPath // 需要停止的音频的本地ID，由stopRecord接口获得
                    });
                });
                return;
            }
        },
        volumeUp:function(){
            
            
        },
        volumeDown:function(){
            
            
        },
        openPlayer:function(){
            
        },
        closePlayer:function(){
            
        },
        startBackgroundRecord:function(mode,filename){

            var wx = window.top.wx;
            if(isWeiXin()){
                wx.ready(function(){
                    wx.startRecord({
                      cancel: function () {
                        //alert('用户拒绝授权录音');
                      }
                    });
                    wx.onVoiceRecordEnd({
                        // 录音时间超过一分钟没有停止的时候会执行 complete 回调
                        complete: function (res) {
                            var localId = res.localId;
                            uexAudio.cbBackgroundRecord && uexAudio.cbBackgroundRecord(0,1,localId);
                        }
                    });
                });
                return;
            }
            //否则不支持
            
        },
        stopBackgroundRecord:function(){
            var wx = window.top.wx;
            
            if(isWeiXin()){
                wx.ready(function(){
                    wx.stopRecord({
                        success: function (res) {
                            var localId = res.localId;
                            uexAudio.cbBackgroundRecord && uexAudio.cbBackgroundRecord(0,1,localId);
                        },
                        fail: function (res) {
                            alert(JSON.stringify(res));
                        }
                    });
                });
                return;
            }
            //否则不支持
            
        },
        record:function(){
            
            
        },
        openSoundPool:function(){
            
            
        },
        addSound:function(){
            
            
        },
        playFromSoundPool:function(){
            
            
        },
        stopFromSoundPool:function(){
            
            
        },
        closeSoundPool:function(){
            
            
        }
    }
    
    /*
        author:jiaobingqian
        email:bingqian.jiao@3g2win.com
        description:uexBaiduMap百度地图接口
        create:2015.08.07
        update:______/___author___
    */
    window.uexBaiduMap = {
        currentInfo:{
            latitude:0,
            longitude:0,
            scale:1
        },
        open:function(x,y,width,height,longitute,latitute){
            var wx = window.top.wx;
            var that = this;
            if(isWeiXin()){
                wx.ready(function(){
                    wx.openLocation({
                        latitude: parseFloat(latitute,10) || that.currentInfo.latitude, // 纬度，浮点数，范围为90 ~ -90
                        longitude: parseFloat(longitute,10) || that.currentInfo.longitude, // 经度，浮点数，范围为180 ~ -180。
                        name: '', // 位置名
                        address: '', // 地址详情说明
                        scale: that.currentInfo.scale || 1, // 地图缩放级别,整形值,范围从1~28。默认为最大
                        infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
                    });
                });
            }
        },
        close:function(){
            
        },
        setMapType:function(){
            
            
        },
        setTrafficEnabled:function(){
            
            
        },
        setCenter:function(longitude,latitude){
            
            this.currentInfo.longitude = longitude;
            this.currentInfo.latitude = latitude;
            
        },
        setZoomLevel:function(level){
            
            this.currentInfo.scale = level;
            
        },
        zoomIn:function(){
            
            
        },
        zoomOut:function(){
            
            
        },
        rotate:function(){
            
            
        },
        overlook:function(){
            
            
        },
        setZoomEnable:function(){
            
            
        },
        setRotateEnable:function(){
            
            
        },
        setScrollEnable:function(){
            
            
        },
        setOverlookEnable:function(){
            
            
        },
        addMarkersOverlay:function(){
            
            
        },
        setMarkerOverlay:function(){
            
            
        },
        showBubble:function(){
            
            
        },
        hideBubble:function(){
            
            
        },
        addDotOverlay:function(){
            
            
        },
        addPolylineOverlay:function(){
            
            
        },
        addArcOverlay:function(){
            
            
        },
        addCircleOverlay:function(){
            
            
        },
        addPolygonOverlay:function(){
            
            
        },
        addGroundOverlay:function(){
            
            
        },
        addTextOverlay:function(){
            
            
        },
        removeMakersOverlay:function(){
            
            
        },
        poiSearchInCity:function(){
            
            
        },
        poiBoundSearch:function(){
            
            
        },
        busLineSearch:function(){
            
            
        },
        removeBusLine:function(){
            
            
        },
        perBusLineNode:function(){
            
            
        },
        nextBusLineNode:function(){
            
            
        },
        searchRoutePlan:function(){
            
            
        },
        removeRoutePlan:function(){
            
            
        },
        preRouteNode:function(){
            
            
        },
        nextRouteNode:function(){},
        geocode:function(){
            
            
        },
        reverseGeocode:function(){
            
            
        },
        getCurrentLocation:function(){
            var wx = window.top.wx;
            if(isWeiXin()){
                wx.ready(function(){
                    wx.getLocation({
                        success: function (res) {
                            var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                            var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                            var speed = res.speed; // 速度，以米/每秒计
                            var accuracy = res.accuracy; // 位置精度
                            
                            uexBaiduMap.cbCurrentLocation && uexBaiduMap.cbCurrentLocation({
                                latitude:latitude,
                                longitude:longitude,
                                speed:speed,
                                accuracy:accuracy
                            });
                            
                        }
                    });
                });
                return;
            }
            
        },
        startLocation:function(){
            
            
        },
        stopLocation:function(){
            
            
        },
        setMyLocationEnable:function(){
            
            
        },
        setUserTrackingMode:function(){
            
            
        }
    }
    
    /*
        author:jiaobingqian
        email:bingqian.jiao@3g2win.com
        description:uexImageBrowser
        create:2015.08.07
        update:______/___author___

    */
    window.uexImageBrowser = {
        viewer:null,
        viewerScroller:null,
        open:function(imgList,index){
            var wx = window.top.wx;
            if(isWeiXin()){
                wx.ready(function(){
                    wx.previewImage({
                        current: index || 0, // 当前显示的图片链接
                        urls: imgList|| [] // 需要预览的图片链接列表
                    });
                });
                return;
            }else{
                var that = this;
                var wt = window.innerWidth;
                //create image preview
                if(!this.viewer){
                    this.viewer = document.createElement('div');
                
                
                    this.viewer.innerHTML = '<div class="imagewidget_wraper">'+
                            '<div class="imagewidget-header">'+
                            '   <div class="imagewidget-header-close"></div>'+
                            '   <div class="imagewidget-header-index">'+
                            '       <span>0/0</span>'+
                            '   </div>'+
                            '</div>'+
                            '<div class="imagewidget-content-wrap">'+
                            '    <div class="imagewidget-content">'+
                            '    </div>'+
                            '</div>'+
                        '</div>';
                    
                    this.viewer.querySelector('.imagewidget-header-close').onclick = function(){
                        that.viewerScroller.destroy();
                        that.viewerScroller=null;
                        that.viewer.style.display = 'none';
                    };
                    
                }else{
                    that.viewer.style.display = 'block';
                } 
                var cwrap = this.viewer.querySelector('.imagewidget-content-wrap');
                var wcontent = this.viewer.querySelector('.imagewidget-content');
                var imgIndex = this.viewer.querySelector('.imagewidget-header-index > span');
                var tmpList = '';
                
                //reset
                imgIndex.innerHTML = '1/1';
                
                for(var i=0,len=imgList.length;i<len;i++){
                   
                    var imgUrl=null;
                    
                    //fixed web bug
                    if(typeof imgList[i] =='object' && imgList[i].name){
                        if(window.URL) {
                            imgUrl =  window.URL.createObjectURL(imgList[i]);
                        }else if(window.webkitURL) {
                            imgUrl =  window.webkitURL.createObjectUrl(imgList[i]);
                        }else{
                            
                        }
                    }else{
                        imgUrl = imgList[i];
                    }
                    tmpList += '<div style="width:'+wt+'px"><img style="width:100%;" src="'+imgUrl+'" /></div>';
                    
                }
                
                wcontent.innerHTML = tmpList;
                imgIndex.innerHTML = '1/'+imgList.length;
                
                wcontent.style.width = window.innerWidth * imgList.length+'px';
                cwrap.style.height = (window.innerHeight - 40 )+"px"
                
                this.viewer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#FFF';
                
                
                
                document.body.appendChild(this.viewer);
                
                this.viewerScroller =  new IScroll('.imagewidget-content-wrap',{momentum:false,snap: true, scrollX: true, scrollY: false, mouseWheel: true});
                
                var viewerScroller = this.viewerScroller;
                
                this.viewerScroller.on('scrollEnd',function(e){
                    var curr = viewerScroller.currentPage;
                    imgIndex.innerHTML = (curr.pageX + 1)+'/'+imgList.length;
                });
                
            }
        },
        pick:function(){
            var wx = window.top.wx;
            if(isWeiXin()){
                wx.ready(function(){
                    wx.chooseImage({
                        success: function (res) {
                            var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                            //调用uexImageBrowser cbpick
                            uexImageBrowser.cbPick && uexImageBrowser.cbPick(0,1,localIds);
                        },fail:function(res){
                            alert(JSON.stringify(res));
                        }
                    });
                });
                return;
            }else{
                
                //创建创建input
                var fileSelector = document.createElement('input');
                fileSelector.setAttribute('type','file');
                fileSelector.style.visibility = 'hidden';
                fileSelector.style.width = 0;
                fileSelector.style.height = 0;
                
                fileSelector.click();
                //fixed webkit webview bug
                 // setTimeout(function(){
                    // fileSelector.click();
                 // },0);
                fileSelector.onchange = function(){
                    
                    var localIds = Array.prototype.slice.call(this.files,0);
                    //调用uexImageBrowser cbpick
                    uexImageBrowser.cbPick && uexImageBrowser.cbPick(0,1,localIds);
                };
                document.body.appendChild(fileSelector);
            }
            
        },
        save:function(){
            
        },
        cleanCache:function(){
            
        },
        pickMulti:function(){
            var wx = window.top.wx;
            if(isWeiXin()){
                wx.ready(function(){
                    wx.chooseImage({
                        success: function (res) {
                            var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                            //调用uexImageBrowser cbpick
                            uexImageBrowser.cbPick && uexImageBrowser.cbPick(0,1,localIds);
                        }
                    });
                });
                return;
            }else{
                //创建创建input
                var fileSelector = document.createElement('input');
                fileSelector.setAttribute('type','file');
                fileSelector.setAttribute('multiple','multiple');
                fileSelector.style.visibility = 'hidden';
                fileSelector.style.width = 0;
                fileSelector.style.height = 0;
                fileSelector.click();
                fileSelector.onchange = function(){
                    var localIds = Array.prototype.slice.call(this.files,0);
                    //调用uexImageBrowser cbpick
                    uexImageBrowser.cbPick && uexImageBrowser.cbPick(0,1,localIds);
                };
                document.body.appendChild(fileSelector);
            }
            
        }

    }
    
    /*
        author:jiaobingqian
        email:bingqian.jiao@3g2win.com
        description:uexDevice
        create:2015.08.07
        update:______/___author___

    */
    window.uexDevice = {
        vibrate:function(){
            
            
        },
        cancelVibrate:function(){
            
            
            
        },
        getInfo:function(infoId){
            if(infoId == 13){
                if(isWeiXin()){
                    var wx = window.top.wx;
                    wx.ready(function(){
                        
                        wx.getNetworkType({
                            success: function (res) {
                                var networkType = res.networkType; // 返回网络类型2g，3g，4g，wifi
                                var cbRes = -1;
                                if(networkType == 'wifi'){
                                    cbRes = 0;
                                }else if(networkType == '3g'){
                                    cbRes = 1;
                                }else if(networkType == '2g'){
                                    cbRes = 2;
                                }else if(networkType == '4g'){
                                    cbRes = 3;
                                }
                                uexDevice.cbGetInfo && uexDevice.cbGetInfo(0,1,{
                                    connectStatus:cbRes
                                });
                            }
                        });
                        
                    });
                }
                return;
            }
        }
    }
    
    /*
        author:jiaobingqian
        email:bingqian.jiao@3g2win.com
        description:uexScanner 微信二维码扫描接口
        create:2015.08.07
        update:______/___author___

    */
    window.uexScanner = {
        open:function(flag){
            var wx = window.top.wx;
            if(isWeiXin()){
                flag = flag === void 0 ? 1:0;
                wx.ready(function(){
                    wx.scanQRCode({
                        needResult: flag, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                        scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
                        success: function (res) {
                            var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                            uexScanner.cbOpen && uexScanner.cbOpen(0,1,{
                                type:'',
                                code:result
                            });
                        }
                    });
                });
                return;
            }
        }
    }
    
    /*
        author:jiaobingqian
        email:bingqian.jiao@3g2win.com
        description:uexActionSheet
        create:2015.08.07
        update:______/___author___

    */
    window.uexActionSheet = {

    }
    
    /*
        author:jiaobingqian
        email:bingqian.jiao@3g2win.com
        description:uexButton
        create:2015.08.07
        update:______/___author___

    */
    window.uexButton = {
        
    }
    
    /*
        author:jiaobingqian
        email:bingqian.jiao@3g2win.com
        description:uexVideo
        create:2015.08.07
        update:______/___author___

    */
    window.uexVideo= {

    }
    
    /*
        author:jiaobingqian
        email:bingqian.jiao@3g2win.com
        description:uexWidget
        create:2015.08.07
        update:______/___author___

    */
    window.uexWidget = {
        
        
    }
    
    /*
        author:jiaobingqian
        email:bingqian.jiao@3g2win.com
        description:uexWidgetOne
        create:2015.08.07
        update:______/___author___

    */
    window.uexWidgetOne = {
        getPlatform:function(){}
    }
    
    /*
        author:jiaobingqian
        email:bingqian.jiao@3g2win.com
        description:uexXmlHttpMgr
        create:2015.08.07
        update:______/___author___
    */
    // window.uexXmlHttpMgr = {
        
    // }
    
    /*
        author:jiaobingqian
        email:bingqian.jiao@3g2win.com
        description:uexLog
        create:2015.08.07
        update:______/___author___

    */
    window.uexLog = {
        
        
    }
    
    /*
        author:jiaobingqian
        email:bingqian.jiao@3g2win.com
        description:uexListView
        create:2015.08.07
        update:______/___author___

    */
    window.uexListView = {

    }
    window.uexCall = {

    }
    window.uexCamera = {

    }
    window.uexClipboard = {

    }
    window.uexContact = {

    }
    window.uexControl = {

    }
    window.uexDataBaseMgr = {

    }
    window.uexDocumentReader = {

    }
    window.uexEmail = {

    }
    window.uexFileMgr = {

    }
    window.uexLocalNotification = {

    }
    window.uexLocation = {

    }
    window.uexMMS = {

    }
    window.uexSensor = {

    }
    window.uexSMS = {

    }
    window.uexZip = {

    }
    window.uexCreditCardRec = {

    }
    window.uexPDFReader = {

    }
    window.uexBrokenLine = {
        setData:function(obj){
            
        },
        open:function(x,y,width,height,id){
            
        }

    }
    window.uexCoverFlow2 = {

    }
    window.uexEditDialog = {

    }
    window.uexHexagonal = {

    }
    window.uexIndexBar = {

    }
    window.uexPie = {

    }
    window.uexPieChart = {

    }
    window.uexSlidePager = {

    }
    window.uexTimeMachine = {

    }
    window.uexWheel = {

    }
    window.uexCityListView = {

    }
    window.uexDataAnalysis = {

    }
    window.uexDownloaderMgr = {

    }
    window.uexSocketMgr = {

    }
    window.uexUploaderMgr = {

    }
    window.uexAliPay = {

    }
    window.uexSina = {

    }
    window.uexWeixin = {

    }
    window.uexTent = {

    }
    window.uexQQ = {

    }
    window.uexTestinCrash = {

    }
    window.uexGaodeMap = {

    }
    window.uexJPush = {

    }
    window.uexScrollPicture = {

    }
    window.uexEasemob = {

    }
    window.uexGetui = {

    }
    window.uexXGPush = {

    }
    window.uexMeChat = {

    }
    window.uexPingpp = {

    }
    window.uexIFlytekMsc = {
        
    }
    window.uexHYFont = {
        
    }
    
    //web/微信版本入口
    //执行uexOnload方法
    //window.uexOnload && window.uexOnload(1);
    //window.uexOnload = null;
    
    if(isWebApp || isWeiXin()){
        window.uexWindow = uexWindow;
        window.uexWidgetOne = uexWidgetOne;
        window.uexWidget = uexWidget;
        window.uexImageBrowser = uexImageBrowser;
        window.uexAudio = uexAudio;
        window.uexDevice = uexDevice;
        window.uexBaiduMap = uexBaiduMap;
        
        window.uexScanner = uexScanner;
        window.uexButton = uexButton;
        window.uexActionSheet = uexActionSheet;
        window.uexListView = uexListView;
        window.uexLog = uexLog;
        window.uexVideo = uexVideo;
        //window.uexXmlHttpMgr = uexXmlHttpMgr;
        
        //执行uexOnload方法
        
        window.uexOnload && window.uexOnload(1);
        window.uexOnload = null;
        
        Zepto(document).ready(function(){
            var popParams = null;
            var pageHistory = null;
            var isBackPage = null;
            var curWindName = null;
            var lastPop = null;
            var popTabIndex = 0;
            var lastPopInfo = null;
            if(self == top){
                pageHistory = sessionStorage.getItem('pageHistory');
                //isBackPage = getQueryString('isBack');
                isBackPage = window.location.hash;
                if(pageHistory && isBackPage && isBackPage =='#isBack'){
                    pageHistory = JSON.parse(pageHistory);
                    curWindName = pageHistory.curWind;
                    if(pageHistory['win_'+curWindName]){
                        lastPop = pageHistory['win_'+curWindName].lastPop;
                        lastPopInfo = pageHistory['win_'+curWindName][lastPop];
                        if(pageHistory['win_'+curWindName].lastPop != pageHistory['win_'+curWindName].firstPop){
                            uexWindow.openPopover(lastPopInfo);
                        }
                        popTabIndex = pageHistory[curWindName + "_" + lastPop +"_tabIndex"];
                    }
                    if(window.onUexWindowClose && typeof(window.onUexWindowClose) == 'function'){
                        window.onUexWindowClose({'tabIndex':popTabIndex});
                    }
                    window.location.hash = '';
                }else if(!pageHistory && !isBackPage){
                    pageHistory = {
                        'firstWind':'default',
                        'prevWind':'default',
                        'curWind':'default',
                        'windList':['default'], //递增序列
                        'win_default':{
                            'openArgs':{
                                'inWindName':'default',
                                'inData':window.location.href,
                                'inDataType':0,
                                'inAniID':0,
                                'inWidth':0,
                                'inHeight':0,
                                'inFlag':0
                            }
                        }
                    };
                    sessionStorage.setItem('pageHistory',JSON.stringify(pageHistory));
                }
            }else{
                //iframe加载完成
            }
            window.uexOnload && window.uexOnload(1);
            window.uexOnload =null;
        })
    }
    

})();

