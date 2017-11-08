var express = require('express');
var router = express.Router();
// 导入MySQL模块
var mysql = require('mysql');
var dbConfig = require('../db/companyDBconfig');
//var request = require('request');

var pool = mysql.createPool( dbConfig.mysql );

router.post("/tenantInfo/register",function(req,res){
    pool.getConnection(function(err, connection) {
        //var connection=DButil.connection();
        connection.connect();
        var map={};
        console.log(req.body);
        var  addSql = 'INSERT INTO companyid(app_id,company_name,telephone_number,password) VALUES(?,?,?,?)';
        var addsqlParams=[];
        addsqlParams[0]=req.body.AppID;
        addsqlParams[1]=req.body.CompanyName;
        addsqlParams[2]=req.body.TelephoneNumber;
        addsqlParams[3]=req.body.Password;
        res.writeHead(200,{'Content-Type':'text/html'});
        connection.query(addSql,addsqlParams,function (err, result) {
            if(err){
                console.log('[INSERT ERROR] - ',err.message);
                map.result=false;
                res.end(JSON.stringify(map));
                return ;
            }

            map.result=true;
            map.datum={};
            map.datum.AppID=req.body.AppID;
            map.datum.CompanyName=req.body.CompanyName;
            map.datum.TelephoneNumber=req.body.TelephoneNumber;
            map.datum.Password=req.body.Password;
            res.end(JSON.stringify(map));
            console.log('--------------------------INSERT----------------------------');
            //console.log('INSERT ID:',result.insertId);
            console.log('INSERT ID:',result);
            console.log('-----------------------------------------------------------------\n\n');

        });
// console.log(tp);
        connection.release() ;
    });
});

module.exports=router;