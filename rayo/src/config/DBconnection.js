import mysql from 'mysql2/promise';
// Create the connection to database
export async function DBinit(){
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: "n3u3da!",
        database: 'pentafolio'
      });
    return connection;
}
