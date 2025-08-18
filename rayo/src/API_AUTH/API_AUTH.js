import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET|| "fallback_secret",
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

export default function(app,connection) {

    app.post('/API/auth/register', async (req,res) => {
        try{
            const { username,email,firstName,lastName, password, money } = req.body;
            if (!email ||!username || !firstName || !lastName || !password || !money) {
                return res.status(400).json({
                    success: false,
                    message: 'Some information is missing'
                });
            }

            let [results,fields] = await connection.execute('SELECT * FROM users WHERE mail = ?',[email]);
            if(results.length>0){
                return res.status(400).json({
                    success: false,
                    message: 'This email is already registered'
                });
            }
            const now = new Date();
            const formatDate = now.toISOString().slice(0,19).replace('T',' ');
            [results] = await connection.execute('INSERT INTO users(username,mail,password_user,first_name,last_name,date_creation,update_password) VALUES (?,?,?,?,?,?,?)',[username,email,password,firstName,lastName,formatDate,formatDate]);

            const [resultsmoney] = await connection.execute('INSERT INTO valores(id_user,simbol,val) VALUES(?,\'USD\',?);',[results.insertId,money]);
            return res.status(200).json({
                success: true,
                message: 'New account created successfully'
            });
        }catch(err){

        }
    });

    app.post('/API/auth/login', async (req, res) => {
        try {
            const { email, password } = req.body;
             // Validate required fields
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }
            // Find user by email
            const [results,fields] = await connection.execute('SELECT * FROM users WHERE mail = ?',[email]);
            if(results.length===0){
                return res.status(401).json({
                    success: false,
                    message: 'this email isnt registered'
                });
            }else{
                //al momento de registrar con hash usamos esta madre jajajaja
                //const isPasswordValid = await bcrypt.compare(password,results[0].password_user);
                const isPasswordValid = password===results[0].password_user;
                if(!isPasswordValid){
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid email or password'
                    });
                }
                // Generate JWT token
                const token = generateToken(results[0].id_user);
                const [BalanceUSD,fields] = await connection.execute('SELECT * FROM valores WHERE simbol = \'USD\' AND id_user=?',[results[0].id_user]);
                res.json({
                    success: true,
                    message: 'Login successful',
                    data: {
                        user: {
                            id: results[0].id_user,
                            username: results[0].username,
                            email: results[0].mail,
                            firstName: results[0].first_name,
                            lastName: results[0].last_name,
                            cashBalance: BalanceUSD[0].val
                        },
                        token
                    }
                });
            }
        } catch (err) {
            console.log(err);
        }
    });
}
