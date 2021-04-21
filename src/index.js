import * as express from 'express';
import * as http  from 'http';

const app = express();
const port = 3000;
const apiUrl = `http://localhost:${port}`;

const httpRequest = (url) => {
  return new Promise(async (resolve, reject) => {
    const req = http.request(
      url,
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
      },
      res => {
        let resData = '';
        res.on('data', function (chunk) {
          resData += chunk;
        });
        res.on('end', async function () {
          if (res.statusCode === 200) {
            resolve(resData);
          } else {
            reject(res.statusMessage);
          }
        });
        res.on('error', reject);
      },
    );
    req.on('error', reject);
    req.end();
  });
};

class InternalRestResponse extends http.ServerResponse {
  promise;
  #resolve;
  #reject;
  #content;

  constructor(req) {
    super(req);
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    })
  }

  // override json to prevent unneeded serialization in non proxy responses
  json = (result) => {
    this.resolve(result);
  }

  // override end which will be executed in case of an error or successful RESTProxy request
  end = () => {
    if (this.statusCode === 200) {
      try {
        this.resolve(JSON.parse(this.content));
      } catch (e) {
        this.statusCode = 500;
        this.statusMessage = e.message;
        this.handleError();
      }
    } else {
      this.handleError();
    }
  }

  // handle chunks from RESTProxy request
  write = (...attrs) => {
    const cb = typeof attrs[1] === 'function' ? attrs[1] : attrs[2];
    const encoding = typeof attrs[1] === 'function' ? undefined : attrs[1];
    this.content += attrs[0].toString(encoding);
    cb?.();
    return true;
  }

  writeHead = (statusCode) => {
    if (statusCode !== 200) {
      this.handleError();
    }
    return this;
  }

  handleError = () => {
    this.reject({
      code: this.statusCode,
      message: this.statusMessage,
    });
  };
}

const httpInternalRequest = async (originalReq, url, opts = {}) => {
  const req = new http.IncomingMessage({});
  Object.assign(req, {
    url,
    method: 'GET',
    headers: originalReq.headers,
    httpVersion: originalReq.httpVersion,
    httpVersionMajor: originalReq.httpVersionMajor,
    httpVersionMinor: originalReq.httpVersionMinor,
  }, opts);
  const res = new InternalRestResponse(req);
  app.handle(req, res);
  return res.promise;
};

app.get('/foo', (req, res) => {
  res.json({ sample: true });
});

app.get('/internal-simple', async (req, res) => {
  const internalResponse = await httpRequest(`${apiUrl}/foo`);
  res.json(JSON.parse(internalResponse));
});

app.get('/internal-final', async (req, res) => {
  const internalResponse = await httpInternalRequest(req, `${apiUrl}/foo`);
  res.json(internalResponse);
});

app.listen(port, () => {
  console.log(`Server listening at ${apiUrl}`);
});

export default app;
