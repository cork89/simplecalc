# simplecalc
Simple calculators

* supports the following simple calculators
  * age
  * mortgage
  * marginal tax

* this is currently deployed using cloudflare workers static assets
  * `wrangler.jsonc` points the worker at the `dist/` directory, `wrangler deploy` uploads it
  * there is no worker code or r2 bucket, cloudflare serves the files directly
* the route is defined from a subdomain on a cloudflare domain i own (CNAME record)