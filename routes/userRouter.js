const express = require('express');
const userRouter = express.Router();
const {User} = require('../models/models');
const { authenticate } = require('../middleware/authenticate');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const route = '/services/user';

userRouter.post('/create', (req, res) => {
    // create user
    let log = '';
    const body = _.pick(req.body, ['email', 'password']);
    log += `POST ${route}/create, body: ${JSON.stringify(req.body)}\n`;

    const user = new User(body);
    const token = user.generateAuthToken();

    // current iteration doesn't check if user with same email address already exists in database.
    // should return message that user exists and offer password recovery
    user.save()
        .then((user) =>
        {
            log += `CREATED USER: ${user}\n`;
            log += `CREATED TOKEN: ${token}\n`;
            res.status(200).header('x-auth', token).send({user, token})
        })
        .catch((e) =>
        {
            log += `FAILED TO CREATE USER DUE TO: ${e}\n`;
            res.status(400).send(e);

        })
        .finally(() =>
        {
            if(process.env.VERBOSE_MODE) {
                log += `POST Request completed\n\n`;
                console.log(log);
            }
        });
});

userRouter.get('/me', authenticate, (req, res) => {
    let log = `GET ${route}/me`;
    const decoded = jwt.decode(req.query.token);
    User.findById(decoded._id)
        .then((user) => {
            if(user) {
                log += `FOUND USER: ${user}`;
                res.status(200).send({user});
            } else {
                log += `FAILED TO FIND USER IN DB.\n`;
                res.status(404).send();
            }
        })
        .catch((e) => {
            log += `FAILED TO GET USER DUE TO: ${e}\n`;
            res.status(404).send(e);
        })
        .finally(() => {
            if(process.env.VERBOSE_MODE) {
                log += `GET Request completed\n\n`;
                console.log(log);
            }
        });
});

userRouter.post('/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    let log = `POST ${route}/log body: ${JSON.stringify(req.body)}\n`;

    User.findByCredentials(body.email, body.password)
        .then((user) => {
            console.log('user: ', user);
            const token = user.generateAuthToken();
            log += `FOUND USER: ${user}`;
            log += `GENERATED TOKEN: ${token}\n`;
            res.status(200).header('x-auth', token).send({user, token})})
        .catch((e) => {
            log += `LOGIN FAILED DUE TO: ${e}\n`;
            res.status(404).send(e);
        })
        .finally(() => {
            if(process.env.VERBOSE_MODE) {
                log += `POST Request completed\n\n`;
                console.log(log);
            }
        });
});

module.exports = { userRouter };
