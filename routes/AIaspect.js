var express = require('express');
var router = express.Router();
// 导入MySQL模块
var mysql = require('mysql');
var dbConfig = require('../db/DBconfig');
var dbConfig2 = require('../db/companyDBconfig');
//var userSQL = require('../db/userSql');
var request = require('request');
// 使用DBConfig.js的配置信息创建一个MySQL连接池
var pool = mysql.createPool( dbConfig.mysql );
var pool2 = mysql.createPool( dbConfig2.mysql );
// 响应一个JSON数据
var responseJSON = function (res, ret) {
    if(typeof ret === 'undefined') {
        res.json({     code:'-200',     msg: '操作失败'
        });
    } else {
        res.json(ret);
    }};

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
//定时发送请求
setInterval(function(err){
    if(err){
        console.log(err.message);
    }
    pool.getConnection(function(err, connection){
        var appId;
        var sql="select appId ,count(id) as appRecords from hdb where isRecSuccess=1 group by appId";
        connection.query(sql,function(err,result){
            console.log(typeof result[0].appId);
            for(var i=0; i<result.length; i++){
                if(result[i].appRecords >=5){
                    appId= +result[i].appId;
                    console.log(typeof appId);
                    request('http://111.207.243.70:83/dl/trainAble?appId='+appId ,function(error, response, body){
                        console.log(body);
                        if(err){
                            //console.log('############');
                            console.log(err.message);
                        }

                    });
                }
            }
            connection.release();
        });
    });
},5*60 * 1000);

//训练AI
router.get('/trainAI',function(req, res, next){
    pool.getConnection(function(err, connection){
        //var appId = req.query.appId;
        pool2.getConnection(function(err, connection2){
            var appId = req.query.appId;
            var csql = "select app_id from companyid where app_id=?";
            connection2.query(csql,appId,function(err,result){
                console.log(result);
                if(err){
                    console.log(err.message);
                }
                console.log(!result[0]);
                if(!result[0]){
                    result ={
                        retCode:202,
                        retDesc:'该公司未注册'
                    };
                    console.log(result);
                    responseJSON(res, result);
                }
                else{
                    var sql = "select qdb.question , tdb.tid from hdb,qdb,tdb where hdb.appId=? and hdb.isRecSuccess=1 " +
                        "and hdb.appId=qdb.appId and tdb.appId=qdb.appId " +
                        "and qdb.qid=hdb.standardQuestionId and tdb.type=qdb.questionType order by hdb.id desc limit 5";
                    connection.query(sql,appId,function(err,result){
                        if(err){
                            console.log(err.message);
                        }
                        if(result){
                            result = {
                                retCode: 200 ,
                                retDesc: '返回5000条数据',
                                resQuestion: result
                            };
                        }
                        responseJSON(res, result);
                        connection.release();
                    });
                }
                //responseJSON(res, result);
                connection2.release();
            });
        });
    });
});
//初始化AI
router.get('/initAI', function(req, res, next){
    pool.getConnection(function(err, connection) {
//获取前台页面传过来的参数
        pool2.getConnection(function(err, connection2){
            var appId = req.query.appId;
            var csql ="select app_id from companyid where app_id=?";
            connection2.query(csql,appId,function(err,result){
                console.log(result);
                if(err){
                    console.log(err.message);
                }
                console.log(!result[0]);
                if(!result[0]){
                    result ={
                        retCode:202,
                        retDesc:'该公司未注册'
                    };
                    console.log(result);
                    responseJSON(res, result);
                }
                else{
                    console.log('#########');
                    var tsql = "select appId,count(tid) as numClass  from tdb where appId=? group by appId";

                    connection.query(tsql, appId, function(err, result) {
                        console.log(appId);
                        console.log(result);
                        if(err){
                            console.log(err.message);
                        }
                        if(result) {
                            var appnumClass = result[0].numClass;
                            console.log(typeof appnumClass);
                            appId= +appId;
                            console.log(typeof appId);
                            request('http://111.207.243.70:83/dl/init?appId='+appId+'&classNum='+appnumClass, function (error, response, body){
                                if(error){

                                    console.log(error.message);
                                }
                                console.log('$$$$$$$$$$');
                                console.log(body);
                                body=JSON.parse(body);

                                if (body.retCode == 0) {
                                        result = {
                                            retCode: 200 ,
                                            retDesc: '初始化AI成功'
                                        };
                                }
                                else{
                                        result = {
                                            retCode: -200 ,
                                            retDesc: '初始化AI失败'
                                        };
                                }
                                responseJSON(res, result);
                            });

                        }
                        connection.release();
                    });
                }
                connection2.release();
            });
        });

      });
});

//AI预测
router.get('/predict',function(req, res, next){
    pool.getConnection(function(err, connection) {
// 获取前台页面传过来的参数
        pool2.getConnection(function(err, connection2){
            var appId = req.query.appId;
            var csql = "select app_id from companyid where app_id=?";
            connection2.query(csql,appId,function(err,result){
                //console.log(result);
                if(err){
                    console.log(err.message);
                }
                //console.log(!result[0]);
                if(!result[0]){
                    result ={
                        retCode:202,
                        retDesc:'该公司未注册'
                    };
                    console.log(result);
                    responseJSON(res, result);
                }
                else{
                    var useClass = req.query.useClass;
                    if(useClass == 1){
                        //appId = req.query.appId;
                        var tid = req.query.tid;
                        //console.log(appId);
                        //console.log(tid);
                        var sql = "select question,qid from qdb where appId=? and questionType in (select type from tdb where appId=? and tid=?)";
                        connection.query(sql, [appId,appId,tid], function(err, result){
                            if(err){
                                console.log(err.message);
                            }
                            //console.log(result);
                            if(result) {
                                result = {
                                    retCode: 200,
                                    retDesc:'返回给AI成功',
                                    useClass:1,
                                    appId:appId,
                                    userQuestion:result
                                };
                            }
                            responseJSON(res, result);
                            // 释放连接
                            connection.release();
                        });
                    }
                    else if(useClass == 0){
                        //appId = req.query.appId;
                        var sql2 = "select question,qid from qdb where appId=? ";
                        connection.query(sql2, appId, function(err, result){
                            //console.log(result);
                            if(result) {
                                result = {
                                    retCode: 200,
                                    retDesc:'返回给AI成功',
                                    reqResult:result
                                };
                            }
                            responseJSON(res, result);
                            // 释放连接
                            connection.release();
                        });
                    }
                }
                connection2.release();
            });
        });

     });
});
//AI查询问题库
router.get('/getAllQuestionsFromQdb', function(req, res, next){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
        if(err){
            console.log(err);
        }
// 获取前台页面传过来的参数
        var appId = req.query.appId ;
        var sql = "select qdb.question, tdb.tid from qdb, tdb where qdb.appId=? and qdb.appId=tdb.appId and qdb.questionType=tdb.type";
        connection.query(sql, appId, function(err, result) {
            if(err){
                console.log(err);
            }
            //console.log(result);
            if(result) {
                console.log(typeof result);
                result = {
                    retCode: 200,
                    retDesc:'获取成功',
                    question:result
                };
            }
            // 以json形式，把操作结果返回给前台页面
            responseJSON(res, result);
            // 释放连接
            connection.release();
        });
    });
});
module.exports = router;
