var UserSQL = {
    insert:'INSERT IGNORE INTO qdb(date,appId,qid,question,questionType) VALUES(?,?,?,?,?)',
    delete:'DELETE FROM qdb WHERE appId=? AND qid=? ',
    update:'UPDATE qdb SET date=?, question=? , questionType=? WHERE appId=? AND qid=?',
    select:'SELECT * FROM qdb WHERE appId=? AND qid = ?',
    getAllQuestions:'SELECT * FROM qdb WHERE appId=?',
    //init:"INSERT INTO qdb(date,appId,qid,question,questionType) VALUES ?",
    hselect:'SELECT * FROM hdb WHERE appId=? ',
    userInQ:"INSERT INTO hdb(date,appId,standardQuestionId,isRecSuccess,artificialQuestion) VALUES (?,?,?,?,?)"
};
module.exports = UserSQL;
