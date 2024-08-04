import connect from '@/lib/mongo/connect';
import users from '@/lib/mongo/models/users';
import bcrypt from 'bcrypt';

export default async function Signup(req, res) {
    const {email, password} = req.body; 
    await connect();

    const user = await users.findOne({email}, 'password', {lean: true});

    if (!user) {
        res.json({
            success: false
        });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
        delete user.password
        
        res.json({
            user
        });
    }

    res.json({
        success: false
    });
}
