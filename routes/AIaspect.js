var express = require('express');
var router = express.Router();
// 导入MySQL模块
var mysql = require('mysql');
var dbConfig = require('../db/DBconfig');
//var userSQL = require('../db/userSql');
var request = require('request');
// 使用DBConfig.js的配置信息创建一个MySQL连接池
var pool = mysql.createPool( dbConfig.mysql );
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
//初始化AI
router.get('/initAI', function(req, res, next){
    pool.getConnection(function(err, connection) {
// 获取前台页面传过来的参数
        var appId = req.query.appId;
        var tsql = "select appId,count(tid) as numClass  from tdb group by appId=?";
        connection.query(tsql, appId, function(err, result) {
            if(err){
                responseJSON(res,err.message);
                return;
            }
            if(result) {
                var appnumClass = result[0].numClass;
                request('http://111.207.243.70:82/dl/init?appId='+appId+'&numClass='+appnumClass, function (error, response, body){

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

                // result = {
                //     retCode: 200,
                //     retDesc:'获取成功'
                // };
            }
            // 以json形式，把操作结果返回给前台页面
            //responseJSON(res, result);
            // 释放连接
            connection.release();
        });
    });
});

//AI预测
router.get('/predict',function(req, res, next){
    pool.getConnection(function(err, connection) {
// 获取前台页面传过来的参数
        var useClass = req.query.useClass;
        //console.log(useClass);
        var appId;
        var tid;
        var sql;
        //var useClass = req.query.retCode;
        if(useClass == 1){
            appId = req.query.appId;
            tid = req.query.tid;
            //console.log(appId);
            //console.log(tid);
            sql = "select question,qid from qdb where appId=? and questionType in (select type from tdb where appId=? and tid=?)";
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
            appId = req.query.appId;
            sql = "select question,qid from qdb where appId=? ";
            connection.query(sql, appId, function(err, result){
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
                    question:result,
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
