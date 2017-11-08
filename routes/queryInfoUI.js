var express = require('express');
var router = express.Router();
// 导入MySQL模块
var mysql = require('mysql');
var dbConfig = require('../db/companyDBconfig');
var pool = mysql.createPool( dbConfig.mysql );

router.get('/wsl',function(req,res){
    res.sendFile("E:/nodeProject/views/history_info.htm");
});

router.get('/info',function(req,res){
    res.setHeader("Access-Control-Allow-Origin", "*");
    pool.getConnection(function(err, connection) {
        var data=req.query.id;

        var firstsql='select count(*) as num from companyid where app_id="'+data+'"'+ ' or company_name="'+data+'"';


        connection.query(firstsql,function(err,result){
            if(err){
                console.log(err.message);
                return;
            }
            else if(result[0].num==0){

                res.send('There is no company with appID or name '+data);
            }
            else{

                var sql='select * from companyid where app_id="'+data+'"'+ ' or company_name="'+data+'"';

                connection.query(sql,function(err,info){
                    if(err){
                        console.log(err.message);
                        return;
                    }
                    else{
                        // console.log(typeof info);
                        //console.log(info);
                        res.send(info);
                    }
                })

            }
        });
    });

});
module.exports = router;