# getcolo-do
This worker calls [getcolo.jldec.me](https://github.com/jldec/getcolo/blob/main/src/index.js) from the worker, from its durable object, and from its container.

It uses the colo of the originating worker as the name/id for the DO. Reload your browser to see non-cold-start latencies. To activate a new DO and container, pass a suffix in a query param like `?do=<xx>`. Passing an uppercase `DO` query param will activate a DO without a container.

Latency times are in _ms_.

Deployed at https://getcolo-do.jldec.me

