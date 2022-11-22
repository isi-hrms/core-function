const axios = require("axios");
const config = require("../config");

// Middleware Style

/**
 * Logging to HRMS Log Center
 * @param  {String} channel
 * @return {Void} void
 */

module.exports = function (channel, message) {
  return function (req, res, next) {
    res.logger = (channel, message) => {

      console.log(req.headers,55555);
      axios.post(`http://192.168.1.12:5000/api/log/${channel}`, {
        header: {
          info: req.headers,
          path: req.path,
          method: req.method,
          ip: req.ip,
          host: req.hostname,
        },
        data: {
          ...message,
        },
      });
    };
    next();
  };
};

// Classical Function Style

/*
module.exports = (req, channel, message) => {
    axios.post(`${config.host}/${channel}`, {
        header: {
            path: req.path,
            method: req.method,
            ip: req.ip,
            host: req.hostname,
            userAgent: req.get('User-Agent'),
        },
        data: {
            ...message
        }
    })
}
*/
