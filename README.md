# agecalculator
Simple age calculator

* this is currently deployed using cloudflare workers
  * the index.html is placed in a r2 bucket
  * the worker.js is the worker code used to read the index.html from the bucket
  * the worker has a single r2 binding to my bucket which exposes the bucket in the env arg
  * the route is defined from a subdomain on a cloudflare domain i own (CNAME record)