const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
    key         : Joi.string().required()
});

module.exports = async (data, callback) =>{
    try {
        let res = await schema.validateAsync(data);
        return callback(null, res);
    } catch (error) {
        return callback(true, 'Your input incorrect, please check again.');
    }
}