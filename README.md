# internal-express-requests
Sample solution for making internal requests from one endpoint to another in Express

# Install
```
git clone https://github.com/lukaszwilk/internal-express-requests.git
cd internal-express-requests
npm ci
```

# Usage
Start Express server. 
```
npm run build
npm run serve
```

Server exposes three endpoints:
- `/internal-simple` - uses simple TCP request
- `/internal-final` - uses internal express request
- `/foo` - target endpoint for internal requests

## Simple TCP request
```
curl 'localhost:3000/internal-simple'
```

## Internal Express request
```
curl 'localhost:3000/internal-final'
```