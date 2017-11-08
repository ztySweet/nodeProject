var express = require('express');
var router = express.Router();
// 导入MySQL模块
var mysql = require('mysql');
var dbConfig = require('../db/DBconfig');
var pool = mysql.createPool( dbConfig.mysql );

router.get('/wsl',function(req,res){
    res.sendFile("E:/nodeProject/views/history_info.htm");
});

router.get('/history',function(req,res){
    res.setHeader("Access-Control-Allow-Origin", "*");
    pool.getConnection(function(err, connection) {
        var id=req.query.id;
        var start=req.query.start;
        var end=req.query.end;

        var sql='select * from hdb where appId="'+id+'"'+ '  and date between "'+start+' 00:00:00" and "'+end+' 23:59:59"';
    console.log(sql);
        connection.query(sql,function(err,result){
            if(err){
                console.log(err.message);
                return;
            }
            else{
                //console.log(typeof result);
               console.log(result);
                res.send(result);
            }
        });
    });

});
module.exports = router;