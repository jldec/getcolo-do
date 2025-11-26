# getcolo-do
This worker gathers colo and request location details by calling [getcolo.jldec.me](https://github.com/jldec/getcolo/blob/main/src/index.js)

1. from this worker (`coloLocal`)
2. from a durable object (`coloDO`), and optionally 
3. from a container connected to the durable object (`coloContainer`)

The `colo` returned by getcolo is usually (but not always) located in the city where the request originated. Latency times are in _ms_.

<img width="2200" height="1164" alt="Screenshot 2025-11-08 at 11 51 03" src="https://github.com/user-attachments/assets/5758c077-348c-4938-8f63-82098a1febaf" />

To start a container, pass a 'DO' query param like `?DO` or `?DO=<xx>`. 

The implemenation uses the colo of the originating worker as the name/id for the durable object. Reload your browser to see non-cold-start latencies. Passing a `do=<xx>` or `DO=<xx>` query param will suffix the durable object's name/id, forcing activation of a new durable object.

Deployed at https://getcolo-do.jldec.me
