const fetch = require('cross-fetch');
const https = require('https');
require('log-timestamp');

class CiscoFmc {
  constructor(host, user, password, rejectUnauthorized = true) {
    this._access_token = null;
    this._refresh_token = null;
    this._domainUUID = null;
    this._host = host;
    this._user = user;
    this._password = password;
    this._httpsAgent = new https.Agent({
      rejectUnauthorized,
    });
    this._sem = require('semaphore')(1);
    this._lastTimestampToken = 0;
    this._numberOfRefreshToken = 0;
  }

  getToken() {
    return new Promise((resolve, reject) => {
      this._sem.take(() => {
        let tokenExpired =
          this._access_token &&
          Date.now() - this._lastTimestampToken > 1000 * 60 * 30; // 30 minutes
        let needToGenerateToken =
          !this._access_token ||
          (tokenExpired && this._numberOfRefreshToken > 2);
        let needToRefreshToken =
          this._access_token && tokenExpired && this._numberOfRefreshToken <= 2;

        if (needToGenerateToken) {
          console.log('generate token');
          fetch(
            `https://${this._host}/api/fmc_platform/v1/auth/generatetoken`,
            {
              method: 'POST',
              headers: {
                Authorization:
                  'Basic ' +
                  Buffer.from(`${this._user}:${this._password}`).toString(
                    'base64'
                  ),
                Accept: 'application/json',
              },
              body: '{}',
              agent: this._httpsAgent,
            }
          )
            .catch((err) => {
              throw err;
            })
            .then(async (response) => {
              if (response.status >= 400) {
                let status = response.status;
                let body = await response.text();
                body ? (body = JSON.parse(body)) : null;
                throw { status, body };
              } else return response;
            })
            .then((response) => {
              console.log('receive token from generatetoken');
              this._numberOfRefreshToken = 0;
              this._lastTimestampToken = Date.now();
              this._access_token = response.headers.get('x-auth-access-token');
              this._refresh_token = response.headers.get(
                'x-auth-refresh-token'
              );
              this._domainUUID = response.headers.get('DOMAIN_UUID');
              this._sem.leave();
              resolve();
            })
            .catch((err) => {
              this._sem.leave();
              reject(err);
            });
        } else {
          if (needToRefreshToken) {
            this._numberOfRefreshToken += 1;
            console.log(`refresh token ${this._numberOfRefreshToken} time(s)`);
            fetch(
              `https://${this._host}/api/fmc_platform/v1/auth/refreshtoken`,
              {
                method: 'POST',
                headers: {
                  'X-auth-access-token': this._access_token,
                  'X-auth-refresh-token': this._refresh_token,
                  Accept: 'application/json',
                },
                body: '{}',
                agent: this._httpsAgent,
              }
            )
              .catch((err) => {
                this._sem.leave();
                reject(err);
              })
              .then((response) => {
                console.log('receive token from refreshtoken');
                this._lastTimestampToken = Date.now();
                this._access_token = response.headers.get(
                  'x-auth-access-token'
                );
                this._refresh_token = response.headers.get(
                  'x-auth-refresh-token'
                );
                this._domainUUID = response.headers.get('DOMAIN_UUID');
                this._sem.leave();
                resolve();
              });
          } else {
            this._sem.leave();
            resolve();
          }
        }
      });
    });
  }

  platform(method, path, body = null, expanded = false) {
    return new Promise((resolve, reject) => {
      this.getToken()
        .catch((err) => {
          throw err;
        })
        .then(() => {
          let url = `https://${this._host}/api/fmc_platform/v1/info${path}`;
          if (expanded) url += '?expanded=true';
          fetch(url, {
            method,
            headers: {
              'X-auth-access-token': this._access_token,
              Accept: 'application/json',
            },
            body: body ? JSON.stringify(body) : null,
            agent: this._httpsAgent,
          })
            .catch((err) => {
              throw err;
            })
            .then(async (response) => {
              if (response.status >= 400) {
                let status = response.status;
                let body = await response.text();
                body ? (body = JSON.parse(body)) : null;
                throw { status, body };
              } else return response;
            })
            .then((response) => response.text())
            .then((response) => {
              resolve(JSON.parse(response));
            })
            .catch((err) => reject(err));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  config(method, path, body = null, expanded = false) {
    return new Promise((resolve, reject) => {
      this.getToken()
        .catch((err) => {
          throw err;
        })
        .then(() => {
          let url = `https://${this._host}/api/fmc_config/v1/domain/${this._domainUUID}${path}`;
          if (expanded) url += '?expanded=true';
          fetch(url, {
            method,
            headers: {
              'X-auth-access-token': this._access_token,
              Accept: 'application/json',
            },
            body: body ? JSON.stringify(body) : null,
            agent: this._httpsAgent,
          })
            .catch((err) => {
              throw err;
            })
            .then(async (response) => {
              if (response.status >= 400) {
                let status = response.status;
                let body = await response.text();
                body ? (body = JSON.parse(body)) : null;
                throw { status, body };
              } else return response;
            })
            .then((response) => response.text())
            .then((response) => {
              resolve(JSON.parse(response));
            })
            .catch((err) => reject(err));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = CiscoFmc;
