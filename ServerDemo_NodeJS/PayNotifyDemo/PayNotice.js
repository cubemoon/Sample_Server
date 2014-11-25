var http = require('http');
var qs = require('querystring');
var crypto = require('crypto');
var privateKey="696064B29E9A0B7DDBD6FCB88F34A555";

/**
 * anysdk ֧��֪ͨ�������ж�
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
 * ��ǩ
 * @param array params 
 * @param array priKey AnySDK�������ϷprivateKey
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
 * ����ǩ��
 * @param array $data
 * @param string $privateKey
 * @return string
 */
var getSign=function(data, priKey){
	console.log("#\n#ԭʼ����:\n"+JSON.stringify(data)+"\n");
	delete data["sign"];
	
	console.log("#\n#ȡ��sign�������:\n"+JSON.stringify(data)+"\n");
	//����������Ϊ�����������ݱ�������Ź����
	console.log("#\n#�������鰴key����:\n"+JSON.stringify(data)+"\n");
	
	var str="";
	for(var key in data){
		str+=data[key];
	}
	console.log("#\n#������ֵ���ӳ��ַ���:\n"+str+"\n");
	
	var md5 = crypto.createHash('md5'); 
	md5.update(str, 'utf8'); 
	var d1 = md5.digest('hex');
	console.log("#\n#��һ��md5��Сд:\n"+d1+"\n");
	
	md5 = crypto.createHash('md5'); 
	md5.update(d1+privateKey, 'utf8');
	var d2=md5.digest('hex');
	console.log("#\n#���һ��md5��Сд(ǩ��):\n"+d2+"\n");
    return d2;
}

/**
 * �����߽����ʵ�ʽ���Ƿ�һ�£������߸���ʵ������Լ�ʵ���жϷ�ʽ
 * @param type $params
 */
var checkAmount=function(params){
	if(getProductAmount(params["product_id"]) != params['amount']){
		return true;
	}
    return false;
}

/**
 * ��ȡ�����ڷ������ϵĽ��
 * @param type productId 
 * @return int ��λԪ
 */
var getProductAmount=function(productId) {
        //get amount by productId
        return 1;
}

/**
 * ��ȡ�ͻ���ip
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