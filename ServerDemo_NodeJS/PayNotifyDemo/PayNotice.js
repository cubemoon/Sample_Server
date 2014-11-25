var http = require('http');
var qs = require('querystring');
var crypto = require('crypto');
var privateKey="696064B29E9A0B7DDBD6FCB88F34A555";

/**
 * anysdk 支付通知白名单判断
 */
var checkAnySDKServer=function (paramIP){
     var ips=["211.151.20.126", "211.151.20.127"];
     if(ips[0]==paramIP || ips[1]==paramIP){
         return true;
     }else{
         return false;
     }
 }
 
 
/**
 * 验签
 * @param array params 
 * @param array priKey AnySDK分配的游戏privateKey
 * @return bool
 */
var checkSign=function(params, priKey){
    if(params==null || params["sign"]==null || priKey==null){
		console.log("check params error");
        return false;
    }
    var sign=params["sign"];
    var _sign=getSign(params, priKey);
    if(sign!=_sign){
		console.log("check sign error");
        return false;
    }
	console.log("check sign true");
	return true;
}


 
 /**
 * 计算签名
 * @param array $data
 * @param string $privateKey
 * @return string
 */
var getSign=function(data, priKey){
	console.log("#\n#原始数组:\n"+JSON.stringify(data)+"\n");
	delete data["sign"];
	
	console.log("#\n#取出sign后的数组:\n"+JSON.stringify(data)+"\n");
	//不用排序，因为传过来的数据本身就是排过序的
	console.log("#\n#参数数组按key升序:\n"+JSON.stringify(data)+"\n");
	
	var str="";
	for(var key in data){
		str+=data[key];
	}
	console.log("#\n#将数组值连接成字符串:\n"+str+"\n");
	
	var md5 = crypto.createHash('md5'); 
	md5.update(str, 'utf8'); 
	var d1 = md5.digest('hex');
	console.log("#\n#第一次md5并小写:\n"+d1+"\n");
	
	md5 = crypto.createHash('md5'); 
	md5.update(d1+privateKey, 'utf8');
	var d2=md5.digest('hex');
	console.log("#\n#最后一次md5并小写(签名):\n"+d2+"\n");
    return d2;
}

/**
 * 检测道具金额与实际金额是否一致，开发者根据实际情况自己实现判断方式
 * @param type $params
 */
var checkAmount=function(params){
	if(getProductAmount(params["product_id"]) != params['amount']){
		return true;
	}
    return false;
}

/**
 * 获取道具在服务器上的金额
 * @param type productId 
 * @return int 单位元
 */
var getProductAmount=function(productId) {
        //get amount by productId
        return 1;
}

/**
 * 获取客户端ip
 * @return string 
 */
var getClientIp=function (req) {
     return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
};

var payNotice=function(req, res){	
    var info ='';
    req.addListener('data', function(chunk){
        info += chunk;
    });
	
    req.addListener('end', function(){
        console.log(info);
		
		if(!checkAnySDKServer(getClientIp(req))){
			console.log("remote address is illegal.");
			res.write("remote address is illegal.");
			res.end();
			return;
		}
	
		var params = qs.parse(info);
		console.log(params["amount"]);
		
		
        if(checkSign(params, privateKey)){
            res.write("ok");
        }else{
            res.write("Wrong signature.");
        }
		res.end();
    });
}

var server = http.createServer(payNotice);
server.listen(8888);