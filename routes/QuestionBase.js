var express = require('express');
var router = express.Router();
// 导入MySQL模块
var mysql = require('mysql');
var dbConfig = require('../db/DBconfig');
var userSQL = require('../db/userSql');
var request = require('request');

// global.countRecordHdb = 0;
// global.leftIndexReturnHdb = 1;
// global.rightIndexReturnHdb = 5000;
// global.timerReqTrainAI = 1000;

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

//用户选择问题
router.post('/conversation',function(req, res){
    pool.getConnection(function(err, connection) {
        if(err){
            console.log(err.message);
            return;
        }
// 获取前台页面传过来的参数
        var param = req.body;
       // console.log(param);
        var date = new Date();
        date.setHours(date.getHours()+8);//时区问题解决方案
// 建立连接 增加一个用户信息

        connection.query(userSQL.userInQ, [date,param.appId,param.standardQuestionId,param.isRecSuccess,param.artificialQuestion], function(err, result) {

            if(err){
                console.log(err.message);
                return;
            }
            if(result) {
                // if(param.isRecSuccess == 1){
                //     countRecordHdb++;
                //     console.log(countRecordHdb);
                //     if(countRecordHdb === 5){
                //         countRecordHdb = 0;
                //         console.log(countRecordHdb);
                //         request('http://111.207.243.70:83/dl/trainAble&appId='+param.appId ,function(error, response, body){
                //             console.log(body);
                //             if(err){
                //                 console.log(err.message);
                //
                //             }
                //         });
                //     }
                // }

                result = {
                    retCode: 200,
                    retDesc:'成功记录'
                };
            }
            // 以json形式，把操作结果返回给前台页面
            responseJSON(res, result);
            // 释放连接
            connection.release();
        });

    });
});

//初始化知识库
router.post('/base', function(req, res){

    pool.getConnection(function(err, connection){
        var date = new Date();
        var param = req.body;
        //var param = req.query;
        var values = new Array();
        for (var i=0; i < param.questionIdList.length; i++){
            values[i] = [date,param.appId,param.questionIdList[i],param.questionList[i],param.typeList[i]];
            //console.log(values[i]);
        }
        //创建typeid
        var types = new Array();
        for(var j=0, k = param.typeList.length; j < k; j++ ){
            if(types.indexOf(param.typeList[j]) === -1){
                types.push(param.typeList[j]);
                //console.log(j);
                //console.log(k);
                //console.log(types);
            }
        }
        //console.log(types);
        var tvalues = new Array();
       // console.log("####");
        //console.log(types.length);
        for (i=0; i < types.length; i++){

            tvalues[i] = [param.appId,i,types[i]];
            //console.log(tvalues[i]);
        }
        var tsql = "INSERT INTO tdb(appId,tid,type) VALUES ?";
        connection.query(tsql,[tvalues], function(err, result){
            if(err){
                responseJSON(res,err.message);
                return;
            }
        });

        var sql = "INSERT INTO qdb(date,appId,qid,question,questionType) VALUES ?";
        connection.query(sql,[values], function(err, result){
            if(err){
                responseJSON(res,err.message);
                return;
            }
            if(result){
                result = {
                    retCode: 200,
                    retDesc: '初始化成功'
                }
            }
            responseJSON(res, result);
            // 释放连接
            connection.release();
        });
        request('http://111.207.243.71:3000/AIaspect/initAI?appId='+param.appId, function (error, response, body){
            console.log(body);
            if(err){
                console.log(err.message);

            }
        });
    });
});

//添加用户
router.get('/baseDetail/insert', function(req, res, next){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
// 获取前台页面传过来的参数
        var param = req.query || req.params;
        var date = new Date();
// 建立连接 增加一个用户信息
        connection.query(userSQL.insert, [date,param.appId,param.qid,param.question,param.questionType], function(err, result) {
            if(err){
                responseJSON(res,err.message);
                return;
            }
            if(result) {
                result = {
                    retCode: 200,
                    retDesc:'增加成功'
                };
            }
            // 以json形式，把操作结果返回给前台页面
            responseJSON(res, result);
            // 释放连接
            connection.release();
        });
    });
});
//删除用户
router.get('/baseDetail/delete', function(req, res, next){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
// 获取前台页面传过来的参数
        var appId = req.query.appId ;
        var qid = req.query.qid ;
// 建立连接 删除一个用户信息
        connection.query(userSQL.delete, [appId,qid], function(err, result) {

            if(result.affectedRows > 0) {
                result = {
                    retCode: 200,
                    retDesc:'删除成功'
                };
            }
            // 以json形式，把操作结果返回给前台页面
            responseJSON(res, result);
            // 释放连接
            connection.release();
        });
    });
});
//修改用户数据
router.get('/baseDetail/update', function(req, res, next){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
// 获取前台页面传过来的参数
        var param = req.query || req.params;
        var date = new Date();
// 建立连接 增加一个用户信息
        connection.query(userSQL.update, [date,param.question,param.questionType,param.appId,param.qid], function(err, result) {
            if(result) {
                result = {
                    retCode: 200,
                    retDesc:'修改成功'
                };
            }
            // 以json形式，把操作结果返回给前台页面
            responseJSON(res, result);
            // 释放连接
            connection.release();
        });
    });
});

//查看数据
router.get('/baseDetail/select', function(req, res, next){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
// 获取前台页面传过来的参数
        var appId = req.query.appId ;
        var qid = req.query.qid ;
        connection.query(userSQL.select, [appId,qid], function(err, result) {

            if(result) {
                console.log(result);
                result = {
                    retCode: 200,
                    retDesc:'查询成功',
                    question:result[0].question,
                    questionType:result[0].questionType
                };
            }
            // 以json形式，把操作结果返回给前台页面
            responseJSON(res, result);
            // 释放连接
            connection.release();
        });
    });
});
//查看全部数据
router.get('/baseDetail/getAllQuestions', function(req, res, next){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
// 获取前台页面传过来的参数
        var appId = req.query.appId ;
        connection.query(userSQL.getAllQuestions, appId, function(err, result) {

            if(result) {
                var qList = new Array();
                for(var i = 0; i < result.length; i++){
                    qList[i] = result[i].qid;
                }
                result = {
                    retCode: 200,
                    retDesc:'获取成功',
                    questionIdList:qList

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
