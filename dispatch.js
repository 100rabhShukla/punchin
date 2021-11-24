var ibmdb = require('ibm_db');


// Retrieve event information by searching the shortname
 function fetchEventByEmpName(dsn, empname) {
    try {
       var conn=ibmdb.openSync(dsn);
       // Search for exact match only, could be extended with lIKE
       var data=conn.querySync("select name, punchin2, punchout2 from punchin1 where name=? fetch first 2 rows only", [empname]);
       conn.closeSync();
       var resString="Data: \n";
       for (var i=0;i<data.length;i++) {
         resString+="name: "+data[i]['NAME']+" info: "+data[i]['PUNCHIN2']+" AND "+data[i]['PUNCHOUT2']+"\n";
       }
       // Return both generated string and data
       return {result : resString, data : data, input: empname};
    } catch (e) {
        return { dberror : e }
    }
   }  

function main(params) {
    dsn=params.__bx_creds[Object.keys(params.__bx_creds)[0]].dsn;

    // dsn does not exist in the DB2 credential for Standard instance. It must be built manually
    if(!dsn) {
        const dbname = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.database;
        const hostname = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.hosts[0].hostname;
        const port = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.hosts[0].port;
        const protocol = 'TCPIP';
        const uid = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.authentication.username;
        const password = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.authentication.password;
        
        //dsn="DATABASE=;HOSTNAME=;PORT=;PROTOCOL=;UID=;PWD=;Security=SSL";
        dsn = `DATABASE=${dbname};HOSTNAME=${hostname};PORT=${port};PROTOCOL=${protocol};UID=${uid};PWD=${password};Security=SSL`;
    }
    
    switch(params.actionname) {
        case "searchByEmpName":
            return fetchEventByEmpName(dsn,params.empname);
        default:
            return { dberror: "No action defined", actionname: params.actionname}
    }
}
