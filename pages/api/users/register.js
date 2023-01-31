const bcrypt = require('bcryptjs');

import { usersRepo } from './user-repo';

export default apiHandler({
    post: register
});

function register(req, res) {
    // split out password from user details 
    const { password, ...user } = req.body;

    // validate
    if (usersRepo.find(x => x.username === user.username))
        throw `User with the username "${user.username}" already exists`;

    // hash password
    user.hash = bcrypt.hashSync(password, 10);    

    usersRepo.create(user);
    return res.status(200).json({});
}